import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { FileText, BookOpen, Share2, Star, Mail, Search, Zap, Users, TrendingUp, BarChart2 } from 'lucide-react'
import { timeAgo } from '@/lib/utils'
import { ADMIN_IDS } from '@/lib/admin'
import { getTranslations } from 'next-intl/server'
import ReturnBriefingComponent from '@/components/dashboard/ReturnBriefing'
import RecommendedAgents from '@/components/dashboard/RecommendedAgents'
import { generateReturnBriefing } from '@/lib/agents/projectMemoryAgent'
import type { ReturnBriefing } from '@/lib/agents/projectMemoryAgent'

export default async function MissionControlPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)

  const [{ data: profile }, { data: bp }, { data: recentGens }, { data: crmStats }, { data: revenueData }, { data: lastSession }, { data: profileData }] = await Promise.all([
    supabase.from('profiles').select('plan, credits_used, credits_limit, business_type').eq('id', user.id).single(),
    supabase.from('business_profiles').select('*').eq('user_id', user.id).eq('is_primary', true).single(),
    supabase.from('saved_generations').select('id, type, content, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('contacts').select('id, status').eq('user_id', user.id),
    supabase.from('revenue_snapshots').select('total_revenue, total_jobs').eq('user_id', user.id).gte('snapshot_date', monthStart),
    supabase.from('user_sessions').select('*').eq('user_id', user.id).single(),
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
  ])

  if (!profile) redirect(`/${locale}/login`)

  const isAdminUser = ADMIN_IDS.includes(user.id)
  const t = await getTranslations('dashboard')

  // Calculate return briefing
  let returnBriefing: ReturnBriefing | null = null
  let showBriefing = false
  let userName = (profileData?.full_name as string | null)?.split(' ')[0] ?? 'there'

  if (lastSession?.last_session_at) {
    const lastActive = new Date(lastSession.last_session_at as string)
    const daysSince = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince > 1) {
      showBriefing = true
      try {
        returnBriefing = await generateReturnBriefing({
          userId: user.id,
          businessProfile: (bp ?? {}) as Record<string, unknown>,
          lastSession: (lastSession ?? {}) as Record<string, unknown>,
          recentGenerations: (recentGens ?? []) as Record<string, unknown>[],
          daysSinceLastLogin: daysSince,
          locale,
        })
      } catch {
        // silently skip briefing on error
      }
    }
  }

  const revenueThisMonth = (revenueData ?? []).reduce((s, r) => s + (r.total_revenue ?? 0), 0)
  const jobsThisMonth = (revenueData ?? []).reduce((s, r) => s + (r.total_jobs ?? 0), 0)

  const hour = now.getHours()
  const welcomeKey = hour < 12 ? 'welcomeMorning' : hour < 17 ? 'welcomeAfternoon' : 'welcomeEvening'

  const contactCount = crmStats?.length ?? 0
  const lapsedCount = crmStats?.filter(c => c.status === 'lapsed' || c.status === 'at_risk').length ?? 0
  const creditsRemaining = isAdminUser ? Infinity : (profile.credits_limit ?? 20) - (profile.credits_used ?? 0)

  const quickActions = [
    { href: `/${locale}/dashboard/content/gbp-posts`, label: t('gbpPost'), icon: FileText, color: 'text-blue-400' },
    { href: `/${locale}/dashboard/content/blog`, label: t('blogPost'), icon: BookOpen, color: 'text-purple-400' },
    { href: `/${locale}/dashboard/content/social`, label: t('socialCaption'), icon: Share2, color: 'text-pink-400' },
    { href: `/${locale}/dashboard/content/reviews`, label: t('reviewResponse'), icon: Star, color: 'text-amber-400' },
    { href: `/${locale}/dashboard/content/email`, label: t('emailGen'), icon: Mail, color: 'text-green-400' },
    { href: `/${locale}/dashboard/content/seo`, label: t('seoCopy'), icon: Search, color: 'text-cyan-400' },
  ]

  const typeLabel: Record<string, string> = {
    gbp_post: 'GBP Post', blog: 'Blog', social_caption: 'Social', review_response: 'Review',
    email: 'Email', seo: 'SEO', repurposed: 'Repurpose',
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Return briefing */}
      {showBriefing && returnBriefing && (
        <ReturnBriefingComponent briefing={returnBriefing} userName={userName} />
      )}

      {/* Recommended agents based on business type */}
      {(profile as { business_type?: string })?.business_type && (
        <RecommendedAgents
          businessType={(profile as { business_type?: string }).business_type!}
          businessName={bp?.business_name}
        />
      )}

      {/* Mini analytics strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Link href={`/${locale}/analytics`} className="bg-dashCard border border-dashSurface2 rounded-xl p-3 hover:border-accent/30 transition-colors group">
          <p className="text-xs text-dashMuted mb-0.5">{t('revenueThisMonth')}</p>
          <p className="text-xl font-bold text-dashText">€{revenueThisMonth.toFixed(0)}</p>
          <p className="text-xs text-accent group-hover:underline mt-0.5 flex items-center gap-0.5">
            <BarChart2 size={10} /> {t('viewAnalytics')}
          </p>
        </Link>
        <Link href={`/${locale}/analytics`} className="bg-dashCard border border-dashSurface2 rounded-xl p-3 hover:border-accent/30 transition-colors group">
          <p className="text-xs text-dashMuted mb-0.5">{t('jobsThisMonth')}</p>
          <p className="text-xl font-bold text-dashText">{jobsThisMonth}</p>
          <p className="text-xs text-accent group-hover:underline mt-0.5 flex items-center gap-0.5">
            <BarChart2 size={10} /> {t('viewAnalytics')}
          </p>
        </Link>
        <Link href={`/${locale}/analytics`} className="bg-dashCard border border-dashSurface2 rounded-xl p-3 hover:border-accent/30 transition-colors group">
          <p className="text-xs text-dashMuted mb-0.5">{t('creditsUsed')}</p>
          <p className="text-xl font-bold text-dashText">
            {isAdminUser ? `∞ ${t('unlimited')}` : `${profile.credits_used}/${profile.credits_limit}`}
          </p>
          <p className="text-xs text-accent group-hover:underline mt-0.5 flex items-center gap-0.5">
            <BarChart2 size={10} /> {t('viewAnalytics')}
          </p>
        </Link>
        <Link href={`/${locale}/analytics`} className="bg-dashCard border border-dashSurface2 rounded-xl p-3 hover:border-accent/30 transition-colors group">
          <p className="text-xs text-dashMuted mb-0.5">{t('roas')}</p>
          <p className="text-xl font-bold text-dashText">—</p>
          <p className="text-xs text-accent group-hover:underline mt-0.5 flex items-center gap-0.5">
            <BarChart2 size={10} /> {t('importAdData')}
          </p>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dashText">{t('title')}</h1>
        <p className="text-dashMuted mt-1">
          {t(welcomeKey, { name: bp?.business_name ?? '' })}
          {isAdminUser
            ? ` ${t('welcomeCredits', { count: '∞' })}`
            : creditsRemaining > 0
              ? ` ${t('welcomeCredits', { count: String(creditsRemaining) })}`
              : ` ${t('welcomeNoCredits')}`}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
          <p className="text-xs text-dashMuted mb-1">{t('creditsLeft')}</p>
          <p className={`text-2xl font-bold ${isAdminUser ? 'text-indigo-400' : creditsRemaining > 10 ? 'text-green-400' : creditsRemaining > 3 ? 'text-amber-400' : 'text-red-400'}`}>
            {isAdminUser ? '∞' : creditsRemaining}
          </p>
          <p className="text-xs text-dashMuted">{isAdminUser ? t('unlimited') : `of ${profile.credits_limit}`}</p>
        </div>
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
          <p className="text-xs text-dashMuted mb-1">{t('generations')}</p>
          <p className="text-2xl font-bold text-dashText">{recentGens?.length ?? 0}</p>
          <p className="text-xs text-dashMuted">{t('recent')}</p>
        </div>
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
          <p className="text-xs text-dashMuted mb-1">{t('contacts')}</p>
          <p className="text-2xl font-bold text-dashText">{contactCount}</p>
          <p className="text-xs text-dashMuted">{t('inCRM')}</p>
        </div>
        <div className="bg-dashCard rounded-xl border border-dashSurface2 p-4">
          <p className="text-xs text-dashMuted mb-1">{t('needAttention')}</p>
          <p className={`text-2xl font-bold ${lapsedCount > 0 ? 'text-amber-400' : 'text-green-400'}`}>{lapsedCount}</p>
          <p className="text-xs text-dashMuted">{t('lapsedAtRisk')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="lg:col-span-2 bg-dashCard rounded-xl border border-dashSurface2 p-6">
          <h2 className="text-sm font-semibold text-dashText uppercase tracking-wide mb-4">{t('quickCreate')}</h2>
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
              <p className="text-sm font-semibold text-dashText">{t('problemSolver')}</p>
              <p className="text-xs text-dashMuted">{t('problemSolverDesc')}</p>
            </div>
          </Link>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Recent generations */}
          <div className="bg-dashCard rounded-xl border border-dashSurface2 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-dashText uppercase tracking-wide">Recent</h2>
              <Link href={`/${locale}/dashboard/library`} className="text-xs text-accent hover:underline">{t('viewAll')}</Link>
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
              <p className="text-xs text-dashMuted">{t('noGenerations')}</p>
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
          {!isAdminUser && profile.plan === 'trial' && (
            <Link
              href={`/${locale}/pricing`}
              className="block bg-accentDim rounded-xl border border-accent/20 p-5 hover:border-accent/40 transition-all"
            >
              <div className="flex items-start gap-3">
                <TrendingUp size={16} className="text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-dashText">{t('upgradeToLaunch')}</p>
                  <p className="text-xs text-dashMuted mt-0.5">{t('upgradeDesc')}</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
