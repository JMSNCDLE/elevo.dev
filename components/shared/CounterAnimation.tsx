'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

interface CounterAnimationProps {
  end: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
  decimals?: number
}

export default function CounterAnimation({
  end,
  prefix = '',
  suffix = '',
  duration = 2000,
  className,
  decimals = 0,
}: CounterAnimationProps) {
  const [displayValue, setDisplayValue] = useState('0')
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true

    const startTime = performance.now()

    function cubicOut(t: number): number {
      return 1 - Math.pow(1 - t, 3)
    }

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = cubicOut(progress)
      const current = easedProgress * end

      setDisplayValue(current.toFixed(decimals))

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(end.toFixed(decimals))
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, end, duration, decimals])

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  )
}
