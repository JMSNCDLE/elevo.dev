import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ELEVO AI vs HubSpot — Full Marketing Suite at 1/18th the Price',
  description: 'Compare ELEVO AI and HubSpot side-by-side. 60+ AI agents, CRM, content, analytics — from €39/mo vs HubSpot at $720/mo. Switch and save €8,000+/year.',
}

interface PageProps {
  params: Promise<{ locale: string }>
}

const FEATURES = [
  { feature: 'CRM & contact management', elevo: true, competitor: true },
  { feature: 'Email marketing', elevo: true, competitor: true },
  { feature: 'AI content generation', elevo: true, competitor: true },
  { feature: 'Blog & SEO tools', elevo: true, competitor: true },
  { feature: 'Social media management', elevo: true, competitor: true },
  { feature: 'Sales pipeline', elevo: true, competitor: true },
  { feature: 'AI-powered 60+ agents', elevo: true, competitor: false },
  { feature: 'Competitor intelligence', elevo: true, competitor: false },
  { feature: 'ROAS & ad analysis', elevo: true, competitor: false },
  { feature: 'Financial health reports', elevo: true, competitor: false },
  { feature: 'Google Business Profile', elevo: true, competitor: false },
  { feature: 'AI video studio', elevo: true, competitor: false },
  { feature: 'Dropshipping suite', elevo: true, competitor: false },
  { feature: '12 language support', elevo: true, competitor: false },
  { feature: 'No per-seat pricing', elevo: true, competitor: false },
  { feature: '7-day free trial', elevo: true, competitor: false },
  { feature: 'Starting price', elevo: '€39/mo', competitor: '$720/mo' },
]

const REASONS = [
  { title: '18x cheaper — same capabilities', desc: 'HubSpot Marketing Hub starts at $720/mo. ELEVO starts at €39/mo and includes CRM, content, sales, analytics, and 60+ AI agents.' },
  { title: 'No per-seat charges', desc: 'HubSpot charges per user. ELEVO Galaxy includes up to 5 team members at €149/mo — no surprise bills as your team grows.' },
  { title: 'AI-native, not AI-bolted-on', desc: 'ELEVO was built from day one with AI agents at the core. HubSpot added AI features on top of a legacy CRM — it shows.' },
  { title: 'Competitor intelligence included', desc: 'ELEVO Spy™ gives you real-time competitor monitoring. HubSpot has nothing comparable — you\'d need a separate tool.' },
]

export default async function CompareHubSpotPage({ params }: PageProps) {
  const { locale } = await params

  return (
    <main className="bg-white min-h-screen">
      <section className="pt-20 pb-12 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <Link href={`/${locale}/compare`} className="text-sm text-indigo-600 hover:underline mb-4 inline-block">&larr; All comparisons</Link>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">ELEVO AI vs HubSpot</h1>
          <p className="mt-4 text-lg text-gray-500">Everything HubSpot does — plus 60+ AI agents — at 1/18th the price.</p>
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-5 text-gray-500 font-medium">Feature</th>
                  <th className="py-4 px-5 text-indigo-600 font-black">ELEVO AI&#8482;</th>
                  <th className="py-4 px-5 text-gray-400 font-medium">HubSpot</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((row, i) => (
                  <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="py-3 px-5 text-gray-700 font-medium">{row.feature}</td>
                    <td className="py-3 px-5 text-center font-bold">
                      {typeof row.elevo === 'boolean' ? (row.elevo ? <span className="text-indigo-600">&#10003;</span> : <span className="text-gray-400">&#10007;</span>) : <span className="text-gray-900">{row.elevo}</span>}
                    </td>
                    <td className="py-3 px-5 text-center">
                      {typeof row.competitor === 'boolean' ? (row.competitor ? <span className="text-green-600">&#10003;</span> : <span className="text-gray-400">&#10007;</span>) : <span className="text-gray-900">{row.competitor}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why switch from HubSpot to ELEVO</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {REASONS.map((r, i) => (
              <div key={i} className="rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{r.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to switch from HubSpot?</h2>
          <p className="text-gray-500 mb-6">Save €8,000+/year and get more AI power.</p>
          <Link href={`/${locale}/signup`} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">
            Start free trial &rarr;
          </Link>
          <p className="mt-4 text-sm text-gray-400">7-day free trial on every plan. Cancel anytime.</p>
        </div>
      </section>
    </main>
  )
}
