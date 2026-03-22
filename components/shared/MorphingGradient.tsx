'use client'

import { motion } from 'framer-motion'

export default function MorphingGradient() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Blob 1 — indigo/violet */}
      <motion.div
        className="absolute rounded-full blur-3xl opacity-30"
        style={{
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle, #818cf8 0%, #6366f1 50%, transparent 100%)',
          top: '-10%',
          left: '-10%',
        }}
        animate={{
          x: [0, 80, -40, 0],
          y: [0, 60, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
      />

      {/* Blob 2 — purple/violet */}
      <motion.div
        className="absolute rounded-full blur-3xl opacity-25"
        style={{
          width: '50%',
          height: '50%',
          background: 'radial-gradient(circle, #a78bfa 0%, #7c3aed 50%, transparent 100%)',
          bottom: '-15%',
          right: '-5%',
        }}
        animate={{
          x: [0, -60, 30, 0],
          y: [0, -50, 40, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}
