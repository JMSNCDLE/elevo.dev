const TELEGRAM_API = 'https://api.telegram.org/bot'

export async function sendTelegramToJames(message: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    console.warn('Telegram not configured: missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID')
    return false
  }

  try {
    const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })
    return res.ok
  } catch (error) {
    console.error('Telegram send failed:', error)
    return false
  }
}

export const JAMES_ALERTS = {
  newSale: (plan: string, amount: string, email: string) =>
    `💰 <b>New ELEVO Sale!</b>\n\nPlan: ${plan}\nAmount: ${amount}\nCustomer: ${email}\n\n🚀 Keep growing!`,
  newUser: (email: string, country: string) =>
    `👤 <b>New ELEVO Signup</b>\n\nEmail: ${email}\nCountry: ${country}\n\nThey're in the 7-day trial.`,
  trialExpiring: (email: string, daysLeft: number) =>
    `⏰ <b>Trial Expiring</b>\n\n${email} has ${daysLeft} day(s) left.\nConsider reaching out.`,
  paymentFailed: (email: string, amount: string) =>
    `⚠️ <b>Payment Failed</b>\n\nCustomer: ${email}\nAmount: ${amount}\nCheck Stripe dashboard.`,
  criticalError: (error: string, page: string) =>
    `🔴 <b>ELEVO Error</b>\n\nPage: ${page}\nError: ${error}\n\nPA Agent has flagged this.`,
  dailySummary: (users: number, revenue: string, newSignups: number) =>
    `📊 <b>Daily ELEVO Summary</b>\n\nTotal users: ${users}\nRevenue today: ${revenue}\nNew signups: ${newSignups}\n\n💪 How real engineers solve problems.`,
  competitorAlert: (competitor: string, action: string) =>
    `🕵️ <b>Competitor Alert</b>\n\n${competitor} just: ${action}\n\nELEVO Spy has flagged this for review.`,
}
