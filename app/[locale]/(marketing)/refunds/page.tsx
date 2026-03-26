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
            We want you to love ELEVO AI™. Here is exactly what happens if you need a refund — no hidden clauses, no runaround.
          </p>

          <div className="space-y-10">

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">7-day free trial</h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Every plan starts with a 7-day free trial. You can explore the full feature set of your chosen plan during the trial period. If you decide ELEVO is not right for you, simply cancel before the trial ends — you will not be charged.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">48-hour money-back guarantee</h2>
              <p className="text-gray-600 text-base leading-relaxed">
                If you proceed to a paid subscription and are not satisfied, we offer a full refund on your first payment — no questions asked — provided you request it within 48 hours of being charged for the first time. This applies to the first month of any plan.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">How to claim a refund</h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Email hello@elevo.dev within 48 hours of your first charge. Include the email address associated with your account. We will process your refund within 5 business days. Refunds are returned to your original payment method via Stripe.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">After the 48-hour window</h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Refunds cannot be issued after 48 hours from your first payment. This applies regardless of usage. If you are experiencing a problem with the platform, please contact us at hello@elevo.dev — we will do everything we can to resolve it.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Subsequent monthly charges</h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Subsequent monthly charges are non-refundable. You can cancel your subscription at any time from your billing settings, and your access will continue until the end of the current billing period. We do not offer pro-rata refunds for unused time after the first 48-hour window.
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
