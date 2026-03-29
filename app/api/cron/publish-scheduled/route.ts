import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  publishToInstagram,
  publishToFacebook,
  publishToLinkedIn,
  publishToTwitter,
  publishToGoogleBusiness,
} from '@/lib/social/publisher'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  // Find all posts due for publishing
  const { data: posts } = await supabase
    .from('scheduled_posts')
    .select('*, social_accounts(*)')
    .eq('status', 'scheduled')
    .lte('scheduled_for', new Date().toISOString())
    .limit(50)

  if (!posts || posts.length === 0) {
    return NextResponse.json({ published: 0 })
  }

  let published = 0
  let failed = 0

  for (const post of posts) {
    const account = post.social_accounts as {
      platform: string
      access_token: string
      platform_user_id: string
      page_id?: string
    } | null

    if (!account) {
      await supabase
        .from('scheduled_posts')
        .update({ status: 'failed', error_message: 'No social account linked' })
        .eq('id', post.id)
      failed++
      continue
    }

    try {
      let result: { success: boolean; postId?: string; tweetId?: string; postName?: string; error?: string }

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
          result = { success: false, error: `Unsupported platform: ${account.platform}` }
      }

      const platformPostId = result.postId ?? result.tweetId ?? result.postName
      await supabase
        .from('scheduled_posts')
        .update({
          status: result.success ? 'published' : 'failed',
          published_at: result.success ? new Date().toISOString() : null,
          platform_post_id: platformPostId ?? null,
          error_message: result.error ?? null,
        })
        .eq('id', post.id)

      if (result.success) published++
      else failed++
    } catch (err) {
      await supabase
        .from('scheduled_posts')
        .update({ status: 'failed', error_message: String(err) })
        .eq('id', post.id)
      failed++
    }
  }

  return NextResponse.json({ published, failed, total: posts.length })
}
