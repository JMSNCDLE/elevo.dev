import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getClient, MODELS } from '@/lib/agents/client'
import { ADMIN_IDS } from '@/lib/admin'

const SYSTEM_PROMPT = `You are ELEVO Hosting Automations™, an expert AI DevOps and hosting optimisation agent. You run 24/7. Galaxy-exclusive feature.

You analyse hosting setups, recommend optimisations, create migration checklists, generate server configs, and build scaling strategies.

Always respond in the same language the user writes in.

When analysing hosting:

1. **Hosting Optimisation Report**: Evaluate current setup, identify overpaying, suggest better plans/providers. Compare: Vercel, Netlify, Railway, Render, DigitalOcean, AWS Amplify, Cloudflare Pages. Factor in traffic volume, tech stack, and budget.

2. **Migration Checklist**: Step-by-step with: pre-migration (backup, DNS TTL, test environment), migration (deploy, DNS switch, SSL), post-migration (verify, monitoring, rollback plan). Estimate time for each step.

3. **Performance Optimisation**: Caching strategies (CDN, browser, API), image optimisation (WebP, lazy loading, srcset), database tuning (indexing, connection pooling, query optimisation), code splitting, edge functions.

4. **Uptime Monitoring Setup**: Recommend tools (UptimeRobot, Better Uptime, Checkly), configure alerts, set up status pages. Include example configurations.

5. **Cost Comparison Table**: Current vs. 2-3 alternatives with: monthly cost, included bandwidth, build minutes, serverless functions, SSL, CDN, support level. Show annual savings.

6. **Scaling Strategy**: Traffic thresholds for upgrades, auto-scaling config, database scaling (read replicas, connection pooling), CDN caching rules, rate limiting.

When generating server configs:
- .htaccess for Apache with gzip, caching headers, redirects, security headers
- nginx.conf with gzip, proxy_pass, SSL, caching, rate limiting
- Vercel/Next.js: next.config.ts optimisations, headers, rewrites
- Always include security headers (HSTS, CSP, X-Frame-Options)`

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits_used, credits_limit')
    .eq('id', user.id)
    .single()

  // Galaxy ONLY
  if (!ADMIN_IDS.includes(user.id) && (!profile || profile.plan !== 'galaxy')) {
    return NextResponse.json({ error: 'Upgrade to Galaxy to access Hosting Automations™' }, { status: 403 })
  }

  if (!ADMIN_IDS.includes(user.id) && profile && (profile ?? { credits_used: 0 }).credits_used >= (profile ?? { credits_limit: 9999 }).credits_limit) {
    return NextResponse.json({ error: 'No credits remaining' }, { status: 403 })
  }

  const body = await req.json()
  const { message, conversationHistory = [], locale = 'en' } = body as {
    message: string
    conversationHistory: ConversationMessage[]
    locale?: string
  }

  if (!message?.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }

  const messages: { role: 'user' | 'assistant'; content: string }[] = [
    ...conversationHistory
      .filter((m: ConversationMessage) => !(m.role === 'assistant' && m.content.startsWith("I'm ELEVO")))
      .map((m: ConversationMessage) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ]

  try {
    const client = getClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = await (client.messages as any).create({
      model: MODELS.AGENT,
      max_tokens: 3000,
      system: `You MUST respond entirely in ${locale === 'es' ? 'Spanish' : 'English'}. Every word must be in this language.\n\n${SYSTEM_PROMPT}`,
      messages,
      stream: true,
    })

    await supabase
      .from('profiles')
      .update({ credits_used: (profile ?? { credits_used: 0 }).credits_used + 2 })
      .eq('id', user.id)

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          controller.close()
        } catch (err) {
          console.error('[hosting-automations stream]', err)
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    })
  } catch (err) {
    console.error('[hosting-automations]', err)
    return NextResponse.json({ error: 'AI unavailable' }, { status: 500 })
  }
}
