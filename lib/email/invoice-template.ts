export interface InvoiceEmailParams {
  firstName: string
  businessName?: string
  invoiceNumber: string
  plan: string
  amount: number
  currency: string
  billingPeriodStart: string
  billingPeriodEnd: string
  nextBillingDate: string
  nextBillingAmount: string
  paymentMethod: string
  locale: string
}

export function generateInvoiceEmail(params: InvoiceEmailParams): string {
  const {
    firstName, businessName, invoiceNumber, plan, amount, currency,
    billingPeriodStart, billingPeriodEnd, nextBillingDate, nextBillingAmount,
    paymentMethod,
  } = params

  const currencySymbol = currency === 'gbp' ? '£' : currency === 'eur' ? '€' : '$'
  const formattedAmount = `${currencySymbol}${amount.toFixed(2)}`
  const formattedNext = `${currencySymbol}${parseFloat(nextBillingAmount).toFixed(2)}`

  const planName = {
    launch: 'ELEVO Launch™',
    orbit: 'ELEVO Orbit™',
    galaxy: 'ELEVO Galaxy™',
  }[plan] ?? `ELEVO ${plan}™`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Payment Confirmed — ELEVO AI™</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
<div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-0.5px;">ELEVO AI™</div>
<div style="font-size:14px;color:rgba(255,255,255,0.8);margin-top:4px;">Payment Confirmed</div>
</td></tr>

<!-- Body -->
<tr><td style="background:#fff;padding:40px;">
<!-- Checkmark -->
<div style="text-align:center;margin-bottom:24px;">
<div style="width:56px;height:56px;background:#d1fae5;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:24px;">✓</div>
</div>
<h1 style="text-align:center;font-size:22px;font-weight:700;color:#111827;margin:0 0 8px;">Thank you, ${firstName}!</h1>
${businessName ? `<p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 32px;">Your ${businessName} account is active.</p>` : '<p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 32px;">Your ELEVO account is now active.</p>'}

<!-- Receipt box -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;margin-bottom:24px;">
<tr><td style="padding:24px;">
<table width="100%" cellpadding="0" cellspacing="0">
${[
  ['Invoice', `#${invoiceNumber}`],
  ['Date', new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
  ['Plan', planName],
  ['Billing period', `${billingPeriodStart} – ${billingPeriodEnd}`],
  ['Amount paid', formattedAmount],
  ['Payment method', paymentMethod],
].map(([label, value], i) => `
<tr>
  <td style="font-size:13px;color:#6b7280;padding:6px 0;border-bottom:${i < 5 ? '1px solid #e5e7eb' : 'none'};">${label}</td>
  <td style="font-size:13px;font-weight:600;color:#111827;text-align:right;padding:6px 0;border-bottom:${i < 5 ? '1px solid #e5e7eb' : 'none'};">${value}</td>
</tr>`).join('')}
</table>
</td></tr>
</table>

<!-- Next billing notice -->
<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;margin-bottom:32px;">
<p style="margin:0;font-size:13px;color:#1d4ed8;text-align:center;">
📅 Your next payment of <strong>${formattedNext}</strong> will be taken on <strong>${nextBillingDate}</strong>
</p>
</div>

<!-- What to do next -->
<h2 style="font-size:16px;font-weight:700;color:#111827;margin:0 0 16px;">What to do next</h2>
<table width="100%" cellpadding="0" cellspacing="0">
${[
  ['1. Set up your first social account', '/social'],
  ['2. Run your first ROAS analysis', '/roas'],
  ["3. Generate this week's content", '/dashboard/content/gbp-posts'],
].map(([label, href]) => `
<tr><td style="padding:8px 0;">
<a href="https://elevo.dev/en${href}" style="display:block;background:#f8fafc;border-radius:8px;padding:12px 16px;text-decoration:none;color:#4f46e5;font-size:13px;font-weight:600;">${label} →</a>
</td></tr>`).join('')}
</table>
</td></tr>

<!-- Support -->
<tr><td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
<p style="margin:0;font-size:12px;color:#6b7280;">Questions? <a href="mailto:hello@elevo.dev" style="color:#4f46e5;">hello@elevo.dev</a></p>
</td></tr>

<!-- Footer -->
<tr><td style="background:#f1f5f9;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
<p style="margin:0;font-size:11px;color:#9ca3af;">™ ELEVO AI Ltd · All rights reserved ·
<a href="#" style="color:#9ca3af;">Privacy</a> · <a href="#" style="color:#9ca3af;">Terms</a> · <a href="#" style="color:#9ca3af;">Unsubscribe</a>
</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}
