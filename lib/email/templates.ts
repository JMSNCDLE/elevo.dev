// Shared ELEVO email template wrapper
// All emails use this for consistent branding

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'

export function wrapEmail(content: string, opts?: { unsubscribeUrl?: string; locale?: string }): string {
  const locale = opts?.locale ?? 'en'
  const unsubUrl = opts?.unsubscribeUrl ?? `${APP_URL}/api/email/unsubscribe`
  const unsubText = locale === 'es' ? 'Cancelar suscripción' : 'Unsubscribe'
  const footerText = locale === 'es' ? 'Estás recibiendo esto porque tienes una cuenta en ELEVO AI.' : 'You\'re receiving this because you have an ELEVO AI account.'

  return `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;margin:0;padding:0">
<div style="max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#ffffff;border-radius:12px;padding:40px 32px;border:1px solid #e4e4e7">
    <div style="margin-bottom:28px">
      <table cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:middle">
          <img src="https://elevo.dev/logo.svg" alt="ELEVO AI" width="32" height="32" style="display:block;border-radius:8px"/>
        </td>
        <td style="padding-left:10px;font-weight:800;font-size:18px;color:#18181b;vertical-align:middle">ELEVO AI</td>
      </tr></table>
    </div>
    <div style="font-size:15px;line-height:1.7;color:#3f3f46">
      ${content}
    </div>
  </div>
  <div style="text-align:center;padding:20px 0;font-size:12px;color:#a1a1aa">
    <p style="margin:0 0 4px">${footerText}</p>
    <a href="${unsubUrl}" style="color:#a1a1aa;text-decoration:underline">${unsubText}</a>
    <p style="margin:8px 0 0">ELEVO AI™ · elevo.dev</p>
  </div>
</div>
</body>
</html>`
}

export function emailButton(text: string, url: string): string {
  return `<div style="margin:24px 0;text-align:center">
  <a href="${url}" style="display:inline-block;background:#6366F1;color:#ffffff;font-weight:600;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none">${text}</a>
</div>`
}

export function emailDivider(): string {
  return '<hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0">'
}

export function emailStatRow(label: string, value: string | number): string {
  return `<tr>
  <td style="padding:8px 0;color:#71717a;font-size:14px">${label}</td>
  <td style="padding:8px 0;text-align:right;font-weight:600;color:#18181b;font-size:14px">${value}</td>
</tr>`
}
