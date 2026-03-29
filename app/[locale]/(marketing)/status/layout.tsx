import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'System Status',
  description: 'ELEVO AI system status. Real-time health of all services including API, database, payments, and AI agents.',
}

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children
}
