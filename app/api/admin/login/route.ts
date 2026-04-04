import { NextResponse } from 'next/server'
import { makeToken, COOKIE_NAME, COOKIE_OPTS } from '@/lib/auth'

const PASSWORD = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'change-me'

export async function POST(req: Request) {
  const { password } = await req.json()

  if (!password || password !== PASSWORD) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  const token = makeToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, token, COOKIE_OPTS)
  return res
}
