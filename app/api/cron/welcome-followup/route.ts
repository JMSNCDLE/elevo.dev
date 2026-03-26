import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendSequenceEmail } from '@/lib/email/send'

// Runs daily at 9 AM UTC — sends follow-up to users who signed up 24 hours ago

const AGENT_TIPS: Record<string, string[]> = {
  local_business: [
    '1. **CRM & Contacts** — Import your customers and let ELEVO track follow-ups automatically',
    '2. **SEO & Rankings** — Run an SEO audit to see how your business appears on Google',
    '3. **Social Media Manager** — Generate a week of social posts in 30 seconds',
  ],
  ecommerce: [
    '1. **Sales Strategist** — Create a 90-day sales plan tailored to your store',
    '2. **Marketing Planner** — Build ad campaign briefs for Meta and Google',
    '3. **Analytics** — Connect your data and track what is working',
  ],
  pod: [
    '1. **Create Agent** — Generate product designs and creative prompts',
    '2. **Marketing Planner** — Plan your launch campaign across all channels',
    '3. **Social Media Manager** — Schedule content for the week in one click',
  ],
  fashion: [
    '1. **Create Agent** — Design lookbook content and campaign visuals',
    '2. **Viral Agent** — Find trending hooks and build a 30-day content calendar',
    '3. **Marketing Planner** — Plan your next collection launch',
  ],
  influencer: [
    '1. **Viral Agent** — Discover trending topics and get 50 hook ideas',
    '2. **Social Media Manager** — Plan and schedule your content week',
    '3. **Analytics** — Track what is growing and what needs attention',
  ],
  freelancer: [
    '1. **CRM & Contacts** — Organise your clients and track project status',
    '2. **Sales Strategist** — Get a plan to win more projects this quarter',
    '3. **Write Pro** — Polish your proposals until they sound perfect',
  ],
  agency: [
    '1. **Sales Strategist** — Build a pipeline strategy to close more deals',
    '2. **Marketing Planner** — Create campaign plans for your clients',
    '3. **Competitive Intel** — Analyse your competitors and find gaps',
  ],
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')
  const validSecret = process.env.CRON_SECRET
  if (validSecret && cronSecret !== validSecret && authHeader !== `Bearer ${validSecret}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const sb = createClient(url, key)

    // Find users who signed up between 20-28 hours ago (window to avoid duplicates)
    const now = Date.now()
    const from = new Date(now - 28 * 60 * 60 * 1000).toISOString()
    const to = new Date(now - 20 * 60 * 60 * 1000).toISOString()

    const { data: newUsers } = await sb
      .from('profiles')
      .select('id, full_name, email, business_type')
      .gte('created_at', from)
      .lte('created_at', to)

    let sent = 0
    for (const user of newUsers ?? []) {
      if (!user.email) continue

      const firstName = (user.full_name as string | null)?.split(' ')[0] ?? 'there'
      const tips = AGENT_TIPS[user.business_type ?? 'local_business'] ?? AGENT_TIPS.local_business

      await sendSequenceEmail('welcomeFollowup', user.email, {
        firstName,
        agentTip1: tips[0],
        agentTip2: tips[1],
        agentTip3: tips[2],
      })
      sent++
    }

    return NextResponse.json({ ok: true, sent, checked: newUsers?.length ?? 0 })
  } catch (err) {
    console.error('[cron/welcome-followup]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
