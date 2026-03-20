import { Resend } from 'resend'
import { EMAIL_SEQUENCES, type SequenceKey } from './sequences'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.FROM_EMAIL ?? 'hello@elevo.ai'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.ai'

export interface SendEmailParams {
  to: string
  subject: string
  body: string
  from?: string
}

export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; id?: string }> {
  try {
    const html = params.body
      .replace(/\n/g, '<br>')
      .replace(/\[(.+?)\s*→\]\s*(https?:\/\/\S+)/g, '<a href="$2" style="color:#6366F1;font-weight:600;">$1 →</a>')
      .replace(/\[(.+?)\s*→\]/g, '<a href="#" style="color:#6366F1;font-weight:600;">$1 →</a>')

    const { data, error } = await resend.emails.send({
      from: params.from ?? FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:24px">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;padding:40px;border:1px solid #e5e7eb">
<div style="margin-bottom:32px">
  <span style="font-weight:800;font-size:20px;color:#111827">ELEVO AI</span>
</div>
<div style="font-size:15px;line-height:1.7;color:#374151">
${html}
</div>
<div style="margin-top:40px;padding-top:24px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af">
  ELEVO AI · <a href="${APP_URL}/dashboard/settings" style="color:#9ca3af">Unsubscribe</a>
</div>
</div>
</body>
</html>`,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    console.error('sendEmail error:', err)
    return { success: false }
  }
}

function interpolate(template: string, variables: Record<string, string | number>): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value))
  }
  // Replace any unreplaced variables with empty string
  result = result.replace(/\{\{[^}]+\}\}/g, '')
  return result
}

export async function sendSequenceEmail(
  sequenceKey: SequenceKey,
  to: string,
  variables: Record<string, string | number>
): Promise<void> {
  const sequence = EMAIL_SEQUENCES[sequenceKey]
  const allVars = { appUrl: APP_URL, ...variables }

  const subject = interpolate(sequence.subject, allVars)
  const body = interpolate(sequence.body, allVars)

  await sendEmail({ to, subject, body })
}
