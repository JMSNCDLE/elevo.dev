# ELEVO AI — Deployment Checklist

Before going live, complete every item below.

---

## 1. SUPABASE SETUP

- [ ] Create new Supabase project at supabase.com
- [ ] Run `supabase/schema.sql` in SQL Editor (full schema)
- [ ] Enable Email Auth in Authentication → Providers
- [ ] Enable Google OAuth (optional but recommended)
- [ ] Set up Row Level Security — verify all policies active
- [ ] Copy `SUPABASE_URL` and `SUPABASE_ANON_KEY` to `.env.local`
- [ ] Copy `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- [ ] Set email templates in Supabase Auth → Email Templates
  - Confirm signup: "Confirm your ELEVO account"
  - Reset password: "Reset your ELEVO password"
- [ ] Enable Supabase Realtime on the `profiles` table (for credit updates)

---

## 2. ANTHROPIC API SETUP

- [ ] Create account at console.anthropic.com
- [ ] Generate API key
- [ ] Add `ANTHROPIC_API_KEY` to `.env.local`
- [ ] Set spending limit ($500/month recommended for launch)
- [ ] Note model pricing:
  - `claude-opus-4-6` = $15/1M input, $75/1M output
  - `claude-sonnet-4-6` = $3/1M input, $15/1M output

---

## 3. STRIPE SETUP

- [ ] Create Stripe account at stripe.com
- [ ] Create 3 Products: ELEVO Launch, ELEVO Orbit, ELEVO Galaxy
- [ ] For each product, create prices:
  - Monthly GBP, USD, EUR
  - Annual GBP, USD, EUR (with 2 months free)
  - Total: 18 price IDs
- [ ] Enable free trial on checkout: 7 days
- [ ] Copy all 18 price IDs to `.env.local`
- [ ] Copy `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`
- [ ] Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
  - Events to enable:
    - `checkout.session.completed`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.payment_succeeded`
    - `invoice.payment_failed`
    - `customer.subscription.trial_will_end`
- [ ] Copy `STRIPE_WEBHOOK_SECRET` to `.env.local`
- [ ] Enable Stripe Customer Portal
- [ ] Enable trial ending reminder emails (3 days before)

---

## 4. RESEND EMAIL SETUP

- [ ] Create account at resend.com
- [ ] Add and verify your domain (e.g. elevo.ai)
- [ ] Create API key
- [ ] Add `RESEND_API_KEY` to `.env.local`
- [ ] Set `FROM_EMAIL=hello@elevo.ai` in `.env.local`
- [ ] Test email sending with welcome sequence

---

## 5. VERCEL DEPLOYMENT

- [ ] Push all code to GitHub on branch `claude/build-elevo-ai-aYfcC`
- [ ] Connect repository to Vercel at vercel.com
- [ ] Set all environment variables in Vercel dashboard (copy from `.env.local.example`)
- [ ] Set Framework Preset: Next.js
- [ ] Deploy
- [ ] Add custom domain in Vercel → Domains
- [ ] Verify SSL certificate active
- [ ] Set `NEXT_PUBLIC_APP_URL=https://yourdomain.com` in Vercel

---

## 6. VERCEL CRON JOBS

`vercel.json` is already configured with:

```json
{
  "crons": [
    { "path": "/api/cron/market-intel",    "schedule": "0 6 * * 1" },
    { "path": "/api/cron/coach-brief",     "schedule": "0 7 * * 1" },
    { "path": "/api/cron/credit-reset",    "schedule": "0 0 1 * *" },
    { "path": "/api/cron/trial-reminders", "schedule": "0 9 * * *" }
  ]
}
```

- [ ] Set `CRON_SECRET` in Vercel environment variables
- [ ] Verify cron routes respond correctly (test manually via GET with header)

---

## 7. ANALYTICS

- [ ] Set up Google Analytics 4 (or Plausible for privacy-first)
  - Add to `app/[locale]/layout.tsx`
- [ ] Set up key conversion events:
  - `signup_started`
  - `trial_started`
  - `first_generation`
  - `upgraded_to_paid`
  - `roas_analysis_run`
  - `problem_solver_used`
- [ ] Set up Hotjar (or Microsoft Clarity) for session recordings
  - Focus on: signup flow, onboarding, first generation

---

## 8. LAUNCH DAY CHECKLIST

### Morning of launch:
- [ ] Test full signup → onboarding → first generation flow
- [ ] Test Stripe checkout in test mode → verify webhooks fire
- [ ] Test all 6 email sequences
- [ ] Test ROAS analysis with sample data
- [ ] Verify mobile view works correctly on iPhone and Android
- [ ] Test demo page with guest mode (3 per day limit)
- [ ] Verify admin panel at `/admin` is accessible only to admin users

### 1 hour before launch:
- [ ] Switch Stripe to live mode
- [ ] Remove any test data from Supabase
- [ ] Set your own account as `role='admin'` in profiles table
- [ ] Post ProductHunt product (schedule for 12:01am PST)

### At launch:
- [ ] Post Reddit r/smallbusiness thread
- [ ] Post in 3 Facebook groups
- [ ] Email any beta users or friends to upvote ProductHunt
- [ ] LinkedIn post from your personal account

---

## 9. POST-LAUNCH MONITORING

### First 24 hours, monitor:
- Vercel function logs (any 500 errors?)
- Supabase logs (any failed queries?)
- Stripe dashboard (any failed payments?)
- Resend dashboard (emails delivering?)
- GitHub: any build failures?

### First 7 days:
- Watch which agents get used most (from `saved_generations` type distribution)
- Watch where users drop off in onboarding
- Watch credit usage patterns (are people hitting limits?)
- Check ROAS analysis adoption rate

---

## 10. ENVIRONMENT VARIABLES — FINAL LIST

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
