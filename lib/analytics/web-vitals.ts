import type { Metric } from 'web-vitals'

function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown'
  return window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
}

function sendMetric(metric: Metric) {
  const body = JSON.stringify({
    url: window.location.pathname,
    metric_name: metric.name,
    metric_value: Math.round(metric.value * 1000) / 1000,
    rating: metric.rating,
    device_type: getDeviceType(),
  })

  // Use sendBeacon for reliability (fires even on page unload)
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/web-vitals', body)
  } else {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {})
  }
}

export function initWebVitals() {
  if (typeof window === 'undefined') return

  import('web-vitals').then(({ onLCP, onCLS, onTTFB, onINP }) => {
    onLCP(sendMetric)
    onCLS(sendMetric)
    onTTFB(sendMetric)
    onINP(sendMetric)
  })
}
