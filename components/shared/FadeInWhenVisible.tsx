'use client'
import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

export function FadeInWhenVisible({
  children,
  className = '',
  delay = 0,
  y = 20,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.12 })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  if (isMobile) {
    return (
      <div
        ref={ref}
        className={`${className} ${isInView ? 'animate-fade-in' : 'opacity-0'}`}
        style={{ animationDelay: `${delay}s` }}
      >
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        transformOrigin: 'center center',
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
      }}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  )
}
