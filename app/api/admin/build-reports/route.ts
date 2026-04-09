import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('build_agent_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) {
      return NextResponse.json({ reports: [] })
    }

    return NextResponse.json({ reports: data })
  } catch {
    return NextResponse.json({ reports: [] })
  }
}
