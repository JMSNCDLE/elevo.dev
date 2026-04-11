import Link from 'next/link'
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ session_id?: string }>
}

export const metadata = {
  title: 'Welcome to ELEVO AI™ — Your subscription is active',
}

export default async function CheckoutSuccessPage({ params }: PageProps) {
  const { locale } = await params

  return (
    <main className="min-h-screen bg-[#0A0A14] text-white flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full text-center">
        <div className="w-20 h-20 bg-green-500/15 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
          Welcome to ELEVO AI™ 🎉
        </h1>
        <p className="text-lg text-white/70 mb-2">Your subscription is active.</p>
        <p className="text-sm text-white/50 mb-10">
          Your 7-day free trial starts now. We&apos;ll email you before your card is charged.
        </p>

        <div className="bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-5 mb-8 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <p className="text-sm font-bold text-white">Welcome bonus</p>
          </div>
          <p className="text-sm text-white/70">
            You&apos;ve earned <strong className="text-white">1 free custom AI agent</strong>. We&apos;ll help you set it up
            in your dashboard so it learns your business and works the way you do.
          </p>
        </div>

        <Link
          href={`/${locale}/dashboard?checkout=success`}
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full transition-colors shadow-lg shadow-indigo-500/25"
        >
          Go to your dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>

        <p className="text-xs text-white/40 mt-6">
          Need help? Reply to your welcome email or chat with Mira from any dashboard page.
        </p>
      </div>
    </main>
  )
}
