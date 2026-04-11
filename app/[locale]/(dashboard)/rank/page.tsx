import AgentLandingPage from '@/components/dashboard/AgentLandingPage'
import { AGENT_LANDING } from '@/lib/agent-landing-data'

export const metadata = {
  title: 'rank — ELEVO AI™',
}

export default function Page() {
  return <AgentLandingPage {...AGENT_LANDING['rank']} />
}
