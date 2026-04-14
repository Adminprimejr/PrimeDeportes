import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/auth'
import { getLeads } from '@/lib/articles'

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(getLeads())
}
