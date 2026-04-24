import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Server-only Supabase client. Uses the service role key so it bypasses RLS —
// do NOT import this file from any client component. Admin auth is enforced
// separately via lib/auth.ts on the API routes that use this client.
//
// The client is created lazily on first use so that `next build` (which imports
// every module to collect types + bundles) doesn't fail when env vars are
// missing in the build environment. Any actual query will still throw loudly
// if the credentials aren't configured at runtime.
let client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase credentials missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local (and in Vercel env).',
    )
  }

  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}

// Proxy so the rest of the app keeps using `supabase.from(...)` syntax
// without having to call `getClient()` everywhere.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const c = getClient() as unknown as Record<string | symbol, unknown>
    const value = c[prop]
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(c) : value
  },
})
