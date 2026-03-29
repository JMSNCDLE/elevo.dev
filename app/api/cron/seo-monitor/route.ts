import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/send'

const CRON_SECRET = process.env.CRON_SECRET
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'
const ADMIN_EMAIL = process.env.ELEVO_ADMIN_EMAIL ?? 'team@elevo.dev'
const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? ''
const LOCALES = ['en', 'es']

interface SEOCheck {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
  engine?: string
}

async function checkUrl(url: string): Promise<{ ok: boolean; status: number }> {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    return { ok: res.status < 400, status: res.status }
  } catch {
    return { ok: false, status: 0 }
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const checks: SEOCheck[] = []

  // 1. Sitemap check
  const sitemapUrl = `${BASE_URL}/sitemap.xml`
  const sitemap = await checkUrl(sitemapUrl)
  checks.push({
    name: 'Sitemap',
    status: sitemap.ok ? 'pass' : 'fail',
    message: sitemap.ok ? `sitemap.xml returns ${sitemap.status}` : `Sitemap unreachable (${sitemap.status})`,
  })

  // 2. Robots.txt check
  const robotsUrl = `${BASE_URL}/robots.txt`
  const robots = await checkUrl(robotsUrl)
  checks.push({
    name: 'Robots.txt',
    status: robots.ok ? 'pass' : 'fail',
    message: robots.ok ? 'robots.txt accessible' : `robots.txt unreachable (${robots.status})`,
  })

  // 3. Check key marketing pages return 200
  const keyPages = ['', '/pricing', '/blog', '/privacy', '/terms']
  for (const page of keyPages) {
    for (const locale of LOCALES) {
      const url = `${BASE_URL}/${locale}${page}`
      const result = await checkUrl(url)
      if (!result.ok) {
        checks.push({
          name: `Page /${locale}${page || '/'}`,
          status: 'fail',
          message: `Returns ${result.status}`,
        })
      }
    }
  }
  const pagesChecked = keyPages.length * LOCALES.length
  const pagesFailed = checks.filter(c => c.name.startsWith('Page') && c.status === 'fail').length
  if (pagesFailed === 0) {
    checks.push({ name: 'Marketing Pages', status: 'pass', message: `All ${pagesChecked} pages return 200` })
  }

  // 4. Structured data check (verify JSON-LD present on homepage)
  try {
    const homeRes = await fetch(`${BASE_URL}/en`, { headers: { 'User-Agent': 'ELEVO-SEO-Monitor/1.0' } })
    const homeHtml = await homeRes.text()
    const jsonLdCount = (homeHtml.match(/application\/ld\+json/g) || []).length
    checks.push({
      name: 'Structured Data',
      status: jsonLdCount >= 2 ? 'pass' : jsonLdCount === 1 ? 'warn' : 'fail',
      message: `${jsonLdCount} JSON-LD blocks found on homepage (need ≥2: Organization + SoftwareApplication)`,
    })

    // Check hreflang
    const hasHreflang = homeHtml.includes('hreflang')
    checks.push({
      name: 'Hreflang Tags',
      status: hasHreflang ? 'pass' : 'warn',
      message: hasHreflang ? 'hreflang detected' : 'No hreflang tags found — multilingual SEO may suffer',
    })

    // Check OG tags
    const hasOg = homeHtml.includes('og:title')
    checks.push({
      name: 'Open Graph',
      status: hasOg ? 'pass' : 'warn',
      message: hasOg ? 'OG tags present' : 'Missing Open Graph tags',
    })

    // Check canonical
    const hasCanonical = homeHtml.includes('canonical')
    checks.push({
      name: 'Canonical URL',
      status: hasCanonical ? 'pass' : 'warn',
      message: hasCanonical ? 'Canonical URL present' : 'Missing canonical URL',
    })
  } catch {
    checks.push({ name: 'Structured Data', status: 'fail', message: 'Could not fetch homepage' })
  }

  // 5. Search engine bot accessibility
  const engines = [
    { name: 'Google', bot: 'Googlebot' },
    { name: 'Bing', bot: 'Bingbot' },
    { name: 'DuckDuckGo', bot: 'DuckDuckBot' },
    { name: 'Yandex', bot: 'YandexBot' },
    { name: 'Apple', bot: 'Applebot' },
  ]
  try {
    const robotsTxt = await fetch(robotsUrl).then(r => r.text())
    for (const engine of engines) {
      // Check robots.txt doesn't block this bot
      const blockPattern = new RegExp(`User-agent:\\s*${engine.bot}[\\s\\S]*?Disallow:\\s*/\\s*$`, 'im')
      const isBlocked = blockPattern.test(robotsTxt)
      checks.push({
        name: `${engine.name} Access`,
        status: isBlocked ? 'fail' : 'pass',
        message: isBlocked ? `${engine.bot} is blocked in robots.txt` : `${engine.bot} allowed`,
        engine: engine.name,
      })
    }
  } catch {
    checks.push({ name: 'Bot Access Check', status: 'warn', message: 'Could not parse robots.txt' })
  }

  // 6. IndexNow key check
  if (INDEXNOW_KEY) {
    const keyUrl = `${BASE_URL}/${INDEXNOW_KEY}.txt`
    const keyCheck = await checkUrl(keyUrl)
    checks.push({
      name: 'IndexNow Key',
      status: keyCheck.ok ? 'pass' : 'warn',
      message: keyCheck.ok ? 'IndexNow verification key accessible' : 'IndexNow key file not found — create it',
    })
  } else {
    checks.push({
      name: 'IndexNow Key',
      status: 'warn',
      message: 'INDEXNOW_KEY not configured — Bing/Yandex instant indexing disabled',
    })
  }

  // 7. Ping IndexNow if content changes detected (check blog_posts updated_at)
  let indexNowPinged = false
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (url && key && INDEXNOW_KEY) {
      const supabase = createClient(url, key)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count } = await supabase
        .from('blog_posts')
        .select('id', { count: 'exact', head: true })
        .gte('updated_at', yesterday)
        .eq('published', true)

      if ((count ?? 0) > 0) {
        // Ping IndexNow for updated content
        await fetch(`${BASE_URL}/api/seo/indexnow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CRON_SECRET}`,
          },
          body: JSON.stringify({}),
        })
        indexNowPinged = true
        checks.push({
          name: 'IndexNow Ping',
          status: 'pass',
          message: `${count} blog posts updated in last 24h — IndexNow pinged`,
        })
      }
    }
  } catch {}

  // Build summary
  const summary = {
    timestamp: new Date().toISOString(),
    total: checks.length,
    passed: checks.filter(c => c.status === 'pass').length,
    failed: checks.filter(c => c.status === 'fail').length,
    warned: checks.filter(c => c.status === 'warn').length,
    indexNowPinged,
    checks,
  }

  // Send weekly report on Mondays
  const today = new Date()
  if (today.getDay() === 1) {
    const failures = checks.filter(c => c.status === 'fail')
    const warnings = checks.filter(c => c.status === 'warn')

    const html = `
      <h2>ELEVO SEO Health Report — ${today.toLocaleDateString('en-GB')}</h2>
      <p><strong>${summary.passed}/${summary.total} checks passed</strong></p>
      ${failures.length > 0 ? `
        <h3 style="color:#dc2626">Failures (${failures.length})</h3>
        <ul>${failures.map(f => `<li><strong>${f.name}</strong>: ${f.message}</li>`).join('')}</ul>
      ` : ''}
      ${warnings.length > 0 ? `
        <h3 style="color:#d97706">Warnings (${warnings.length})</h3>
        <ul>${warnings.map(w => `<li><strong>${w.name}</strong>: ${w.message}</li>`).join('')}</ul>
      ` : ''}
      <h3>Search Engine Coverage</h3>
      <table style="border-collapse:collapse;width:100%">
        <tr style="background:#f3f4f6"><th style="padding:8px;text-align:left;border:1px solid #e5e7eb">Engine</th><th style="padding:8px;border:1px solid #e5e7eb">Status</th></tr>
        ${engines.map(e => {
          const check = checks.find(c => c.engine === e.name)
          return `<tr><td style="padding:8px;border:1px solid #e5e7eb">${e.name}</td><td style="padding:8px;border:1px solid #e5e7eb;color:${check?.status === 'pass' ? '#16a34a' : '#dc2626'}">${check?.status === 'pass' ? 'Allowed' : 'Blocked'}</td></tr>`
        }).join('')}
      </table>
      ${indexNowPinged ? '<p style="color:#16a34a">IndexNow pinged for recent content updates.</p>' : ''}
      <p style="font-size:12px;color:#9ca3af;margin-top:20px">ELEVO SEO Monitor — automated weekly report</p>
    `

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `SEO Health: ${summary.passed}/${summary.total} passed — ${failures.length} issues`,
      html,
      agentName: 'SEO Monitor',
    }).catch(() => {})
  }

  // Save to health_checks
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (url && key) {
      const supabase = createClient(url, key)
      await supabase.from('health_checks').insert({
        overall_health: summary.failed > 0 ? 'critical' : summary.warned > 0 ? 'warning' : 'healthy',
        result: { type: 'seo', ...summary },
        issues_count: summary.failed + summary.warned,
        critical_count: summary.failed,
      })
    }
  } catch {}

  return NextResponse.json(summary)
}
