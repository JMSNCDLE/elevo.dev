import { NextResponse } from 'next/server'

const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? ''
const BASE_URL = 'https://elevo.dev'
const LOCALES = ['en', 'es']

// IndexNow API — instant indexing for Bing, Yandex, DuckDuckGo, Seznam, Naver
// Spec: https://www.indexnow.org/documentation

export async function POST(request: Request) {
  // Auth: admin or cron
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Check if admin
    const adminHeader = request.headers.get('x-admin-id')
    if (adminHeader !== (process.env.ELEVO_ADMIN_USER_ID ?? '5dc15dea-4633-441b-b37a-5406e7235114')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (!INDEXNOW_KEY) {
    return NextResponse.json({ error: 'INDEXNOW_KEY not configured' }, { status: 500 })
  }

  const body = await request.json().catch(() => ({}))
  const specificUrls = (body.urls as string[]) ?? []

  // Build URL list: either specific URLs or all key pages
  const urls: string[] = specificUrls.length > 0
    ? specificUrls
    : buildAllUrls()

  // Submit to IndexNow (Bing endpoint — propagates to all participating engines)
  const payload = {
    host: 'elevo.dev',
    key: INDEXNOW_KEY,
    keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls.slice(0, 10000), // IndexNow max 10k per batch
  }

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    })

    const status = res.status
    // 200 = OK, 202 = Accepted (submitted), 429 = Rate limited
    return NextResponse.json({
      ok: status === 200 || status === 202,
      indexNowStatus: status,
      urlsSubmitted: urls.length,
      engines: ['Bing', 'Yandex', 'DuckDuckGo', 'Seznam', 'Naver'],
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

// GET: serve the IndexNow key verification file
export async function GET() {
  if (!INDEXNOW_KEY) {
    return NextResponse.json({ error: 'Not configured' }, { status: 404 })
  }
  return new Response(INDEXNOW_KEY, {
    headers: { 'Content-Type': 'text/plain' },
  })
}

function buildAllUrls(): string[] {
  const urls: string[] = []
  const pages = ['', '/pricing', '/blog', '/privacy', '/terms', '/refunds', '/cookies']

  for (const locale of LOCALES) {
    for (const page of pages) {
      urls.push(`${BASE_URL}/${locale}${page}`)
    }
  }

  return urls
}
