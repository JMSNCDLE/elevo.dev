# Setting Up Stripe Products for ELEVO AI

## Step 1 — Create products

Go to: dashboard.stripe.com → **Products → Add product**

### Product 1: ELEVO Launch
- Name: ELEVO Launch
- Prices:
  - £39.00 / month (GBP) → copy Price ID → `STRIPE_LAUNCH_GBP_ID`
  - $49.00 / month (USD) → copy Price ID → `STRIPE_LAUNCH_USD_ID`
  - €45.00 / month (EUR) → copy Price ID → `STRIPE_LAUNCH_EUR_ID`

### Product 2: ELEVO Orbit
- Name: ELEVO Orbit
- Prices:
  - £79.00 / month (GBP) → `STRIPE_ORBIT_GBP_ID`
  - $99.00 / month (USD) → `STRIPE_ORBIT_USD_ID`
  - €89.00 / month (EUR) → `STRIPE_ORBIT_EUR_ID`

### Product 3: ELEVO Galaxy
- Name: ELEVO Galaxy
- Prices:
  - £149.00 / month (GBP) → `STRIPE_GALAXY_GBP_ID`
  - $199.00 / month (USD) → `STRIPE_GALAXY_USD_ID`
  - €169.00 / month (EUR) → `STRIPE_GALAXY_EUR_ID`

### Product 4: Creative Credit Pack — 100 credits
- Name: ELEVO Create™ — 100 Credits
- Type: One-time payment
- Price: £9.99 → `STRIPE_CREATE_PACK_100_ID`

### Product 5: Creative Credit Pack — 500 credits
- Name: ELEVO Create™ — 500 Credits
- Type: One-time payment
- Price: £39.99 → `STRIPE_CREATE_PACK_500_ID`

## Step 2 — Enable payment methods

Settings → Payment methods → Enable:
- ✅ PayPal
- ✅ Apple Pay
- ✅ Google Pay
- ✅ Klarna
- ✅ Link (Stripe's 1-click checkout)

## Step 3 — Add price IDs to Vercel

Add these to Vercel → Settings → Environment Variables:

```
STRIPE_LAUNCH_GBP_ID=price_...
STRIPE_LAUNCH_USD_ID=price_...
STRIPE_LAUNCH_EUR_ID=price_...
STRIPE_ORBIT_GBP_ID=price_...
STRIPE_ORBIT_USD_ID=price_...
STRIPE_ORBIT_EUR_ID=price_...
STRIPE_GALAXY_GBP_ID=price_...
STRIPE_GALAXY_USD_ID=price_...
STRIPE_GALAXY_EUR_ID=price_...
STRIPE_CREATE_PACK_100_ID=price_...
STRIPE_CREATE_PACK_500_ID=price_...
```

## Step 4 — Test payments

Use test card: `4242 4242 4242 4242` (any future expiry, any CVC)

Go to: your-vercel-url/en/pricing → click any plan → complete checkout with test card → verify `/en/dashboard` loads with correct plan.
