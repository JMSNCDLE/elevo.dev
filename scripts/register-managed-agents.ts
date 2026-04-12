// ─── Register ELEVO background agents in Anthropic Console ──────────────────
// Run once with: npx ts-node scripts/register-managed-agents.ts
// Copy the output agent IDs into .env.local and Vercel

import { managedAgentsClient, ELEVO_BACKGROUND_AGENTS } from '../lib/managed-agents/registry'

async function registerAgents() {
  console.log('🤖 Registering ELEVO background agents in Claude Console...\n')

  const results: Record<string, string> = {}

  for (const [key, agentDef] of Object.entries(ELEVO_BACKGROUND_AGENTS)) {
    try {
      console.log(`Creating agent: ${agentDef.name}...`)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const agent = await (managedAgentsClient.beta as any).agents.create({
        name: agentDef.name,
        description: agentDef.description,
        model: agentDef.model,
        system_prompt: agentDef.system,
        tools: agentDef.tools,
      })

      results[key] = agent.id
      console.log(`✅ ${agentDef.name} — ID: ${agent.id}\n`)
    } catch (error) {
      console.error(`❌ Failed to create ${agentDef.name}:`, error instanceof Error ? error.message : error)
      results[key] = 'FAILED'
    }
  }

  console.log('\n📋 Add these to your .env.local and Vercel:\n')
  console.log(`MANAGED_AGENT_COUNCIL_ID=${results.agentCouncil ?? 'FAILED'}`)
  console.log(`MANAGED_SELF_UPDATE_ID=${results.selfUpdateAgent ?? 'FAILED'}`)
  console.log(`MANAGED_QA_BOT_ID=${results.qaBot ?? 'FAILED'}`)
  console.log(`MANAGED_CLIP_BOT_ID=${results.clipBot ?? 'FAILED'}`)
  console.log(`MANAGED_DROPSHIPPING_SYNC_ID=${results.dropshippingSync ?? 'FAILED'}`)
}

registerAgents().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
