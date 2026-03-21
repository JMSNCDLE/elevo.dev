import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { FileText, BookOpen, Share2, Star, Mail, Search, Zap, Users, TrendingUp, BarChart2 } from 'lucide-react'
import { formatCurrency, timeAgo } from '@/lib/utils'

export default async function MissionControlPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)

  const [{ data: profile }, { data: bp }, { data: recentGens }, { data: crmStats }, { data: revenueData }] = await Promise.all([
    supabase.from('profiles').select('plan, credits_used, credits_limit').eq('id', user.id).single(),
    supabase.from('business_profiles').select('*').eq('user_id', user.id).eq('is_primary', true).single(),
    supabase.from('saved_generations').select('id, type, content, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('contacts').select('id, status').eq('user_id', user.id),
    supabase.from('revenue_snapshots').select('total_revenue, total_jobs').eq('user_id', user.id).gte('snapshot_date', monthStart),
  ])

  if (!profile) redirect(`/${locale}/login`)

  const revenueThisMonth = (revenueData ?? []).reduce((s, r) => s + (r.total_revenue ?? 0), 0)
  const jobsThisMonth = (revenueData ?? []).reduce((s, r) => s + (r.total_jobs ?? 0), 0)

  const hour = now.getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  const contactCount = crmStats?.length ?? 0
  const lapsedCount = crmStats?.filter(c => c.status === 'lapsed' || c.status === 'at_risk').length ?? 0
  const creditsRemaining = (profile.credits_limit ?? 20) - (profile.credits_used ?? 0)

  const quickActions = [
    { href: `/${locale}/dashboard/content/gbp-posts`, label: 'GBP Post', icon: FileText, color: 'text-blue-400' },
    { href: `/${locale}/dashboard/content/blog`, label: 'Blog Post', icon: BookOpen, color: 'text-purple-400' },
    { href: `/${locale}/dashboard/content/social`, label: 'Social Caption', icon: Share2, color: 'text-pink-400' },
    { href: `/${locale}/dashboard/content/reviews`, label: 'Review Response', icon: Star, color: 'text-amber-400' },
    { href: `/${locale}/dashboard/content/email`, label: 'Email', icon: Mail, color: 'text-green-400' },
    { href: `/${locale}/dashboard/content/seo`, label: 'SEO Copy', icon: Search, color: 'text-cyan-400' },
  ]

  const typeLabel: Record<string, string> = {
    gbp_post: 'GBP Post', blog: 'Blog', social_caption: 'Social', review_response: 'Review',
    email: 'Email', seo: 'SEO', repurposed: 'Repurpose',
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Mini analytics strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Link href={`/${locale}/analytics`} className="bg-dashCard border border-dashSurface2 rounded-xl p-3 hover:border-accent/30 transition-colors group">
          <p className="text-xs text-dashMuted mb-0.5">Revenue this month</p>
          <p className="text-xl font-bold text-dashText">£{revenueThisMonth.toFixed(0)}</p>
          <p className="text-xs text-accent group-hover:underline mt-0.5 flex items-center gap-0.5">
            <BarChart2 size={10} /> View analytics
          </p>
        </Link>
        <Link href={`/${locale}/analytics`} className="bg-dashCard border border-dashSurface2 rounded-xl p-3 hover:border-accent/30 transition-colors group">
          <p className="text-xs text-dashMuted mb-0.5">Jobs this month</p>
          <p className="text-xl font-bold text-dashText">{jobsThisMonth}</p>
          <p className="text-xs text-accent group-hover:underline mt-0.5 flex items-center gap-0.5">
            <BarChart2 size={10} /> View analytics
          </p>
        </Link>
        <Link href={`/${locale}/analytics`} className="bg-dashCard border border-dashSurface2 rounded-xl p-3 hover:border-accent/30 transition-colors group">
          <p className="text-xs text-dashMuted mb-0.5">Credits used</p>
          <p className="text-xl font-bold text-dashText">
            {profile.credits_used}/{profile.credits_limit}
          </p>
          <p className="text-xs text-accent group-hover:underline mt-0.5 flex items-center gap-0.5">
            <BarChart2 size={10} /> View analytics
          </p>
        </Link>
        <Link href={`/${locale}/analytics`} className="bg-dashCard border border-dashSurface2 rounded-xl p-3 hover:border-accent/30 transition-colors group">
          <p className="text-xs text-dashMuted mb-0.5">ROAS</p>
          <p className="text-xl font-bold text-dashText">—</p>
          <p className="text-xs text-accent group-hover:underline mt-0.5 flex items-center gap-0.5">
            <BarChart2 size={10} /> Import ad data
          </p>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dashText">Mission Control</h1>
        <p className="text-dashMuted mt-1">
          Good {timeOfDay}{bp?.business_name ? `, ${bp.business_name}` : ''}.
          {creditsRemaining > 0
            ? ` You have ${creditsRemaining} credits remaining.`
            : ' Your credits are used up — upgrade to continue.'}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
          <p className="text-xs text-dashMuted mb-1">Credits left</p>
          <p className={`text-2xl font-bold ${creditsRemaining > 10 ? 'text-green-400' : creditsRemaining > 3 ? 'text-amber-400' : 'text-red-400'}`}>
            {creditsRemaining}
          </p>
          <p className="text-xs text-dashMuted">of {profile.credits_limit}</p>
        </div>
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
          <p className="text-xs text-dashMuted mb-1">Generations</p>
          <p className="text-2xl font-bold text-dashText">{recentGens?.length ?? 0}</p>
          <p className="text-xs text-dashMuted">recent</p>
        </div>
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
          <p className="text-xs text-dashMuted mb-1">Contacts</p>
          <p className="text-2xl font-bold text-dashText">{contactCount}</p>
          <p className="text-xs text-dashMuted">in CRM</p>
        </div>
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
          <p className="text-xs text-dashMuted mb-1">Need attention</p>
          <p className={`text-2xl font-bold ${lapsedCount > 0 ? 'text-amber-400' : 'text-green-400'}`}>{lapsedCount}</p>
          <p className="text-xs text-dashMuted">lapsed / at risk</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="lg:col-span-2 bg-dashCard rounded-xl border border-dashSurface2 p-6">
          <h2 className="text-sm font-semibold text-dashText uppercase tracking-wide mb-4">Quick Create</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickActions.map(action => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-2.5 p-3 rounded-lg bg-dashSurface hover:bg-dashSurface2 border border-dashSurface2 hover:border-accent/30 transition-all group"
              >
                <action.icon size={18} className={action.color} />
                <span className="text-sm text-dashText font-medium">{action.label}</span>
              </Link>
            ))}
          </div>

          {/* Problem solver CTA */}
          <Link
            href={`/${locale}/dashboard/advisor`}
            className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-accentDim border border-accent/20 hover:border-accent/40 transition-all"
          >
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shrink-0">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-dashText">Problem Solver</p>
              <p className="text-xs text-dashMuted">Describe any business challenge — get expert analysis + action plan</p>
            </div>
          </Link>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Recent generations */}
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-dashText uppercase tracking-wide">Recent</h2>
              <Link href={`/${locale}/dashboard/library`} className="text-xs text-accent hover:underline">View all</Link>
            </div>
            {recentGens && recentGens.length > 0 ? (
              <ul className="space-y-2">
                {recentGens.map(gen => (
                  <li key={gen.id} className="flex items-start gap-2">
                    <span className="text-xs bg-dashSurface text-dashMuted px-1.5 py-0.5 rounded mt-0.5 shrink-0">
                      {typeLabel[gen.type] ?? gen.type}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-dashText truncate">{gen.content?.slice(0, 60)}...</p>
                      <p className="text-xs text-dashMuted">{timeAgo(gen.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-dashMuted">No generations yet. Create your first piece of content above.</p>
            )}
          </div>

          {/* CRM nudge */}
          {lapsedCount > 0 && (
            <Link
              href={`/${locale}/dashboard/customers`}
              className="block bg-dashCard rounded-xl border border-amber-500/20 p-5 hover:border-amber-500/40 transition-all"
            >
              <div className="flex items-start gap-3">
                <Users size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-dashText">{lapsedCount} contacts need attention</p>
                  <p className="text-xs text-dashMuted mt-0.5">Lapsed or at-risk customers — reach out now.</p>
                </div>
              </div>
            </Link>
          )}

          {/* Upgrade nudge for trial */}
          {profile.plan === 'trial' && (
            <Link
              href={`/${locale}/pricing`}
              className="block bg-accentDim rounded-xl border border-accent/20 p-5 hover:border-accent/40 transition-all"
            >
              <div className="flex items-start gap-3">
                <TrendingUp size={16} className="text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-dashText">Upgrade to Launch</p>
                  <p className="text-xs text-dashMuted mt-0.5">100 credits/month + CRM. From £39/mo.</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
