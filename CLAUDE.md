# ELEVO AI — Claude Code Master Memory

**Product:** ELEVO AI | Latin: elevāre — I lift, I raise, I launch | **Creator:** James Carlin
**Path:** /home/user/Suppository-Repository | **Branch:** claude/build-elevo-ai-aYfcC

## Models
- Orchestrator + Problem Solver: `claude-opus-4-6`, thinking `{type:"adaptive"}`, effort "high"/"max"
- All specialist agents: `claude-sonnet-4-6`, thinking `{type:"adaptive"}`, effort "high" or "medium"
- Web search agents (Competitor/Trend/Research/Campaign/MarketIntel): add `web_search_20250305` tool
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
