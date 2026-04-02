'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, AlertTriangle, Clock } from 'lucide-react'

interface RetryBannerProps {
  error: string
  retryable: boolean
  retryAfterMs?: number
  onRetry: () => void
}

export default function RetryBanner({ error, retryable, retryAfterMs = 3000, onRetry }: RetryBannerProps) {
  const [countdown, setCountdown] = useState(Math.ceil(retryAfterMs / 1000))
  const [autoRetrying, setAutoRetrying] = useState(retryable)

  const handleRetry = useCallback(() => {
    setAutoRetrying(false)
    onRetry()
  }, [onRetry])

  useEffect(() => {
    if (!autoRetrying) return
    if (countdown <= 0) { handleRetry(); return }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, autoRetrying, handleRetry])

  return (
    <div className="mx-0 my-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm min-w-0">
        <AlertTriangle size={16} className="text-amber-400 shrink-0" />
        <span className="text-dashText truncate">{error}</span>
        {autoRetrying && (
          <span className="text-dashMuted flex items-center gap-1 shrink-0">
            <Clock size={12} /> {countdown}s...
          </span>
        )}
      </div>
      <button
        onClick={handleRetry}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent/80 transition-colors shrink-0"
      >
        <RefreshCw size={12} /> Retry
      </button>
    </div>
  )
}
