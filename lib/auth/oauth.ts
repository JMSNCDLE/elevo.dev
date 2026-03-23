'use client'
import { createBrowserClient } from '@/lib/supabase/client'

export async function signInWithGoogle() {
  const supabase = createBrowserClient()
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })
}

export async function signInWithApple() {
  const supabase = createBrowserClient()
  await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  })
}
