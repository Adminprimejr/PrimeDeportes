import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/auth'
import { getArticleById, updateArticle, deleteArticle } from '@/lib/articles'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const article = getArticleById(Number(id))
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(article)
}

export async function PATCH(req: Request, { params }: Params) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const data = await req.json()
  try {
    const article = updateArticle(Number(id), data)
    return NextResponse.json(article)
  } catch (err: unknown) {
    console.error('[PATCH /api/admin/articles/' + id + '] failed', err, 'payload keys:', Object.keys(data ?? {}))
    const message = err instanceof Error ? err.message : 'Error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  deleteArticle(Number(id))
  return NextResponse.json({ ok: true })
}
