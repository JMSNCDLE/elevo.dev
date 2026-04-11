'use client'

import dynamic from 'next/dynamic'

const CookieConsent = dynamic(() => import('@/components/shared/CookieConsent'), { ssr: false })
const ExitIntentPopup = dynamic(() => import('@/components/popups/ExitIntentPopup'), { ssr: false })
const ScrollTriggerPopup = dynamic(() => import('@/components/popups/ScrollTriggerPopup'), { ssr: false })
const FreeAuditPopup = dynamic(() => import('@/components/marketing/FreeAuditPopup'), { ssr: false })

export default function ClientPopups() {
  return (
    <>
      <CookieConsent />
      <ExitIntentPopup />
      <ScrollTriggerPopup />
      <FreeAuditPopup />
    </>
  )
}
