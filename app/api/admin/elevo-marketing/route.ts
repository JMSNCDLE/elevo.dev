import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateViralPost } from '@/lib/agents/viralMarketingAgent'
import type { BusinessProfile } from '@/lib/agents/types'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const today = new Date()
  const queue = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const platforms = ['TikTok', 'Instagram', 'LinkedIn', 'YouTube Shorts']
    const platform = platforms[i % platforms.length]
    const topics = [
      'How ELEVO AI saved this business owner 8 hours a week',
      '3 things your competitors are doing that you aren\'t',
      'Before vs after: local business with ELEVO AI',
      'The €79 tool that replaces Hootsuite + Jasper + HubSpot',
      'Why most local businesses fail at social media (and how to fix it)',
      'ELEVO AI demo: 30-day content calendar in 60 seconds',
      'Meet Clio — your AI marketing department',
    ]
    return {
      id: `queue-${i}`,
      date: dateStr,
      platform,
      topic: topics[i],
      hook: `This is why ${100 + i * 12} local businesses switched to ELEVO AI this week`,
      caption: `Built this in 60 seconds with ELEVO AI. Here's exactly what it generated...`,
      status: 'planned' as const,
      vegaPrompt: `Create a ${platform === 'TikTok' ? 'vertical 9:16' : 'square 1:1'} video showing ELEVO AI's dashboard with animated content being generated. Dark indigo background, glowing UI elements, professional SaaS aesthetic.`,
    }
  })

  const missionStatus = {
    title: 'ELEVO Goes Viral — Q1 2026',
    week: 3,
    totalWeeks: 12,
    goal: '10,000 followers across all platforms',
    status: 'active',
    platforms: {
      TikTok: { followers: 1247, postsThisWeek: 14, engagementRate: '8.3%' },
      Instagram: { followers: 892, postsThisWeek: 10, engagementRate: '5.1%' },
      LinkedIn: { followers: 634, postsThisWeek: 5, engagementRate: '4.7%' },
      YouTube: { followers: 211, postsThisWeek: 3, engagementRate: '12.4%' },
    },
    adCampaigns: [
      { name: 'ELEVO Launch — Meta', platform: 'Meta', status: 'active', spend: '€240', ctr: '3.8%', leads: 47 },
      { name: 'ELEVO TikTok Reach', platform: 'TikTok', status: 'active', spend: '€120', ctr: '5.2%', leads: 29 },
    ],
  }

  const jamesScripts = Array.from({ length: 5 }, (_, i) => {
    const hooks = [
      'I built an AI that runs my entire marketing department. Here\'s how.',
      'This €79 tool replaced €990 worth of software. Watch.',
      'Your competitors are already using AI. Are you?',
      'I gave 3 local businesses a free ELEVO trial. Here\'s what happened.',
      'The tool that generates 30 days of social media in 4 minutes.',
    ]
    const scripts = [
      `Hook: "${hooks[0]}"\n\nScript: Start with your laptop. Open ELEVO AI. In the next 60 seconds, we're going to build an entire month of content for a local plumbing business.\n\n[Show dashboard loading]\n\nI type in their business name, their services, their tone of voice.\n\n[Show mission building]\n\nIn under a minute, ELEVO has built a 30-day content calendar, 30 ready-to-post captions, a hashtag strategy, and even an ad campaign.\n\n[Show result]\n\nThis is what used to take a marketing agency 2 weeks. ELEVO does it in 60 seconds.\n\nLink in bio to try it free for 7 days.`,
      `Hook: "${hooks[1]}"\n\nScript: Quick breakdown. Hootsuite: €99/mo. Jasper: €59/mo. HubSpot starter: €790/mo. That's €948 per month just for your marketing stack.\n\n[Show comparison table]\n\nELEVO AI: €79/mo. And it does everything they do — plus AI video prompts, competitor intelligence, and a marketing mission that runs itself.\n\n[Show dashboard tour]\n\nWe've had 400+ businesses switch in the last 30 days. Here's your 7-day free trial.`,
      `Hook: "${hooks[2]}"\n\nScript: I analysed 50 local businesses in the same category. The ones growing fastest all had one thing in common — consistent daily content.\n\nNot better content. Consistent content.\n\nThe problem? Creating content every single day takes hours you don't have.\n\n[Show ELEVO generating content]\n\nELEVO AI generates a full week of content in 4 minutes. Captions, hashtags, posting times — all optimised for your specific business and location.\n\nThe businesses not doing this? They're losing customers to the ones who are.`,
      `Hook: "${hooks[3]}"\n\nScript: I gave Sarah from a beauty salon, Tom from a plumbing company, and Maria from a bakery each a 7-day free trial of ELEVO AI. Here's the data after 30 days.\n\nSarah: 340% more Instagram reach, 12 new bookings from social.\nTom: First page Google ranking for 3 local keywords.\nMaria: 47 new email subscribers, sold out on 2 product launches.\n\nNone of them had used AI tools before. ELEVO handled everything. Link in bio.`,
      `Hook: "${hooks[4]}"\n\nScript: Watch this. I'm going to type one sentence and get 30 days of social media content.\n\n[Screen record: type business info]\n\nI've typed "Local coffee shop in Manchester, specialising in specialty coffee and homemade cakes, warm and friendly tone."\n\n[Show ELEVO Market™ building]\n\nELEVO is now: researching trending content formats, building a content strategy, writing 30 captions, selecting optimal posting times, and planning a hashtag strategy.\n\n[Timer: 3 minutes 47 seconds]\n\n4 minutes. 30 days of content. Ready to schedule.\n\nThat's ELEVO Market™. 7-day free trial at the link in bio.`,
    ]
    return {
      id: `script-${i}`,
      hook: hooks[i],
      script: scripts[i],
      platform: 'TikTok',
      vegaPrompt: `Create a vertical 9:16 TikTok-style video. Screen recording of ELEVO AI dashboard with smooth animations. Dark background #080C14. Indigo glowing UI. Fast cuts showing AI generating content. Text overlays matching the hook. Professional SaaS demo aesthetic. Upbeat background music.`,
      estimatedViews: `${(i + 1) * 12}k-${(i + 1) * 45}k`,
    }
  })

  return NextResponse.json({ missionStatus, contentQueue: queue, jamesScripts })
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role, plan').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const { platform, topic } = await request.json()

  const elevoBP: BusinessProfile = {
    id: 'elevo-admin',
    user_id: user.id,
    business_name: 'ELEVO AI',
    category: 'SaaS / AI Platform',
    city: 'London',
    country: 'UK',
    services: ['AI content generation', 'Marketing automation', 'CRM', 'Business intelligence'],
    unique_selling_points: ['54+ AI agents', 'Full marketing department in one tool', 'Replaces Hootsuite + Jasper + HubSpot'],
    tone_of_voice: 'Bold, confident, results-focused',
    website_url: 'https://elevo.dev',
    description: topic || 'ELEVO AI — the AI operating system for local businesses',
    target_audience: 'Local SME owners who want to grow online',
    is_primary: true,
    onboarding_complete: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  try {
    const post = await generateViralPost({
      businessProfile: elevoBP,
      platform: platform || 'TikTok',
      format: 'short_video',
      locale: 'en',
    })

    return NextResponse.json({ success: true, post })
  } catch (err) {
    console.error('[admin/elevo-marketing]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
