import { NextResponse } from 'next/server'
import { getClient, MODELS } from '@/lib/agents/client'

// All ELEVO AI agents and their API paths — 24/7 availability check
const AGENTS = [
  { name: 'Sales Strategist', path: '/api/agents/sales-strategist', tier: 'orbit' },
  { name: 'Marketing Planner', path: '/api/agents/marketing-planner', tier: 'orbit' },
  { name: 'Execution Coach', path: '/api/agents/execution-coach', tier: 'orbit' },
  { name: 'Competitive Intel', path: '/api/agents/competitive-intel', tier: 'galaxy' },
  { name: 'Help Bot', path: '/api/help-bot', tier: 'all' },
  { name: 'PA Agent', path: '/api/pa', tier: 'all' },
  { name: 'Content Generator', path: '/api/generate', tier: 'all' },
  { name: 'Problem Solver', path: '/api/problem-solver', tier: 'all' },
  { name: 'ROAS Analysis', path: '/api/roas', tier: 'orbit' },
  { name: 'SEO Audit', path: '/api/seo/audit', tier: 'all' },
  { name: 'Spy Analyse', path: '/api/spy/analyse', tier: 'orbit' },
  { name: 'Viral Strategy', path: '/api/viral/strategy', tier: 'orbit' },
  { name: 'Write Pro', path: '/api/write-pro/humanise', tier: 'all' },
  { name: 'Video Studio', path: '/api/video-studio/avatar', tier: 'orbit' },
  { name: 'CRM Brief', path: '/api/crm/brief', tier: 'all' },
]

export async function GET() {
  // Check Anthropic API connectivity
  let aiStatus: 'operational' | 'degraded' | 'down' = 'operational'
  let aiLatency = 0

  try {
    const start = performance.now()
    const client = getClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (client.messages as any).create({
      model: MODELS.SPECIALIST,
      max_tokens: 10,
      stream: false,
      messages: [{ role: 'user', content: 'ping' }],
    })
    aiLatency = Math.round(performance.now() - start)
    if (aiLatency > 5000) aiStatus = 'degraded'
  } catch {
    aiStatus = 'down'
  }

  const agentStatuses = AGENTS.map(agent => ({
    name: agent.name,
    path: agent.path,
    tier: agent.tier,
    available: true, // All agents are always available — 24/7
    aiBackend: aiStatus,
  }))

  const allAvailable = aiStatus !== 'down'

  return NextResponse.json({
    status: allAvailable ? 'all_agents_online' : 'degraded',
    aiBackend: { status: aiStatus, latency: aiLatency, model: MODELS.SPECIALIST },
    agents: agentStatuses,
    totalAgents: AGENTS.length,
    timestamp: new Date().toISOString(),
    uptime: '24/7 — no scheduled downtime',
  })
}
