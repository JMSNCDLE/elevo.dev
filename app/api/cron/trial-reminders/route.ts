import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/send'
import { wrapEmail, emailButton, emailStatRow, emailDivider } from '@/lib/email/templates'

const CRON_SECRET = process.env.CRON_SECRET
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'

function buildReminderHtml(
  locale: string,
  firstName: string,
  stats: { contentGenerated: number; contactsAdded: number; creditsUsed: number }
): string {
  const isEs = locale === 'es'

  const content = isEs
    ? `<h2 style="color:#18181b;font-size:22px;margin:0 0 16px">Tu prueba gratis termina mañana</h2>
<p>Hola ${firstName}, tu período de prueba de 7 días termina mañana.</p>
<p style="font-weight:600;color:#18181b">Esto es lo que has construido:</p>
<table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:16px 0;background:#f4f4f5;border-radius:8px;padding:4px">
  ${emailStatRow('Contenido creado', stats.contentGenerated)}
  ${emailStatRow('Contactos en CRM', stats.contactsAdded)}
  ${emailStatRow('Créditos usados', stats.creditsUsed)}
</table>
${emailDivider()}
<p style="font-weight:600;color:#dc2626">Si no actualizas, mañana perderás:</p>
<ul style="color:#3f3f46;font-size:14px;line-height:2">
  <li>Tus agentes de IA dejarán de trabajar</li>
  <li>La automatización de CRM se pausará</li>
  <li>No recibirás más informes semanales</li>
  <li>No podrás generar más contenido</li>
</ul>
<p>El plan Launch cuesta solo €29.99/mes — menos que una hora con un consultor de marketing.</p>
${emailButton('Mantener mi equipo de IA →', `${APP_URL}/es/pricing`)}
<p style="font-size:13px;color:#71717a">¿Preguntas? Responde a este correo.</p>`
    : `<h2 style="color:#18181b;font-size:22px;margin:0 0 16px">Your free trial ends tomorrow</h2>
<p>Hey ${firstName}, your 7-day trial ends tomorrow.</p>
<p style="font-weight:600;color:#18181b">Here's what you've built:</p>
<table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:16px 0;background:#f4f4f5;border-radius:8px;padding:4px">
  ${emailStatRow('Content created', stats.contentGenerated)}
  ${emailStatRow('Contacts in CRM', stats.contactsAdded)}
  ${emailStatRow('Credits used', stats.creditsUsed)}
</table>
${emailDivider()}
<p style="font-weight:600;color:#dc2626">If you don't upgrade, tomorrow you'll lose:</p>
<ul style="color:#3f3f46;font-size:14px;line-height:2">
  <li>Your AI agents will stop working</li>
  <li>CRM automation will pause</li>
  <li>Weekly content briefs will stop</li>
  <li>You won't be able to generate new content</li>
</ul>
<p>The Launch plan is just €29.99/month — less than one hour with a marketing consultant.</p>
${emailButton('Keep my AI team →', `${APP_URL}/en/pricing`)}
<p style="font-size:13px;color:#71717a">Questions? Reply to this email.</p>`

  return wrapEmail(content, { locale })
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(url, key)

  // Day 6 users only: created between 5.5 and 6.5 days ago
  const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  const fiveHalfDaysAgo = new Date(Date.now() - 5.5 * 24 * 60 * 60 * 1000)
  const sixHalfDaysAgo = new Date(Date.now() - 6.5 * 24 * 60 * 60 * 1000)

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, credits_used, created_at')
    .eq('plan', 'trial')
    .gte('created_at', sixHalfDaysAgo.toISOString())
    .lte('created_at', fiveHalfDaysAgo.toISOString())
    .is('trial_reminder_sent_at', null)
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = { sent: 0, errors: 0 }

  for (const user of users ?? []) {
    try {
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(user.id)
      const email = authUser?.email ?? user.email
      if (!email) continue

      // Check unsubscribe
      const { data: unsub } = await supabase
        .from('email_preferences')
        .select('marketing_emails')
        .eq('user_id', user.id)
        .single()
      if (unsub?.marketing_emails === false) continue

      const firstName = (user.full_name as string | null)?.split(' ')[0] ?? 'there'
      const locale = (authUser?.user_metadata?.locale as string) ?? 'en'

      // Gather stats
      const { count: contentGenerated } = await supabase
        .from('saved_generations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { count: contactsAdded } = await supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const subject = locale === 'es'
        ? 'Tu prueba gratis termina mañana — no pierdas tu equipo de IA'
        : "Your free trial ends tomorrow — don't lose your AI team"

      await sendEmail({
        to: email,
        subject,
        html: buildReminderHtml(locale, firstName, {
          contentGenerated: contentGenerated ?? 0,
          contactsAdded: contactsAdded ?? 0,
          creditsUsed: user.credits_used ?? 0,
        }),
        agentName: 'Trial Reminder',
        userId: user.id,
      })

      await supabase
        .from('profiles')
        .update({ trial_reminder_sent_at: new Date().toISOString() })
        .eq('id', user.id)

      results.sent++
    } catch {
      results.errors++
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
