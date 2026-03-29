import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminDevicesPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/en/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch device stats from user_sessions
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('device_type, os, browser, screen_width')
    .not('device_type', 'is', null)

  const total = sessions?.length ?? 0

  const deviceCounts = { mobile: 0, tablet: 0, desktop: 0 }
  const osCounts: Record<string, number> = {}
  const browserCounts: Record<string, number> = {}

  for (const s of sessions ?? []) {
    if (s.device_type) deviceCounts[s.device_type as keyof typeof deviceCounts] = (deviceCounts[s.device_type as keyof typeof deviceCounts] ?? 0) + 1
    if (s.os) osCounts[s.os] = (osCounts[s.os] ?? 0) + 1
    if (s.browser) browserCounts[s.browser] = (browserCounts[s.browser] ?? 0) + 1
  }

  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#EEF2FF] mb-2">Device Analytics</h1>
      <p className="text-gray-400 mb-8">How your users access ELEVO AI</p>

      {total === 0 && (
        <div className="bg-[#1A2332] rounded-2xl p-8 text-center text-gray-400">
          No device data collected yet. Data populates as users log in.
        </div>
      )}

      {total > 0 && (
        <div className="space-y-6">
          {/* Device type */}
          <div className="bg-[#1A2332] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#EEF2FF] mb-4">Device Type ({total} sessions)</h2>
            <div className="space-y-3">
              {Object.entries(deviceCounts).map(([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 capitalize">{type}</span>
                    <span className="text-gray-400">{count} ({pct(count)}%)</span>
                  </div>
                  <div className="h-2 bg-[#0D1520] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${pct(count)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {pct(deviceCounts.mobile) >= 40 && (
              <p className="mt-4 text-sm text-amber-400 bg-amber-900/20 px-3 py-2 rounded-lg">
                {pct(deviceCounts.mobile)}% of your users are on mobile — ensure the mobile experience is perfect.
              </p>
            )}
          </div>

          {/* OS */}
          <div className="bg-[#1A2332] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#EEF2FF] mb-4">Operating System</h2>
            <div className="space-y-3">
              {Object.entries(osCounts).sort((a, b) => b[1] - a[1]).map(([os, count]) => (
                <div key={os}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 capitalize">{os}</span>
                    <span className="text-gray-400">{count} ({pct(count)}%)</span>
                  </div>
                  <div className="h-2 bg-[#0D1520] rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct(count)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Browser */}
          <div className="bg-[#1A2332] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#EEF2FF] mb-4">Browser</h2>
            <div className="space-y-3">
              {Object.entries(browserCounts).sort((a, b) => b[1] - a[1]).map(([browser, count]) => (
                <div key={browser}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 capitalize">{browser}</span>
                    <span className="text-gray-400">{count} ({pct(count)}%)</span>
                  </div>
                  <div className="h-2 bg-[#0D1520] rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct(count)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
