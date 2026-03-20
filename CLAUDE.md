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
