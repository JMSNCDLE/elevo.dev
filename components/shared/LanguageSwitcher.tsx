'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

const SUPPORTED = ['en', 'es']

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(newLocale: string) {
    if (newLocale === locale) return

    // Replace current locale segment in path
    const segments = pathname.split('/')
    // segments[0] is '' (before first /), segments[1] is locale
    if (segments.length > 1 && SUPPORTED.includes(segments[1])) {
      segments[1] = newLocale
    } else {
      segments.splice(1, 0, newLocale)
    }
    const newPath = segments.join('/') || '/'

    // Set cookie for locale preference
    document.cookie = `elevo_locale=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`

    router.push(newPath)
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      {SUPPORTED.map((lang, i) => (
        <span key={lang} className="flex items-center">
          {i > 0 && <span className="text-gray-300 mx-1">|</span>}
          <button
            onClick={() => switchLocale(lang)}
            className={`font-medium transition-colors ${
              locale === lang
                ? 'text-indigo-600'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            {lang.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  )
}
