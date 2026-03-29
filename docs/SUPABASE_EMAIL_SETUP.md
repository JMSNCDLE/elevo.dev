# ELEVO AI — How to Make Confirmation Emails Work

## OPTION A — For immediate testing (use this now)

1. Go to supabase.com → your ELEVO AI project
2. Click **Authentication** in the left menu
3. Click **Settings**
4. Scroll to **SMTP Settings**
5. Toggle ON **Enable Custom SMTP**
6. Fill in:
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: `[paste your RESEND_API_KEY from .env.local — starts with re_]`
   - Sender name: `ELEVO AI`
   - Sender email: `onboarding@resend.dev`
7. Click **Save**
8. Go to **Email Templates → Confirmation** → click **Save**
9. Sign up again — the confirmation email will now arrive

## OPTION B — After connecting elevo.ai domain (production)

1. Go to resend.com → Domains → Add Domain → enter `elevo.ai`
2. Add the DNS records shown to your Cloudflare account
3. Verify the domain in Resend
4. Change Sender email to: `hello@elevo.ai`
5. All emails now send from your branded domain

## Email Confirmation HTML Template

Paste this into Supabase → Authentication → Email Templates → Confirmation:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirm your ELEVO AI account</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
          <tr>
            <td style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:40px;text-align:center">
              <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px">ELEVO AI™</div>
              <div style="font-size:14px;color:rgba(255,255,255,0.8);margin-top:4px">The AI operating system for local businesses</div>
            </td>
          </tr>
          <tr>
            <td style="padding:48px 40px">
              <h1 style="font-size:24px;font-weight:700;color:#0F172A;margin:0 0 12px">You're almost in.</h1>
              <p style="font-size:16px;color:#475569;line-height:1.6;margin:0 0 32px">
                Click the button below to confirm your email address and activate your ELEVO AI account. Your 7-day free trial starts the moment you confirm.
              </p>
              <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:16px 40px;border-radius:10px">
                Confirm my account →
              </a>
              <p style="font-size:13px;color:#94A3B8;margin:32px 0 0">
                This link expires in 24 hours. If you didn't sign up for ELEVO AI, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #F1F5F9;text-align:center">
              <p style="font-size:12px;color:#94A3B8;margin:0">© 2026 ELEVO AI Ltd™ · hello@elevo.ai</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```
