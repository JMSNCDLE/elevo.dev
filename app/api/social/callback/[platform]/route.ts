import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  exchangeInstagramCode,
  exchangeFacebookCode,
  exchangeLinkedInCode,
  exchangeTwitterCode,
  exchangeTikTokCode,
  exchangeGoogleCode,
  type SocialPlatform,
} from '@/lib/social/oauth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/en/social?error=oauth_denied`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${baseUrl}/en/login`)
  }

  try {
    let accountData: {
      platform_user_id: string
      platform_username?: string
      page_id?: string
      page_name?: string
      access_token: string
      refresh_token?: string
    }

    switch (platform as SocialPlatform) {
      case 'instagram': {
        const r = await exchangeInstagramCode(code)
        accountData = {
          platform_user_id: r.userId,
          page_id: r.pageId,
          page_name: r.pageName,
          access_token: r.accessToken,
        }
        break
      }
      case 'facebook': {
        const r = await exchangeFacebookCode(code)
        accountData = {
          platform_user_id: r.pageId,
          platform_username: r.pageName,
          page_id: r.pageId,
          page_name: r.pageName,
          access_token: r.accessToken,
        }
        break
      }
      case 'linkedin': {
        const r = await exchangeLinkedInCode(code)
        accountData = {
          platform_user_id: r.authorId,
          platform_username: r.name,
          access_token: r.accessToken,
        }
        break
      }
      case 'twitter': {
        const r = await exchangeTwitterCode(code)
        accountData = {
          platform_user_id: r.userId,
          platform_username: r.username,
          access_token: r.accessToken,
        }
        break
      }
      case 'tiktok': {
        const r = await exchangeTikTokCode(code)
        accountData = {
          platform_user_id: r.userId,
          platform_username: r.displayName,
          access_token: r.accessToken,
        }
        break
      }
      case 'google': {
        const r = await exchangeGoogleCode(code)
        accountData = {
          platform_user_id: r.userId,
          platform_username: r.name,
          access_token: r.accessToken,
          refresh_token: r.refreshToken,
        }
        break
      }
      default:
        return NextResponse.redirect(`${baseUrl}/en/social?error=invalid_platform`)
    }

    // Get the user's primary business profile
    const { data: bp } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()

    await supabase.from('social_accounts').upsert(
      {
        user_id: user.id,
        business_profile_id: bp?.id,
        platform,
        ...accountData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,platform,platform_user_id' }
    )

    // Detect locale from state param
    const state = searchParams.get('state') ?? ''
    const locale = state.includes('es') ? 'es' : 'en'

    return NextResponse.redirect(`${baseUrl}/${locale}/social?connected=${platform}`)
  } catch (err) {
    console.error('[social/callback]', err)
    return NextResponse.redirect(`${baseUrl}/en/social?error=oauth_failed`)
  }
}
