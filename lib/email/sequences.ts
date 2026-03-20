// All 7 automated email sequences for ELEVO AI
// Sent via Resend API

export interface EmailSequence {
  subject: string
  preview: string
  body: string
}

export const EMAIL_SEQUENCES = {
  // Sequence 1 — Welcome (sent immediately on signup)
  welcome: {
    subject: 'Welcome to ELEVO — your AI team is ready',
    preview: 'One setup step and your first content is live in 60 seconds.',
    body: `Hi {{firstName}},

You just made a smart decision.

ELEVO is now working in the background for {{businessName}}. Your 21 AI agents are loaded with your business details and ready to go.

Your first task (takes 2 minutes):

→ Generate your first Google Business Profile post
It will include your city, your services, and a real CTA. It will be ready to copy and paste in under 60 seconds.

[Generate My First Post →] {{appUrl}}/dashboard/content/gbp-posts

Questions? Just reply to this email.

The ELEVO team`,
  },

  // Sequence 2 — Day 2: First value proof
  day2: {
    subject: '{{businessName}}: here\'s what your competitors did this week',
    preview: 'Your Competitor Intel agent ran its first scan.',
    body: `Hi {{firstName}},

Your Competitor Intel agent (Geo) has been watching.

In the last 7 days, businesses like yours in {{city}} posted an average of 4 times on Google Business Profile.

You've posted {{gbpPostCount}} time(s).

Every post they make and you don't is a customer who sees them first.

Your ROAS agent Leo is also ready — if you're running any Google Ads or Facebook Ads, paste your campaign data and he'll tell you exactly where you're wasting money.

[See What Leo Found →] {{appUrl}}/roas

ELEVO Team`,
  },

  // Sequence 3 — Day 4: ROAS hook
  day4: {
    subject: 'Is your ad spend actually working? (2-minute check)',
    preview: 'Most local businesses waste 40% of their ad budget.',
    body: `Hi {{firstName}},

Quick question: do you know your ROAS?

Return on Ad Spend = how much revenue you get back for every £1 you spend on ads.

The industry average for local service businesses is 4:1. That means £1 spent → £4 earned.

Most businesses we analyse are at 1.8:1 — they're losing money on ads without realising it.

Your ROAS agent Leo can analyse your campaigns in 60 seconds. Just paste your ad spend data (from Google Ads, Meta, or even a spreadsheet) and he'll tell you exactly what's working and what to cut.

[Run My ROAS Analysis →] {{appUrl}}/roas

If you're not running ads yet — Leo can tell you which channels are worth starting with for a {{businessCategory}} in {{city}}.

ELEVO Team`,
  },

  // Sequence 4 — Day 7 (trial end warning)
  trialEnd: {
    subject: 'Your ELEVO trial ends tomorrow — here\'s what you\'ll lose',
    preview: '47 contacts, 12 pieces of content, your ROAS report...',
    body: `Hi {{firstName}},

Your 7-day trial ends tomorrow.

Here's what you've built so far:
• {{generationCount}} pieces of content created
• {{contactCount}} customers in your CRM
• {{reviewRequestsSent}} review requests sent
• ROAS score: {{roasScore}} (industry avg: 4.0)

If you don't upgrade, you keep access to all your data — but your agents stop working, your CRM automation pauses, and your weekly content briefs stop.

The Launch plan is £39/month — less than one hour with a marketing consultant.

[Keep ELEVO Working →] {{appUrl}}/pricing

Or reply to this email with any questions.

ELEVO Team`,
  },

  // Sequence 5 — Post-upgrade: Welcome to paid
  upgraded: {
    subject: 'You\'re in. Here\'s what just unlocked for {{businessName}}',
    preview: 'Your full agent team is now active.',
    body: `Hi {{firstName}},

Welcome to ELEVO {{planName}}.

Here's what just activated:
{{orbitFeatures}}

Your agents are fully briefed on {{businessName}} and ready to execute.

Where to start today:

1. Run your ROAS analysis if you're running any ads
2. Check the Google Optimisation score for your GBP profile
3. Set up your first Conversation Flow for customer follow-ups

[Go to Mission Control →] {{appUrl}}/dashboard

ELEVO Team`,
  },

  // Sequence 6 — Monthly performance review
  monthlyReview: {
    subject: '{{businessName}}: your ELEVO month in review',
    preview: '{{generationCount}} pieces created. {{reviewCount}} reviews replied to.',
    body: `Hi {{firstName}},

Here's what ELEVO did for {{businessName}} this month:

CONTENT CREATED: {{generationCount}} pieces
REVIEWS REPLIED TO: {{reviewCount}}
REVIEW REQUESTS SENT: {{reviewRequestsSent}}
ROAS TRACKED: {{campaigns}} campaigns
CUSTOMERS IN CRM: {{contactCount}}

Your best-performing content type: {{topContentType}}

This month's top priority from Leo (ROAS agent):
"{{leoPriority}}"

This month's top priority from Geo (Google agent):
"{{geoPriority}}"

[See Full Report →] {{appUrl}}/dashboard

See you next month.
ELEVO Team`,
  },

  // Sequence 7 — Win-back (churned users, 14 days after cancellation)
  winBack: {
    subject: '{{businessName}}: what changed while ELEVO was paused',
    preview: 'Your competitors haven\'t stopped posting.',
    body: `Hi {{firstName}},

It's been 2 weeks since your ELEVO subscription paused.

In that time, the average {{businessCategory}} in {{city}} published 8 Google Business Profile posts, sent 12 review requests, and responded to 24 customer reviews.

How many did {{businessName}} publish?

Your data is still here. Your CRM, your content library, your ROAS history — all waiting.

We've also added 3 new agents since you left:
• Leo now analyses TikTok Ads and Pinterest Ads
• Flora now forecasts 6-month cash flow
• Echo now builds WhatsApp automation flows

[Come back — first week free →] {{appUrl}}/pricing?promo=winback

ELEVO Team`,
  },
  // Sequence 8 — Onboarding Bot (sent on first paid invoice)
  onboardingBot: {
    subject: 'Meet Mira — she\'ll show you around ELEVO',
    preview: 'Your personal onboarding guide is ready',
    body: `Hi {{first_name}},

Welcome to ELEVO AI!

I'm Mira, your personal guide. I'll help you get the most out of ELEVO in the next few days.

Here's your quick-start checklist:

✅ Complete your business profile → /settings
✅ Generate your first piece of content → /dashboard/content/gbp-posts
✅ Add your first customer → /dashboard/customers/new
✅ Explore a Growth tool → /dashboard/growth/strategy
✅ Try the Problem Solver → /dashboard/advisor

Each one takes just a few minutes and will immediately start delivering value for {{business_name}}.

[Start here →] {{dashboard_url}}/onboarding-guide

I'm here if you need anything,
Mira from ELEVO AI`,
  },
} as const

export type SequenceKey = keyof typeof EMAIL_SEQUENCES
