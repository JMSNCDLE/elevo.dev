import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { InstagramAudit } from '@/lib/agents/instagramAuditAgent'
import { createServiceClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

interface PageData {
  audit: InstagramAudit
  agencyName: string
  agencyLogoUrl: string | null
  businessName: string
}

async function getPageData(slug: string): Promise<PageData | null> {
  const supabase = await createServiceClient()

  const { data } = await supabase
    .from('prospect_audits')
    .select('audit_data, agency_name, agency_logo_url, business_name, expires_at, views')
    .eq('page_slug', slug)
    .single()

  if (!data) return null

  if (data.expires_at && new Date(data.expires_at) < new Date()) return null

  // Increment views (fire and forget)
  supabase
    .from('prospect_audits')
    .update({ views: (data.views ?? 0) + 1, last_viewed_at: new Date().toISOString() })
    .eq('page_slug', slug)
    .then(() => {})

  return {
    audit: data.audit_data as unknown as InstagramAudit,
    agencyName: data.agency_name ?? 'ELEVO AI',
    agencyLogoUrl: data.agency_logo_url ?? null,
    businessName: data.business_name ?? data.audit_data?.handle ?? 'Your Business',
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const pageData = await getPageData(slug)
  if (!pageData) return { title: 'Demo Not Found' }

  return {
    title: `Instagram Audit — ${pageData.businessName} | ${pageData.agencyName}`,
    description: pageData.audit.demoPageContent?.heroSubtext ?? 'Personalised Instagram audit and growth report.',
    robots: { index: false, follow: false },
  }
}

export default async function DemoPage({ params }: Props) {
  const { locale, slug } = await params
  const pageData = await getPageData(slug)

  if (!pageData) notFound()

  const { audit, agencyName, businessName } = pageData

  const problems = audit.quickWins.filter(w => w.effort !== 'minutes' && w.canELEVODoThis)
  const quickWins = audit.quickWins.filter(w => w.effort === 'minutes' && w.canELEVODoThis)

  const scoreColor =
    audit.overallScore >= 70
      ? 'text-green-600'
      : audit.overallScore >= 40
      ? 'text-amber-600'
      : 'text-red-600'

  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner */}
      <div className="bg-indigo-600 py-3 px-4 text-center">
        <p className="text-white text-sm">
          This demo was personalised for{' '}
          <strong className="font-bold">{businessName}</strong> by{' '}
          <strong className="font-bold">{agencyName}</strong>
        </p>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-b from-indigo-50 to-white py-20 px-6 text-center border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-wide mb-6">
            Personalised Instagram Audit
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-5">
            {audit.demoPageContent?.heroHeadline ?? `${businessName} is missing revenue from Instagram`}
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
            {audit.demoPageContent?.heroSubtext ?? 'A personalised audit has identified key growth opportunities for your Instagram account.'}
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span>
              Overall Score:{' '}
              <strong className={`font-black text-2xl ${scoreColor}`}>
                {audit.overallScore}
                <span className="text-base">/100</span>
              </strong>
            </span>
            <span>·</span>
            <span>Followers: <strong className="text-gray-700">{audit.estimatedFollowers}</strong></span>
            <span>·</span>
            <span>Engagement: <strong className="text-gray-700">{audit.estimatedEngagementRate}</strong></span>
          </div>
        </div>
      </section>

      {/* 3 Column Section */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Problems Found */}
          <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-red-100 text-red-600 text-sm font-black flex items-center justify-center">!</span>
              Problems Found
            </h2>
            <div className="space-y-3">
              {problems.length === 0 ? (
                <p className="text-sm text-gray-500">No critical problems — but there are still opportunities.</p>
              ) : (
                problems.map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                    <p className="text-sm text-gray-700">{p.action}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Wins */}
          <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-green-100 text-green-600 text-sm font-black flex items-center justify-center">⚡</span>
              Quick Wins
            </h2>
            <div className="space-y-3">
              {quickWins.length === 0 ? (
                <p className="text-sm text-gray-500">Quick wins identified — book a call to hear them.</p>
              ) : (
                quickWins.map((w, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0" />
                    <p className="text-sm text-gray-700">{w.action}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Revenue Opportunity */}
          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-sm font-black flex items-center justify-center">£</span>
              Revenue Opportunity
            </h2>
            <div className="space-y-3">
              {audit.revenueOpportunities.length === 0 ? (
                <p className="text-sm text-gray-500">Revenue opportunities identified — see full report.</p>
              ) : (
                audit.revenueOpportunities.slice(0, 4).map((opp, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                    <p className="text-sm text-gray-700">{opp}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Before / After Examples */}
      {audit.demoPageContent?.beforeAfterExamples?.length > 0 && (
        <section className="py-12 px-6 bg-gray-50 border-y border-gray-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              What this could look like
            </h2>
            <div className="space-y-5">
              {audit.demoPageContent.beforeAfterExamples.map((example, i) => (
                <div key={i} className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-red-500 uppercase mb-2">Before</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{example.before}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-indigo-200 shadow-sm">
                    <p className="text-xs font-bold text-indigo-600 uppercase mb-2">After (with ELEVO AI™)</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{example.after}</p>
                  </div>
                  {example.context && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400 italic text-center">{example.context}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto bg-indigo-600 rounded-3xl p-10 text-center shadow-xl">
          <h2 className="text-2xl font-black text-white mb-3">
            ELEVO AI™ can fix all of this automatically
          </h2>
          <p className="text-indigo-200 text-sm mb-8 leading-relaxed">
            {audit.demoPageContent?.cta ?? 'Book a free call and we\'ll show you exactly how in 15 minutes.'}
          </p>

          <div className="space-y-3 mb-6">
            <Link
              href={`/${locale}/signup`}
              className="block w-full py-3.5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-sm"
            >
              Start free trial →
            </Link>
            <a
              href="https://calendly.com/elevo-ai/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3.5 border-2 border-white/30 text-white font-semibold rounded-xl hover:border-white/60 transition-colors text-sm"
            >
              Book a free 15-min call
            </a>
          </div>

          <p className="text-indigo-300 text-xs">
            No credit card required · Free for 7 days
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-6 text-center">
        <p className="text-xs text-gray-400">
          This personalised audit was generated by{' '}
          <Link href={`/${locale}`} className="text-indigo-600 hover:underline font-medium">
            ELEVO AI™
          </Link>{' '}
          for {agencyName}. All data is estimated from publicly available information.
        </p>
      </footer>
    </div>
  )
}
