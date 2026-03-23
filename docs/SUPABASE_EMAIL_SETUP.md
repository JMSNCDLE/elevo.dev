# Supabase Email Confirmation Setup

This guide explains how to configure (and optionally disable) email confirmation for your ELEVO AI development and production environments.

---

## Development: Disable Email Confirmation

When developing locally, email confirmation is often a friction point. You can disable it in the Supabase dashboard:

### Steps

1. Go to your Supabase project: **Authentication → Providers → Email**
2. Toggle **"Confirm email"** to **OFF**
3. Save

Users will now be able to sign in immediately after signup without confirming their email.

> ⚠️ Only do this in your development/staging project. Always keep email confirmation enabled in production.

---

## Production: Keep Confirmation Enabled + Customise the Email

### 1. Customise the confirmation email

Go to **Authentication → Email Templates → Confirm signup**.

Replace the default template with the ELEVO AI branded version:

```html
<h2>Welcome to ELEVO AI™</h2>
<p>Hi there,</p>
<p>You're one click away from launching your AI-powered business operations.</p>
<p>
  <a href="{{ .ConfirmationURL }}" style="
    background-color: #6366F1;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    display: inline-block;
  ">
    Confirm your email →
  </a>
</p>
<p>If you didn't create an ELEVO AI account, you can safely ignore this email.</p>
<p>— The ELEVO AI Team</p>
```

### 2. Set the redirect URL

In **Authentication → URL Configuration**, set:

- **Site URL**: `https://yourdomain.com`
- **Redirect URLs**: `https://yourdomain.com/en/auth/callback`

This ensures users land on the correct callback route after confirming.

---

## Resend Confirmation Email

If a user doesn't receive their confirmation email, they can request a new one via the `/api/auth/resend-confirmation` endpoint.

### API Usage

```bash
POST /api/auth/resend-confirmation
Content-Type: application/json

{
  "email": "user@example.com"
}
```

This calls `supabase.auth.resend({ type: 'signup', email })` and sends a fresh confirmation link.

### From the frontend

The signup page already has a "Resend confirmation" button that calls this endpoint automatically after the initial signup.

---

## SMTP Configuration (Optional — for custom sender)

By default, Supabase uses its own SMTP to send emails. To use your own (e.g. Resend, SendGrid, Postmark):

1. Go to **Project Settings → Auth → SMTP Settings**
2. Enable custom SMTP
3. Enter your SMTP credentials:
   - **Host**: `smtp.resend.com` (or your provider)
   - **Port**: `465`
   - **User**: `resend` (or your username)
   - **Password**: Your SMTP API key
   - **Sender name**: `ELEVO AI`
   - **Sender email**: `hello@elevoai.com`

---

## Environment Variables

No additional environment variables are required for email confirmation. The Supabase client automatically uses the project's anon key and service role key from:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

These are already set in `.env.local`.

---

## Testing Locally with Supabase CLI

If you're using `supabase start` (local development):

1. Email confirmation is **disabled by default** in local Supabase
2. Emails are captured by **Inbucket** at `http://localhost:54324`
3. You can view all sent emails there without needing real SMTP

---

## Common Issues

| Issue | Solution |
|-------|----------|
| User can't log in after signup | Check email confirmation is off in dev, or confirm the email in prod |
| Confirmation link expired | Links expire after 24 hours. Use the resend endpoint |
| Email going to spam | Set up DMARC/SPF/DKIM records for your sending domain |
| Wrong redirect URL | Ensure `Site URL` in Supabase matches your deployed domain exactly |
| `auth/callback` 404 | Verify `app/[locale]/auth/callback/route.ts` exists and handles the code exchange |
