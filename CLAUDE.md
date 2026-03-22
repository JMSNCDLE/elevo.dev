# ELEVO AI — Claude Code Master Memory

**Product:** ELEVO AI | Latin: elevāre — I lift, I raise, I launch | **Creator:** James Carlin
**Path:** /home/user/Suppository-Repository
**GitHub:** https://github.com/JMSNCDLE/Claude-code-Business-SaaS
**Branch:** claude/build-elevo-ai-aYfcC

> All future development goes to GitHub: https://github.com/JMSNCDLE/Claude-code-Business-SaaS
> New feature branches should be pushed there, not just to origin.

---

## Models
- Orchestrator + Problem Solver: `claude-opus-4-6`, thinking `{type:"adaptive"}`, effort "high"/"max"
- All specialist agents: `claude-sonnet-4-6`, thinking `{type:"adaptive"}`, effort "high" or "medium"
- Web search agents (Research/Campaign): add `web_search_20250305` tool
- NEVER use budget_tokens. NEVER use deprecated thinking format.

## Execution Rules
- Auth check first on every API route. Zod validation second. Credit check third. Agent call fourth.
- Credits deduct AFTER success only. Problem Solver costs 2 credits.
- `saved_generations` (not generations). `full_name` (not first_name). `total_revenue` (not estimated_lifetime_value).
- `review_completed_at` (not review_left). `last_contact_date` (not last_service_date). `created_at` in interactions (not occurred_at).
- No increment_credits_used RPC — use direct Supabase update.
- `unique_selling_points[]` (not usps). `country` (not country_code).
- Every generator page renders AgentStatusIndicator during generation, ActionExplanation after.
- LiveAssistantPanel in dashboard layout.tsx always.
- Admin pages: check profiles.role === "admin". Redirect all others to /dashboard.
- Growth pages (sales/research/strategy/financial/management/campaigns): Orbit+ only.

## Colors
- Dashboard: bg `#080C14` | surface `#141B24`/`#161F2E` | card `#1A2332` | accent `#6366F1` | text `#EEF2FF`
- Marketing/Auth pages: LIGHT THEME — white bg, dark text, indigo `#6366F1` accents

## Plans
- trial | launch (£39) | orbit (£79) ★ | galaxy (£149)

## Dashboard title: Mission Control

---

## What's been built (current state)

### Agents (`lib/agents/`)
| File | Model | Purpose |
|---|---|---|
| `types.ts` | — | All TypeScript interfaces |
| `client.ts` | — | Anthropic singleton, helpers |
| `orchestrator.ts` | Opus | Routes + strategy + retry |
| `contentWriter.ts` | Sonnet | 7 content types |
| `validator.ts` | Sonnet | 10-point quality check |
| `problemSolverAgent.ts` | Opus | Business problem analysis |
| `salesAgent.ts` | Sonnet | Sales proposals |
| `researchAgent.ts` | Sonnet + web_search | Market research |
| `strategyAgent.ts` | Sonnet | SWOT + strategy |
| `financialAgent.ts` | Sonnet | Financial health reports |
| `managementAgent.ts` | Sonnet | HR documents |
| `campaignAgent.ts` | Sonnet + web_search | Campaign planning |
| `crmAgent.ts` | Sonnet | CRM briefings + drafts |
| `liveAssistant.ts` | Sonnet | Live chat panel |

### API Routes (`app/api/`)
- `POST /api/generate` — content generation (all 7 types), PATCH to save/schedule
- `POST /api/problem-solver` + `GET` history — 2 credits, Opus
- `POST /api/assistant` — live assistant panel
- `POST /api/onboard` — create business profile
- `GET/POST /api/crm/contacts` — contact list + create (plan limits enforced)
- `GET/PATCH/DELETE /api/crm/contacts/[id]` — contact detail
- `POST /api/crm/interactions` — log job/call/message etc
- `POST /api/crm/message-draft` — AI-drafted message
- `GET /api/crm/brief` — CRM briefing
- `POST /api/growth/sales|research|strategy|financial|management|campaigns` — Orbit+ growth tools
- `POST /api/stripe/checkout` — Stripe checkout session
- `POST /api/stripe/webhook` — subscription lifecycle

### Pages (`app/[locale]/`)
| Route | Type |
|---|---|
| `(marketing)/page.tsx` | Landing page |
| `(marketing)/pricing/page.tsx` | Pricing |
| `(auth)/login/page.tsx` | Login |
| `(auth)/signup/page.tsx` | Signup |
| `auth/callback/route.ts` | Supabase callback |
| `onboarding/page.tsx` | 5-step chat wizard |
| `(dashboard)/layout.tsx` | Auth guard + Sidebar + LiveAssistantPanel |
| `(dashboard)/dashboard/page.tsx` | Mission Control |
| `(dashboard)/dashboard/content/gbp-posts` | GBP generator |
| `(dashboard)/dashboard/content/blog` | Blog generator |
| `(dashboard)/dashboard/content/social` | Social captions |
| `(dashboard)/dashboard/content/reviews` | Review responses |
| `(dashboard)/dashboard/content/email` | Email generator |
| `(dashboard)/dashboard/content/seo` | SEO copy |
| `(dashboard)/dashboard/growth/sales` | Sales proposals (Orbit+) |
| `(dashboard)/dashboard/growth/research` | Market research (Orbit+) |
| `(dashboard)/dashboard/growth/strategy` | SWOT strategy (Orbit+) |
| `(dashboard)/dashboard/growth/financial` | Financial health (Orbit+) |
| `(dashboard)/dashboard/growth/management` | HR documents (Orbit+) |
| `(dashboard)/dashboard/growth/campaigns` | Campaign planning (Orbit+) |
| `(dashboard)/dashboard/advisor/page.tsx` | Problem Solver |
| `(dashboard)/dashboard/customers/page.tsx` | CRM contacts list |
| `(dashboard)/dashboard/customers/new` | Add contact |
| `(dashboard)/dashboard/library/page.tsx` | Saved generations |
| `(dashboard)/dashboard/settings/page.tsx` | Business profile settings |
| `(dashboard)/dashboard/upgrade/page.tsx` | Upgrade prompt |

### Components
- `components/dashboard/Sidebar.tsx` — full nav, credits bar, plan gating
- `components/dashboard/LiveAssistantPanel.tsx` — floating chat panel
- `components/generators/GeneratorShell.tsx` — split-panel generator layout
- `components/shared/AgentStatusIndicator.tsx` — animated status pill
- `components/shared/ActionExplanation.tsx` — post-generation context panel
- `components/shared/CopyButton.tsx` — clipboard copy with feedback
- `components/shared/EmptyState.tsx` — empty state wrapper
- `components/shared/UpgradePrompt.tsx` — upgrade CTA

### Infrastructure
- `supabase/schema.sql` — full schema with RLS, triggers, indexes
- `lib/stripe/pricing.ts` — plan configs with GBP/USD/EUR prices
- `lib/utils.ts` — cn, formatCurrency, formatDate, timeAgo, truncate, slugify, etc.
- `lib/i18n/routing.ts` — 12 locales + getCurrencyFromLocale()
- `messages/en.json` — base i18n strings
- `middleware.ts` — next-intl + Supabase session update
- `tailwind.config.ts` — custom colors: dashBg, dashCard, accent, etc.

---

## Pending / Next items
_Add items here as James specifies them_

- [ ] Contact detail page (`customers/[contactId]/page.tsx`)
- [ ] Calendar page
- [ ] Admin panel (`/admin`)
- [ ] Additional locale message files (es, fr, de, etc.)
- [ ] Review requests page
- [ ] GitHub push authentication — need PAT from James

---

## Key rules for future sessions
1. Always push to GitHub: `git push github <branch>`
2. Also push to origin: `git push origin <branch>`
3. New branches: `claude/<feature-name>-<session-id>`
4. Schema is canonical — never add columns that don't exist in `supabase/schema.sql`
5. Check this file at the start of every session for current state

---

## Phase 3 Complete (2026-03-20)

### Files added in Phase 3

- `lib/email/sequences.ts` — 7 email sequences (welcome, day2, day4, trialEnd, upgraded, monthlyReview, winBack)
- `lib/email/send.ts` — Resend API wrapper with `sendEmail` + `sendSequenceEmail` + template interpolation
- `app/api/email/send/route.ts` — POST endpoint, service-role protected
- `app/api/cron/market-intel/route.ts` — Weekly market intel refresh (Mon 6am)
- `app/api/cron/coach-brief/route.ts` — Weekly coach brief + email (Mon 7am)
- `app/api/cron/credit-reset/route.ts` — Monthly credit reset (1st of month)
- `app/api/cron/trial-reminders/route.ts` — Daily trial ending email check
- `vercel.json` — Cron schedule configuration
- `marketing/producthunt/LAUNCH_ASSETS.md` — Full PH launch pack
- `marketing/campaigns/REDDIT_STRATEGY.md` — 3 post templates + subreddit priority list
- `marketing/campaigns/FACEBOOK_GROUPS_STRATEGY.md` — Screenshot method + content calendar
- `marketing/campaigns/COLD_EMAIL_AGENCY.md` — Agency outreach with value calculator
- `marketing/REVENUE_PLAN.md` — Conservative projections M1–M12 + unit economics
- `DEPLOYMENT_CHECKLIST.md` — Full 10-section launch checklist
- `app/[locale]/(marketing)/page.tsx` — Complete 10-section landing page rewrite

### Intelligence pages added (Phase 2/3 overlap)

- `/roas` — ROAS Analysis (Leo)
- `/finances` — Financial Intelligence (Flora)
- `/inventory` — Inventory Management (Rex)
- `/customer-trends` — Customer Trends (Maya)
- `/google-optimisation` — Google Optimisation (Geo)
- `/alternatives` — Find Alternatives (Hugo)
- `/conversations` — Conversation Flows (Echo)
- `/agents` — All Agents directory (21 agents, searchable)

### Full feature list (all 3 phases)

- **CONTENT (Pillar 1):** GBP Posts, Blog, Reviews, Social, Email, SEO
- **GROWTH (Pillar 2):** Sales, Research, Strategy, Financial Health, HR, Campaigns
- **INTELLIGENCE (Pillar 3):** ROAS, Finance Analysis, Inventory, Customer Trends, Google Opt, Alternatives
- **CUSTOMERS (Pillar 4):** CRM, Follow-ups, Review Requests, Reactivation, Conversations
- **ADVISOR (Pillar 5):** Problem Solver, Live Assistant, All Agents directory

**Total agents:** 21 named agents + Master Orchestrator
**Total pages:** 40+ dashboard pages
**Total API routes:** 35+
**Languages:** 12 locales
**Email sequences:** 7

### What James needs to do next

1. Run `supabase/schema.sql` in Supabase SQL Editor
2. Set up Stripe products and copy price IDs to `.env.local`
3. Set `ANTHROPIC_API_KEY` in `.env.local`
4. Set `RESEND_API_KEY` in `.env.local`
5. Deploy to Vercel
6. Complete `DEPLOYMENT_CHECKLIST.md`
7. Run launch marketing (start with `marketing/campaigns/REDDIT_STRATEGY.md`)

---

## Phase 5 Complete (2026-03-21)

### Files added in Phase 5

**5A — Analytics:**
- `supabase/schema.sql` — analytics_events, revenue_snapshots, website_analytics, ad_performance tables + RLS + indexes
- `lib/analytics.ts` — AnalyticsEventType, trackEvent(), AnalyticsSummary, AdPerformanceSummary interfaces
- `app/api/analytics/track/route.ts` — POST fire-and-forget event tracking (service role)
- `app/api/analytics/summary/route.ts` — GET authenticated summary with period + % change
- `app/api/analytics/ads/route.ts` — GET Orbit+ ad performance summary grouped by platform
- `app/api/analytics/revenue/route.ts` — POST revenue snapshot upsert
- `app/api/analytics/ads/import/route.ts` — POST bulk ad data import with derived metrics
- `app/[locale]/(dashboard)/analytics/page.tsx` — Full Shopify-style analytics dashboard (recharts)

**5B — Conversational Task Interface:**
- `lib/agents/conversationalTaskAgent.ts` — Opus orchestrated intent classifier + task executor
- `app/[locale]/(dashboard)/chat/page.tsx` — Full-page chat with voice input, content cards, suggestions
- `app/api/chat/route.ts` — POST 1-credit conversational task endpoint

**5C — Spanish:**
- `messages/es.json` — Complete Spanish translation (all keys from en.json)

**5D — Trust + Polish:**
- `components/shared/TrustBar.tsx` — SSL/GDPR/Stripe/rating trust signals row
- `components/shared/LiveCounters.tsx` — Animated business counter + last signup timer
- `components/shared/LanguageSwitcher.tsx` — EN|ES toggle with cookie persistence

**5E — Analytics Event Tracking:**
- `components/dashboard/AnalyticsTracker.tsx` — Client component tracking session_start/page_view
- Updated `app/api/generate/route.ts` — tracks content_generated after generation
- Updated `app/api/roas/route.ts` — tracks roas_viewed after analysis
- Updated `app/api/problem-solver/route.ts` — tracks problem_solved after solve
- Updated `app/api/crm/contacts/route.ts` — tracks contact_added on POST

**5F — Ad Data Import:**
- Updated `lib/agents/dataIngestionAgent.ts` — Added parseAdvertisingData() for Google Ads/Meta Ads CSV

**Updated components/pages:**
- `components/dashboard/Sidebar.tsx` — Added "Chat with ELEVO" (NEW badge, first item) + "Analytics"
- `app/[locale]/(dashboard)/layout.tsx` — Added AnalyticsTracker component
- `app/[locale]/(dashboard)/dashboard/page.tsx` — Mini analytics strip (revenue/jobs/credits/ROAS) at top
- `app/[locale]/(marketing)/page.tsx` — Spanish hero copy, TrustBar, LiveCounters
- `app/[locale]/(marketing)/pricing/page.tsx` — Money-back guarantee + Enterprise CTA
- `middleware.ts` — Spanish Accept-Language redirect

---

## Phase 8 Complete (2026-03-22)

### Files added in Phase 8

**8A — Performance:**
- `next.config.ts` — compress, poweredByHeader off, optimizeCss, optimizePackageImports, security headers, cache headers
- `app/globals.css` — font smoothing + content-visibility
- `app/api/health/route.ts` — GET health check endpoint
- `app/[locale]/(dashboard)/[route]/loading.tsx` — 10 skeleton loading states (dashboard, social, ugc, analytics, roas, finances, customers, advisor, agents, automations)

**8B — Auto-posting (real social API publishing):**
- `lib/social/publisher.ts` — Instagram, Facebook, LinkedIn, Twitter/X, Google Business publishers
- `lib/social/oauth.ts` — OAuth URL generators + code exchangers for 6 platforms
- `app/api/social/oauth/[platform]/route.ts` — Redirect to platform OAuth
- `app/api/social/callback/[platform]/route.ts` — Token exchange + save to social_accounts
- `app/api/social/publish/route.ts` — Publish one post immediately
- `app/api/cron/publish-scheduled/route.ts` — Every 15min: publish due posts
- `app/[locale]/(dashboard)/social/page.tsx` — Full Social Hub with OAuth connect, follower count, auto-post toggle
- `.env.local.example` — All env vars including 12 social OAuth keys
- `vercel.json` — Added */15 * * * * publish-scheduled cron

**8C — AI Video Studio (Arcads + Creatify + ElevenLabs in one):**
- `lib/agents/videoStudioAgent.ts` — Vega agent: generateAvatarAdScript, generateProductVideoFromUrl, generateVoiceoverScript
- `app/[locale]/(dashboard)/video-studio/page.tsx` — 4-mode studio (Avatar/Product URL/Voiceover/Cinematic) with comparison table
- `app/api/video-studio/avatar/route.ts` — 2 credits, Opus-powered
- `app/api/video-studio/product-url/route.ts` — 2 credits
- `app/api/video-studio/voiceover/route.ts` — 1 credit

**8D — ManyChat-level CRM (Sage supercharged):**
- `lib/agents/crmConversationAgent.ts` — Sage: handleIncomingMessage, buildConversationFlow, generateTemplateLibrary
- `app/[locale]/(dashboard)/conversations/page.tsx` — Full ManyChat UI: Live Inbox + Flow Builder + Template Library
- `app/api/conversations/inbox/route.ts` — GET (paginated/filtered) + PATCH
- `app/api/conversations/reply/route.ts` — Sage handles message + auto-CRM + analytics
- `app/api/conversations/flows/route.ts` — GET + POST (build flow) + PATCH (toggle)
- `app/api/conversations/templates/route.ts` — GET + POST (generate)

**8E — Social→CRM Pipeline:**
- `app/api/conversations/reply/route.ts` — auto-upserts contacts when Sage collects info, tracks analytics
- `supabase/schema.sql` — analytics_events extended with lead_captured_social, conversation_converted, dm_flow_triggered, template_sent, video_created

**8F — Landing page:**
- `app/[locale]/(marketing)/page.tsx` — Added Video Studio comparison table section + ManyChat DM automation section with flow diagram

**8G — Sidebar:**
- `components/dashboard/Sidebar.tsx` — New "Social & Video" section (Social Hub, Video Studio, UGC Pipeline, Conversations, Profile Generator). Customers section cleaned up.

**Schema tables added:**
- `social_accounts` — OAuth tokens per platform per user
- `scheduled_posts` — Content scheduled for publishing
- `ai_videos` — Video briefs + AI prompts
- `conversation_flows` — ManyChat-style automation flows
- `live_conversations` — Real-time message threads
- `conversation_templates` — Reusable message templates

### What James needs to do

1. Add social OAuth app credentials to `.env.local` (see `.env.local.example`)
2. Run updated `supabase/schema.sql` in Supabase SQL Editor (Phase 8 tables at bottom)
3. Set `CRON_SECRET` env var in Vercel for cron authentication
4. Create Instagram/Facebook App at developers.facebook.com, LinkedIn App, Twitter Developer App, TikTok Developer App, Google Cloud OAuth credentials

---

## Phase 9 Complete (2026-03-22)

### Files added in Phase 9

**9A — Agent Rebrand:**
- `lib/agents/agentPersonas.ts` — Complete rewrite with `AgentPersona` interface: characterName, brandName, tagline, pillar, emoji, description, capabilities[], creditsPerUse, availableFrom. 25 agents total. Exports `AGENT_PERSONAS[]`, `getAgentByCharacter()`, `getAgentByBrand()`, `getAgentsByPillar()`, `PILLARS[]`.
- `app/[locale]/(dashboard)/agents/page.tsx` — Updated to use AGENT_PERSONAS, new schema fields

**9B — SEO Domination:**
- `lib/agents/seoAgent.ts` — ELEVO Rank™: `runSEOAudit()` + `generateSEOBlogPost()` (both use WEB_SEARCH_TOOL)
- `app/[locale]/(marketing)/blog/page.tsx` — Blog listing page, server component
- `app/[locale]/(marketing)/blog/[slug]/page.tsx` — Blog post with Article JSON-LD + generateMetadata
- `app/api/seo/audit/route.ts` — POST SEO audit (authenticated)
- `app/api/seo/generate-post/route.ts` — POST generate + save blog post (admin only)
- `app/[locale]/(dashboard)/seo/page.tsx` — ELEVO Rank™ dashboard: domain + keywords → 5-tab results
- `app/[locale]/(marketing)/sitemap.xml/route.ts` — Dynamic sitemap per locale with hreflang
- `public/robots.txt` — Allow all, Disallow /api/ /dashboard/

**9C — Ad Campaigns:**
- `lib/agents/adCampaignAgent.ts` — ELEVO Ads Pro™: `buildAdCampaign()` + `generateELEVOOwnAds()`
- `app/[locale]/(dashboard)/ads/page.tsx` — Full ads dashboard: Campaign Builder / My Campaigns / ELEVO's Own Ads
- `app/api/ads/build/route.ts` — POST 3 credits, Orbit+ only
- `app/api/ads/elevo-own/route.ts` — POST admin only

**9D — Social Profiles:**
- `lib/agents/socialProfileAgent.ts` — ELEVO Profile™: `generateSocialProfileKit()` with 30-day calendar + viral ideas
- `app/[locale]/(dashboard)/social/profiles/page.tsx` — Profile generator with 5-tab results
- `app/api/social/profile-kit/route.ts` — POST 1 credit
- `marketing/social/ELEVO_OWN_PROFILES_SETUP.md` — ELEVO's own social profile guide

**9E — Trademark:**
- `lib/agents/trademarkAgent.ts` — ELEVO Guard™: `runTrademarkCheck()` scanning UK/EU/US/AU/CA
- `app/[locale]/(dashboard)/settings/trademark/page.tsx` — Admin-only trademark dashboard with 5-tab report
- `app/api/trademark/check/route.ts` — POST admin-only
- `marketing/legal/TRADEMARK_STRATEGY.md` — Full filing strategy, costs, timelines, monitoring

**9F — Landing Page Overhaul:**
- `app/[locale]/(marketing)/page.tsx` — Complete rewrite: H1 "The AI operating system™ for local businesses", stats bar (400+ | £1.2M | 21 agents | 99.9%), 10 sections with ELEVO brand names throughout, ™ on all mentions, stronger conversion copy

**9G — JSON-LD + Metadata:**
- `app/[locale]/(marketing)/layout.tsx` — Added `generateMetadata()`, SoftwareApplication schema, Organization schema, FAQ schema (5 Q&A), updated nav with Blog link, improved footer with TM notice

**9H — Dynamic OG Images:**
- `app/api/og/route.tsx` — Edge runtime, `ImageResponse` 1200×630, dark indigo gradient bg, grid pattern, glow effects, ELEVO branding, dynamic ?title= + ?subtitle= params, stats bar at bottom

**Sidebar update:**
- `components/dashboard/Sidebar.tsx` — Added "Ad Campaigns → /ads [Orbit+]" and "SEO & Rankings → /seo" to Social & Video section

**supabase/schema.sql additions:**
- `blog_posts` table (slug UNIQUE, locale, title, meta_title, meta_description, content, target_keyword, published)
- `ad_campaigns` table (platform, objective, daily_budget, currency, status, output JSONB, actual_spend, actual_roas)

### What James needs to do next

1. File UK trademark application at https://www.gov.uk/apply-for-trademark (Classes 35 + 42, ~£400)
2. Use ™ symbol on all ELEVO AI branding immediately
3. Register domain variants: elevo.com, getelevo.com, tryelevo.com
4. Run `supabase/schema.sql` (Phase 9 additions: blog_posts, ad_campaigns tables)
5. Set up Google Alerts for "elevo ai", "elevoai"

---

## Phase 12 Complete (2026-03-22)

### What was built in Phase 12

**12 FIX 1 — Hydration errors fixed:**
- `components/shared/LiveCounters.tsx` — mounted pattern, lastSignup randomised in useEffect only
- `app/[locale]/layout.tsx` — suppressHydrationWarning on html + body
- `components/shared/FadeInWhenVisible.tsx` — framer-motion scroll-triggered fade component
- `components/marketing/LogoScroll.tsx` — CSS-only infinite logo scroll (no hydration risk)
- `components/marketing/Nav.tsx` — warm off-white scrolled bg rgba(255,252,248,0.95), gradient E logo
- `lib/ip-locale.ts` — 3-tier locale detection (cookie → Vercel geo → Accept-Language)
- `middleware.ts` — root path `/` redirects to detected locale
- `app/[locale]/(marketing)/layout.tsx` — SmoothScrollProvider + CookieConsent + ExitIntentPopup + ScrollTriggerPopup

**12A — Receipt + Invoice email system:**
- `lib/email/invoice-template.ts` — Beautiful HTML invoice email with anniversary billing date
- `app/api/stripe/webhook/route.ts` — invoice.payment_succeeded handler: generate invoice number, insert to DB, send email
- `app/api/invoices/route.ts` — GET user invoice history
- `app/[locale]/(dashboard)/settings/billing/page.tsx` — Invoice table + next billing date + Stripe portal links
- `supabase/schema.sql` — invoices table + billing_anchor_day on profiles

**12B — Countdown timer + discount codes:**
- `components/pricing/CountdownBanner.tsx` — 7-minute session-based countdown, expired state shows email unlock
- `components/pricing/PersonalCodeBanner.tsx` — Shows saved personal code with expiry countdown
- `app/api/discount/generate/route.ts` — POST: generate/reuse 50% discount code, send email
- `app/api/discount/validate/route.ts` — POST: validate code before checkout
- `app/api/stripe/checkout/route.ts` — Updated to accept + apply discount codes
- `supabase/schema.sql` — discount_codes table

**12C — Sales funnel CTA consistency:**
- `app/[locale]/(marketing)/page.tsx` — Complete rewrite with FadeInWhenVisible animations, warm white #FFFEF9 bg, consistent "Start free trial" CTA language

**12D — ELEVO Spy™ competitor intelligence:**
- `lib/agents/competitorSpyAgent.ts` — Opus + web_search, CompetitorIntelReport interface (10 sections), monitorCompetitor()
- `app/[locale]/(dashboard)/spy/page.tsx` — Full spy dashboard: form, threat level, 6 tabs (overview/content/ads/seo/sentiment/battleplan), monitoring panel
- `app/api/spy/analyse/route.ts` — POST 1/3/5 credits (quick/deep/full), Orbit+ only
- `app/api/spy/saved/route.ts` — GET saved competitors
- `app/api/cron/spy-monitor/route.ts` — Weekly Monday 8am competitor change detection
- `app/api/business-profiles/route.ts` — GET user's business profiles
- `vercel.json` — Added spy-monitor cron (Mondays 8am)
- `supabase/schema.sql` — competitor_intel table
- `components/dashboard/Sidebar.tsx` — ELEVO Spy™ added to Intelligence section (Orbit+, NEW badge)

**12E — Landing page spy section:**
- `app/[locale]/(marketing)/page.tsx` — ELEVO Spy™ dark section between agents and testimonials

### Sidebar: ELEVO Spy™ is under Intelligence section (Orbit+, NEW badge)
### Credits: quick=1, deep=3, full=5

### What James needs to do next

1. Run `supabase/schema.sql` (Phase 12 additions: invoices, discount_codes, competitor_intel tables + billing_anchor_day column)
2. No new env vars required for Phase 12
