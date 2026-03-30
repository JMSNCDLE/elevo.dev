// Centralised admin access control
// Add new admin users here — all admin checks use this module

export const ADMIN_IDS = [
  '5dc15dea-4633-441b-b37a-5406e7235114', // James Carlin (jamescn.2504@gmail.com)
  '56515969-62a0-47ed-bfcb-17b7bbecdf73', // team@elevo.dev
]

export const ADMIN_EMAILS = [
  'jamescn.2504@gmail.com',
  'team@elevo.dev',
]

export function isAdmin(userId: string, email?: string | null): boolean {
  return ADMIN_IDS.includes(userId) || ADMIN_EMAILS.includes(email ?? '')
}

export function isAdminId(userId: string): boolean {
  return ADMIN_IDS.includes(userId)
}
