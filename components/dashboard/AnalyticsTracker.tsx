'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'

interface AnalyticsTrackerProps {
  businessProfileId?: string
}

export default function AnalyticsTracker({ businessProfileId }: AnalyticsTrackerProps) {
  const pathname = usePathname()

  useEffect(() => {
    // Track session start on mount
    trackEvent({
      businessProfileId,
      eventType: 'session_start',
      page: pathname,
    })

    return () => {
      // Track session end on unmount
      trackEvent({
        businessProfileId,
        eventType: 'session_end',
        page: pathname,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Track page views on route changes
    trackEvent({
      businessProfileId,
      eventType: 'page_view',
      page: pathname,
    })
  }, [pathname, businessProfileId])

  return null
}
