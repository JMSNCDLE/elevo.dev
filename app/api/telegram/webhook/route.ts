import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.elevo.dev'

async function sendTelegram(chatId: string | number, text: string) {
  if (!BOT_TOKEN) return
  // Telegram limits messages to 4096 chars
  const trimmed = text.length > 4000 ? text.substring(0, 4000) + '\n\n...(truncated)' : text
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: trimmed,
      parse_mode: 'HTML',
    }),
  })
}

async function fetchAriaData(path: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { headers: { 'x-aria-internal': 'true' } })
    return res.ok ? await res.json() : null
  } catch {
    return null
  }
}

async function getAriaContext(): Promise<string> {
  try {
    const [platform, agents, health] = await Promise.all([
      fetchAriaData('/api/aria/platform-stats') as Promise<Record<string, any> | null>,
      fetchAriaData('/api/aria/agent-stats') as Promise<Record<string, any> | null>,
      fetchAriaData('/api/aria/health') as Promise<Record<string, any> | null>,
    ])

    let ctx = '\n\n--- LIVE ELEVO DATA (queried just now) ---\n'

    if (platform) {
      ctx += `\nUSERS: ${platform.users.total} total, ${platform.users.today} today, ${platform.users.this_week} this week, ${platform.users.this_month} this month`
      ctx += `\nSUBSCRIPTIONS: ${platform.subscriptions.paid} paid, ${platform.subscriptions.active_trials} trials`
      ctx += `\nPLANS: Launch=${platform.subscriptions.plans.launch}, Orbit=${platform.subscriptions.plans.orbit}, Galaxy=${platform.subscriptions.plans.galaxy}`
      ctx += `\nWAITLIST: ${platform.waitlist} signups`
      if (platform.users.recent?.length > 0) {
        ctx += `\nRECENT SIGNUPS: ${platform.users.recent.map((u: any) => `${u.email} (${u.subscription_status})`).join(', ')}`
      }
    }

    if (agents) {
      ctx += `\n\nCREDITS USED: ${agents.credits.today} today, ${agents.credits.this_week} this week`
      if (agents.top_agents?.length > 0) {
        ctx += `\nTOP AGENTS: ${agents.top_agents.map((a: any) => `${a.agent} (${a.uses})`).join(', ')}`
      }
      if (agents.pending_high_priority?.length > 0) {
        ctx += `\nPENDING HIGH-PRIORITY TASKS: ${agents.pending_high_priority.length}`
      }
      if (agents.latest_build_report) {
        ctx += `\nLATEST BUILD: ${agents.latest_build_report.issues} issues (${agents.latest_build_report.critical} critical) on ${agents.latest_build_report.date}`
      }
    }

    if (health) {
      ctx += `\n\nSYSTEM HEALTH: ${health.overall}`
      const downPages = health.pages?.filter((p: any) => !p.ok)
      if (downPages?.length > 0) {
        ctx += `\nDOWN PAGES: ${downPages.map((p: any) => p.name).join(', ')}`
      }
      ctx += `\nSERVICES: Supabase=${health.services.supabase}, Stripe=${health.services.stripe}`
    }

    return ctx
  } catch {
    return '\n\n(Live data unavailable)'
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const message = body.message

    if (!message || !message.text) {
      return NextResponse.json({ ok: true })
    }

    const chatId = message.chat.id
    const text = message.text.trim()
    const command = text.toLowerCase()

    // ─── Commands ──────────────────────────────────────────────

    if (command === '/start') {
      await sendTelegram(chatId,
        '👋 Hi! I\'m Aria, your ELEVO AI assistant.\n\n' +
        '<b>📊 Business Intelligence</b>\n' +
        '/stats — Live user &amp; signup stats\n' +
        '/revenue — MRR, subscriptions, charges\n' +
        '/usage — Agent usage &amp; credits\n' +
        '/health — Full system health check\n\n' +
        '<b>🤖 Operations</b>\n' +
        '/status — Quick page status\n' +
        '/briefing — Generate daily briefing\n' +
        '/agents — Agent overview\n' +
        '/chatid — Show your chat ID\n' +
        '/help — All commands\n\n' +
        'Or just ask me anything — I have live access to platform data.'
      )

    } else if (command === '/chatid') {
      await sendTelegram(chatId, `Your chat ID is: <code>${chatId}</code>`)

    } else if (command === '/status') {
      const checks = [
        { name: 'Homepage', url: `${BASE_URL}/en` },
        { name: 'Pricing', url: `${BASE_URL}/en/pricing` },
        { name: 'Blog', url: `${BASE_URL}/en/blog` },
        { name: 'API Health', url: `${BASE_URL}/api/health` },
      ]

      const results: string[] = []
      for (const check of checks) {
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 8000)
          const res = await fetch(check.url, { method: 'HEAD', signal: controller.signal })
          clearTimeout(timeout)
          results.push(`${res.status < 400 ? '✅' : '❌'} ${check.name}: ${res.status}`)
        } catch {
          results.push(`❌ ${check.name}: unreachable`)
        }
      }

      await sendTelegram(chatId, `🔍 <b>System Status</b>\n\n${results.join('\n')}\n\n⏰ ${new Date().toUTCString()}`)

    } else if (command === '/stats' || command === '/users') {
      await sendTelegram(chatId, '📊 Fetching live stats...')
      const data = await fetchAriaData('/api/aria/platform-stats') as any
      if (!data || data.error) {
        await sendTelegram(chatId, '❌ Failed to fetch stats')
      } else {
        await sendTelegram(chatId,
          `📊 <b>ELEVO Platform Stats</b>\n\n` +
          `👥 Total users: ${data.users.total}\n` +
          `🆕 Today: ${data.users.today}\n` +
          `📅 This week: ${data.users.this_week}\n` +
          `📆 This month: ${data.users.this_month}\n\n` +
          `💳 Paid: ${data.subscriptions.paid}\n` +
          `🆓 Trials: ${data.subscriptions.active_trials}\n` +
          `📋 Waitlist: ${data.waitlist}\n\n` +
          `📦 Plans:\n` +
          `  Launch: ${data.subscriptions.plans.launch}\n` +
          `  Orbit: ${data.subscriptions.plans.orbit}\n` +
          `  Galaxy: ${data.subscriptions.plans.galaxy}\n\n` +
          `⏰ ${new Date().toUTCString()}`
        )
      }

    } else if (command === '/revenue' || command === '/mrr') {
      await sendTelegram(chatId, '💰 Fetching revenue data...')
      const data = await fetchAriaData('/api/aria/revenue-stats') as any
      if (!data) {
        await sendTelegram(chatId, '❌ Failed to fetch revenue')
      } else if (data.error && data.mrr) {
        await sendTelegram(chatId, `💰 <b>Revenue</b>\n\nStripe not configured yet. MRR will show once STRIPE_SECRET_KEY is set.`)
      } else {
        await sendTelegram(chatId,
          `💰 <b>ELEVO Revenue</b>\n\n` +
          `📈 MRR: ${data.mrr.amount_eur}\n` +
          `💳 Active subs: ${data.subscriptions.active}\n` +
          `🆓 Trialing: ${data.subscriptions.trialing}\n` +
          `❌ Recently canceled: ${data.subscriptions.recently_canceled}\n\n` +
          `📅 Last 7 days:\n` +
          `  Revenue: ${data.revenue_7d.amount_eur}\n` +
          `  Charges: ${data.revenue_7d.charges}\n\n` +
          `⏰ ${new Date().toUTCString()}`
        )
      }

    } else if (command === '/usage') {
      await sendTelegram(chatId, '🤖 Fetching agent stats...')
      const data = await fetchAriaData('/api/aria/agent-stats') as any
      if (!data || data.error) {
        await sendTelegram(chatId, '❌ Failed to fetch agent stats')
      } else {
        const topList = data.top_agents?.length > 0
          ? data.top_agents.map((a: any) => `  • ${a.agent}: ${a.uses} uses`).join('\n')
          : '  No usage this week'

        await sendTelegram(chatId,
          `🤖 <b>Agent Usage</b>\n\n` +
          `🔥 Credits today: ${data.credits.today}\n` +
          `📅 Credits this week: ${data.credits.this_week}\n\n` +
          `🏆 Top agents (7 days):\n${topList}\n\n` +
          `⚠️ Pending high-priority: ${data.pending_high_priority?.length || 0}\n\n` +
          (data.latest_build_report
            ? `🔨 Last build: ${data.latest_build_report.issues} issues (${data.latest_build_report.critical} critical)`
            : '🔨 No build reports yet') +
          `\n\n⏰ ${new Date().toUTCString()}`
        )
      }

    } else if (command === '/health') {
      await sendTelegram(chatId, '🏥 Running health check...')
      const data = await fetchAriaData('/api/aria/health') as any
      if (!data || data.error) {
        await sendTelegram(chatId, '❌ Health check failed')
      } else {
        const pageList = data.pages?.map((p: any) =>
          `${p.ok ? '✅' : '❌'} ${p.name}: ${p.status} (${p.latency_ms}ms)`
        ).join('\n') || 'No page data'

        await sendTelegram(chatId,
          `🏥 <b>System Health: ${data.overall?.toUpperCase()}</b>\n\n` +
          `${pageList}\n\n` +
          `🗄 Supabase: ${data.services?.supabase}\n` +
          `💳 Stripe: ${data.services?.stripe}\n\n` +
          `⏰ ${new Date().toUTCString()}`
        )
      }

    } else if (command === '/briefing') {
      await sendTelegram(chatId, '📊 <b>Generating briefing...</b>')
      try {
        const res = await fetch(`${BASE_URL}/api/agents/aria-autonomous`)
        const data = await res.json()
        await sendTelegram(chatId,
          `✅ <b>Briefing Complete</b>\n\nResults: ${data.results?.join(', ') || 'No data'}\nTimestamp: ${data.timestamp || new Date().toISOString()}`
        )
      } catch (err: unknown) {
        await sendTelegram(chatId, `❌ Briefing failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }

    } else if (command === '/agents') {
      await sendTelegram(chatId,
        '🤖 <b>ELEVO Agent Status</b>\n\n' +
        '✅ Aria PA — Online (autonomous every 4h)\n' +
        '✅ Build Agent — Daily at 6 AM UTC\n' +
        '✅ Health Monitor — Every 4 hours\n' +
        '✅ Credit Reset — 1st of month\n' +
        '✅ Trial Reminders — Daily at 9 AM\n\n' +
        '60+ agents available in dashboard.\n' +
        'Use /usage for live credit &amp; agent stats.'
      )

    } else if (command === '/help') {
      await sendTelegram(chatId,
        '📋 <b>Aria Commands</b>\n\n' +
        '<b>📊 Business Intelligence</b>\n' +
        '/stats — Live user &amp; signup stats\n' +
        '/revenue — MRR, subscriptions, charges\n' +
        '/usage — Agent usage &amp; credit consumption\n' +
        '/health — Full system health check\n\n' +
        '<b>🤖 Operations</b>\n' +
        '/status — Quick page status check\n' +
        '/briefing — Generate daily briefing\n' +
        '/agents — Agent overview\n' +
        '/chatid — Show your chat ID\n' +
        '/help — This message\n\n' +
        'You can also just ask me anything — I have live access to platform data.'
      )

    } else {
      // ─── Free-form message with live data context ───────────
      try {
        const liveContext = await getAriaContext()

        const anthropic = new Anthropic()
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1500,
          system: `You are Aria, the AI personal assistant for ELEVO AI (elevo.dev). You work for James, the founder.

ELEVO AI is an AI operating system for small businesses — 60+ AI agents that handle marketing, sales, content, analytics, and operations. It runs on Next.js 15, Supabase, Stripe, and Claude API. Hosted on Vercel Pro.

PRICING:
- Launch: €39/month (500 credits) — small businesses getting started
- Orbit: €79/month (1,500 credits) — growing businesses
- Galaxy: €149/month (5,000 credits) — agencies and power users
- All plans include 7-day free trial

KEY DATES:
- Product Hunt launch: April 28, 2026
- Target: first 100 paying customers within 90 days of launch

YOUR ROLE: You are James's right hand. You monitor the platform, provide business intelligence, execute low-risk tasks autonomously, and flag high-risk decisions for approval. You speak concisely and actionably — no fluff. When you have live data, cite specific numbers. When asked about something you don't have data for, say so clearly.

Format responses for Telegram using HTML tags: <b>, <i>, <code>.
${liveContext}`,
          messages: [{ role: 'user', content: text }],
        })

        const reply = response.content[0].type === 'text'
          ? response.content[0].text
          : 'Sorry, I couldn\'t process that.'
        await sendTelegram(chatId, reply)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        await sendTelegram(chatId, `I'm having trouble right now. Error: ${msg.substring(0, 100)}`)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ ok: true })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Telegram webhook active' })
}
