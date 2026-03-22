'use client'

import { motion } from 'framer-motion'

interface StaggerChildrenProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

const containerVariants = {
  hidden: {},
  visible: (delay: number = 0) => ({
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1 + delay,
    },
  }),
}

export default function StaggerChildren({ children, className, delay = 0 }: StaggerChildrenProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  )
}
