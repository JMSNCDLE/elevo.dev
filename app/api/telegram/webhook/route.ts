import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

async function sendTelegram(chatId: string | number, text: string) {
  if (!BOT_TOKEN) return
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  })
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

    if (command === '/start') {
      await sendTelegram(chatId,
        '👋 Hi! I\'m Aria, your ELEVO AI assistant.\n\n' +
        '<b>Commands:</b>\n' +
        '/status — System health check\n' +
        '/briefing — Daily briefing\n' +
        '/agents — Active agents\n' +
        '/chatid — Show your chat ID\n' +
        '/help — All commands\n\n' +
        'Or just type a question and I\'ll answer it.'
      )

    } else if (command === '/chatid') {
      await sendTelegram(chatId, `Your chat ID is: <code>${chatId}</code>`)

    } else if (command === '/status') {
      const checks = [
        { name: 'Homepage', url: 'https://www.elevo.dev/en' },
        { name: 'Pricing', url: 'https://www.elevo.dev/en/pricing' },
        { name: 'Blog', url: 'https://www.elevo.dev/en/blog' },
        { name: 'API Health', url: 'https://www.elevo.dev/api/health' },
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

      await sendTelegram(chatId,
        `🔍 <b>System Status</b>\n\n${results.join('\n')}\n\n⏰ ${new Date().toUTCString()}`
      )

    } else if (command === '/briefing') {
      await sendTelegram(chatId, '📊 <b>Generating briefing...</b>')

      try {
        const res = await fetch('https://www.elevo.dev/api/agents/aria-autonomous')
        const data = await res.json()
        await sendTelegram(chatId,
          `✅ <b>Briefing Complete</b>\n\n` +
          `Results: ${data.results?.join(', ') || 'No data'}\n` +
          `Timestamp: ${data.timestamp || new Date().toISOString()}`
        )
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        await sendTelegram(chatId, `❌ Briefing failed: ${msg}`)
      }

    } else if (command === '/agents') {
      await sendTelegram(chatId,
        '🤖 <b>ELEVO Agent Status</b>\n\n' +
        '✅ Aria PA — Online (autonomous every 4h)\n' +
        '✅ Build Agent — Daily at 6 AM UTC\n' +
        '✅ Health Monitor — Every 4 hours\n' +
        '✅ Credit Reset — 1st of month\n' +
        '✅ Trial Reminders — Daily at 9 AM\n\n' +
        '60+ agents available in the dashboard.'
      )

    } else if (command === '/help') {
      await sendTelegram(chatId,
        '📋 <b>Aria Commands</b>\n\n' +
        '/status — System health check\n' +
        '/briefing — Daily briefing with stats\n' +
        '/agents — Agent status overview\n' +
        '/chatid — Show your chat ID\n' +
        '/help — This message\n\n' +
        'You can also just type a question and I\'ll answer it using Claude.'
      )

    } else {
      // Free-form message — use Claude to respond
      try {
        const anthropic = new Anthropic()
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: 'You are Aria, the AI assistant for ELEVO AI (elevo.dev). You help the founder James with business questions, platform status, and quick tasks. Keep responses concise and actionable. The platform has 60+ AI agents, runs on Next.js 15 + Supabase + Stripe (€39/€79/€149 plans), and uses the Claude API. Format responses for Telegram (use HTML tags: <b>, <i>, <code>).',
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
    return NextResponse.json({ ok: true }) // Always return 200 to Telegram
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Telegram webhook active' })
}
