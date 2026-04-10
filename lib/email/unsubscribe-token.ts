import crypto from 'crypto'

export type EmailType = 'digest' | 'trial' | 'reengagement' | 'all'

const SECRET = process.env.UNSUBSCRIBE_SECRET ?? process.env.CRON_SECRET ?? 'elevo-dev-secret-change-me'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'

function sign(payload: string): string {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
}

export function makeUnsubscribeUrl(userId: string, type: EmailType): string {
  const payload = `${userId}.${type}`
  const sig = sign(payload)
  return `${APP_URL}/api/email/unsubscribe?uid=${encodeURIComponent(userId)}&type=${type}&sig=${sig}`
}

export function verifyUnsubscribeToken(userId: string, type: string, sig: string): boolean {
  const expected = sign(`${userId}.${type}`)
  if (expected.length !== sig.length) return false
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
}
