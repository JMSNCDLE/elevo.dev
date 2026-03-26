export default async function RefundsPage({ params }: { params: Promise<{ locale: string }> }) {
  await params

  return (
    <div>
      {/* Header */}
      <div className="bg-[#050507] text-white py-20 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">Refund Policy</h1>
        <p className="text-white/50 text-sm">Last updated: March 2026</p>
      </div>

      {/* Content */}
      <div className="bg-[#FFFEF9] py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-600 text-base mb-12 leading-relaxed">
            Please read our refund policy carefully before subscribing to ELEVO AI™.
          </p>

          <div className="space-y-10">

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">7-day free trial</h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Every plan starts with a 7-day free trial. You can explore the full feature set of your chosen plan during the trial period. If you decide ELEVO is not right for you, simply cancel before the trial ends — you will not be charged.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">All sales are final</h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Once payment has been processed after the trial period, all sales are final. No refunds are issued for any reason. We encourage you to make full use of your 7-day trial to determine whether ELEVO AI is right for your business before committing to a paid plan.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cancellation</h2>
              <p className="text-gray-600 text-base leading-relaxed">
                You can cancel your subscription at any time from your billing settings. Cancellation takes effect at the end of the current billing period. You will retain full access until then. No pro-rata refunds are issued for unused time.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Data export after cancellation</h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Your data is always yours. After cancellation, you have 30 days to export your saved generations, contacts, and reports from your dashboard. After 30 days, your data will be scheduled for deletion in accordance with our Privacy Policy. To request an emergency data export, email hello@elevo.dev.
              </p>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
              <h3 className="font-bold text-indigo-900 mb-2">Questions?</h3>
              <p className="text-indigo-700 text-sm">
                Email us at <a href="mailto:hello@elevo.dev" className="font-semibold underline">hello@elevo.dev</a>. We respond within 48 hours.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
