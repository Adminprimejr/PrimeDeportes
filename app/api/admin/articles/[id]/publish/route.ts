import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/auth'
import { togglePublish, getArticleById } from '@/lib/articles'

interface Params { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Params) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const article = getArticleById(Number(id))
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const newStatus: 0 | 1 = article.published === 1 ? 0 : 1
  togglePublish(Number(id), newStatus)
  return NextResponse.json({ published: newStatus })
}
