import { createHmac, timingSafeEqual } from 'crypto'

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

export const COOKIE_NAME = 'pd_admin'
export const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}
