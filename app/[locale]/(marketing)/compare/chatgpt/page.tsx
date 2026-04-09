import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ELEVO AI vs ChatGPT — Purpose-Built for Business',
  description: 'Compare ELEVO AI and ChatGPT Plus. ChatGPT is a general chatbot. ELEVO is a purpose-built business platform with 60+ specialised AI agents. From €39/mo.',
}

interface PageProps {
  params: Promise<{ locale: string }>
}

const FEATURES = [
  { feature: 'General AI chat', elevo: true, competitor: true },
  { feature: 'Content generation', elevo: true, competitor: true },
  { feature: 'Image generation', elevo: true, competitor: true },
  { feature: 'Business-specific AI agents', elevo: true, competitor: false },
  { feature: 'CRM & contact management', elevo: true, competitor: false },
  { feature: 'Competitor intelligence', elevo: true, competitor: false },
  { feature: 'ROAS & ad analysis', elevo: true, competitor: false },
  { feature: 'Financial health reports', elevo: true, competitor: false },
  { feature: 'Sales pipeline & proposals', elevo: true, competitor: false },
  { feature: 'Social media auto-posting', elevo: true, competitor: false },
  { feature: 'Google Business Profile', elevo: true, competitor: false },
  { feature: 'AI video studio', elevo: true, competitor: false },
  { feature: 'Business dashboard', elevo: true, competitor: false },
  { feature: 'Team collaboration', elevo: true, competitor: true },
  { feature: 'Saved generations library', elevo: true, competitor: false },
  { feature: '12 language support', elevo: true, competitor: true },
  { feature: '7-day free trial', elevo: true, competitor: false },
  { feature: 'Starting price', elevo: '€39/mo', competitor: '$20/mo' },
]

const REASONS = [
  { title: 'Purpose-built vs general-purpose', desc: 'ChatGPT is a general chatbot. ELEVO has 60+ specialised agents — each one trained for a specific business task like SEO, ads, CRM, or competitor intel.' },
  { title: 'Business dashboard, not a chat window', desc: 'ELEVO gives you a full business dashboard with analytics, content library, CRM, scheduling, and team collaboration. ChatGPT gives you a conversation.' },
  { title: 'Automated workflows', desc: 'ELEVO agents work autonomously — scheduling posts, monitoring competitors, sending follow-ups, and managing your pipeline. ChatGPT only responds when you ask.' },
  { title: 'No prompt engineering needed', desc: 'Every ELEVO agent knows your business context, brand voice, and goals. No need to re-explain your business in every conversation like with ChatGPT.' },
]

export default async function CompareChatGPTPage({ params }: PageProps) {
  const { locale } = await params

  return (
    <main className="bg-white min-h-screen">
      <section className="pt-20 pb-12 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <Link href={`/${locale}/compare`} className="text-sm text-indigo-600 hover:underline mb-4 inline-block">&larr; All comparisons</Link>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">ELEVO AI vs ChatGPT</h1>
          <p className="mt-4 text-lg text-gray-500">ChatGPT is a chatbot. ELEVO is an AI business platform with 60+ specialised agents.</p>
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
                  <th className="py-4 px-5 text-gray-400 font-medium">ChatGPT Plus</th>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why choose ELEVO over ChatGPT</h2>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to upgrade from ChatGPT?</h2>
          <p className="text-gray-500 mb-6">Get a full AI business platform — not just a chatbot.</p>
          <Link href={`/${locale}/signup`} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">
            Start free trial &rarr;
          </Link>
          <p className="mt-4 text-sm text-gray-400">7-day free trial on every plan. Cancel anytime.</p>
        </div>
      </section>
    </main>
  )
}
