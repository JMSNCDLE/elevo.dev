import { getCircuitStatus } from '@/lib/agents/circuitBreaker'
import { NextResponse } from 'next/server'

export async function GET() {
  const status = getCircuitStatus('anthropic')
  return NextResponse.json({
    service: 'anthropic',
    ...status,
    timestamp: new Date().toISOString(),
  })
}
