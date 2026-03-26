'use client'

import createToolPage from '@/lib/tools/tool-page'
import { UserPlus, Mail, Calendar, FileText, ClipboardList, Clock } from 'lucide-react'

export default createToolPage({
  title: 'Client Onboarding Kit',
  subtitle: 'Generate complete onboarding packages — 1 credit per query',
  apiPath: '/api/tools/onboarding-kit',
  iconColor: 'bg-teal-600',
  cursorColor: 'bg-teal-400',
  icon: UserPlus,
  greeting: "I'm the ELEVO Client Onboarding Kit — I create complete client onboarding packages that set projects up for success. Tell me about your new client and I'll generate a welcome email, kickoff agenda, questionnaire, timeline, and expectations document. Who are we onboarding?",
  upgradeCopy: 'Upgrade to Orbit (€79/mo) to unlock the Client Onboarding Kit — generate complete onboarding packages with welcome emails, kickoff agendas, questionnaires, and timelines.',
  quickActions: [
    { label: 'Full Kit', prompt: 'Create a complete client onboarding kit. I\'ll tell you about the client and you generate everything: welcome email, kickoff agenda, questionnaire, timeline, and expectations document.', icon: FileText },
    { label: 'Welcome Email', prompt: 'Write a warm, personal welcome email for a new client. Tone: excited, professional, and genuinely happy to work with them.', icon: Mail },
    { label: 'Kickoff Agenda', prompt: 'Create a 60-minute project kickoff meeting agenda with talking points for each section.', icon: Calendar },
    { label: 'Questionnaire', prompt: 'Generate a smart client questionnaire (10-15 questions) tailored to my business type to deeply understand their needs.', icon: ClipboardList },
    { label: '90-Day Timeline', prompt: 'Build a 90-day timeline with milestones for a new client project. Week-by-week breakdown with deliverables and checkpoints.', icon: Clock },
    { label: 'Expectations Doc', prompt: 'Create an expectations document covering: communication cadence, deliverables schedule, revision policy, escalation process, and response times.', icon: FileText },
  ],
})
