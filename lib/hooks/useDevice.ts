'use client'
import { useState, useEffect } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'
export type OS = 'ios' | 'android' | 'macos' | 'windows' | 'linux' | 'unknown'
export type Browser = 'chrome' | 'safari' | 'firefox' | 'edge' | 'unknown'

export interface DeviceInfo {
  type: DeviceType
  os: OS
  browser: Browser
  screenWidth: number
  screenHeight: number
  isTouchDevice: boolean
  isRetina: boolean
  connectionSpeed: 'slow' | 'medium' | 'fast' | 'unknown'
}

export function useDevice(): DeviceInfo {
  const [device, setDevice] = useState<DeviceInfo>({
    type: 'desktop',
    os: 'unknown',
    browser: 'unknown',
    screenWidth: 1440,
    screenHeight: 900,
    isTouchDevice: false,
    isRetina: false,
    connectionSpeed: 'unknown',
  })

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    const width = window.innerWidth
    const type: DeviceType = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop'
    const os: OS = /iphone|ipad|ipod/.test(ua) ? 'ios'
      : /android/.test(ua) ? 'android'
      : /mac/.test(ua) ? 'macos'
      : /win/.test(ua) ? 'windows'
      : /linux/.test(ua) ? 'linux' : 'unknown'
    const browser: Browser = /chrome/.test(ua) && !/edge/.test(ua) ? 'chrome'
      : /safari/.test(ua) && !/chrome/.test(ua) ? 'safari'
      : /firefox/.test(ua) ? 'firefox'
      : /edge/.test(ua) ? 'edge' : 'unknown'
    const connection = (navigator as any).connection
    const speed = connection
      ? connection.effectiveType === '4g' ? 'fast'
        : connection.effectiveType === '3g' ? 'medium' : 'slow'
      : 'unknown'
    setDevice({
      type,
      os,
      browser,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      isTouchDevice: 'ontouchstart' in window,
      isRetina: window.devicePixelRatio > 1,
      connectionSpeed: speed,
    })
    const handleResize = () => setDevice(d => ({
      ...d,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
    }))
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return device
}
