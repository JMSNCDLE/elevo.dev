// ─── Exponential Backoff Retry ───────────────────────────────────────────────
// Wraps any async function with automatic retry + jitter.
// Total time stays under 55s (Vercel Hobby 60s limit).

export interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
  retryableErrors?: number[]
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void
}

const DEFAULT_RETRYABLE = [429, 500, 502, 503, 529]

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 2,
    initialDelayMs = 1500,
    maxDelayMs = 10000,
    backoffMultiplier = 2,
    retryableErrors = DEFAULT_RETRYABLE,
    onRetry,
  } = options

  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: unknown) {
      lastError = error
      const err = error as { status?: number; statusCode?: number; message?: string; code?: string }
      const status = err?.status ?? err?.statusCode ?? 0
      const isRetryable = retryableErrors.includes(status) ||
        err?.message?.includes('overloaded') ||
        err?.message?.includes('timeout') ||
        err?.code === 'ECONNRESET' ||
        err?.code === 'ETIMEDOUT'

      if (!isRetryable || attempt === maxRetries) throw error

      const jitter = Math.random() * 500
      const delay = Math.min(initialDelayMs * Math.pow(backoffMultiplier, attempt) + jitter, maxDelayMs)

      if (onRetry) onRetry(attempt + 1, error, delay)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw lastError
}
