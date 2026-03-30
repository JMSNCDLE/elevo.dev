'use client'

import { useEffect } from 'react'

export default function CopyrightProtection({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-protected]') || target.closest('.trademark-protected')) {
        e.preventDefault()
      }
    }

    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection()
      if (!selection) return
      const anchorNode = selection.anchorNode
      if (!anchorNode) return
      const el = anchorNode instanceof HTMLElement ? anchorNode : anchorNode.parentElement
      if (el?.closest('[data-protected]') || el?.closest('.trademark-protected')) {
        e.preventDefault()
        e.clipboardData?.setData('text/plain', '© ELEVO AI™ — Content protected by copyright.')
      }
    }

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-protected]') || target.closest('.trademark-protected')) {
        e.preventDefault()
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('dragstart', handleDragStart)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('dragstart', handleDragStart)
    }
  }, [])

  return <>{children}</>
}
