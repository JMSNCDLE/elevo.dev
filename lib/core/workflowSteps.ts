import type { WorkflowStep } from '@/components/chat/WorkflowProgress'

type AgentType = 'lawyer' | 'accountant' | 'ceo' | 'social' | 'seo' | 'email' | 'create' | 'clip' | 'pa' | 'default'

const STEP_TEMPLATES: Record<AgentType, { label: string; id: string }[]> = {
  lawyer: [
    { id: 'analyse', label: 'Analysing document...' },
    { id: 'identify', label: 'Identifying clauses & risks...' },
    { id: 'compare', label: 'Comparing against standard terms...' },
    { id: 'write', label: 'Writing recommendations...' },
  ],
  accountant: [
    { id: 'parse', label: 'Parsing financial data...' },
    { id: 'calculate', label: 'Running calculations...' },
    { id: 'analyse', label: 'Analysing trends & anomalies...' },
    { id: 'write', label: 'Preparing report...' },
  ],
  ceo: [
    { id: 'context', label: 'Understanding business context...' },
    { id: 'research', label: 'Researching strategy options...' },
    { id: 'analyse', label: 'Evaluating trade-offs...' },
    { id: 'write', label: 'Drafting strategic advice...' },
  ],
  social: [
    { id: 'analyse', label: 'Analysing target audience...' },
    { id: 'create', label: 'Crafting content...' },
    { id: 'optimise', label: 'Optimising for engagement...' },
    { id: 'finalise', label: 'Finalising post...' },
  ],
  seo: [
    { id: 'audit', label: 'Auditing page structure...' },
    { id: 'keywords', label: 'Researching keywords...' },
    { id: 'optimise', label: 'Generating SEO improvements...' },
    { id: 'write', label: 'Writing recommendations...' },
  ],
  email: [
    { id: 'context', label: 'Understanding requirements...' },
    { id: 'draft', label: 'Drafting email...' },
    { id: 'tone', label: 'Refining tone & structure...' },
    { id: 'finalise', label: 'Finalising email...' },
  ],
  create: [
    { id: 'understand', label: 'Understanding request...' },
    { id: 'research', label: 'Gathering context...' },
    { id: 'create', label: 'Creating content...' },
    { id: 'polish', label: 'Polishing output...' },
  ],
  clip: [
    { id: 'extract', label: 'Extracting transcript...' },
    { id: 'analyse', label: 'Analysing content...' },
    { id: 'identify', label: 'Identifying key moments...' },
    { id: 'write', label: 'Writing clips & captions...' },
  ],
  pa: [
    { id: 'understand', label: 'Understanding your request...' },
    { id: 'plan', label: 'Planning actions...' },
    { id: 'execute', label: 'Executing...' },
    { id: 'respond', label: 'Preparing response...' },
  ],
  default: [
    { id: 'understand', label: 'Understanding your request...' },
    { id: 'process', label: 'Processing...' },
    { id: 'generate', label: 'Generating response...' },
    { id: 'finalise', label: 'Finalising...' },
  ],
}

const ESTIMATED_TIMES: Record<AgentType, number> = {
  lawyer: 20000,
  accountant: 18000,
  ceo: 22000,
  social: 12000,
  seo: 15000,
  email: 10000,
  create: 15000,
  clip: 12000,
  pa: 10000,
  default: 15000,
}

export function getWorkflowSteps(agentType: string): WorkflowStep[] {
  const key = (agentType in STEP_TEMPLATES ? agentType : 'default') as AgentType
  return STEP_TEMPLATES[key].map(s => ({ ...s, status: 'pending' as const }))
}

export function getEstimatedTime(agentType: string): number {
  const key = (agentType in ESTIMATED_TIMES ? agentType : 'default') as AgentType
  return ESTIMATED_TIMES[key]
}
