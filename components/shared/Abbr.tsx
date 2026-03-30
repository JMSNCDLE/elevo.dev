'use client'

import { useState } from 'react'

const DEFINITIONS: Record<string, string> = {
  GBP: 'Google Business Profile',
  CTR: 'Click-Through Rate',
  CPA: 'Cost Per Acquisition',
  ROAS: 'Return On Ad Spend',
  CRM: 'Customer Relationship Management',
  SEO: 'Search Engine Optimization',
  ROI: 'Return On Investment',
  MRR: 'Monthly Recurring Revenue',
  'P&L': 'Profit & Loss',
  KPI: 'Key Performance Indicator',
  SWOT: 'Strengths, Weaknesses, Opportunities, Threats',
  GDPR: 'General Data Protection Regulation',
  API: 'Application Programming Interface',
  SMM: 'Social Media Management',
  DM: 'Direct Message',
  HR: 'Human Resources',
  AI: 'Artificial Intelligence',
  LTV: 'Lifetime Value',
  ARPU: 'Average Revenue Per User',
  ARR: 'Annual Recurring Revenue',
}

interface AbbrProps {
  term: string
  children?: React.ReactNode
}

export default function Abbr({ term, children }: AbbrProps) {
  const [show, setShow] = useState(false)
  const definition = DEFINITIONS[term]

  if (!definition) return <>{children ?? term}</>

  return (
    <span
      className="relative inline-block cursor-help border-b border-dotted border-current"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(v => !v)}
    >
      {children ?? term}
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap shadow-lg z-50 pointer-events-none">
          {definition}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  )
}

// Utility: wrap known acronyms in a text string
export function withTooltips(text: string): React.ReactNode {
  const pattern = /\b(GBP|CTR|CPA|ROAS|CRM|SEO|ROI|MRR|KPI|SWOT|GDPR|SMM)\b/g
  const parts = text.split(pattern)

  return parts.map((part, i) => {
    if (DEFINITIONS[part]) {
      return <Abbr key={i} term={part} />
    }
    return part
  })
}
