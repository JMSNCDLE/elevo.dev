import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { HomePricingCards, HomeComparisonPrice, HomeOrbitPrice } from '@/components/marketing/HomePricing'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ELEVO AI™ — Create and Boost Your Business Powered by AI',
  description: 'Create and boost your business powered by AI — every aspect taken care of. 47+ AI agents for content, marketing, ads, CRM, SEO, and analytics. 7-day free trial.',
  keywords: ['AI for business', 'business AI tools', 'marketing AI', 'local business AI', 'ELEVO AI', 'AI agents', 'content automation', 'CRM AI', 'SEO AI'],
}

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations('marketing')

  return (
    <main className="overflow-hidden">

      {/* ── SECTION 1: HERO ──────────────────────────────────────────────────── */}
      <section className="bg-[#050507] relative overflow-hidden min-h-screen flex flex-col justify-center px-6 py-32">
        <div className="grid-overlay" />
        <div className="hero-beam" />
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="v-badge mx-auto mb-8 w-fit">
            ✦ Now with ELEVO CEO™
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white tracking-tight leading-none mb-8">
            {t('heroTitle1')}<br />
            {t('heroTitle2')}{' '}
            <span className="gradient-text-hero">{t('heroTitle3')}</span>
          </h1>

          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link
              href={`/${locale}/signup`}
              className="inline-flex items-center justify-center bg-white text-gray-900 font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-colors"
            >
              {t('startTrial')}
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center border border-white/20 text-white px-8 py-3 rounded-full hover:bg-white/5 transition-colors"
            >
              See how it works
            </Link>
          </div>

          <p className="text-white/35 text-xs">400+ businesses · 12 countries · 99.9% uptime</p>

          {/* Dashboard Mockup */}
          <div className="max-w-5xl mx-auto mt-20" style={{ perspective: '1200px' }}>
            <div
              style={{ transform: 'rotateX(4deg)' }}
              className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl transform-gpu flex"
            >
              {/* Sidebar */}
              <div className="w-56 bg-[#0e1117] border-r border-white/5 p-4 shrink-0 hidden md:block">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-black text-xs">E</span>
                  </div>
                  <span className="text-white font-black text-sm">ELEVO AI™</span>
                </div>
                <div className="space-y-1">
                  {[
                    { label: 'Dashboard', color: 'bg-indigo-500' },
                    { label: 'Content', color: 'bg-purple-500' },
                    { label: 'Growth', color: 'bg-green-500' },
                    { label: 'Intelligence', color: 'bg-red-500' },
                    { label: 'Customers', color: 'bg-blue-500' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-gray-400 text-xs">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main */}
              <div className="flex-1 bg-[#080c14] p-6">
                <h2 className="text-white font-bold text-xl mb-4">Mission Control</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Credits Used', value: '247' },
                    { label: 'Content Generated', value: '83' },
                    { label: 'Growth Score', value: '94%' },
                    { label: 'Businesses Helped', value: '400+' },
                  ].map(m => (
                    <div key={m.label} className="glass-card p-3">
                      <p className="text-white font-bold text-lg">{m.value}</p>
                      <p className="text-white/40 text-xs">{m.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { agent: 'ELEVO Spy™', action: 'Competitor alert: rival posted viral reel', time: '2m ago', dot: 'bg-red-400' },
                    { agent: 'ELEVO Market™', action: 'Monthly strategy updated for Q2', time: '5m ago', dot: 'bg-green-400' },
                    { agent: 'ELEVO SMM™', action: '3 posts scheduled across all platforms', time: '12m ago', dot: 'bg-blue-400' },
                  ].map(item => (
                    <div key={item.agent} className="flex items-center gap-3 bg-white/3 rounded-lg p-3">
                      <div className={`w-2 h-2 rounded-full ${item.dot} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white">{item.agent}</p>
                        <p className="text-xs text-gray-500 truncate">{item.action}</p>
                      </div>
                      <span className="text-xs text-gray-600 shrink-0">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Fade mask */}
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#050507] to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ── SECTION 2: LOGOS ─────────────────────────────────────────────────── */}
      <section className="bg-[#080810] border-y border-white/5 py-12 overflow-hidden">
        <p className="text-white/40 text-sm text-center mb-6">Trusted by businesses using</p>
        <div className="flex gap-12 animate-[marquee_25s_linear_infinite] whitespace-nowrap w-max">
          {['Restaurants', 'Hair Salons', 'Plumbers', 'Dentists', 'Gyms', 'Retailers', 'Accountants', 'Estate Agents', 'Solicitors', 'Electricians', 'Cleaners', 'Physiotherapists', 'Restaurants', 'Hair Salons', 'Plumbers', 'Dentists', 'Gyms', 'Retailers', 'Accountants', 'Estate Agents', 'Solicitors', 'Electricians', 'Cleaners', 'Physiotherapists'].map((type, i) => (
            <span key={i} className="text-white/30 text-sm font-medium">{type}</span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </section>

      {/* ── SECTIONS 3-5: FEATURE ROWS ───────────────────────────────────────── */}
      <section id="features" className="bg-[#050507] py-24">

        {/* Row 1: ROAS Intelligence */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-4">Intelligence</span>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
                Know your ROAS<br />before you spend.
              </h2>
              <p className="text-white/60 text-lg mb-8 leading-relaxed">
                ELEVO analyses your ad spend and sales data to show you exactly where your money is working — and where it's being wasted.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Real-time ROAS by platform and campaign',
                  'Wastage detection with reallocation advice',
                  'Google, Meta, TikTok all in one view',
                  'Plain English recommendations',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                    <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="terminal">
              <div className="terminal-bar">
                <div className="t-dot t-red" />
                <div className="t-dot t-yellow" />
                <div className="t-dot t-green" />
                <span className="text-white/30 text-xs ml-2">ELEVO ROAS Analysis</span>
              </div>
              <div className="p-5 text-sm space-y-2">
                <p className="text-white/40"># Running ROAS analysis for Apex Plumbing...</p>
                <p className="text-green-400">✓ Google Ads: ROAS 4.2x — strong</p>
                <p className="text-yellow-400">⚠ Meta Ads: ROAS 1.1x — poor</p>
                <p className="text-green-400">✓ TikTok: ROAS 3.8x — good</p>
                <p className="text-white/40">&nbsp;</p>
                <p className="text-white/80">Recommendation:</p>
                <p className="text-indigo-400">→ Reallocate £400/mo from Meta to Google</p>
                <p className="text-indigo-400">→ Projected improvement: +£1,680/mo</p>
                <p className="text-white/40">&nbsp;</p>
                <p className="text-green-400">✓ Report saved to Intelligence hub</p>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Social Automation */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="bg-[#0d1117] border border-white/8 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Today&apos;s Schedule</span>
                <span className="text-xs text-white/30">3 posts ready</span>
              </div>
              {[
                { platform: 'Instagram', time: '9:00 AM', caption: 'Behind the scenes at our shop this morning 📸', color: 'bg-pink-500' },
                { platform: 'Facebook', time: '12:30 PM', caption: 'Limited slots this week — book now before they go!', color: 'bg-blue-500' },
                { platform: 'Google', time: '5:00 PM', caption: 'Update: Extended hours this Saturday until 7pm', color: 'bg-green-500' },
              ].map(post => (
                <div key={post.platform} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${post.color}`} />
                    <span className="text-xs font-semibold text-white">{post.platform}</span>
                    <span className="text-xs text-white/40 ml-auto">{post.time}</span>
                  </div>
                  <p className="text-sm text-white/70">{post.caption}</p>
                </div>
              ))}
            </div>
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-4">Automation</span>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
                Post everywhere.<br />Without lifting a finger.
              </h2>
              <p className="text-white/60 text-lg mb-8 leading-relaxed">
                ELEVO SMM™ generates and schedules your social media content across Instagram, Facebook, Google, TikTok, and LinkedIn — automatically.
              </p>
              <ul className="space-y-3">
                {[
                  'AI writes captions in your brand voice',
                  'Auto-scheduled at peak engagement times',
                  'Platform-optimised for each channel',
                  '30-day content calendar in one click',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                    <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Row 3: Competitor Intel */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest block mb-4">Intelligence</span>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
                Know everything about<br />your competitors.
              </h2>
              <p className="text-white/60 text-lg mb-8 leading-relaxed">
                ELEVO Spy™ monitors competitor content, ads, SEO rankings, and customer sentiment in real time. Weekly battle plans delivered straight to your dashboard.
              </p>
              <ul className="space-y-3">
                {[
                  'Live competitor content monitoring',
                  'Ad campaign reverse engineering',
                  'SEO gap identification',
                  'Weekly battle plan with exact tactics',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                    <CheckCircle2 size={16} className="text-red-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#0d1117] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Competitor Alert</span>
                <span className="text-xs text-white/30">2 minutes ago</span>
              </div>
              <div className="mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-red-400 font-black text-sm">!</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Rival Co.</p>
                  <p className="text-white/40 text-xs">Threat level: HIGH</p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">HIGH</span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'New viral post detected', severity: 'HIGH', color: 'text-red-400 bg-red-500/10' },
                  { label: 'Ad spend increased 40%', severity: 'MEDIUM', color: 'text-yellow-400 bg-yellow-500/10' },
                  { label: 'Ranking #3 for your keyword', severity: 'WATCH', color: 'text-blue-400 bg-blue-500/10' },
                ].map(alert => (
                  <div key={alert.label} className="flex items-center gap-3 p-2.5 bg-white/4 rounded-lg">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${alert.color}`}>{alert.severity}</span>
                    <span className="text-sm text-white/70">{alert.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
                <p className="text-xs text-indigo-300">Battle plan: Counter with a behind-the-scenes reel today. Post at 6pm for maximum reach.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: STATS ─────────────────────────────────────────────────── */}
      <section className="bg-[#030305] py-24 relative overflow-hidden">
        <div className="grid-overlay" />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="section-divider mb-16" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: '400+', label: 'Businesses' },
              { value: '35+', label: 'API Routes' },
              { value: '£616', label: 'Avg monthly ROI' },
              { value: '99.9%', label: 'Uptime' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="stat-num">{stat.value}</p>
                <p className="text-white/40 text-sm mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="section-divider mt-16" />
        </div>
      </section>

      {/* ── SECTION 7: COMPARISON ────────────────────────────────────────────── */}
      <section className="bg-[#FFFEF9] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
              How ELEVO AI™ compares
            </h2>
            <p className="text-gray-500 mt-4">One platform instead of four</p>
          </div>
          <div className="comparison-table-wrap">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 pr-6 text-gray-500 font-medium">Feature</th>
                  <th className="py-3 px-4 text-indigo-600 font-black">ELEVO AI™</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">Hootsuite</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">Jasper</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">HubSpot</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Content generation', '✓', '✗', '✓', '✓'],
                  ['Market research', '✓', '✗', '✗', '✗'],
                  ['Competitor spy', '✓', '✗', '✗', '✗'],
                  ['CRM & contacts', '✓', '✗', '✗', '✓'],
                  ['Financial health', '✓', '✗', '✗', '✗'],
                  ['ROAS analysis', '✓', '✗', '✗', '✗'],
                  ['Stripe billing built-in', '✓', '✗', '✗', '✗'],
                  ['Multi-language (12)', '✓', '✗', '✗', '✗'],
                  ['7-day free trial', '✓', '✓', '✓', '✗'],
                  ['Starting price', 'From €39/mo', '€99/mo', '€39/mo', '€720/mo'],
                ].map(([feature, elevo, hs, jasper, hub], i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 pr-6 text-gray-700 font-medium">{feature}</td>
                    <td className={`py-3 px-4 text-center font-bold ${elevo === '✓' ? 'text-indigo-600' : 'text-gray-900'}`}>{elevo}</td>
                    <td className={`py-3 px-4 text-center ${hs === '✓' ? 'text-green-600' : 'text-gray-400'}`}>{hs}</td>
                    <td className={`py-3 px-4 text-center ${jasper === '✓' ? 'text-green-600' : 'text-gray-400'}`}>{jasper}</td>
                    <td className={`py-3 px-4 text-center ${hub === '✓' ? 'text-green-600' : 'text-gray-400'}`}>{hub}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: PRICING ───────────────────────────────────────────────── */}
      <section className="bg-[#FFFEF9] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
              {t('pricingTitle')}
            </h2>
            <p className="text-gray-500 mt-4">{t('pricingSubtitle')}</p>
          </div>
          <HomePricingCards />
          <p className="text-center text-gray-400 text-sm mt-8">
            {t('trialNote')}
          </p>
        </div>
      </section>

      {/* ── SECTION 8B: WHY HIRE WHEN AI WORKS 24/7? ──────────────────────── */}
      <section className="bg-[#050507] py-24 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              Why hire when AI agents work 24/7?
            </h2>
            <p className="text-white/50 mt-4 text-lg max-w-2xl mx-auto">
              Each ELEVO agent replaces the need for a full-time employee — at a fraction of the cost.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { role: 'Marketing Manager', cost: '€3,500/mo', agent: 'ELEVO Market™' },
              { role: 'Social Media Manager', cost: '€2,200/mo', agent: 'ELEVO SMM™' },
              { role: 'Sales Rep', cost: '€2,800/mo', agent: 'Sales Strategist Agent' },
              { role: 'Content Writer', cost: '€1,800/mo', agent: 'ELEVO Write™' },
              { role: 'Business Analyst', cost: '€3,000/mo', agent: 'ELEVO Spy™' },
              { role: 'Executive Coach', cost: '€4,000/mo', agent: 'Execution Coach Agent' },
              { role: 'Researcher', cost: '€2,500/mo', agent: 'Researcher Agent' },
              { role: 'Personal Assistant', cost: '€2,000/mo', agent: 'ELEVO PA™' },
            ].map(item => (
              <div key={item.role} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">Replaces your</p>
                <p className="text-white font-bold text-lg mb-1 line-through decoration-red-500/60">{item.role}</p>
                <p className="text-red-400 text-sm line-through mb-3">{item.cost}</p>
                <div className="flex items-center gap-2">
                  <span className="text-white/30">→</span>
                  <p className="text-green-400 text-sm font-semibold">{item.agent}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-white/30 text-sm">Total employee cost: <span className="text-red-400 line-through">€21,800/mo</span></p>
            <p className="text-white text-2xl font-black mt-2">ELEVO Orbit: <HomeOrbitPrice /></p>
            <Link
              href="/en/signup"
              className="inline-flex items-center justify-center bg-white text-gray-900 font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-colors mt-6"
            >
              Start replacing costs with results →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 9: TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="bg-[#050507] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              Loved by local businesses
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                quote: "ELEVO completely transformed how I run my salon. The social media content alone saves me 5 hours a week. My Google reviews have nearly doubled.",
                name: 'Sam T.',
                role: 'Hair Salon, Manchester',
                stars: 5,
              },
              {
                quote: "The ROAS analysis told me I was wasting £600/month on Meta ads. Moved it to Google and my leads tripled. Paid for itself in week one.",
                name: 'Mike R.',
                role: 'Plumber, Birmingham',
                stars: 5,
              },
              {
                quote: "ELEVO Spy caught my competitor running a discount campaign before I even knew about it. I launched a counter-offer the same day. Game changer.",
                name: 'Laura K.',
                role: 'Gym Owner, Bristol',
                stars: 5,
              },
            ].map((t, i) => (
              <div key={i} className="glass-card p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <span key={j} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/40 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 10: FINAL CTA ────────────────────────────────────────────── */}
      <section className="bg-[#050507] py-32 px-6 relative overflow-hidden">
        <div className="hero-beam" />
        <div className="grid-overlay" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl font-black text-white tracking-tight mb-6">
            Build your AI business team today.
          </h2>
          <p className="text-white/50 text-lg mb-10">
            Join 400+ businesses already using ELEVO AI™ to work smarter and grow faster.
          </p>
          <Link
            href={`/${locale}/signup`}
            className="inline-flex items-center justify-center bg-white text-gray-900 font-semibold px-10 py-4 rounded-full hover:bg-white/90 transition-colors text-base"
          >
            {t('startFreeArrow')}
          </Link>
          <p className="text-white/30 text-xs mt-4">{t('trialNote')}</p>
        </div>
      </section>

    </main>
  )
}
