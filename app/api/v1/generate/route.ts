import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { validateApiKey } from '@/lib/api-auth'
import { runOrchestrator } from '@/lib/agents/orchestrator'
import type { BusinessProfile, GenerationInput } from '@/lib/agents/types'

const Schema = z.object({
  type: z.enum(['gbp_post', 'blog', 'social_caption', 'review_response', 'email', 'seo', 'repurposed']),
  businessProfileId: z.string().uuid(),
  topic: z.string().optional(),
  service: z.string().optional(),
  keyword: z.string().optional(),
  tone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  // API key auth
  const authHeader = request.headers.get('Authorization') ?? ''
  const apiKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

  const { valid, userId, plan } = await validateApiKey(apiKey)
  if (!valid || !userId) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  if (plan === 'trial' || plan === 'launch') {
    return NextResponse.json({ error: 'API access requires Galaxy plan' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const { businessProfileId, type, ...rest } = parsed.data

  const supabase = await createServiceClient()

  // Credit check
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_used, credits_limit')
    .eq('id', userId)
    .single()

  if (!profile || profile.credits_used >= profile.credits_limit) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  const { data: bp } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', businessProfileId)
    .eq('user_id', userId)
    .single()

  if (!bp) return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })

  const input: GenerationInput = { type, businessProfile: bp as BusinessProfile, ...rest }

  try {
    const output = await runOrchestrator(input)
    await supabase.from('profiles').update({ credits_used: profile.credits_used + 1 }).eq('id', userId)
    return NextResponse.json({ output })
  } catch (err) {
    console.error('v1 generate error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
