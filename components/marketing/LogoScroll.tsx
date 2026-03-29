'use client'

const LOGOS = ['Google', 'Meta', 'TikTok', 'Stripe', 'Instagram', 'LinkedIn', 'WhatsApp', 'YouTube', 'Trustpilot', 'Apple Pay']

export function LogoScroll() {
  return (
    <div className="overflow-hidden py-6 relative">
      {/* fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white z-10 pointer-events-none" />
      <div
        style={{
          display: 'flex',
          gap: '3rem',
          animation: 'logoScroll 30s linear infinite',
          width: 'max-content',
        }}
      >
        {[...LOGOS, ...LOGOS].map((logo, i) => (
          <div
            key={i}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#f8f7f4',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#6b7280',
              whiteSpace: 'nowrap',
            }}
          >
            {logo}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes logoScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
