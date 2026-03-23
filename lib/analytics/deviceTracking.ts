import { createBrowserClient } from '@/lib/supabase/client'
import type { DeviceInfo } from '@/lib/hooks/useDevice'

export async function trackDeviceInfo(userId: string, device: DeviceInfo): Promise<void> {
  try {
    const supabase = createBrowserClient()
    await supabase
      .from('user_sessions')
      .update({
        device_type: device.type,
        os: device.os,
        browser: device.browser,
        screen_width: device.screenWidth,
      })
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(1)
  } catch {
    // fire and forget, never throw
  }
}
