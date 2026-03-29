import { createServiceClient } from '@/lib/supabase/server'

export interface WhiteLabelConfig {
  userId: string
  domain: string
  brandName: string
  logoUrl?: string
  primaryColor: string
  accentColor: string
  hideElevoBranding: boolean
  customCss?: string
}

export async function getWhiteLabelConfig(domain: string): Promise<WhiteLabelConfig | null> {
  const supabase = await createServiceClient()

  const { data } = await supabase
    .from('white_label_configs')
    .select('*')
    .eq('domain', domain)
    .single()

  if (!data) return null

  return {
    userId: data.user_id,
    domain: data.domain,
    brandName: data.brand_name,
    logoUrl: data.logo_url ?? undefined,
    primaryColor: data.primary_color ?? '#6366F1',
    accentColor: data.accent_color ?? '#4F46E5',
    hideElevoBranding: data.hide_elevo_branding ?? false,
    customCss: data.custom_css ?? undefined,
  }
}

export function generateWhiteLabelCss(config: WhiteLabelConfig): string {
  return `
:root {
  --wl-primary: ${config.primaryColor};
  --wl-accent: ${config.accentColor};
  --wl-brand-name: "${config.brandName}";
}

.wl-primary { color: ${config.primaryColor}; }
.wl-bg-primary { background-color: ${config.primaryColor}; }
.wl-accent { color: ${config.accentColor}; }
.wl-bg-accent { background-color: ${config.accentColor}; }

${config.hideElevoBranding ? `.elevo-branding { display: none !important; }` : ''}

${config.customCss ?? ''}
`.trim()
}
