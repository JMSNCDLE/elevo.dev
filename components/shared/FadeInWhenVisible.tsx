'use client'

export function FadeInWhenVisible({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
