import { headers } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { ADMIN_IDS } from '@/lib/admin'

const LANGUAGE_MAP: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
  pl: 'Polish',
  sv: 'Swedish',
  ja: 'Japanese',
}

async function resolveLocale(): Promise<string> {
  const h = await headers()
  const intlLocale = h.get('x-next-intl-locale')
  if (intlLocale) return intlLocale
  const pathname = h.get('x-invoke-path') || h.get('x-matched-path') || ''
  const match = pathname.match(/^\/(en|es|fr|de|it|pt|nl|pl|sv|ja)/)
  if (match) return match[1]
  return 'en'
}

export async function getUserContext() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const locale = await resolveLocale()
    return {
      user: null,
      profile: null,
      plan: 'trial' as string,
      isAdmin: false,
      locale,
      language: LANGUAGE_MAP[locale] || 'English',
      supabase,
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isAdmin = ADMIN_IDS.includes(user.id)
  const plan = isAdmin ? 'galaxy' : (profile?.plan ?? 'trial')
  const locale = await resolveLocale()
  const language = LANGUAGE_MAP[locale] || 'English'

  return { user, profile, plan, isAdmin, locale, language, supabase }
}
