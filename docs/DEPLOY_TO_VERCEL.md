# How to Deploy ELEVO AI to Vercel

## Step 1 — Create Vercel account
1. Go to: vercel.com
2. Click: **Sign up with GitHub**
3. Authorise: JMSNCDLE account

## Step 2 — Import the project
1. Click: **New Project**
2. Select: **JMSNCDLE/Claude-code-Business-SaaS**
3. Framework: Next.js (auto-detected)
4. Branch: `claude/build-elevo-ai-aYfcC`
5. Click: **Deploy**

## Step 3 — Add environment variables
In Vercel → your project → **Settings → Environment Variables**

Add EVERY line from your `.env.local` file:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gtkeaanluhtawxnemhzj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from .env.local |
| `SUPABASE_SERVICE_ROLE_KEY` | from .env.local |
| `ANTHROPIC_API_KEY` | from .env.local |
| `STRIPE_SECRET_KEY` | your real Stripe key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | your real Stripe key |
| `STRIPE_WEBHOOK_SECRET` | from Stripe webhook setup (Step 5) |
| `NEXT_PUBLIC_APP_URL` | `https://elevo.dev` |
| `RESEND_API_KEY` | from .env.local |
| `FROM_EMAIL` | `hello@elevo.ai` |
| `CRON_SECRET` | `elevo-cron-secret-2026` |
| `ELEVO_ADMIN_EMAIL` | `jamesc.2504@gmail.com` |
| `ELEVO_ADMIN_USER_ID` | your Supabase user UUID |

Click **Save**. Then click **Redeploy** to apply variables.

## Step 4 — Connect elevo.ai domain
1. In Vercel → Settings → **Domains** → Add Domain → `elevo.ai`
2. Vercel shows you 2 DNS records
3. Go to **Cloudflare → elevo.ai → DNS** → add them:
   - Type A: `@` → [Vercel IP shown]
   - Type CNAME: `www` → `cname.vercel-dns.com`
4. Wait 5–30 minutes — elevo.ai is now live

## Step 5 — Set up Stripe webhook
1. Go to: dashboard.stripe.com → Developers → **Webhooks**
2. Click: **Add endpoint**
3. URL: `https://elevo.dev/api/stripe/webhook`
4. Events to select:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Click: **Add endpoint**
6. Copy the **signing secret** → add to Vercel as `STRIPE_WEBHOOK_SECRET`
7. Redeploy Vercel

## Step 6 — Test on live URL
1. Go to: https://elevo.dev
2. Sign up with a test account
3. Check confirmation email arrives
4. Check dashboard loads
5. Go to `/en/admin/qa` → run all checks

## Step 7 — You are live. Start selling.

Refer to `marketing/campaigns/REDDIT_STRATEGY.md` for the first wave of traffic.
