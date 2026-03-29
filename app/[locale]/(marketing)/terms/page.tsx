import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'ELEVO AI terms of service. Subscription terms, acceptable use, billing, cancellation, and intellectual property policies.',
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  await params

  const sections = [
    {
      title: '1. Agreement to terms',
      content: `By creating an account or using ELEVO AI™, you agree to these Terms of Service. If you do not agree, please do not use the service. These terms form a legally binding agreement between you and ELEVO AI Ltd, operated by James Carlin, England and Wales.`,
    },
    {
      title: '2. Service description',
      content: `ELEVO AI™ is a software-as-a-service (SaaS) platform that provides AI-powered tools for local businesses, including content generation, market research, competitor intelligence, CRM, financial analysis, and related services. The platform is hosted on Vercel and operated from the United Kingdom.`,
    },
    {
      title: '3. Account security',
      content: `You are responsible for maintaining the security of your account credentials. Do not share your password with others. You are responsible for all activity that occurs under your account. If you suspect unauthorised access, notify us immediately at team@elevo.dev. We reserve the right to suspend accounts showing signs of compromise or misuse.`,
    },
    {
      title: '4. Acceptable use',
      content: `You agree not to:

• Use ELEVO AI™ to send spam, unsolicited messages, or bulk communications not permitted by applicable law.
• Scrape, crawl, or systematically extract data from the platform.
• Resell or redistribute AI-generated output as your own standalone AI product or service.
• Use the platform for any illegal purpose, including but not limited to fraud, harassment, or distribution of malware.
• Attempt to reverse engineer, decompile, or circumvent any security or access controls.
• Impersonate any person or entity or misrepresent your affiliation.

Violations may result in immediate account suspension without refund.`,
    },
    {
      title: '5. Billing',
      content: `Subscriptions are billed monthly on the anniversary of your sign-up date. Payments are processed by Stripe. By subscribing, you authorise us to charge your payment method on each billing anniversary. All prices are shown in GBP and include VAT where applicable.`,
    },
    {
      title: '6. Launch discounts',
      content: `If you subscribed during an active promotional period, your promotional pricing is locked for the lifetime of your subscription, provided your account remains active and in good standing. Promotional pricing is non-transferable and does not apply if you cancel and re-subscribe.`,
    },
    {
      title: '7. Refund policy',
      content: `All sales are final. No refunds are issued after payment has been processed. You may cancel your subscription at any time, and cancellation will take effect at the end of the current billing period.`,
    },
    {
      title: '8. Cancellation',
      content: `You can cancel your subscription at any time from your billing settings. Cancellation takes effect at the end of your current billing period. You will retain full access until then. No pro-rata refunds are issued for the remaining portion of a billing period.`,
    },
    {
      title: '9. AI content',
      content: `AI-generated output is provided as a starting point and should be reviewed before publishing or acting upon it. This is especially important for financial projections, legal documents, medical advice, and any content that could have regulatory implications. ELEVO AI™ is not a regulated financial adviser, solicitor, or accountant. We accept no liability for decisions made based solely on AI-generated content.`,
    },
    {
      title: '10. IP and trademark',
      content: `ELEVO AI™ is a trademark of James Carlin. The ELEVO platform, including all software, agent names, brand elements, and underlying code, is the intellectual property of ELEVO AI Ltd. Your business data — the information you input about your business — belongs to you. We do not claim ownership of your content or data.`,
    },
    {
      title: '11. Uptime',
      content: `We target 99.9% uptime. Scheduled maintenance windows will be announced via email and/or dashboard notice at least 24 hours in advance. We are not liable for downtime caused by third-party services (Supabase, Vercel, Anthropic, Stripe, etc.) or events outside our reasonable control.`,
    },
    {
      title: '12. Liability limit',
      content: `To the maximum extent permitted by law, our total liability to you for any claims arising from your use of ELEVO AI™ is limited to the total fees you have paid in the three months preceding the claim. We are not liable for indirect, incidental, special, or consequential damages.`,
    },
    {
      title: '13. Governing law',
      content: `These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales. If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force.`,
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="bg-[#050507] text-white py-20 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">Terms of Service</h1>
        <p className="text-white/50 text-sm">Last updated: March 2026</p>
      </div>

      {/* Content */}
      <div className="bg-[#FFFEF9] py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-600 text-base mb-12 leading-relaxed">
            These terms govern your use of ELEVO AI™. By using the platform, you agree to be bound by them. Written in plain English — if anything is unclear, email team@elevo.dev.
          </p>

          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
                <div className="text-gray-600 text-base leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
