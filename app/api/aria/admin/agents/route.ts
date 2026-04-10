import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action, agent_id, payload } = body

  try {
    const supabase = getSupabase()

    switch (action) {
      case 'list_agents': {
        try {
          const { data } = await supabase.from('agent_configurations').select('*').order('name')
          return NextResponse.json({ agents: data || [] })
        } catch {
          return NextResponse.json({ agents: [], note: 'agent_configurations table not yet created' })
        }
      }

      case 'get_agent_status': {
        try {
          const { data } = await supabase.from('agent_configurations').select('*').eq('id', agent_id).single()
          return NextResponse.json({ agent: data })
        } catch {
          return NextResponse.json({ agent: null, note: 'Agent not found or table not yet created' })
        }
      }

      case 'run_agent': {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.elevo.dev'
        const res = await fetch(`${baseUrl}/api/agents/${agent_id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-aria-internal': 'true' },
          body: JSON.stringify(payload || {}),
        })
        const result = await res.json()
        return NextResponse.json({ success: res.ok, result })
      }

      case 'toggle_agent': {
        try {
          const { data: current } = await supabase.from('agent_configurations').select('enabled').eq('id', agent_id).single()
          const newState = !(current?.enabled ?? true)
          await supabase.from('agent_configurations').update({ enabled: newState }).eq('id', agent_id)
          return NextResponse.json({ success: true, agent_id, enabled: newState })
        } catch {
          return NextResponse.json({ error: 'agent_configurations table not yet created' }, { status: 500 })
        }
      }

      case 'update_config': {
        try {
          await supabase.from('agent_configurations').update(payload).eq('id', agent_id)
          return NextResponse.json({ success: true, agent_id, updated: payload })
        } catch {
          return NextResponse.json({ error: 'agent_configurations table not yet created' }, { status: 500 })
        }
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
