export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  await params

  return (
    <div>
      {/* Header */}
      <div className="bg-[#050507] text-white py-20 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">Cookie Policy</h1>
        <p className="text-white/50 text-sm">Last updated: March 2026</p>
      </div>

      {/* Content */}
      <div className="bg-[#FFFEF9] py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-600 text-base mb-12 leading-relaxed">
            Cookies are small files stored in your browser. Here is a plain-English explanation of how we use them and how you can control them.
          </p>

          <div className="space-y-10">

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. What cookies are</h2>
              <p className="text-gray-600 text-base leading-relaxed">
                A cookie is a small text file that a website stores on your device when you visit. Cookies help websites remember information about your visit — such as keeping you logged in or remembering your preferences. They cannot run programs or deliver viruses to your computer.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Essential cookies (always on)</h2>
              <p className="text-gray-600 text-base leading-relaxed mb-4">
                These cookies are required for the website to function correctly. They cannot be disabled.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3 font-semibold text-gray-700">Cookie name</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Purpose</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'sb-auth-token', purpose: 'Keeps you logged in to your ELEVO account', duration: 'Session' },
                      { name: 'sb-refresh-token', purpose: 'Refreshes your authentication session', duration: '7 days' },
                      { name: 'NEXT_LOCALE', purpose: 'Remembers your language preference', duration: '1 year' },
                      { name: 'elevo_consent_v2', purpose: 'Stores your cookie consent choices', duration: '1 year' },
                      { name: '__stripe_sid', purpose: 'Stripe session security (fraud prevention)', duration: '30 min' },
                    ].map((row) => (
                      <tr key={row.name} className="border-t border-gray-100">
                        <td className="p-3 font-mono text-xs text-gray-700">{row.name}</td>
                        <td className="p-3 text-gray-600">{row.purpose}</td>
                        <td className="p-3 text-gray-500">{row.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Optional cookies</h2>
              <p className="text-gray-600 text-base leading-relaxed mb-4">
                These are only set if you accept them via the consent banner.
              </p>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-2">Analytics cookies</h3>
                  <p className="text-sm text-gray-600">
                    Set by Vercel Analytics and/or PostHog. These help us understand how visitors use the site — which pages are most visited, where people drop off, and how they navigate. The data is anonymised and aggregated. No personally identifiable information is collected.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-2">Marketing cookies</h3>
                  <p className="text-sm text-gray-600">
                    If enabled, we may set a Meta Pixel cookie to measure the performance of our advertising campaigns. This cookie tracks whether you visited our site after seeing one of our ads on Facebook or Instagram. It does not allow us to see your personal Facebook data.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Third-party cookies</h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Stripe sets cookies to prevent fraud and keep payments secure. These are essential and cannot be disabled. Stripe&apos;s cookie policy is available at stripe.com/privacy. Supabase sets session cookies for authentication. These are essential and cannot be disabled.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. How to manage cookies</h2>
              <p className="text-gray-600 text-base leading-relaxed">
                You can manage your cookie preferences at any time via the consent banner at the bottom of our website. Click &ldquo;Manage preferences&rdquo; to change your choices. You can also manage cookies through your browser settings — however, disabling essential cookies will prevent the site from working correctly.
              </p>
              <p className="text-gray-600 text-base leading-relaxed mt-4">
                For further information about managing cookies in your browser, visit: allaboutcookies.org
              </p>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
              <h3 className="font-bold text-indigo-900 mb-2">Questions?</h3>
              <p className="text-indigo-700 text-sm">
                Email us at <a href="mailto:hello@elevo.dev" className="font-semibold underline">hello@elevo.dev</a>.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
