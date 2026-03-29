import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'

export function generateApiKey(userId: string): { key: string; hash: string; prefix: string } {
  const randomBytes = crypto.randomBytes(32).toString('hex')
  const key = `elevo_${randomBytes}`
  const hash = crypto.createHash('sha256').update(key).digest('hex')
  const prefix = key.substring(0, 12)
  return { key, hash, prefix }
}

export async function validateApiKey(
  key: string
): Promise<{ valid: boolean; userId?: string; plan?: string }> {
  if (!key || !key.startsWith('elevo_')) {
    return { valid: false }
  }

  const hash = crypto.createHash('sha256').update(key).digest('hex')

  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('api_keys')
    .select('user_id, revoked, expires_at, profiles!inner(plan)')
    .eq('key_hash', hash)
    .single()

  if (!data) return { valid: false }
  if (data.revoked) return { valid: false }
  if (data.expires_at && new Date(data.expires_at) < new Date()) return { valid: false }

  // Update last used
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key_hash', hash)

  const profileData = data.profiles as unknown as { plan: string }

  return {
    valid: true,
    userId: data.user_id,
    plan: profileData?.plan ?? 'trial',
  }
}
