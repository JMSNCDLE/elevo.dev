import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/send'
import { wrapEmail, emailButton, emailStatRow, emailDivider } from '@/lib/email/templates'

const CRON_SECRET = process.env.CRON_SECRET
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'

function buildProgressHtml(
  locale: string,
  firstName: string,
  stats: { creditsUsed: number; contentGenerated: number; contactsAdded: number; agentsUsed: string[] }
): string {
  const isEs = locale === 'es'
  const agentList = stats.agentsUsed.length > 0
    ? stats.agentsUsed.slice(0, 5).join(', ')
    : isEs ? 'Ninguno todavía' : 'None yet'

  const content = isEs
    ? `<h2 style="color:#18181b;font-size:22px;margin:0 0 16px">Tus resultados con ELEVO AI hasta ahora</h2>
<p>Hola ${firstName}, llevas 4 días con ELEVO. Esto es lo que han hecho tus agentes:</p>
<table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:20px 0;background:#f4f4f5;border-radius:8px;padding:4px">
  ${emailStatRow(isEs ? 'Créditos usados' : 'Credits used', `${stats.creditsUsed} / 20`)}
  ${emailStatRow(isEs ? 'Contenido creado' : 'Content created', stats.contentGenerated)}
  ${emailStatRow(isEs ? 'Contactos añadidos' : 'Contacts added', stats.contactsAdded)}
  ${emailStatRow(isEs ? 'Agentes activos' : 'Agents used', agentList)}
</table>
${stats.creditsUsed === 0
  ? `${emailDivider()}<p style="font-weight:600;color:#6366F1">Todavía no has usado ningún crédito. Prueba crear tu primera publicación — tarda menos de 30 segundos.</p>
${emailButton('Crear mi primer contenido →', `${APP_URL}/es/dashboard/content/social`)}`
  : `${emailDivider()}<p>Tu prueba termina en 3 días. Sigue explorando para aprovechar al máximo tu equipo de IA.</p>
${emailButton('Volver al panel →', `${APP_URL}/es/dashboard`)}`}
<p style="font-size:13px;color:#71717a">¿Necesitas ayuda? Responde a este correo.</p>`
    : `<h2 style="color:#18181b;font-size:22px;margin:0 0 16px">Your ELEVO AI results so far</h2>
<p>Hey ${firstName}, you're 4 days into your trial. Here's what your agents have done:</p>
<table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:20px 0;background:#f4f4f5;border-radius:8px;padding:4px">
  ${emailStatRow('Credits used', `${stats.creditsUsed} / 20`)}
  ${emailStatRow('Content created', stats.contentGenerated)}
  ${emailStatRow('Contacts added', stats.contactsAdded)}
  ${emailStatRow('Agents used', agentList)}
</table>
${stats.creditsUsed === 0
  ? `${emailDivider()}<p style="font-weight:600;color:#6366F1">You haven't used any credits yet! Try creating your first post — it takes less than 30 seconds.</p>
${emailButton('Create my first content →', `${APP_URL}/en/dashboard/content/social`)}`
  : `${emailDivider()}<p>Your trial ends in 3 days. Keep exploring to get the most out of your AI team.</p>
${emailButton('Back to dashboard →', `${APP_URL}/en/dashboard`)}`}
<p style="font-size:13px;color:#71717a">Need help? Reply to this email.</p>`

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

  // Find trial users created ~4 days ago (between 3.5 and 4.5 days)
  const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  const threeHalfDaysAgo = new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000)
  const fourHalfDaysAgo = new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000)

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, credits_used, created_at')
    .eq('plan', 'trial')
    .gte('created_at', fourHalfDaysAgo.toISOString())
    .lte('created_at', threeHalfDaysAgo.toISOString())
    .is('progress_email_sent_at', null)
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

      // Get unique agent types from email_logs
      const { data: agentLogs } = await supabase
        .from('email_logs')
        .select('agent_name')
        .eq('user_id', user.id)
        .not('agent_name', 'is', null)
        .limit(10)
      const agentsUsed = [...new Set((agentLogs ?? []).map(l => l.agent_name).filter(Boolean))] as string[]

      const subject = locale === 'es'
        ? 'Tus resultados con ELEVO AI hasta ahora'
        : 'Your ELEVO AI results so far'

      await sendEmail({
        to: email,
        subject,
        html: buildProgressHtml(locale, firstName, {
          creditsUsed: user.credits_used ?? 0,
          contentGenerated: contentGenerated ?? 0,
          contactsAdded: contactsAdded ?? 0,
          agentsUsed,
        }),
        agentName: 'Trial Progress',
        userId: user.id,
      })

      await supabase
        .from('profiles')
        .update({ progress_email_sent_at: new Date().toISOString() })
        .eq('id', user.id)

      results.sent++
    } catch {
      results.errors++
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
