export type AnalyticsEventType =
  | 'page_view' | 'session_start' | 'session_end'
  | 'content_generated' | 'roas_viewed' | 'problem_solved'
  | 'contact_added' | 'review_requested' | 'campaign_sent'
  | 'upgrade_clicked' | 'feature_used' | 'agent_chat'

export async function trackEvent(params: {
  businessProfileId?: string
  eventType: AnalyticsEventType
  page?: string
  agentName?: string
  feature?: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessProfileId: params.businessProfileId,
        eventType: params.eventType,
        page: params.page,
        agentName: params.agentName,
        feature: params.feature,
        metadata: params.metadata ?? {},
      }),
    })
  } catch {
    // Fire-and-forget — never block UI
  }
}

export interface AnalyticsSummary {
  totalRevenue: number
  revenueChange: number
  totalJobs: number
  jobsChange: number
  newCustomers: number
  customersChange: number
  avgJobValue: number
  avgJobValueChange: number
  contentPublished: number
  reviewsReceived: number
  topAgentsUsed: Array<{ agentName: string; uses: number }>
  revenueByDay: Array<{ date: string; revenue: number; jobs: number }>
  topFeatures: Array<{ feature: string; count: number }>
}

export interface AdPerformanceSummary {
  totalSpend: number
  totalRevenue: number
  overallROAS: number
  totalImpressions: number
  totalClicks: number
  avgCPM: number
  avgCPC: number
  avgCTR: number
  totalConversions: number
  byPlatform: Array<{
    platform: string
    spend: number
    revenue: number
    roas: number
    impressions: number
    cpm: number
    ctr: number
  }>
  performanceByDay: Array<{
    date: string
    spend: number
    revenue: number
    roas: number
    impressions: number
  }>
}
