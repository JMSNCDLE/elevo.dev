import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Create and Boost Your Business Powered by AI'
  const subtitle = searchParams.get('subtitle') ?? '47+ AI agents that replace your entire team. From €39/month.'

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0f0a2e 0%, #1e1060 40%, #2d1b8e 70%, #3730a3 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Glow circles */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '60px 72px',
            height: '100%',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                background: '#6366f1',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 900,
                color: 'white',
              }}
            >
              E
            </div>
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
              ELEVO AI™
            </span>
          </div>

          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(99,102,241,0.2)',
                border: '1px solid rgba(99,102,241,0.4)',
                borderRadius: '100px',
                padding: '6px 16px',
                width: 'fit-content',
              }}
            >
              <span style={{ fontSize: '13px', color: '#a5b4fc', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                ELEVO AI™
              </span>
            </div>

            <h1
              style={{
                fontSize: title.length > 50 ? '52px' : '64px',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.08,
                letterSpacing: '-1.5px',
                margin: 0,
              }}
            >
              {title}
            </h1>

            <p
              style={{
                fontSize: '22px',
                color: 'rgba(165,180,252,0.85)',
                margin: 0,
                lineHeight: 1.4,
                fontWeight: 400,
              }}
            >
              {subtitle}
            </p>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', gap: '24px' }}>
              {['400+ businesses', '£1.2M saved', '47+ AI agents', '99.9% uptime'].map(stat => (
                <div key={stat} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', background: '#6366f1', borderRadius: '50%' }} />
                  <span style={{ fontSize: '14px', color: 'rgba(165,180,252,0.7)', fontWeight: 500 }}>{stat}</span>
                </div>
              ))}
            </div>
            <span style={{ fontSize: '16px', color: 'rgba(165,180,252,0.5)', fontWeight: 500 }}>
              elevo.dev
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
