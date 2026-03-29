'use client'

import { useState } from 'react'
import { Search, Plug, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface Integration {
  name: string
  category: string
  description: string
  color: string
  initials: string
  available: boolean
}

const CATEGORIES = [
  'All',
  'Communication',
  'Social Media',
  'CRM',
  'Email',
  'Payments',
  'Productivity',
  'Analytics',
  'Storage',
] as const

const INTEGRATIONS: Integration[] = [
  // Communication
  { name: 'WhatsApp Business', category: 'Communication', description: 'Send automated messages and notifications via WhatsApp', color: '#25D366', initials: 'WA', available: false },
  { name: 'Slack', category: 'Communication', description: 'Get ELEVO notifications and alerts in your Slack workspace', color: '#4A154B', initials: 'SL', available: false },
  { name: 'Microsoft Teams', category: 'Communication', description: 'Connect Teams for notifications and collaboration', color: '#6264A7', initials: 'MT', available: false },
  { name: 'Discord', category: 'Communication', description: 'Send alerts and updates to your Discord server', color: '#5865F2', initials: 'DC', available: false },

  // Social Media
  { name: 'Instagram', category: 'Social Media', description: 'Auto-post content and manage DMs from ELEVO', color: '#E4405F', initials: 'IG', available: false },
  { name: 'Facebook', category: 'Social Media', description: 'Publish posts and manage your Facebook page', color: '#1877F2', initials: 'FB', available: false },
  { name: 'TikTok', category: 'Social Media', description: 'Schedule and publish TikTok content', color: '#000000', initials: 'TK', available: false },
  { name: 'LinkedIn', category: 'Social Media', description: 'Share professional content to your LinkedIn profile', color: '#0A66C2', initials: 'LI', available: false },
  { name: 'X / Twitter', category: 'Social Media', description: 'Post tweets and monitor mentions', color: '#1DA1F2', initials: 'X', available: false },

  // CRM
  { name: 'HubSpot', category: 'CRM', description: 'Sync contacts and deals between ELEVO and HubSpot', color: '#FF7A59', initials: 'HS', available: false },
  { name: 'Salesforce', category: 'CRM', description: 'Two-way sync with Salesforce CRM', color: '#00A1E0', initials: 'SF', available: false },
  { name: 'Zoho CRM', category: 'CRM', description: 'Connect your Zoho CRM for contact sync', color: '#E42527', initials: 'ZO', available: false },

  // Email
  { name: 'Gmail', category: 'Email', description: 'Send emails and track opens from your Gmail account', color: '#EA4335', initials: 'GM', available: false },
  { name: 'Outlook', category: 'Email', description: 'Connect Microsoft Outlook for email campaigns', color: '#0078D4', initials: 'OL', available: false },
  { name: 'Mailchimp', category: 'Email', description: 'Sync contacts and campaigns with Mailchimp', color: '#FFE01B', initials: 'MC', available: false },
  { name: 'SendGrid', category: 'Email', description: 'Transactional and marketing email via SendGrid', color: '#1A82E2', initials: 'SG', available: false },

  // Payments
  { name: 'Stripe', category: 'Payments', description: 'Already connected — powers ELEVO billing', color: '#635BFF', initials: 'ST', available: true },
  { name: 'PayPal', category: 'Payments', description: 'Accept PayPal payments from your customers', color: '#003087', initials: 'PP', available: false },
  { name: 'Square', category: 'Payments', description: 'Sync Square POS data and transactions', color: '#006AFF', initials: 'SQ', available: false },

  // Productivity
  { name: 'Google Workspace', category: 'Productivity', description: 'Connect Calendar, Drive, and Docs', color: '#4285F4', initials: 'GW', available: false },
  { name: 'Notion', category: 'Productivity', description: 'Sync tasks and documents with Notion', color: '#000000', initials: 'NO', available: false },
  { name: 'Trello', category: 'Productivity', description: 'Create Trello cards from ELEVO tasks', color: '#0079BF', initials: 'TR', available: false },
  { name: 'Asana', category: 'Productivity', description: 'Sync projects and tasks with Asana', color: '#F06A6A', initials: 'AS', available: false },
  { name: 'Calendly', category: 'Productivity', description: 'Embed scheduling and sync bookings', color: '#006BFF', initials: 'CA', available: false },

  // Analytics
  { name: 'Google Analytics', category: 'Analytics', description: 'Import website analytics into ELEVO dashboard', color: '#E37400', initials: 'GA', available: false },
  { name: 'Meta Pixel', category: 'Analytics', description: 'Track conversions from Meta ads', color: '#1877F2', initials: 'MP', available: false },
  { name: 'Google Search Console', category: 'Analytics', description: 'Import search performance data', color: '#4285F4', initials: 'SC', available: false },

  // Storage
  { name: 'Google Drive', category: 'Storage', description: 'Save and access files from Google Drive', color: '#0F9D58', initials: 'GD', available: false },
  { name: 'Dropbox', category: 'Storage', description: 'Sync files and exports to Dropbox', color: '#0061FF', initials: 'DB', available: false },
  { name: 'OneDrive', category: 'Storage', description: 'Connect Microsoft OneDrive for file storage', color: '#0078D4', initials: 'OD', available: false },
]

export default function IntegrationsPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = INTEGRATIONS.filter(i => {
    const matchesSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'All' || i.category === activeCategory
    return matchesSearch && matchesCategory
  })

  function handleConnect(integration: Integration) {
    if (integration.available && integration.name === 'Stripe') {
      toast.success('Stripe is already connected and powers your billing.')
      return
    }
    toast(`${integration.name} integration coming soon! We'll notify you when it's ready.`, { icon: '🔔' })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Plug className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Integrations</h1>
          <p className="text-sm text-dashMuted">Connect your favourite tools to ELEVO AI</p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dashMuted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search integrations…"
            className="w-full bg-dashCard border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-dashCard text-dashMuted hover:text-white border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-dashMuted mb-4">{filtered.length} integration{filtered.length !== 1 ? 's' : ''}</p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(integration => (
          <div
            key={integration.name}
            className="bg-dashCard border border-white/5 rounded-xl p-5 flex flex-col hover:border-white/10 transition-colors group"
          >
            <div className="flex items-start gap-3 mb-3">
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: integration.color }}
              >
                {integration.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white truncate">{integration.name}</h3>
                  {integration.available && (
                    <span className="text-[10px] font-medium text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-full">
                      Connected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-indigo-400">{integration.category}</p>
              </div>
            </div>

            <p className="text-xs text-dashMuted leading-relaxed mb-4 flex-1">
              {integration.description}
            </p>

            <button
              onClick={() => handleConnect(integration)}
              className={`w-full py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                integration.available
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-white/5 text-dashMuted hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {integration.available ? (
                <>Connected</>
              ) : (
                <>
                  <ExternalLink className="w-3 h-3" />
                  Connect
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Plug className="w-12 h-12 text-dashMuted mx-auto mb-4" />
          <p className="text-dashMuted text-sm">No integrations match your search.</p>
        </div>
      )}
    </div>
  )
}
