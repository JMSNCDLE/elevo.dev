export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  await params

  const sections = [
    {
      title: '1. Who we are',
      content: `ELEVO AI™ is a software-as-a-service platform operated by James Carlin, registered in England and Wales. If you have any questions about this policy, you can reach us at hello@elevo.dev. We take your privacy seriously and are committed to protecting your personal data in accordance with UK GDPR and the Data Protection Act 2018.`,
    },
    {
      title: '2. What data we collect',
      content: `We collect the following categories of data when you use ELEVO AI™:

• Account information: your full name, email address, and password (stored as a secure hash).
• Business profile: your business name, type, location, services, and unique selling points — which you provide during onboarding.
• Usage data: which features you use, how many credits you consume, content you generate, and actions you take within the dashboard.
• Payment data: handled entirely by Stripe. We never store your card number or CVV — only a Stripe customer ID and subscription status.
• Communications: emails you send to us, and any support requests you submit.`,
    },
    {
      title: '3. How we use your data',
      content: `We use your data to:

• Deliver and improve the ELEVO AI™ service.
• Power AI content generation using your business profile context.
• Send email sequences related to your account (welcome, trial reminders, monthly reviews).
• Analyse how the platform is used to improve features and fix bugs.
• Process payments and manage your subscription via Stripe.
• Send important account and security notifications.

We do not sell your data to third parties. We do not use your data to train AI models.`,
    },
    {
      title: '4. Who we share your data with',
      content: `We share data only with the following trusted service providers, each bound by data processing agreements:

• Supabase — our database and authentication provider (EU servers).
• Stripe — payment processing and subscription management.
• Resend — transactional email delivery.
• Twilio — WhatsApp notification delivery (admin use only).
• Vercel — hosting and edge network.
• Anthropic — AI model API (prompts are sent to generate content; no data is stored or used for training by Anthropic under our agreement).`,
    },
    {
      title: '5. Data retention',
      content: `We retain your personal data for as long as your account is active. If you request deletion of your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or financial compliance purposes (e.g. invoice records, which we retain for 7 years as required by HMRC).`,
    },
    {
      title: '6. Your GDPR rights',
      content: `Under UK GDPR, you have the right to:

• Access: request a copy of the personal data we hold about you.
• Rectification: ask us to correct inaccurate data.
• Erasure: ask us to delete your data ("right to be forgotten").
• Portability: receive your data in a machine-readable format.
• Objection: object to processing based on legitimate interests.
• Restriction: ask us to limit how we use your data.

To exercise any of these rights, email hello@elevo.dev. We will respond within 30 days.`,
    },
    {
      title: '7. Cookies',
      content: `We use cookies to keep you logged in, remember your preferences, and analyse site usage. You can manage your cookie preferences at any time via the banner at the bottom of our website. See our Cookie Policy for full details.`,
    },
    {
      title: '8. Children',
      content: `ELEVO AI™ is not intended for use by anyone under the age of 16. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact hello@elevo.dev and we will delete it promptly.`,
    },
    {
      title: '9. Policy changes',
      content: `We may update this Privacy Policy from time to time. For material changes, we will notify you by email at least 30 days before the changes take effect. The "Last updated" date at the top of this page will always reflect the most recent revision.`,
    },
    {
      title: '10. Contact us',
      content: `For privacy-related questions, data requests, or complaints, contact us at hello@elevo.dev. We aim to respond within 48 hours. You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk.`,
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="bg-[#050507] text-white py-20 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-white/50 text-sm">Last updated: March 2026</p>
      </div>

      {/* Content */}
      <div className="bg-[#FFFEF9] py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-600 text-base mb-12 leading-relaxed">
            We believe privacy policies should be readable. This one is written in plain English. If anything is unclear, email us at hello@elevo.dev.
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
