'use client'

import { motion, type Variants } from 'framer-motion'
import { fadeUp, viewportOnce } from '@/lib/animations'

interface ScrollRevealProps {
  children: React.ReactNode
  variants?: Variants
  delay?: number
  className?: string
  once?: boolean
}

export default function ScrollReveal({
  children,
  variants = fadeUp,
  delay = 0,
  className,
  once = true,
}: ScrollRevealProps) {
  const customVariants: Variants = delay
    ? {
        hidden: variants.hidden ?? {},
        visible: {
          ...(typeof variants.visible === 'object' && !('opacity' in (variants.visible as object))
            ? {}
            : (variants.visible as object)),
          transition: {
            ...(typeof variants.visible === 'object' &&
            'transition' in (variants.visible as object)
              ? (variants.visible as { transition: object }).transition
              : {}),
            delay,
          },
        },
      }
    : variants

  return (
    <motion.div
      className={className}
      variants={customVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-80px' }}
    >
      {children}
    </motion.div>
  )
}
