import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action, user_id, email, reason } = body

  try {
    const supabase = getSupabase()

    switch (action) {
      case 'get_user': {
        const query = user_id
          ? supabase.from('profiles').select('*').eq('id', user_id).single()
          : supabase.from('profiles').select('*').eq('email', email).single()
        const { data, error } = await query
        if (error) throw error
        return NextResponse.json({ user: data })
      }

      case 'list_recent': {
        const { data } = await supabase
          .from('profiles')
          .select('id, email, full_name, subscription_status, subscription_plan, created_at')
          .order('created_at', { ascending: false })
          .limit(20)
        return NextResponse.json({ users: data })
      }

      case 'flag_for_review': {
        await supabase
          .from('profiles')
          .update({ flagged: true, flagged_reason: reason || 'Flagged by Aria' })
          .eq('id', user_id)
        return NextResponse.json({ success: true, action: 'flagged', user_id })
      }

      case 'reset_credits': {
        await supabase
          .from('profiles')
          .update({ credits_used: 0 })
          .eq('id', user_id)
        return NextResponse.json({ success: true, action: 'credits_reset', user_id })
      }

      case 'suspend': {
        await supabase
          .from('profiles')
          .update({ subscription_status: 'suspended', suspended_at: new Date().toISOString(), suspended_reason: reason })
          .eq('id', user_id)
        return NextResponse.json({ success: true, action: 'suspended', user_id })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
