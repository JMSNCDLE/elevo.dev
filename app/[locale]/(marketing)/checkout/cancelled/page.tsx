import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ locale: string }>
}

export const metadata = {
  title: 'Checkout cancelled — ELEVO AI™',
}

export default async function CheckoutCancelledPage({ params }: PageProps) {
  const { locale } = await params

  return (
    <main className="min-h-screen bg-[#0A0A14] text-white flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
          👋
        </div>

        <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
          No worries — you haven&apos;t been charged.
        </h1>
        <p className="text-white/60 mb-8">
          You can start your free trial anytime. Your AI team will be ready when you are.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/${locale}/pricing`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to pricing
          </Link>
          <Link
            href={`/${locale}/demo`}
            className="inline-flex items-center justify-center px-6 py-3 border border-white/20 text-white hover:bg-white/5 font-semibold rounded-full transition-colors"
          >
            See the live demo
          </Link>
        </div>
      </div>
    </main>
  )
}
