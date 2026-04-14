import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

const SECRET = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'change-me'

export function makeToken(): string {
  return createHmac('sha256', SECRET).update('pd-admin-authenticated').digest('hex')
}

export function verifyToken(token: string): boolean {
  try {
    const expected = makeToken()
    return timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

// Central auth check — respects ADMIN_OPEN=1 bypass for initial setup
export async function isAuthed(): Promise<boolean> {
  if (process.env.ADMIN_OPEN === '1') return true
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  return !!token && verifyToken(token)
}

export const COOKIE_NAME = 'pd_admin'
export const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}
