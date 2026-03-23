import twilio from 'twilio'

const JAMES_WHATSAPP = 'whatsapp:+34679444783'

export async function sendWhatsAppToJames(message: string): Promise<boolean> {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: JAMES_WHATSAPP,
      body: message,
    })
    return true
  } catch (error) {
    console.error('WhatsApp send failed:', error)
    return false
  }
}

export async function sendWhatsAppToUser(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phoneNumber}`,
      body: message,
    })
    return true
  } catch (error) {
    console.error('WhatsApp send failed:', error)
    return false
  }
}

export const JAMES_ALERTS = {
  newSale: (plan: string, amount: string, email: string) =>
    `💰 *New ELEVO Sale!*\n\nPlan: ${plan}\nAmount: ${amount}\nCustomer: ${email}\n\n🚀 Keep growing!`,
  newUser: (email: string, country: string) =>
    `👤 *New ELEVO Signup*\n\nEmail: ${email}\nCountry: ${country}\n\nThey're in the 7-day trial.`,
  trialExpiring: (email: string, daysLeft: number) =>
    `⏰ *Trial Expiring*\n\n${email} has ${daysLeft} day(s) left.\nConsider reaching out.`,
  paymentFailed: (email: string, amount: string) =>
    `⚠️ *Payment Failed*\n\nCustomer: ${email}\nAmount: ${amount}\nCheck Stripe dashboard.`,
  criticalError: (error: string, page: string) =>
    `🔴 *ELEVO Error*\n\nPage: ${page}\nError: ${error}\n\nPA Agent has flagged this.`,
  dailySummary: (users: number, revenue: string, newSignups: number) =>
    `📊 *Daily ELEVO Summary*\n\nTotal users: ${users}\nRevenue today: ${revenue}\nNew signups: ${newSignups}\n\n💪 How real engineers solve problems.`,
  competitorAlert: (competitor: string, action: string) =>
    `🕵️ *Competitor Alert*\n\n${competitor} just: ${action}\n\nELEVO Spy has flagged this for review.`,
}
