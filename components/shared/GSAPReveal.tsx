'use client'

import { useRef, useEffect } from 'react'

interface GSAPRevealProps {
  children: React.ReactNode
  animation?: 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale' | 'rotate'
  delay?: number
  duration?: number
  className?: string
}

export function GSAPReveal({
  children,
  animation = 'slide-up',
  delay = 0,
  duration = 0.8,
  className = '',
}: GSAPRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!ref.current) return

    const el = ref.current
    let scrollTriggerInstance: { kill: () => void } | null = null

    void (async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const fromVars: Record<string, number> = { opacity: 0 }
      const toVars: Record<string, number | string> = {
        opacity: 1,
        duration,
        delay,
        ease: 'power3.out' as string,
      }

      switch (animation) {
        case 'slide-up':
          fromVars.y = 50
          toVars.y = 0
          break
        case 'slide-left':
          fromVars.x = 60
          toVars.x = 0
          break
        case 'slide-right':
          fromVars.x = -60
          toVars.x = 0
          break
        case 'scale':
          fromVars.scale = 0.85
          toVars.scale = 1
          break
        case 'rotate':
          fromVars.rotation = 8
          fromVars.y = 30
          toVars.rotation = 0
          toVars.y = 0
          break
        case 'fade':
        default:
          break
      }

      gsap.set(el, fromVars)

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(el, toVars)
        },
      })

      scrollTriggerInstance = st
    })()

    return () => {
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill()
      }
    }
  }, [animation, delay, duration])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
