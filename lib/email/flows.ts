// ─────────────────────────────────────────────────────────────────────────────
// Email flow templates — Welcome, Trial Reminders (3d/1d/0d), Weekly Digest, Re-engagement
// All templates render via wrapEmail() and include a signed unsubscribe link.
// ─────────────────────────────────────────────────────────────────────────────

import { wrapEmail, emailButton, emailDivider, emailStatRow } from './templates'
import { makeUnsubscribeUrl } from './unsubscribe-token'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'

// ─── 1. Welcome ──────────────────────────────────────────────────────────────

export function buildWelcomeEmail(userId: string, firstName: string, locale = 'en'): { subject: string; html: string } {
  const isEs = locale === 'es'
  const subject = isEs
    ? 'Bienvenido a ELEVO AI — tu negocio acaba de volverse más inteligente 🚀'
    : 'Welcome to ELEVO AI — Your business just got smarter 🚀'

  const content = isEs
    ? `<h2 style="color:#18181b;font-size:24px;margin:0 0 12px">¡Hola ${firstName}! 👋</h2>
<p>Tu equipo de IA está listo. Más de 60 agentes esperan a trabajar 24/7 para ti.</p>
<p style="font-weight:600;color:#18181b;margin-top:24px">Esto es lo que ELEVO puede hacer por ti:</p>
<ul style="color:#3f3f46;line-height:1.9">
  <li><strong>Crear contenido</strong> — posts, blogs, emails, captions</li>
  <li><strong>Gestionar marketing</strong> — campañas, ROAS, SEO</li>
  <li><strong>Automatizar tu CRM</strong> — seguimiento, recordatorios, mensajes</li>
</ul>
${emailButton('Abre tu dashboard →', `${APP_URL}/es/dashboard`)}
${emailDivider()}
<p style="font-weight:600;color:#18181b">Empieza con uno de estos agentes:</p>
<ul style="color:#3f3f46;line-height:1.9">
  <li><a href="${APP_URL}/es/ceo" style="color:#6366F1">ELEVO CEO™</a> — briefing semanal de tu negocio</li>
  <li><a href="${APP_URL}/es/creator" style="color:#6366F1">ELEVO Creator™</a> — crea tu primer post</li>
  <li><a href="${APP_URL}/es/market" style="color:#6366F1">ELEVO Market™</a> — plan de marketing de 30 días</li>
</ul>
<p style="font-size:13px;color:#71717a;margin-top:24px">¿Necesitas ayuda? Responde a este correo — una persona real lee cada mensaje.</p>`
    : `<h2 style="color:#18181b;font-size:24px;margin:0 0 12px">Hey ${firstName}! 👋</h2>
<p>Your AI team is ready. 60+ agents are standing by, working 24/7 just for you.</p>
<p style="font-weight:600;color:#18181b;margin-top:24px">Here&#39;s what ELEVO can do for you:</p>
<ul style="color:#3f3f46;line-height:1.9">
  <li><strong>Create content</strong> — posts, blogs, emails, captions in seconds</li>
  <li><strong>Run your marketing</strong> — campaigns, ROAS, SEO, social</li>
  <li><strong>Automate your CRM</strong> — follow-ups, reminders, messages</li>
</ul>
${emailButton('Open your dashboard →', `${APP_URL}/en/dashboard`)}
${emailDivider()}
<p style="font-weight:600;color:#18181b">Start with one of these agents:</p>
<ul style="color:#3f3f46;line-height:1.9">
  <li><a href="${APP_URL}/en/ceo" style="color:#6366F1">ELEVO CEO™</a> — get a weekly business briefing</li>
  <li><a href="${APP_URL}/en/creator" style="color:#6366F1">ELEVO Creator™</a> — create your first social post</li>
  <li><a href="${APP_URL}/en/market" style="color:#6366F1">ELEVO Market™</a> — build a 30-day marketing plan</li>
</ul>
<p style="font-size:13px;color:#71717a;margin-top:24px">Need anything? Just reply — a real person reads every message.</p>`

  return {
    subject,
    html: wrapEmail(content, { locale, unsubscribeUrl: makeUnsubscribeUrl(userId, 'all') }),
  }
}

// ─── 2. Trial Reminder ───────────────────────────────────────────────────────

export type TrialReminderVariant = '3d' | '1d' | '0d'

export function buildTrialReminderEmail(
  userId: string,
  firstName: string,
  variant: TrialReminderVariant,
  stats: { contentGenerated: number; contactsAdded: number; creditsUsed: number },
  locale = 'en'
): { subject: string; html: string } {
  const isEs = locale === 'es'
  const subjectMap: Record<TrialReminderVariant, { en: string; es: string }> = {
    '3d': {
      en: 'Your ELEVO trial ends in 3 days — don&#39;t lose your AI team',
      es: 'Tu prueba de ELEVO termina en 3 días — no pierdas tu equipo de IA',
    },
    '1d': {
      en: 'Last day! Your ELEVO AI trial expires tomorrow',
      es: '¡Último día! Tu prueba de ELEVO AI termina mañana',
    },
    '0d': {
      en: 'Your ELEVO trial has ended — but it&#39;s not too late',
      es: 'Tu prueba de ELEVO ha terminado — pero no es demasiado tarde',
    },
  }

  const headlineMap: Record<TrialReminderVariant, { en: string; es: string }> = {
    '3d': {
      en: 'Your free trial ends in 3 days',
      es: 'Tu prueba gratis termina en 3 días',
    },
    '1d': {
      en: 'Your free trial ends tomorrow',
      es: 'Tu prueba gratis termina mañana',
    },
    '0d': {
      en: 'Your trial has ended — re-activate in one click',
      es: 'Tu prueba ha terminado — reactívala con un clic',
    },
  }

  const content = isEs
    ? `<h2 style="color:#18181b;font-size:22px;margin:0 0 16px">${headlineMap[variant].es}</h2>
<p>Hola ${firstName}, ${variant === '0d' ? 'tu período de prueba terminó hoy.' : variant === '1d' ? 'tu período de prueba termina mañana.' : 'quedan 3 días en tu prueba.'}</p>
<p style="font-weight:600;color:#18181b">Esto es lo que has construido:</p>
<table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:16px 0;background:#f4f4f5;border-radius:8px;padding:4px">
  ${emailStatRow('Contenido creado', stats.contentGenerated)}
  ${emailStatRow('Contactos en CRM', stats.contactsAdded)}
  ${emailStatRow('Créditos usados', stats.creditsUsed)}
</table>
${emailDivider()}
<p style="font-weight:600;color:#dc2626">${variant === '0d' ? 'Tu acceso está pausado. Sin pagar:' : 'Si no actualizas, perderás:'}</p>
<ul style="color:#3f3f46;font-size:14px;line-height:2">
  <li>Tus 60+ agentes de IA dejarán de trabajar</li>
  <li>La automatización de CRM se pausará</li>
  <li>No podrás generar más contenido</li>
</ul>
<p>Los planes empiezan en solo €39/mes — menos que una hora con un consultor.</p>
${emailButton('Elige tu plan →', `${APP_URL}/es/pricing`)}`
    : `<h2 style="color:#18181b;font-size:22px;margin:0 0 16px">${headlineMap[variant].en}</h2>
<p>Hey ${firstName}, ${variant === '0d' ? 'your trial ended today.' : variant === '1d' ? 'your trial ends tomorrow.' : 'you have 3 days left in your free trial.'}</p>
<p style="font-weight:600;color:#18181b">Here&#39;s what you&#39;ve built:</p>
<table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:16px 0;background:#f4f4f5;border-radius:8px;padding:4px">
  ${emailStatRow('Content created', stats.contentGenerated)}
  ${emailStatRow('Contacts in CRM', stats.contactsAdded)}
  ${emailStatRow('Credits used', stats.creditsUsed)}
</table>
${emailDivider()}
<p style="font-weight:600;color:#dc2626">${variant === '0d' ? 'Your access is paused. Without upgrading:' : 'If you don&#39;t upgrade, you&#39;ll lose:'}</p>
<ul style="color:#3f3f46;font-size:14px;line-height:2">
  <li>Your 60+ AI agents will stop working</li>
  <li>CRM automation will pause</li>
  <li>You won&#39;t be able to generate new content</li>
</ul>
<p>Plans start at just €39/month — less than one hour with a marketing consultant.</p>
${emailButton('Choose your plan →', `${APP_URL}/en/pricing`)}`

  return {
    subject: subjectMap[variant][isEs ? 'es' : 'en'],
    html: wrapEmail(content, { locale, unsubscribeUrl: makeUnsubscribeUrl(userId, 'trial') }),
  }
}

// ─── 3. Weekly Digest ────────────────────────────────────────────────────────

export interface WeeklyDigestStats {
  creditsThisWeek: number
  creditsLastWeek: number
  topAgents: string[]
  generationsCount: number
  unusedAgents: string[]
}

const WEEKLY_TIPS = [
  'Try the ELEVO CEO™ briefing on Mondays — it surfaces what to focus on this week.',
  'Use ELEVO Spy™ to monitor 2-3 competitors. You&#39;ll be notified when they launch new content.',
  'Schedule a week of social posts in one sitting with ELEVO SMM™ — set it and forget it.',
  'ELEVO Market™ can build a full 30-day marketing calendar in 2 minutes.',
  'Connect your Stripe account so ELEVO can track your real revenue automatically.',
]

export function buildWeeklyDigestEmail(
  userId: string,
  firstName: string,
  weekLabel: string,
  stats: WeeklyDigestStats,
  locale = 'en'
): { subject: string; html: string } {
  const isEs = locale === 'es'
  const trend = stats.creditsThisWeek - stats.creditsLastWeek
  const trendArrow = trend > 0 ? '↑' : trend < 0 ? '↓' : '→'
  const trendColor = trend > 0 ? '#16a34a' : trend < 0 ? '#dc2626' : '#71717a'
  const tipIndex = Math.floor(Math.random() * WEEKLY_TIPS.length)
  const tip = WEEKLY_TIPS[tipIndex]

  const content = isEs
    ? `<h2 style="color:#18181b;font-size:22px;margin:0 0 16px">Tu semana en ELEVO 📊</h2>
<p>Hola ${firstName}, aquí está tu resumen de la semana del ${weekLabel}.</p>
<table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:16px 0;background:#f4f4f5;border-radius:8px;padding:4px">
  ${emailStatRow('Créditos usados esta semana', stats.creditsThisWeek)}
  ${emailStatRow('Semana pasada', `${stats.creditsLastWeek} <span style="color:${trendColor}">${trendArrow}</span>`)}
  ${emailStatRow('Acciones completadas', stats.generationsCount)}
</table>
${stats.topAgents.length > 0 ? `<p style="font-weight:600;color:#18181b">Tus agentes más usados:</p>
<ul style="color:#3f3f46;line-height:1.8">${stats.topAgents.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}
${stats.unusedAgents.length > 0 ? `<p style="font-weight:600;color:#18181b;margin-top:16px">Agentes que aún no has probado:</p>
<ul style="color:#3f3f46;line-height:1.8">${stats.unusedAgents.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}
${emailDivider()}
<p style="font-weight:600;color:#18181b">💡 Consejo de la semana</p>
<p style="color:#3f3f46;font-style:italic">${tip}</p>
${emailButton('Ver dashboard completo →', `${APP_URL}/es/dashboard`)}`
    : `<h2 style="color:#18181b;font-size:22px;margin:0 0 16px">Your ELEVO week in review 📊</h2>
<p>Hey ${firstName}, here&#39;s your recap for the week of ${weekLabel}.</p>
<table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:16px 0;background:#f4f4f5;border-radius:8px;padding:4px">
  ${emailStatRow('Credits used this week', stats.creditsThisWeek)}
  ${emailStatRow('Last week', `${stats.creditsLastWeek} <span style="color:${trendColor}">${trendArrow}</span>`)}
  ${emailStatRow('Actions completed', stats.generationsCount)}
</table>
${stats.topAgents.length > 0 ? `<p style="font-weight:600;color:#18181b">Your top agents this week:</p>
<ul style="color:#3f3f46;line-height:1.8">${stats.topAgents.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}
${stats.unusedAgents.length > 0 ? `<p style="font-weight:600;color:#18181b;margin-top:16px">Agents you haven&#39;t tried yet:</p>
<ul style="color:#3f3f46;line-height:1.8">${stats.unusedAgents.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}
${emailDivider()}
<p style="font-weight:600;color:#18181b">💡 Tip of the week</p>
<p style="color:#3f3f46;font-style:italic">${tip}</p>
${emailButton('See full dashboard →', `${APP_URL}/en/dashboard`)}`

  return {
    subject: isEs ? `Tu semana en ELEVO — ${weekLabel}` : `Your ELEVO week in review — ${weekLabel}`,
    html: wrapEmail(content, { locale, unsubscribeUrl: makeUnsubscribeUrl(userId, 'digest') }),
  }
}

// ─── 4. Re-engagement ────────────────────────────────────────────────────────

export function buildReEngagementEmail(
  userId: string,
  firstName: string,
  daysInactive: number,
  locale = 'en'
): { subject: string; html: string } {
  const isEs = locale === 'es'
  const content = isEs
    ? `<h2 style="color:#18181b;font-size:22px;margin:0 0 16px">¡Te echamos de menos! 👋</h2>
<p>Hola ${firstName}, han pasado ${daysInactive} días desde tu última visita a ELEVO.</p>
<p>Tu equipo de IA sigue ahí, listo para trabajar. Mientras estabas fuera, otros negocios usaron ELEVO para crear cientos de posts, gestionar leads y analizar a sus competidores.</p>
${emailDivider()}
<p style="font-weight:600;color:#18181b">Una idea rápida para volver:</p>
<p style="color:#3f3f46">Pídele a tu agente <strong>ELEVO CEO™</strong> un briefing semanal de tu negocio. Tarda 30 segundos y te dirá exactamente en qué enfocarte esta semana.</p>
${emailButton('Volver a ELEVO →', `${APP_URL}/es/ceo`)}
<p style="font-size:13px;color:#71717a;margin-top:24px">Si ya no quieres usar ELEVO, no hay problema. Puedes <a href="${makeUnsubscribeUrl(userId, 'reengagement')}" style="color:#6366F1">cancelar estos correos</a>.</p>`
    : `<h2 style="color:#18181b;font-size:22px;margin:0 0 16px">We miss you! 👋</h2>
<p>Hey ${firstName}, it&#39;s been ${daysInactive} days since you last used ELEVO.</p>
<p>Your AI team is still here, ready to work. While you were away, other businesses used ELEVO to create hundreds of posts, manage leads, and spy on their competitors.</p>
${emailDivider()}
<p style="font-weight:600;color:#18181b">One quick idea to come back:</p>
<p style="color:#3f3f46">Ask your <strong>ELEVO CEO™</strong> agent for a weekly briefing on your business. Takes 30 seconds and tells you exactly what to focus on this week.</p>
${emailButton('Come back to ELEVO →', `${APP_URL}/en/ceo`)}
<p style="font-size:13px;color:#71717a;margin-top:24px">Not using ELEVO anymore? No worries — you can <a href="${makeUnsubscribeUrl(userId, 'reengagement')}" style="color:#6366F1">unsubscribe from these emails</a>.</p>`

  return {
    subject: isEs ? '¡Te echamos de menos! Tu equipo de IA está esperando 👋' : 'We miss you! Your AI team is waiting 👋',
    html: wrapEmail(content, { locale, unsubscribeUrl: makeUnsubscribeUrl(userId, 'reengagement') }),
  }
}
