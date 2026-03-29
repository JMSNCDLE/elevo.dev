import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Changelog — Latest Updates',
  description: 'See what is new in ELEVO AI. Latest features, improvements, and bug fixes.',
}

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return children
}
