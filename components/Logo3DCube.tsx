'use client'

import Image from 'next/image'

interface Logo3DCubeProps {
  size?: number
  className?: string
}

export default function Logo3DCube({ size = 220, className = '' }: Logo3DCubeProps) {
  const half = size / 2

  const faceStyle = (transform: string): React.CSSProperties => ({
    position: 'absolute',
    width: size,
    height: size,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform,
  })

  return (
    <div
      className={`logo-3d-scene ${className}`}
      style={{ width: size, height: size, perspective: '800px', position: 'relative' }}
    >
      <div
        className="logo-3d-cube"
        style={{
          width: size,
          height: size,
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front */}
        <div className="logo-3d-face" style={faceStyle(`translateZ(${half}px)`)}>
          <Image src="/logo.png" alt="ELEVO AI" width={size} height={size} quality={100} className="object-contain" priority />
        </div>
        {/* Back */}
        <div className="logo-3d-face" style={faceStyle(`rotateY(180deg) translateZ(${half}px)`)}>
          <Image src="/logo.png" alt="ELEVO AI" width={size} height={size} quality={100} className="object-contain" />
        </div>
        {/* Right */}
        <div className="logo-3d-face" style={faceStyle(`rotateY(90deg) translateZ(${half}px)`)}>
          <Image src="/logo.png" alt="ELEVO AI" width={size} height={size} quality={100} className="object-contain" />
        </div>
        {/* Left */}
        <div className="logo-3d-face" style={faceStyle(`rotateY(-90deg) translateZ(${half}px)`)}>
          <Image src="/logo.png" alt="ELEVO AI" width={size} height={size} quality={100} className="object-contain" />
        </div>
        {/* Top */}
        <div className="logo-3d-face" style={faceStyle(`rotateX(90deg) translateZ(${half}px)`)}>
          <Image src="/logo.png" alt="ELEVO AI" width={size} height={size} quality={100} className="object-contain" />
        </div>
        {/* Bottom */}
        <div className="logo-3d-face" style={faceStyle(`rotateX(-90deg) translateZ(${half}px)`)}>
          <Image src="/logo.png" alt="ELEVO AI" width={size} height={size} quality={100} className="object-contain" />
        </div>
      </div>
    </div>
  )
}
