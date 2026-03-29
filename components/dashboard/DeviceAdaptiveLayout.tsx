'use client'
import { useEffect } from 'react'
import { useDevice } from '@/lib/hooks/useDevice'
import { trackDeviceInfo } from '@/lib/analytics/deviceTracking'

interface Props {
  children: React.ReactNode
  userId?: string
}

export default function DeviceAdaptiveLayout({ children, userId }: Props) {
  const device = useDevice()

  useEffect(() => {
    if (userId && device.type !== 'desktop') {
      trackDeviceInfo(userId, device).catch(() => {})
    }
  }, [userId, device.type])

  return (
    <div data-device={device.type} className="w-full h-full">
      {children}
    </div>
  )
}
