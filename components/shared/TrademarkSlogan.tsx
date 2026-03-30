'use client'

export default function TrademarkSlogan({ className = '' }: { className?: string }) {
  return (
    <p
      className={`font-black text-xl md:text-2xl select-none pointer-events-none trademark-protected ${className}`}
      data-protected
      style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}
      onCopy={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      draggable={false}
      aria-label="ELEVO AI trademarked slogan"
    >
      <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
        You can&apos;t afford not to.
      </span>
      <sup className="text-[10px] text-gray-400 ml-0.5">™</sup>
    </p>
  )
}
