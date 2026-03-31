import { createMessage, MODELS, extractText, parseJSON } from './client'

export interface AgentBuildInput {
  clientName: string
  businessType: string
  businessSize: string
  mainProblem: string
  currentTools: string[]
  budget: string
  timeline: string
  technicalLevel: 'none' | 'low' | 'medium' | 'high'
  locale: string
}

export interface AgentBuildBrief {
  projectName: string
  executiveSummary: string
  agentSpec: {
    agentName: string
    agentRole: string
    primaryObjective: string
    triggerConditions: string[]
    inputs: Array<{ name: string; type: string; required: boolean; description: string }>
    outputs: Array<{ name: string; type: string; format: string; description: string }>
    decisionLogic: string[]
    errorHandling: string[]
    escalationRules: string[]
  }
  tools: Array<{
    toolName: string
    purpose: string
    apiRequired: boolean
    estimatedSetupTime: string
    alternatives: string[]
  }>
  techStack: {
    aiModel: string
    framework: string
    database: string
    hosting: string
    estimatedMonthlyCost: string
  }
  buildPlan: Array<{
    phase: number
    name: string
    deliverables: string[]
    duration: string
    dependencies: string[]
    completionCriteria: string
  }>
  handover: {
    documentationRequired: string[]
    trainingRequired: string[]
    maintenancePlan: string
    supportPlan: string
    escalationContacts: string[]
    goLiveChecklist: string[]
  }
  commercial: {
    estimatedBuildCost: string
    estimatedTimeline: string
    monthlySupportCost: string
    roi: string
    paybackPeriod: string
  }
  risks: Array<{
    risk: string
    likelihood: 'low' | 'medium' | 'high'
    impact: 'low' | 'medium' | 'high'
    mitigation: string
  }>
  fullBriefDocument: string
}

export async function generateAgentBuildBrief(
  input: AgentBuildInput,
  locale: string
): Promise<AgentBuildBrief> {
  const systemPrompt = `You are ELEVO Build™, a world-class AI solutions architect. You design and specify custom AI agents for businesses of all sizes. You translate vague business problems into precise, actionable technical specifications that a development team can execute.

You understand:
- Modern AI orchestration frameworks (n8n, Make, LangChain, custom Node.js/Python)
- Integration patterns for business tools (CRMs, ERPs, communication platforms)
- Cost-effective architectures for SMEs
- Change management and technical adoption for non-technical teams

Your briefs are:
- Technically precise but readable by non-technical clients
- Commercially grounded with real cost and ROI estimates
- Structured for handover to any competent developer
- Honest about risks and limitations

Locale: ${locale}`

  const userPrompt = `Design a complete AI agent build brief for this client.

CLIENT DETAILS:
- Client name: ${input.clientName}
- Business type: ${input.businessType}
- Business size: ${input.businessSize}
- Current tools: ${input.currentTools.length > 0 ? input.currentTools.join(', ') : 'None specified'}
- Budget: ${input.budget}
- Timeline: ${input.timeline}
- Client's technical level: ${input.technicalLevel}

THE PROBLEM TO SOLVE:
${input.mainProblem}

Design a complete, production-ready AI agent specification. The fullBriefDocument should be a polished markdown document suitable for sending directly to the client — professional, clear, and convincing.

Return ONLY valid JSON with this exact structure:
{
  "projectName": "Catchy project name e.g. 'AutoQuote Agent for ${input.clientName}'",
  "executiveSummary": "3-4 sentence non-technical summary. What it does, what problem it solves, expected outcome. Written for a business owner.",
  "agentSpec": {
    "agentName": "Agent name",
    "agentRole": "One-line role description",
    "primaryObjective": "Clear, measurable primary objective",
    "triggerConditions": ["When X happens...", "When Y occurs...", "Scheduled: every Z"],
    "inputs": [
      { "name": "input_name", "type": "string|number|boolean|object|array", "required": true, "description": "What this input is" }
    ],
    "outputs": [
      { "name": "output_name", "type": "string|json|email|webhook", "format": "format description", "description": "What this output does" }
    ],
    "decisionLogic": ["If condition A, then action B", "Priority order for X scenarios"],
    "errorHandling": ["On API timeout: retry 3 times", "On missing data: flag to human"],
    "escalationRules": ["Escalate to human if confidence < 70%", "Alert on error rate > 5%"]
  },
  "tools": [
    {
      "toolName": "Tool name",
      "purpose": "What it does in this agent",
      "apiRequired": true,
      "estimatedSetupTime": "e.g. 2 hours",
      "alternatives": ["Alternative 1", "Alternative 2"]
    }
  ],
  "techStack": {
    "aiModel": "Recommended AI model and why",
    "framework": "Recommended framework and why",
    "database": "Database recommendation",
    "hosting": "Hosting recommendation",
    "estimatedMonthlyCost": "€X-Y per month breakdown"
  },
  "buildPlan": [
    {
      "phase": 1,
      "name": "Phase name",
      "deliverables": ["Deliverable 1", "Deliverable 2"],
      "duration": "e.g. 3 days",
      "dependencies": ["What must be done first"],
      "completionCriteria": "How we know this phase is done"
    }
  ],
  "handover": {
    "documentationRequired": ["API documentation", "User guide", "..."],
    "trainingRequired": ["Admin training (2 hours)", "..."],
    "maintenancePlan": "Monthly maintenance description",
    "supportPlan": "Support arrangement description",
    "escalationContacts": ["Primary: agency contact", "Technical: developer"],
    "goLiveChecklist": ["Item 1", "Item 2", "Item 3", "..."]
  },
  "commercial": {
    "estimatedBuildCost": "€X,XXX",
    "estimatedTimeline": "X weeks",
    "monthlySupportCost": "€XXX/month",
    "roi": "Expected ROI description",
    "paybackPeriod": "e.g. 3 months"
  },
  "risks": [
    {
      "risk": "Risk description",
      "likelihood": "low|medium|high",
      "impact": "low|medium|high",
      "mitigation": "How we mitigate this"
    }
  ],
  "fullBriefDocument": "# [Project Name]\\n\\nComplete, professional markdown brief document for client delivery. Include all sections: executive summary, what the agent does, technical approach (non-technical language), build plan, commercial terms, risks, next steps. Minimum 800 words. Professional tone."
}`

  const response = await createMessage({
    model: MODELS.ORCHESTRATOR,
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    effort: 'max',
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  try {
    return parseJSON<AgentBuildBrief>(extractText(response))
  } catch {
    const text = extractText(response)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in agent builder response')
    return JSON.parse(jsonMatch[0]) as AgentBuildBrief
  }
}
