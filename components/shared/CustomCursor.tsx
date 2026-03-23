'use client'
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const springX = useSpring(cursorX, { stiffness: 500, damping: 28 })
  const springY = useSpring(cursorY, { stiffness: 500, damping: 28 })

  useEffect(() => {
    // Only on desktop pointer devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const onEnterHoverable = () => setIsHovering(true)
    const onLeaveHoverable = () => setIsHovering(false)

    const addHoverListeners = () => {
      const hoverTargets = document.querySelectorAll(
        'a, button, [data-cursor="hover"]'
      )
      hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', onEnterHoverable)
        el.addEventListener('mouseleave', onLeaveHoverable)
      })
      return hoverTargets
    }

    document.addEventListener('mousemove', onMove)
    let targets = addHoverListeners()
    document.body.style.cursor = 'none'

    // Re-run on DOM changes (for dynamic content)
    const observer = new MutationObserver(() => {
      targets.forEach(el => {
        el.removeEventListener('mouseenter', onEnterHoverable)
        el.removeEventListener('mouseleave', onLeaveHoverable)
      })
      targets = addHoverListeners()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('mousemove', onMove)
      targets.forEach(el => {
        el.removeEventListener('mouseenter', onEnterHoverable)
        el.removeEventListener('mouseleave', onLeaveHoverable)
      })
      observer.disconnect()
      document.body.style.cursor = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isVisible) return null

  return (
    <>
      {/* Inner dot */}
      <motion.div
        style={{ left: springX, top: springY, transform: 'translate(-50%, -50%)' }}
        className="fixed w-2 h-2 bg-[#6366F1] rounded-full pointer-events-none z-[99999]"
      />
      {/* Outer ring */}
      <motion.div
        style={{ left: springX, top: springY, transform: 'translate(-50%, -50%)' }}
        animate={{
          width: isHovering ? 32 : 0,
          height: isHovering ? 32 : 0,
          opacity: isHovering ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
        className="fixed border-2 border-[#6366F1] rounded-full pointer-events-none z-[99998]"
      />
    </>
  )
}
