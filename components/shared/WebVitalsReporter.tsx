'use client'

import { useEffect } from 'react'
import { initWebVitals } from '@/lib/analytics/web-vitals'

export default function WebVitalsReporter() {
  useEffect(() => {
    initWebVitals()
  }, [])

  return null
}
