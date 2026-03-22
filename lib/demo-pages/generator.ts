import { createServiceClient } from '@/lib/supabase/server'
import type { InstagramAudit } from '@/lib/agents/instagramAuditAgent'

export async function generateProspectDemoPage(
  audit: InstagramAudit,
  userId: string,
  agencyName: string,
  agencyLogo?: string
): Promise<{ pageSlug: string; pageUrl: string; expiresAt: string }> {
  const supabase = await createServiceClient()

  // Generate slug from handle
  const baseSlug = audit.handle
    .replace('@', '')
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase()
  const pageSlug = `${baseSlug}-audit-${Date.now().toString(36)}`
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  await supabase.from('prospect_audits').insert({
    user_id: userId,
    instagram_handle: audit.handle,
    business_name: audit.handle,
    page_slug: pageSlug,
    audit_data: audit as unknown as Record<string, unknown>,
    agency_name: agencyName,
    agency_logo_url: agencyLogo ?? null,
    expires_at: expiresAt,
  })

  return {
    pageSlug,
    pageUrl: `https://elevo.ai/en/demo/${pageSlug}`,
    expiresAt,
  }
}
