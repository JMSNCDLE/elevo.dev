'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function ConfirmPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [resentError, setResentError] = useState('')

  // Detect email provider for smart buttons
  const isGmail = email.includes('@gmail')
  const isOutlook = email.includes('@outlook') || email.includes('@hotmail') || email.includes('@live') || email.includes('@msn')

  const handleResend = async () => {
    setResending(true)
    setResentError('')
    try {
      const res = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        setResentError(data.error ?? 'Failed to resend. Please try again.')
      } else {
        setResent(true)
      }
    } catch {
      setResentError('Network error. Please try again.')
    }
    setResending(false)
  }

  return (
    <div className="min-h-screen bg-[#FFFEF9] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 px-8 py-10 text-center">
          {/* Animated envelope */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center animate-envelope">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#0D0F1A] mb-2">Check your inbox</h1>

          {email ? (
            <p className="text-gray-500 text-sm mb-1">
              We sent a confirmation link to
            </p>
          ) : (
            <p className="text-gray-500 text-sm mb-1">
              We sent a confirmation link to your email address.
            </p>
          )}
          {email && (
            <p className="font-semibold text-indigo-600 text-sm mb-4 break-all">{email}</p>
          )}

          <p className="text-gray-500 text-sm mb-7">
            Click the link to activate your account and start your free trial.
          </p>

          {/* Smart email buttons */}
          <div className="space-y-2.5">
            {isGmail && (
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 h-11 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Open Gmail →
              </a>
            )}

            {isOutlook && (
              <a
                href="https://outlook.live.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 h-11 bg-[#0078d4] text-white rounded-xl text-sm font-medium hover:bg-[#106ebe] transition-colors"
              >
                Open Outlook →
              </a>
            )}

            <a
              href={email ? `mailto:${email}` : 'mailto:'}
              className="w-full flex items-center justify-center gap-2 h-11 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Open Mail App
            </a>
          </div>

          {/* Resend */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-3">
              Didn&apos;t receive it? Check your spam folder first.
            </p>
            {resent ? (
              <p className="text-xs text-emerald-600 font-medium">Email resent! Check your inbox.</p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending || !email}
                className="text-xs text-indigo-600 hover:underline disabled:opacity-50 flex items-center gap-1 mx-auto"
              >
                {resending && <Loader2 size={12} className="animate-spin" />}
                Resend confirmation email →
              </button>
            )}
            {resentError && (
              <p className="text-xs text-red-500 mt-2">{resentError}</p>
            )}
          </div>
        </div>

        {/* Footer hints */}
        <div className="mt-5 text-center space-y-1">
          <p className="text-xs text-gray-400">Email sent from hello@elevo.ai — add to contacts</p>
          <p className="text-xs text-gray-400">Email expires in 24 hours</p>
          <p className="mt-3 text-xs text-gray-300">SSL encrypted · GDPR compliant · ™ ELEVO AI</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes envelope {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-4px) rotate(-1deg); }
          75% { transform: translateY(-4px) rotate(1deg); }
        }
        .animate-envelope {
          animation: envelope 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
