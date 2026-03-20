import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'

// Re-export as a no-arg function — pages call createBrowserClient() directly
export function createBrowserClient() {
  return _createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function createClient() {
  return createBrowserClient()
}
