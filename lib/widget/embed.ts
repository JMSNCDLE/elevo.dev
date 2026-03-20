export interface EmbedConfig {
  widgetId: string
  position: 'bottom-right' | 'bottom-left'
  primaryColor: string
  greeting: string
  businessName: string
}

export function generateEmbedScript(config: EmbedConfig): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.ai'
  return `<script
  src="${appUrl}/widget.js"
  data-widget-id="${config.widgetId}"
  data-position="${config.position}"
  data-color="${config.primaryColor}"
  data-greeting="${config.greeting.replace(/"/g, '&quot;')}"
  data-business="${config.businessName.replace(/"/g, '&quot;')}"
  async
></script>`
}
