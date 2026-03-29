'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  text: string
  className?: string
  size?: 'sm' | 'md'
}

export default function CopyButton({ text, className = '', size = 'md' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const iconSize = size === 'sm' ? 13 : 15

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-sm transition-colors ${
        copied ? 'text-green-400' : 'text-dashMuted hover:text-dashText'
      } ${className}`}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? <Check size={iconSize} /> : <Copy size={iconSize} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
