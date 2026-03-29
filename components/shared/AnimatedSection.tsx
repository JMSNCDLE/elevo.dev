'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface AnimatedSectionProps {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'
  delay?: number
  className?: string
}

export default function AnimatedSection({
  children,
  direction = 'up',
  delay = 0,
  className,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const initial: Record<string, number> = { opacity: 0 }
  const animate: Record<string, number> = { opacity: isInView ? 1 : 0 }

  if (direction === 'up') {
    initial.y = 32
    animate.y = isInView ? 0 : 32
  } else if (direction === 'down') {
    initial.y = -32
    animate.y = isInView ? 0 : -32
  } else if (direction === 'left') {
    initial.x = 48
    animate.x = isInView ? 0 : 48
  } else if (direction === 'right') {
    initial.x = -48
    animate.x = isInView ? 0 : -48
  } else if (direction === 'scale') {
    initial.scale = 0.92
    animate.scale = isInView ? 1 : 0.92
  }
  // 'fade' — opacity only, already set above

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
