import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOAuthUrl, type SocialPlatform } from '@/lib/social/oauth'

const VALID_PLATFORMS: SocialPlatform[] = ['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok', 'google']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params

  if (!VALID_PLATFORMS.includes(platform as SocialPlatform)) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const state = `${user.id}:${platform}:${Date.now()}`
  const url = getOAuthUrl(platform as SocialPlatform, state)

  return NextResponse.redirect(url)
}
