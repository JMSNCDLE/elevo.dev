import type { NextRequest } from 'next/server'

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30)
}

export function getSubdomain(request: NextRequest): string | null {
  const host =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    ''

  const hostname = host.split(':')[0] // strip port

  // Ignore top-level domains and reserved names
  const reserved = ['www', 'app', 'localhost', 'elevo']
  const parts = hostname.split('.')

  // For local dev (e.g. abc.localhost)
  if (hostname.endsWith('.localhost') && parts.length === 2) {
    const sub = parts[0]
    return reserved.includes(sub) ? null : sub
  }

  // For production (e.g. acme.elevo.ai)
  if (parts.length >= 3) {
    const sub = parts[0]
    return reserved.includes(sub) ? null : sub
  }

  return null
}

export function getDashboardUrl(subdomain?: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.ai'

  if (!subdomain) {
    // Default: use app subdomain
    return base.replace('https://', 'https://app.')
  }

  // Custom subdomain
  return base.replace('https://', `https://${subdomain}.`)
}
