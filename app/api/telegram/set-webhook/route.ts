import { NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not set' }, { status: 500 })
  }

  const webhookUrl = 'https://www.elevo.dev/api/telegram/webhook'

  const response = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
  )
  const result = await response.json()

  return NextResponse.json({
    webhook_url: webhookUrl,
    telegram_response: result,
  })
}
