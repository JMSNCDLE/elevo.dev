import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action, key, value } = body

  try {
    const supabase = getSupabase()

    switch (action) {
      case 'get_all': {
        try {
          const { data } = await supabase.from('platform_settings').select('*')
          return NextResponse.json({ settings: data || [] })
        } catch {
          return NextResponse.json({ settings: [], note: 'platform_settings table not yet created' })
        }
      }

      case 'get': {
        try {
          const { data } = await supabase.from('platform_settings').select('*').eq('key', key).single()
          return NextResponse.json({ setting: data })
        } catch {
          return NextResponse.json({ setting: null })
        }
      }

      case 'update': {
        try {
          await supabase.from('platform_settings').upsert({ key, value, updated_at: new Date().toISOString() })
          return NextResponse.json({ success: true, key, value })
        } catch {
          return NextResponse.json({ error: 'platform_settings table not yet created' }, { status: 500 })
        }
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
