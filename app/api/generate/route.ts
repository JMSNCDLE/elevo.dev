import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { runOrchestrator } from '@/lib/agents/orchestrator'
import type { BusinessProfile, GenerationInput } from '@/lib/agents/types'
import { checkDemoLimit, incrementDemoCount } from '@/lib/cookies'

const PostSchema = z.object({
  type: z.enum(['gbp_post', 'blog', 'social_caption', 'review_response', 'email', 'seo', 'repurposed']),
  businessProfileId: z.string().uuid(),
  topic: z.string().optional(),
  service: z.string().optional(),
  keyword: z.string().optional(),
  season: z.string().optional(),
  tone: z.string().optional(),
  wordCount: z.number().optional(),
  angle: z.string().optional(),
  intent: z.string().optional(),
  goal: z.string().optional(),
  offer: z.string().optional(),
  platform: z.string().optional(),
  includeHashtags: z.boolean().optional(),
  schemaType: z.string().optional(),
  pageUrl: z.string().optional(),
  pageTitle: z.string().optional(),
  starRating: z.number().min(1).max(5).optional(),
  reviewerName: z.string().optional(),
  reviewText: z.string().optional(),
})

export async function POST(request: NextRequest) {
  // Auth
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Guest / demo mode — check demo limit
  if (!user) {
    const { allowed, remaining, count } = checkDemoLimit(request)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Demo limit reached. Create a free account to continue.', demoLimitReached: true },
        { status: 429 }
      )
    }

    // Validate
    const body = await request.json()
    const parsed = PostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const { businessProfileId, type, ...rest } = parsed.data

    // Load business profile (guest can only access profiles without user_id restriction in demo mode)
    const { data: bp } = await supabase.from('business_profiles').select('*').eq('id', businessProfileId).single()
    if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

    const input: GenerationInput = { type, businessProfile: bp as BusinessProfile, ...rest }

    try {
      const output = await runOrchestrator(input)
      const response = NextResponse.json({ output, demoRemaining: remaining - 1 })
      return incrementDemoCount(response, count)
    } catch (err) {
      console.error('Generation error (guest):', err)
      return NextResponse.json({ error: 'Generation failed. Please try again.' }, { status: 500 })
    }
  }

  // Validate
  const body = await request.json()
  const parsed = PostSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const { businessProfileId, type, ...rest } = parsed.data

  // Credit check
  const { data: profile } = await supabase.from('profiles').select('credits_used, credits_limit, plan').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  if (profile.credits_used >= profile.credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits. Please upgrade your plan.' }, { status: 402 })
  }

  // Load business profile
  const { data: bp } = await supabase.from('business_profiles').select('*').eq('id', businessProfileId).eq('user_id', user.id).single()
  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  // Generate
  const input: GenerationInput = { type, businessProfile: bp as BusinessProfile, ...rest }

  try {
    const output = await runOrchestrator(input)

    // Save to DB
    await supabase.from('saved_generations').insert({
      user_id: user.id,
      business_profile_id: businessProfileId,
      type,
      content: output.primary,
      metadata: { alternatives: output.alternatives, hashtags: output.hashtags, schemaJson: output.schemaJson },
      seo_score: output.seoScore?.score ?? null,
      word_count: output.wordCount,
    })

    // Deduct credit
    await supabase.from('profiles').update({ credits_used: profile.credits_used + 1 }).eq('id', user.id)

    // Track analytics event
    await supabase.from('analytics_events').insert({
      user_id: user.id,
      business_profile_id: businessProfileId,
      event_type: 'content_generated',
      feature: type,
      agent_name: 'Sol',
      metadata: { contentType: type },
    })

    return NextResponse.json({ output })
  } catch (err) {
    console.error('Generation error:', err)
    return NextResponse.json({ error: 'Generation failed. Please try again.' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id, scheduledFor } = await request.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await supabase.from('saved_generations').update({ scheduled_for: scheduledFor ?? null }).eq('id', id).eq('user_id', user.id)

  return NextResponse.json({ success: true })
}
