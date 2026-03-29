import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { parseRawData } from '@/lib/agents/dataIngestionAgent'

const Schema = z.object({
  rawData: z.string().min(1),
  expectedType: z.enum(['financial', 'inventory', 'advertising', 'customer', 'general']),
})

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  try {
    const ingestType = parsed.data.expectedType === 'general' ? 'financial' : parsed.data.expectedType
    const result = await parseRawData(parsed.data.rawData, ingestType)

    const { cleanedData, detectedFormat, detectedColumns, rowCount, warnings, confidence } = result as {
      cleanedData: unknown
      detectedFormat: string
      detectedColumns: string[]
      rowCount: number
      warnings: string[]
      confidence: number
    }

    return NextResponse.json({ cleanedData, detectedFormat, detectedColumns, rowCount, warnings, confidence })
  } catch (err) {
    console.error('Data ingestion error:', err)
    return NextResponse.json({ error: 'Data parsing failed' }, { status: 500 })
  }
}
