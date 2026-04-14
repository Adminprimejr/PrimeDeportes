import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/auth'
import { getAllArticles, createArticle } from '@/lib/articles'

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(getAllArticles())
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  try {
    const article = createArticle(data)
    return NextResponse.json(article, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al crear artículo'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
