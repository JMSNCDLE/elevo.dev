import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/send'
import { wrapEmail, emailButton } from '@/lib/email/templates'

const CRON_SECRET = process.env.CRON_SECRET
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'

function buildWelcomeHtml(locale: string, firstName: string): string {
  const isEs = locale === 'es'

  const content = isEs
    ? `<h2 style="color:#18181b;font-size:22px;margin:0 0 16px">¡Bienvenido a ELEVO AI, ${firstName}!</h2>
<p>Tu equipo de IA está listo y esperándote. Durante los próximos 7 días, tendrás acceso completo a todos nuestros agentes.</p>
<p style="font-weight:600;color:#18181b;margin-top:20px">Esto es lo que puedes hacer ahora mismo:</p>
<table cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;width:100%">
  <tr><td style="padding:10px 0;font-size:14px">📝 <strong>Crear contenido</strong> — publicaciones, blogs, correos, redes sociales</td></tr>
  <tr><td style="padding:10px 0;font-size:14px">📊 <strong>Analizar tu marketing</strong> — ROAS, SEO, tendencias</td></tr>
  <tr><td style="padding:10px 0;font-size:14px">🤖 <strong>Automatizar seguimientos</strong> — CRM, reseñas, mensajes</td></tr>
  <tr><td style="padding:10px 0;font-size:14px">🔍 <strong>Espiar a la competencia</strong> — análisis completo con IA</td></tr>
</table>
${emailButton('Ir a mi panel →', `${APP_URL}/es/dashboard`)}
<p style="font-size:13px;color:#71717a">¿Preguntas? Responde a este correo — una persona real lo lee.</p>`
    : `<h2 style="color:#18181b;font-size:22px;margin:0 0 16px">Welcome to ELEVO AI, ${firstName}!</h2>
<p>Your AI team is ready and waiting. For the next 7 days, you have full access to every agent in the platform.</p>
<p style="font-weight:600;color:#18181b;margin-top:20px">Here's what you can do right now:</p>
<table cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;width:100%">
  <tr><td style="padding:10px 0;font-size:14px">📝 <strong>Create content</strong> — GBP posts, blogs, emails, social captions</td></tr>
  <tr><td style="padding:10px 0;font-size:14px">📊 <strong>Analyse your marketing</strong> — ROAS, SEO, customer trends</td></tr>
  <tr><td style="padding:10px 0;font-size:14px">🤖 <strong>Automate follow-ups</strong> — CRM, reviews, messages</td></tr>
  <tr><td style="padding:10px 0;font-size:14px">🔍 <strong>Spy on competitors</strong> — full AI-powered analysis</td></tr>
</table>
${emailButton('Go to my dashboard →', `${APP_URL}/en/dashboard`)}
<p style="font-size:13px;color:#71717a">Questions? Reply to this email — a real person reads every message.</p>`

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

  // Find users created in the last 24 hours who haven't received welcome email
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: newUsers, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, created_at')
    .eq('plan', 'trial')
    .gte('created_at', oneDayAgo)
    .is('welcome_email_sent_at', null)
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = { sent: 0, errors: 0 }

  for (const user of newUsers ?? []) {
    try {
      // Get user email from auth
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(user.id)
      const email = authUser?.email ?? user.email
      if (!email) continue

      const firstName = (user.full_name as string | null)?.split(' ')[0] ?? 'there'

      // Detect locale from user metadata or default to 'en'
      const locale = (authUser?.user_metadata?.locale as string) ?? 'en'
      const isEs = locale === 'es'

      const subject = isEs
        ? 'Bienvenido a ELEVO AI — Tu equipo de IA está listo'
        : 'Welcome to ELEVO AI — Your AI team is ready'

      await sendEmail({
        to: email,
        subject,
        html: buildWelcomeHtml(locale, firstName),
        agentName: 'Trial Welcome',
        userId: user.id,
      })

      // Mark as sent
      await supabase
        .from('profiles')
        .update({ welcome_email_sent_at: new Date().toISOString() })
        .eq('id', user.id)

      results.sent++
    } catch {
      results.errors++
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
