# ELEVO AI — COMPLETE MASTER DOCUMENT
### Everything in one place. For ChatGPT memory. For Claude Code. For James.
### Last updated: March 2026

---

# SECTION 1 — WHAT ELEVO IS
*(Paste this into ChatGPT to give it full memory of the project)*

**ELEVO AI** is a complete AI operating system for local businesses.
Latin: *elevāre* — "I lift. I raise. I launch."
Tagline: "Elevate every business."
Creator: James Carlin
GitHub: https://github.com/JMSNCDLE/Claude-code-Business-SaaS
Branch: claude/build-elevo-ai-aYfcC

ELEVO replaces: marketing agency, CRM tool, business consultant, content writer, financial analyst, ad manager, inventory tracker — all in one platform powered by 21 named AI agents.

**Target customer:** Local service businesses (plumbers, dentists, salons, restaurants, gyms). Also marketing agencies who manage 10–15 local clients.

---

## THE FOUR PILLARS

**Visibility** — GBP Posts, Blog, Reviews, Social, Schema, Email, Repurpose, Competitor Intel, Trends

**Growth** — Sales Pipeline, Market Research, Strategy + SWOT, Financial Health, HR Docs, Campaigns

**Customers** — CRM, Follow-Ups, Review Requests, Reactivation, Conversation Flows (WhatsApp/SMS/Email)

**Intelligence** — ROAS Dashboard, Financial Analysis, Inventory + Supply, Customer Trends, Google Optimisation, Problem Solver, Live Assistant, Alternatives Finder

---

## THE 21 AGENTS (named employees)

| Name | Role | Model |
|------|------|-------|
| Leo | ROAS & Advertising Analyst | claude-opus-4-6 |
| Flora | Financial Intelligence Officer | claude-opus-4-6 |
| Rex | Inventory & Supply Chain | claude-sonnet-4-6 + web |
| Maya | Customer Trends Analyst | claude-sonnet-4-6 + web |
| Geo | Google & Local Search | claude-sonnet-4-6 + web |
| Sol | Content Writer | claude-sonnet-4-6 |
| Val | Quality & SEO Auditor | claude-sonnet-4-6 |
| Nova | Business Strategist | claude-sonnet-4-6 |
| Ava | Sales Intelligence | claude-sonnet-4-6 |
| Clio | Campaign Architect | claude-sonnet-4-6 + web |
| Aria | Research Analyst | claude-sonnet-4-6 + web |
| Zara | Financial Health Advisor | claude-sonnet-4-6 |
| Finn | HR & Management | claude-sonnet-4-6 |
| Sage | CRM & Customers | claude-sonnet-4-6 |
| Echo | Conversation Automation | claude-sonnet-4-6 |
| Max | Problem Solver (Advisor) | claude-opus-4-6 MAX |
| Iris | Live Assistant | claude-sonnet-4-6 |
| Atlas | Market Intelligence | claude-sonnet-4-6 + web |
| Dex | Data Import & Analysis | claude-sonnet-4-6 |
| Mira | Onboarding Guide | claude-sonnet-4-6 |
| Hugo | Alternative Solutions | claude-sonnet-4-6 + web |
| Wren | Website Editor | claude-opus-4-6 + web |

**Master Orchestrator:** claude-opus-4-6, thinking: {type:"adaptive"}, effort:"high"

---

## CLAUDE API RULES (CRITICAL — NEVER DEVIATE)

- Orchestrator + Problem Solver + Finance + ROAS + Website Editor: **claude-opus-4-6**
- All other specialists: **claude-sonnet-4-6**
- Thinking: `{ type: "adaptive" }` — NEVER use deprecated `budget_tokens`
- Web search tool: `web_search_20250305`
- Problem Solver effort: `"max"` — costs 2 credits
- ROAS effort: `"high"` — costs 3 credits
- All agents return ONLY valid JSON — strip ` ```json ` fences before parsing

---

## TECH STACK

- **Framework:** Next.js 14 (App Router, TypeScript, Tailwind CSS)
- **AI:** @anthropic-ai/sdk@^0.30
- **Database:** Supabase (PostgreSQL, RLS, Auth)
- **Payments:** Stripe (GBP/USD/EUR, subscriptions, webhooks)
- **Email:** Resend (7 email sequences)
- **i18n:** next-intl (12 locales: en, en-US, fr, de, es, it, pt, nl, pl, sv, ja, en-AU)
- **Mobile:** PWA (next-pwa), MobileBottomNav
- **Animation:** Framer Motion
- **Hosting:** Vercel (with cron jobs)

---

## PLANS & PRICING

| Plan | GBP | USD | EUR | Credits | Profiles | Features |
|------|-----|-----|-----|---------|----------|----------|
| Trial | Free | Free | Free | 20 | 1 | 7 days, no card |
| Launch | £39 | $49 | €45 | 60/mo | 1 | Core features |
| Orbit ★ | £79 | $99 | €89 | Unlimited | 3 | All features |
| Galaxy | £149 | $199 | €169 | Unlimited | 15 | Team + white-label + API |

Stripe trial: 7 days, card required at signup, auto-charges on day 7.

---

## DATABASE — KEY RULES (COLUMN NAMES — DO NOT GET WRONG)

- `contacts.full_name` (NOT first_name/last_name)
- `contacts.total_revenue` (NOT estimated_lifetime_value)
- `contacts.review_completed_at` (NOT review_left)
- `contacts.last_contact_date` (NOT last_service_date)
- `interactions.created_at` (NOT occurred_at)
- `interactions.notes` + `job_value` (NOT title/body/value)
- `saved_generations` (NOT generations)
- `business_profiles.unique_selling_points[]` (NOT usps)
- `business_profiles.country` (NOT country_code)
- NO `increment_credits_used` RPC — use direct Supabase update
- Credits deduct AFTER successful generation only

---

## COMPLETE FILE STRUCTURE

```
elevo-ai/
├── CLAUDE.md                          ← Memory file for Claude Code sessions
├── .env.local                         ← Your API keys (never commit this)
├── supabase/schema.sql                ← Run this in Supabase SQL Editor
├── vercel.json                        ← Cron jobs config
│
├── lib/
│   ├── agents/
│   │   ├── client.ts                  ← Anthropic singleton + helpers
│   │   ├── types.ts                   ← All TypeScript interfaces
│   │   ├── orchestrator.ts            ← Master coordinator
│   │   ├── contentWriter.ts           ← 7 content types
│   │   ├── validator.ts               ← 10-point QA
│   │   ├── seoStrategy.ts
│   │   ├── roasAgent.ts               ← Leo (Opus, effort high)
│   │   ├── financeAgent.ts            ← Flora (Opus, effort high)
│   │   ├── inventoryAgent.ts          ← Rex (web search)
│   │   ├── customerTrendsAgent.ts     ← Maya (web search)
│   │   ├── googleOptAgent.ts          ← Geo (web search)
│   │   ├── alternativesAgent.ts       ← Hugo (web search)
│   │   ├── websiteEditorAgent.ts      ← Wren (Opus + web)
│   │   ├── conversationAgent.ts       ← Echo (ManyChat-style)
│   │   ├── problemSolverAgent.ts      ← Max (Opus, effort max)
│   │   ├── liveAssistantAgent.ts      ← Iris
│   │   ├── miraOnboardingAgent.ts     ← Mira (5-step guide)
│   │   ├── crmAgent.ts                ← Sage
│   │   ├── competitorAgent.ts
│   │   ├── trendAgent.ts
│   │   ├── repurposeAgent.ts
│   │   ├── followUpAgent.ts
│   │   ├── reactivationAgent.ts
│   │   ├── campaignAgent.ts
│   │   ├── salesAgent.ts
│   │   ├── strategyAgent.ts
│   │   ├── financialAgent.ts
│   │   ├── managementAgent.ts
│   │   ├── coachAgent.ts
│   │   ├── dataIngestionAgent.ts      ← Dex
│   │   ├── onboardingAgent.ts
│   │   ├── translationAgent.ts
│   │   └── agentPersonas.ts           ← 21 agent registry
│   │
│   ├── email/
│   │   ├── sequences.ts               ← 8 email sequences
│   │   └── send.ts                    ← Resend wrapper
│   │
│   ├── cookies.ts                     ← All cookie helpers (GDPR, affiliate, demo)
│   ├── tenant.ts                      ← Subdomain + white-label domain logic
│   ├── affiliate.ts                   ← Commission calculations
│   ├── api-auth.ts                    ← API key generation + validation
│   ├── white-label.ts                 ← Brand config loader
│   ├── widget/embed.ts                ← Widget embed script generator
│   ├── stripe/pricing.ts              ← Plans + price IDs + currency helpers
│   ├── supabase/client.ts             ← Browser client
│   ├── supabase/server.ts             ← Server + service clients
│   └── utils.ts                       ← cn(), formatCurrency(), etc.
│
├── app/
│   ├── [locale]/
│   │   ├── (auth)/login, signup
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/             ← Mission Control
│   │   │   ├── visibility/
│   │   │   │   ├── gbp-posts/
│   │   │   │   ├── blog/
│   │   │   │   ├── reviews/
│   │   │   │   ├── social/
│   │   │   │   ├── schema/
│   │   │   │   ├── email/
│   │   │   │   ├── competitor/        ← Orbit+
│   │   │   │   ├── trends/            ← Orbit+
│   │   │   │   └── repurpose/         ← Orbit+
│   │   │   ├── growth/
│   │   │   │   ├── sales/             ← Orbit+
│   │   │   │   ├── research/          ← Orbit+
│   │   │   │   ├── strategy/          ← Orbit+
│   │   │   │   ├── financial/         ← Orbit+
│   │   │   │   ├── management/        ← Orbit+
│   │   │   │   └── campaigns/         ← Orbit+
│   │   │   ├── intelligence/
│   │   │   │   ├── roas/              ← Orbit+ (Leo)
│   │   │   │   ├── finances/          ← Orbit+ (Flora)
│   │   │   │   ├── inventory/         ← Orbit+ (Rex)
│   │   │   │   ├── customer-trends/   ← Orbit+ (Maya)
│   │   │   │   ├── google-optimisation/ ← All plans (Geo)
│   │   │   │   └── alternatives/      ← Orbit+ (Hugo)
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx           ← Contact list
│   │   │   │   ├── [contactId]/       ← Contact detail
│   │   │   │   ├── campaigns/
│   │   │   │   ├── review-requests/
│   │   │   │   ├── conversations/     ← Orbit+ (Echo)
│   │   │   │   └── new/
│   │   │   ├── advisor/               ← Max (Problem Solver)
│   │   │   │   └── history/
│   │   │   ├── agents/                ← All 21 agents
│   │   │   │   └── [agentId]/         ← 1:1 agent chat
│   │   │   ├── website/               ← Wren (Galaxy)
│   │   │   ├── onboarding-guide/      ← Mira (all plans)
│   │   │   ├── affiliate/             ← All plans
│   │   │   ├── developer/             ← Galaxy (API keys)
│   │   │   ├── widgets/               ← Galaxy (embeddable)
│   │   │   ├── remote/                ← Mobile remote control
│   │   │   ├── more/                  ← Mobile "more" page
│   │   │   ├── settings/
│   │   │   │   ├── domain/            ← Custom subdomain
│   │   │   │   └── white-label/       ← Galaxy branding
│   │   │   ├── profile/
│   │   │   ├── calendar/
│   │   │   └── library/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx               ← Landing page
│   │   │   ├── pricing/
│   │   │   ├── features/
│   │   │   ├── demo/                  ← Guest mode, 3/day
│   │   │   ├── api-docs/              ← Public API reference
│   │   │   └── privacy/               ← GDPR privacy policy
│   │   ├── admin/                     ← role='admin' only
│   │   │   ├── page.tsx               ← Revenue + stats
│   │   │   └── customers/
│   │   └── onboarding/
│   │
│   ├── api/
│   │   ├── generate/                  ← All content types + guest mode
│   │   ├── problem-solver/
│   │   ├── assistant/                 ← Iris (Live)
│   │   ├── onboard/
│   │   ├── onboarding-guide/          ← Mira progress
│   │   ├── coach/
│   │   ├── competitor/
│   │   ├── trends/
│   │   ├── repurpose/
│   │   ├── roas/ + roas/history/
│   │   ├── finances/
│   │   ├── inventory/
│   │   ├── customer-trends/
│   │   ├── google-optimisation/
│   │   ├── alternatives/
│   │   ├── conversations/ + message/
│   │   ├── website/ (audit, changes, generate-page)
│   │   ├── crm/ (contacts, interactions, brief, enrich, message-draft, review-requests, campaigns)
│   │   ├── growth/ (sales, research, strategy, financial, management, campaigns)
│   │   ├── email/send/
│   │   ├── data/ingest/
│   │   ├── remote/trigger/
│   │   ├── affiliate/ (join, stats)
│   │   ├── tenant/ (subdomain, white-label)
│   │   ├── white-label/ (config, logo)
│   │   ├── developer/keys/
│   │   ├── v1/ (generate, roas, contacts, agent) ← Public API
│   │   ├── widget/ (chat, contact)
│   │   ├── widgets/
│   │   ├── admin/ (subscribers, revenue)
│   │   ├── stripe/ (checkout, webhook)
│   │   └── cron/ (market-intel, coach-brief, credit-reset, trial-reminders)
│   │
│   └── globals.css
│
├── components/
│   ├── dashboard/
│   │   ├── Sidebar.tsx                ← Full nav (all sections)
│   │   ├── TopNav.tsx                 ← Business switcher + credits
│   │   ├── ContentCoachCard.tsx
│   │   ├── CRMBriefCard.tsx
│   │   └── QuickProblemSolver.tsx
│   ├── generators/
│   │   └── GeneratorShell.tsx
│   ├── mobile/
│   │   └── MobileBottomNav.tsx        ← <768px bottom nav
│   ├── shared/
│   │   ├── ActionExplanation.tsx      ← "What ELEVO just did"
│   │   ├── LiveAssistantPanel.tsx     ← Iris floating panel
│   │   ├── AgentStatusIndicator.tsx
│   │   ├── CopyButton.tsx
│   │   ├── SEOScoreBadge.tsx
│   │   ├── UpgradePrompt.tsx
│   │   ├── EmptyState.tsx
│   │   ├── DataPasteModal.tsx         ← Universal data paste
│   │   ├── CRMIntakeModal.tsx         ← Lead capture
│   │   ├── CreditTracker.tsx          ← Real-time credits
│   │   ├── UpgradePlanModal.tsx       ← Plan comparison
│   │   ├── MarketPulseCard.tsx        ← Dashboard intelligence card
│   │   └── CookieConsent.tsx          ← GDPR banner
│   └── advisor/
│       ├── ProblemSolverInput.tsx
│       └── ProblemSolverResult.tsx
│
├── public/
│   ├── manifest.json                  ← PWA manifest
│   ├── widget.js                      ← Embeddable widget script
│   └── icons/
│
├── messages/                          ← 12 locale JSON files
├── middleware.ts                      ← Auth + subdomain + affiliate tracking
└── vercel.json                        ← Cron jobs
```

---

## EMAIL SEQUENCES (8 total — Resend)

1. **Welcome** — immediately on signup
2. **Day 2** — competitor activity + ROAS teaser
3. **Day 4** — ROAS hook ("is your ad spend working?")
4. **Day 7** — trial ending tomorrow + what they'll lose
5. **Upgraded** — welcome to paid plan, what just unlocked
6. **Onboarding Bot** — meet Mira (post-first-payment)
7. **Monthly Review** — what ELEVO did this month
8. **Win-Back** — 14 days after cancellation

---

## COOKIE SYSTEM

All cookies defined in `lib/cookies.ts`:

| Cookie | Purpose | Duration |
|--------|---------|----------|
| `elevo_ref_code` | Affiliate referral tracking | 30 days |
| `elevo_demo_count` | Guest mode rate limit (3/day) | 24 hours |
| `elevo_demo_date` | Reset date for demo count | 24 hours |
| `elevo_crm_dismissed` | CRM modal dismissed | 24 hours |
| `elevo_consent` | GDPR cookie consent | 1 year |
| `elevo_locale` | User's language preference | 30 days |
| `elevo_active_profile` | Last active business profile | 30 days |
| `elevo_trial_banner` | Trial banner dismissed | 1 hour |
| Supabase auth | Session management | Auto (Supabase) |

---

## PHASE 4 FEATURES (latest additions)

- **Private domains:** `name.elevo.ai` (Orbit+), custom domain (Galaxy)
- **Website Editor (Wren):** Audit → propose changes → user approves each → apply. Galaxy only.
- **Mira Onboarding Bot:** 5-step interactive guide. Triggered by post-payment email.
- **Affiliate Programme:** 20% recurring commission. Any user can join. Referral tracking via cookie.
- **White-Label:** Galaxy agencies can rebrand ELEVO completely. Custom name, logo, colours, domain.
- **API Access:** Galaxy users get API keys. `/api/v1/*` endpoints for programmatic agent access.
- **Embeddable Widgets:** 5 widget types (chat bot, review collector, lead capture, FAQ, booking). Embed on client sites. Leads go to ELEVO CRM.

---

## PLAN GATING RULES

| Feature | Trial | Launch | Orbit | Galaxy |
|---------|-------|--------|-------|--------|
| Content generators | ✓ (20) | ✓ (60) | ✓ (∞) | ✓ (∞) |
| CRM | 10 contacts | 100 contacts | ∞ | ∞ |
| Problem Solver | 1 | 5 | ∞ | ∞ |
| Growth pages | ✗ | ✗ | ✓ | ✓ |
| ROAS + Finance | ✗ | ✗ | ✓ | ✓ |
| Inventory + Trends | ✗ | ✗ | ✓ | ✓ |
| Google Optimisation | ✓ | ✓ | ✓ | ✓ |
| Competitor Intel | ✗ | ✗ | ✓ | ✓ |
| Custom subdomain | ✗ | ✗ | ✓ | ✓ |
| White-label | ✗ | ✗ | ✗ | ✓ |
| API access | ✗ | ✗ | ✗ | ✓ |
| Embeddable widgets | ✗ | ✗ | ✗ | ✓ |
| Website editor | ✗ | ✗ | ✗ | ✓ |
| Affiliate | ✓ | ✓ | ✓ | ✓ |
| Mira guide | ✓ | ✓ | ✓ | ✓ |

---

## ENVIRONMENT VARIABLES (complete list)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_LAUNCH_GBP_ID=
STRIPE_ORBIT_GBP_ID=
STRIPE_GALAXY_GBP_ID=
STRIPE_LAUNCH_USD_ID=
STRIPE_ORBIT_USD_ID=
STRIPE_GALAXY_USD_ID=
STRIPE_LAUNCH_EUR_ID=
STRIPE_ORBIT_EUR_ID=
STRIPE_GALAXY_EUR_ID=
STRIPE_LAUNCH_GBP_ANNUAL_ID=
STRIPE_ORBIT_GBP_ANNUAL_ID=
STRIPE_GALAXY_GBP_ANNUAL_ID=
NEXT_PUBLIC_APP_URL=
RESEND_API_KEY=
FROM_EMAIL=hello@elevo.ai
CRON_SECRET=
NEXT_PUBLIC_GA_ID=
```

---

# SECTION 2 — CLAUDE CODE BUILD PROMPT
*(Paste this directly into Claude Code)*

```
You are continuing the ELEVO AI build.
Project: /Users/jamescarlin/elevo-ai
GitHub: https://github.com/JMSNCDLE/Claude-code-Business-SaaS
Branch: claude/build-elevo-ai-aYfcC

RULES: Silent execution. Zero questions. Zero placeholders. Every file complete.
Push to GitHub after every phase block. Update CLAUDE.md at the end.
Run tsc --noEmit and fix all errors before marking done.

MEMORY FILE: Read CLAUDE.md first for full project context.

TASK — BUILD COOKIE SYSTEM + ALL REMAINING PHASE 4 FEATURES:

────────────────────────────────────────
COOKIES (build these files now):
────────────────────────────────────────

BUILD lib/cookies.ts with:
- COOKIE_NAMES constant (all cookie name strings)
- COOKIE_OPTIONS presets (long/day/session/client)
- getCookieValue(name) — server-side read
- setResponseCookie(response, name, value, options) — API route set
- deleteResponseCookie(response, name)
- getAffiliateRef(request) — read elevo_ref_code from NextRequest
- checkDemoLimit(request) → { allowed, remaining, count }
- incrementDemoCount(response, currentCount)
- hasConsent(request) → boolean
- giveConsent(response)
- getClientCookie(name) — client-side (document.cookie)
- setClientCookie(name, value, days)
- deleteClientCookie(name)
- shouldShowCRMModal() — checks elevo_crm_dismissed
- dismissCRMModal()
- dismissTrialBanner()
- isTrialBannerDismissed()

All cookies: httpOnly: true (except consent), secure in production,
sameSite: 'lax', path: '/'.

BUILD components/shared/CookieConsent.tsx:
- 'use client' component
- Shows on first visit if no elevo_consent cookie
- "Essential only" button (sets consent=false, hides banner 30 days)
- "Accept all" button (sets consent=true, 365 days)
- Fixed bottom bar, dark theme (#0F1623 background)
- Link to /[locale]/privacy
- Auto-hides after choice

UPDATE app/[locale]/layout.tsx:
- Import and add <CookieConsent /> before </body>

UPDATE middleware.ts:
- Import COOKIE_NAMES, COOKIE_OPTIONS from lib/cookies
- If ?ref=CODE in URL: set elevo_ref_code cookie (30 days) then continue
- If ?utm_source or ?src=ad in URL on homepage: set elevo_from_ad=true (24h)

UPDATE app/api/generate/route.ts:
- Import checkDemoLimit, incrementDemoCount from lib/cookies
- In guestMode branch: check limit → if not allowed return 429
- After success: increment count on response

UPDATE app/api/stripe/checkout/route.ts:
- Import getAffiliateRef from lib/cookies
- Read affiliate code from request, add to Stripe session metadata

BUILD app/[locale]/(marketing)/privacy/page.tsx:
- Light theme, simple layout
- Sections: what we collect, cookies we use, how we use it,
  your rights, contact privacy@elevo.ai
- Last updated: March 2026

────────────────────────────────────────
PHASE 4 FEATURES (if not already built):
────────────────────────────────────────

BUILD lib/tenant.ts — generateSlug(), getSubdomain(), getDashboardUrl()

BUILD lib/agents/websiteEditorAgent.ts — Wren agent:
  auditWebsite(domain, businessProfile, locale) → WebsiteAuditResult
  generateWebsiteChanges(audit, bp, priorities, locale) → WebsiteChange[]
  generatePageContent(pageType, bp, params, locale) → page content
  Uses claude-opus-4-6 + web_search_20250305

BUILD lib/agents/miraOnboardingAgent.ts:
  ONBOARDING_CHECKLIST (5 steps)
  getMiraMessage(bp, completedSteps, currentStep, question?, locale)
  → { message, nextStep, suggestedAction, encouragement, completionPercent }
  Uses claude-sonnet-4-6, warm friendly tone as Mira

BUILD lib/affiliate.ts — generateAffiliateCode(), calculateCommission()
BUILD lib/api-auth.ts — generateApiKey(), validateApiKey()
BUILD lib/white-label.ts — WhiteLabelConfig interface, getWhiteLabelConfig()
BUILD lib/widget/embed.ts — generateEmbedScript()
BUILD public/widget.js — vanilla JS embeddable chat widget (no React)

BUILD all API routes:
  app/api/tenant/subdomain/route.ts
  app/api/tenant/white-label/route.ts
  app/api/website/audit/route.ts
  app/api/website/changes/route.ts
  app/api/website/generate-page/route.ts
  app/api/onboarding-guide/route.ts
  app/api/affiliate/route.ts + join/ + stats/
  app/api/white-label/config/route.ts + logo/
  app/api/developer/keys/route.ts
  app/api/v1/generate/route.ts + roas/ + contacts/ + agent/
  app/api/widget/chat/route.ts + contact/
  app/api/widgets/route.ts

BUILD all dashboard pages:
  app/[locale]/(dashboard)/settings/domain/page.tsx
  app/[locale]/(dashboard)/settings/white-label/page.tsx
  app/[locale]/(dashboard)/website/page.tsx (Galaxy only)
  app/[locale]/(dashboard)/onboarding-guide/page.tsx
  app/[locale]/(dashboard)/affiliate/page.tsx
  app/[locale]/(dashboard)/developer/page.tsx (Galaxy only)
  app/[locale]/(dashboard)/widgets/page.tsx (Galaxy only)
  app/[locale]/(marketing)/api-docs/page.tsx (public)

ADD to supabase/schema.sql:
  ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_subdomain TEXT UNIQUE;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS white_label_domain TEXT UNIQUE;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS white_label_active BOOLEAN DEFAULT false;

  CREATE TABLE IF NOT EXISTS website_sessions (...)
  CREATE TABLE IF NOT EXISTS website_changes (...)
  CREATE TABLE IF NOT EXISTS white_label_configs (...)
  CREATE TABLE IF NOT EXISTS affiliates (...)
  CREATE TABLE IF NOT EXISTS affiliate_referrals (...)
  CREATE TABLE IF NOT EXISTS affiliate_payouts (...)
  CREATE TABLE IF NOT EXISTS api_keys (...)
  CREATE TABLE IF NOT EXISTS widgets (...)
  CREATE TABLE IF NOT EXISTS widget_sessions (...)
  All with RLS + auth.uid() = user_id policies.

UPDATE lib/email/sequences.ts:
  Add sequence 8: onboardingBot
  Subject: "Meet Mira — she'll show you around ELEVO"
  Triggered after first invoice.payment_succeeded

UPDATE app/api/stripe/webhook/route.ts:
  On invoice.payment_succeeded for NEW subscriber:
    Send onboardingBot email via sendSequenceEmail()
  On checkout.session.completed:
    Read affiliate_code from metadata, create affiliate_referrals record

UPDATE Sidebar to include all new nav items (domain, white-label, affiliate,
  developer, widgets, website, onboarding-guide).

────────────────────────────────────────
FINAL CHECKS:
────────────────────────────────────────

tsc --noEmit — fix all TypeScript errors
next build — must succeed with zero errors

Verify files exist:
  lib/cookies.ts ✓
  components/shared/CookieConsent.tsx ✓
  app/[locale]/(marketing)/privacy/page.tsx ✓
  lib/agents/websiteEditorAgent.ts ✓
  lib/agents/miraOnboardingAgent.ts ✓
  public/widget.js ✓
  All API routes listed above ✓
  All dashboard pages listed above ✓

UPDATE CLAUDE.md with complete current state.

COMMIT AND PUSH:
git add -A
git commit -m "feat: Cookie system (GDPR consent, affiliate tracking, demo limiting) + Phase 4 complete (website editor, Mira, affiliate, white-label, API, widgets)"
git push origin claude/build-elevo-ai-aYfcC
git push github claude/build-elevo-ai-aYfcC
```

---

# SECTION 3 — JAMES'S PERSONAL INSTRUCTIONS
*(What you do, step by step, no confusion)*

---

## YOUR WORKFLOW — HOW THIS ALL CONNECTS

```
Claude (this conversation) → writes the prompts
      ↓
Claude Code (on your Mac) → builds the files
      ↓
GitHub (cloud storage) → stores all files safely
      ↓
Your Mac → pull from GitHub to see the files locally
      ↓
Vercel → deploys the live website
```

---

## STEP 1 — SEND THE BUILD PROMPT TO CLAUDE CODE

Copy everything inside the triple-backtick block in Section 2 above.
Open Claude Code. Paste it. Press Enter. Let it run.
It will take 20–40 minutes. Do not interrupt it.
If it stops and asks you something, type: **continue**
When it says "committed and pushed" — it's done.

---

## STEP 2 — PULL THE FILES TO YOUR MAC

Open **Terminal** on your Mac (Command + Space → type Terminal → Enter).

**If this is your first time (you haven't cloned yet):**
```
git clone https://github.com/JMSNCDLE/Claude-code-Business-SaaS.git ~/Desktop/"claude code for business" && cd ~/Desktop/"claude code for business" && git checkout claude/build-elevo-ai-aYfcC
```

**Every time after that (to get new files):**
```
cd ~/Desktop/"claude code for business" && git pull origin claude/build-elevo-ai-aYfcC
```

---

## STEP 3 — OPEN THE FILES

```
code ~/Desktop/"claude code for business"
```

This opens VS Code with every file visible. You can now read everything.

---

## STEP 4 — INSTALL DEPENDENCIES (once only)

```
cd ~/Desktop/"claude code for business" && npm install
```

Takes 2–3 minutes. You'll see a lot of text. That's normal.

---

## STEP 5 — CREATE YOUR .env.local FILE (once only)

```
cat > ~/Desktop/"claude code for business"/.env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-your-key
STRIPE_SECRET_KEY=sk_test_your-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret
STRIPE_LAUNCH_GBP_ID=price_
STRIPE_ORBIT_GBP_ID=price_
STRIPE_GALAXY_GBP_ID=price_
STRIPE_LAUNCH_USD_ID=price_
STRIPE_ORBIT_USD_ID=price_
STRIPE_GALAXY_USD_ID=price_
STRIPE_LAUNCH_EUR_ID=price_
STRIPE_ORBIT_EUR_ID=price_
STRIPE_GALAXY_EUR_ID=price_
STRIPE_LAUNCH_GBP_ANNUAL_ID=price_
STRIPE_ORBIT_GBP_ANNUAL_ID=price_
STRIPE_GALAXY_GBP_ANNUAL_ID=price_
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=re_your-key
FROM_EMAIL=hello@elevo.ai
CRON_SECRET=make-up-any-long-random-string
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
EOF
```

Then open `.env.local` in VS Code (Command+P → type `.env.local`) and fill in each value.

**Where to get each key:**
- **Supabase:** supabase.com → your project → Settings → API
- **Anthropic:** console.anthropic.com → API Keys
- **Stripe:** dashboard.stripe.com → Developers → API keys
- **Stripe price IDs:** Stripe → Products → create Launch/Orbit/Galaxy → copy each price ID
- **Resend:** resend.com → API Keys

---

## STEP 6 — RUN ELEVO ON YOUR COMPUTER

```
cd ~/Desktop/"claude code for business" && npm run dev
```

Then open: **http://localhost:3000**

You'll see ELEVO running live on your Mac. Press **Control+C** to stop it.

---

## STEP 7 — DEPLOY TO THE INTERNET (when ready)

1. Go to **vercel.com** → sign in with GitHub
2. New Project → import `JMSNCDLE/Claude-code-Business-SaaS`
3. Branch: `claude/build-elevo-ai-aYfcC`
4. Add all your `.env.local` keys in Vercel → Settings → Environment Variables
5. Change `NEXT_PUBLIC_APP_URL` to your actual domain (e.g. `https://elevo.ai`)
6. Click Deploy → wait 3 minutes → your site is live
7. Add your domain in Vercel → Settings → Domains

---

## STEP 8 — SET UP THE DATABASE

1. Go to **supabase.com** → open your project → SQL Editor
2. Open the file `supabase/schema.sql` in VS Code
3. Select all the text (Command+A), copy it
4. Paste into Supabase SQL Editor → click **Run**
5. All tables and security rules are created. Done.

---

## YOUR DAILY COMMANDS (save these)

| What you want to do | Command |
|---------------------|---------|
| Pull latest files from GitHub | `cd ~/Desktop/"claude code for business" && git pull origin claude/build-elevo-ai-aYfcC` |
| Run ELEVO locally | `cd ~/Desktop/"claude code for business" && npm run dev` |
| Open files in VS Code | `code ~/Desktop/"claude code for business"` |
| Check for errors | `cd ~/Desktop/"claude code for business" && npx tsc --noEmit` |

---

## THE ORDER OF YOUR FOUR CLAUDE CODE PROMPTS

If you ever need to rebuild from scratch, paste these in order:

1. `ELEVO_CLAUDE_CODE_MASTER_PROMPT.md` — foundation + rebrand
2. `ELEVO_PHASE2_CLAUDE_CODE_PROMPT.md` — ROAS, finance, agents, mobile
3. `ELEVO_PHASE3_LAUNCH_PROMPT.md` — email, marketing, deployment
4. `ELEVO_PHASE4_CLAUDE_CODE_PROMPT.md` — domains, website editor, affiliate, white-label, API, widgets
5. **Section 2 of this document** — cookies + any remaining pieces

---

*This document: save it. Share Section 1 with ChatGPT to give it full context. Paste Section 2 into Claude Code to build. Follow Section 3 yourself.*
