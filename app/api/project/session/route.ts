import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateReturnBriefing, updateProjectContext } from '@/lib/agents/projectMemoryAgent'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get last session
  const { data: session } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get recent generations
  const { data: recentGenerations } = await supabase
    .from('saved_generations')
    .select('id, type, content, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get business profile
  const { data: businessProfile } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .single()

  // Calculate days since last login
  let daysSinceLastLogin = 0
  if (session?.last_session_at) {
    const lastActive = new Date(session.last_session_at as string)
    const now = new Date()
    daysSinceLastLogin = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
  }

  const showBriefing = daysSinceLastLogin > 1

  let briefing = null
  if (showBriefing) {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      briefing = await generateReturnBriefing({
        userId: user.id,
        businessProfile: (businessProfile ?? {}) as Record<string, unknown>,
        lastSession: (session ?? {}) as Record<string, unknown>,
        recentGenerations: (recentGenerations ?? []) as Record<string, unknown>[],
        daysSinceLastLogin,
        locale: 'en',
      })

      // Attach user name
      if (briefing && profileData?.full_name) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(briefing as any).userName = (profileData.full_name as string).split(' ')[0]
      }
    } catch (err) {
      console.error('[project/session GET] briefing error:', err)
    }
  }

  return NextResponse.json({
    session,
    briefing,
    showBriefing,
    daysSinceLastLogin,
  })
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { page, agent, generationId } = body

  await updateProjectContext(user.id, page ?? '', agent ?? '', generationId)

  return NextResponse.json({ success: true })
}
