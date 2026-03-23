# WhatsApp Notifications Setup — ELEVO AI

ELEVO AI sends real-time WhatsApp notifications to James (+34 679 444 783) for:
- New sales
- New signups
- Payment failures
- Critical system errors
- Daily summaries
- Competitor alerts

---

## Step 1: Create a Twilio Account

1. Go to [twilio.com](https://www.twilio.com) and sign up for a free account.
2. Verify your phone number during signup.
3. From your Twilio Console dashboard, copy:
   - **Account SID** — looks like `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token** — found on the same dashboard page (click to reveal)

---

## Step 2: Enable WhatsApp Sandbox

Twilio provides a free WhatsApp sandbox for testing.

1. In the Twilio Console, go to **Messaging → Try it out → Send a WhatsApp message**
2. The sandbox number is: **+1 415 523 8886**
3. To activate the sandbox, send the following WhatsApp message from your phone to that number:
   ```
   join <your-sandbox-word>
   ```
   (Twilio will show you the exact word to use in the sandbox page)
4. Once activated, you can send WhatsApp messages from code to any phone that has joined the sandbox.
5. James's number (+34 679 444 783) must also send the join message to activate receiving.

---

## Step 3: Add to .env.local

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886
JAMES_WHATSAPP_NUMBER=+34679444783
```

Note: `TWILIO_WHATSAPP_NUMBER` for sandbox is always `+14155238886`. For production it will be your approved number.

---

## Step 4: Production Setup (Go-Live)

When ELEVO AI is live and you want to send WhatsApp from your own number (e.g. an elevo.io number):

1. In the Twilio Console, go to **Messaging → Senders → WhatsApp Senders**
2. Click **Request access** to apply for the WhatsApp Business API
3. You'll need:
   - A Facebook Business Manager account
   - A verified business
   - A phone number not registered on WhatsApp
4. Once approved (usually 1–5 business days), connect your elevo.io number
5. Update `TWILIO_WHATSAPP_NUMBER` in your environment variables to the approved number
6. Update the `from` field format stays the same: `whatsapp:+YOUR_NUMBER`

---

## Testing

Once configured, test by hitting the admin endpoint:

```bash
curl -X POST https://elevo.ai/api/whatsapp/notify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \
  -d '{"type": "criticalError", "data": {"error": "Test error", "page": "/test"}}'
```

Or use the test button in the ELEVO PA™ dashboard at `/admin/pa`.

---

## Troubleshooting

- **"Message failed"**: Make sure James's number has joined the sandbox (Step 2)
- **"Invalid credentials"**: Double-check Account SID and Auth Token
- **"From number not verified"**: The sandbox number must be used in test mode; production requires WhatsApp Business API approval
