import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  publishToInstagram,
  publishToFacebook,
  publishToLinkedIn,
  publishToTwitter,
  publishToGoogleBusiness,
} from '@/lib/social/publisher'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { postId } = body as { postId: string }

  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })

  // Load the scheduled post
  const { data: post, error: postErr } = await supabase
    .from('scheduled_posts')
    .select('*, social_accounts(*)')
    .eq('id', postId)
    .eq('user_id', user.id)
    .single()

  if (postErr || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const account = post.social_accounts as {
    platform: string
    access_token: string
    platform_user_id: string
    page_id?: string
  }

  if (!account) {
    return NextResponse.json({ error: 'No social account linked to this post' }, { status: 400 })
  }

  let result: { success: boolean; postId?: string; tweetId?: string; postName?: string; error?: string }

  try {
    switch (account.platform) {
      case 'instagram':
        result = await publishToInstagram({
          accessToken: account.access_token,
          igUserId: account.platform_user_id,
          caption: post.content,
          mediaUrl: post.media_url ?? undefined,
          mediaType: (post.media_type as 'IMAGE' | 'VIDEO' | 'REELS') ?? 'IMAGE',
        })
        break
      case 'facebook':
        result = await publishToFacebook({
          accessToken: account.access_token,
          pageId: account.page_id ?? account.platform_user_id,
          message: post.content,
          mediaUrl: post.media_url ?? undefined,
        })
        break
      case 'linkedin':
        result = await publishToLinkedIn({
          accessToken: account.access_token,
          authorId: account.platform_user_id,
          text: post.content,
          mediaUrl: post.media_url ?? undefined,
        })
        break
      case 'twitter':
        result = await publishToTwitter({
          accessToken: account.access_token,
          accessSecret: '',
          text: post.content,
        })
        break
      case 'google':
        result = await publishToGoogleBusiness({
          accessToken: account.access_token,
          locationId: account.platform_user_id,
          summary: post.content,
          mediaUrl: post.media_url ?? undefined,
        })
        break
      default:
        return NextResponse.json({ error: `Unsupported platform: ${account.platform}` }, { status: 400 })
    }

    const platformPostId = result.postId ?? result.tweetId ?? result.postName
    const status = result.success ? 'published' : 'failed'

    await supabase
      .from('scheduled_posts')
      .update({
        status,
        published_at: result.success ? new Date().toISOString() : null,
        platform_post_id: platformPostId ?? null,
        error_message: result.error ?? null,
      })
      .eq('id', postId)

    return NextResponse.json({ success: result.success, error: result.error })
  } catch (err) {
    await supabase
      .from('scheduled_posts')
      .update({ status: 'failed', error_message: String(err) })
      .eq('id', postId)

    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
