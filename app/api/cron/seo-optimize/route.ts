import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getClient, MODELS } from '@/lib/agents/client'
import { notifyOwner } from '@/lib/notifications/notify-owner'

// Runs daily at 6 AM UTC (7 AM CET)
// Audits ELEVO's own website SEO and suggests improvements

const PAGES_TO_AUDIT = [
  { url: 'https://elevo.dev/en', name: 'Homepage' },
  { url: 'https://elevo.dev/en/pricing', name: 'Pricing' },
  { url: 'https://elevo.dev/en/blog', name: 'Blog' },
]

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')
  const validSecret = process.env.CRON_SECRET
  if (validSecret && cronSecret !== validSecret && authHeader !== `Bearer ${validSecret}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const results: Array<{ page: string; currentMeta: string; suggestedMeta: string; keywords: string[] }> = []

  try {
    const client = getClient()

    for (const page of PAGES_TO_AUDIT) {
      // Fetch the page to get current meta
      let currentMeta = ''
      try {
        const res = await fetch(page.url, { headers: { 'User-Agent': 'ELEVO-SEO-Bot/1.0' } })
        const html = await res.text()
        const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/)
        currentMeta = descMatch?.[1] ?? 'No meta description found'
      } catch {
        currentMeta = 'Failed to fetch page'
      }

      // Ask AI for improvement suggestions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await (client.messages as any).create({
        model: MODELS.AGENT,
        max_tokens: 512,
        stream: false,
        system: `You are an SEO expert. Analyse the current meta description for an AI business platform page and suggest an improved version. Focus on: click-through rate, keyword relevance (AI, business, agents, marketing), and compelling copy under 160 characters. Also suggest 5 target keywords. Respond in JSON format: {"suggested_meta": "...", "keywords": ["k1","k2","k3","k4","k5"], "notes": "brief explanation"}`,
        messages: [{
          role: 'user',
          content: `Page: ${page.name} (${page.url})\nCurrent meta description: "${currentMeta}"\n\nSuggest an improved meta description and target keywords.`,
        }],
      })

      let suggestedMeta = currentMeta
      let keywords: string[] = []
      let notes = ''

      try {
        const text = response.content.find((b: { type: string }) => b.type === 'text')?.text ?? ''
        const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
        const parsed = JSON.parse(cleaned)
        suggestedMeta = parsed.suggested_meta ?? currentMeta
        keywords = parsed.keywords ?? []
        notes = parsed.notes ?? ''
      } catch {
        // If parsing fails, just log the raw response
        suggestedMeta = 'AI parsing failed'
      }

      results.push({ page: page.name, currentMeta, suggestedMeta, keywords })

      // Save audit result
      await sb.from('seo_audits').insert({
        page_url: page.url,
        current_meta: currentMeta,
        suggested_meta: suggestedMeta,
        keywords,
        action_taken: notes || 'Audit complete — suggestions generated',
      })
    }

    // Notify James
    const summaryLines = results.map(r =>
      `${r.page}: ${r.suggestedMeta === r.currentMeta ? 'No change needed' : 'New suggestion available'}`
    ).join('\n')

    await notifyOwner({
      type: 'agent_insight',
      title: 'Daily SEO Audit Complete',
      message: `Audited ${results.length} pages:\n${summaryLines}\n\nView details in Admin > PA dashboard.`,
      channel: 'email',
    })

    return NextResponse.json({ ok: true, audited: results.length, results })
  } catch (err) {
    console.error('[cron/seo-optimize]', err)
    return NextResponse.json({ error: 'SEO audit failed' }, { status: 500 })
  }
}
