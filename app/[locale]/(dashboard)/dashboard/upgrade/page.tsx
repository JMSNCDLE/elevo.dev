import Link from 'next/link'
import { Rocket, CheckCircle2 } from 'lucide-react'

export default function UpgradePage({ params }: { params: { locale: string } }) {
  return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <div className="w-16 h-16 bg-accentDim rounded-2xl flex items-center justify-center mx-auto mb-5">
        <Rocket size={28} className="text-accent" />
      </div>
      <h1 className="text-2xl font-bold text-dashText mb-2">Upgrade to Orbit</h1>
      <p className="text-dashMuted mb-6">Unlock all Growth tools: sales proposals, market research, strategy planning, financial analysis, HR documents, and campaign planning.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
        {[
          'Sales & Proposals AI',
          'Market Research (live web)',
          'Strategy & SWOT analysis',
          'Financial Health reports',
          'Management & HR documents',
          'Campaign planning',
          'Unlimited contacts',
          '300 credits/month',
        ].map(f => (
          <div key={f} className="flex items-center gap-2 text-sm text-dashMuted">
            <CheckCircle2 size={15} className="text-accent shrink-0" />
            {f}
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-center">
        <Link href={`/${params.locale}/pricing`} className="px-6 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accentLight transition-colors">
          View plans
        </Link>
        <Link href={`/${params.locale}/dashboard`} className="px-6 py-2.5 border border-dashSurface2 text-dashMuted rounded-lg hover:text-dashText transition-colors">
          Maybe later
        </Link>
      </div>
    </div>
  )
}
