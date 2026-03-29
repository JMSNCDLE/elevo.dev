'use client'
import createToolPage from '@/lib/tools/tool-page'
import { Linkedin, FileText, Users, MessageSquare, Calendar, Target } from 'lucide-react'
export default createToolPage({
  title: 'LinkedIn Client Generator',
  subtitle: 'Find and convert ideal clients on LinkedIn — 1 credit',
  apiPath: '/api/tools/linkedin-client',
  iconColor: 'bg-blue-700',
  cursorColor: 'bg-blue-400',
  icon: Linkedin,
  greeting: "I'm the ELEVO LinkedIn Client Generator — I build targeted LinkedIn outreach campaigns that convert connections into clients. Tell me about your business and target clients.",
  upgradeCopy: 'Upgrade to Orbit (€79/mo) to unlock the LinkedIn Client Generator.',
  quickActions: [
    { label: 'Full Campaign', prompt: 'Create a complete LinkedIn outreach campaign for my business. Include profile optimisation, connection requests, content plan, and DM sequences.', icon: FileText },
    { label: 'Profile Optimise', prompt: 'Optimise my LinkedIn profile for client attraction: headline, about section, featured section recommendations.', icon: Users },
    { label: 'Connection Messages', prompt: 'Write 20 personalised connection request messages (under 300 chars each) sorted by approach type.', icon: MessageSquare },
    { label: '30-Day Content', prompt: 'Create a 30-day LinkedIn posting calendar with daily topics, hooks, and post formats.', icon: Calendar },
    { label: 'DM Sequences', prompt: 'Write 3-step DM follow-up sequences (connect → value → pitch) with 5 variations each.', icon: Target },
  ],
})
