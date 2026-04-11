import AgentLandingPage from '@/components/dashboard/AgentLandingPage'
import { AGENT_LANDING } from '@/lib/agent-landing-data'

export const metadata = {
  title: 'guide — ELEVO AI™',
}

export default function Page() {
  return <AgentLandingPage {...AGENT_LANDING['guide']} />
}
