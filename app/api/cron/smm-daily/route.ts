import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { runDailySMMWorkflow } from '@/lib/agents/superSMMAgent'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = await createServerClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('id, plan, credits_used, credits_limit')
    .eq('auto_smm_enabled', true)
    .in('plan', ['orbit', 'galaxy'])

  if (!users || users.length === 0) {
    return NextResponse.json({ processed: 0, errors: [] })
  }

  const errors: string[] = []
  let processed = 0
  const date = new Date().toISOString().split('T')[0]

  for (const user of users) {
    try {
      if (user.credits_used + 2 > user.credits_limit) {
        errors.push(`User ${user.id}: insufficient credits`)
        continue
      }

      const { data: bp } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single()

      if (!bp) continue

      const result = await runDailySMMWorkflow({
        businessProfileId: bp.id,
        userId: user.id,
        date,
        connectedPlatforms: [],
        activeMissions: [],
        locale: 'en',
      })

      await supabase.from('saved_generations').insert({
        user_id: user.id,
        business_profile_id: bp.id,
        type: 'social_caption',
        title: `SMM Daily Workflow — ${date}`,
        content: result,
      })

      await supabase.from('profiles').update({ credits_used: user.credits_used + 2 }).eq('id', user.id)

      processed++
    } catch (err) {
      errors.push(`User ${user.id}: ${String(err)}`)
    }
  }

  return NextResponse.json({ processed, errors })
}
