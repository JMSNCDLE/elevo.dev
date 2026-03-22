// ─── Social Media Publisher ────────────────────────────────────────────────────
// Handles actual API calls to post content to each platform.

// ─── Instagram ────────────────────────────────────────────────────────────────

export async function publishToInstagram(params: {
  accessToken: string
  igUserId: string
  caption: string
  mediaUrl?: string
  mediaType: 'IMAGE' | 'VIDEO' | 'REELS'
}): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const { accessToken, igUserId, caption, mediaUrl, mediaType } = params
    const base = `https://graph.facebook.com/v19.0`

    // Step 1: Create media container
    const containerBody: Record<string, string> = { caption, access_token: accessToken }
    if (mediaUrl) {
      if (mediaType === 'VIDEO' || mediaType === 'REELS') {
        containerBody.video_url = mediaUrl
        containerBody.media_type = mediaType
      } else {
        containerBody.image_url = mediaUrl
      }
    } else {
      // Text-only not supported on IG — use a placeholder image approach
      containerBody.image_url = 'https://placehold.co/1080x1080/141B24/6366F1.png'
    }

    const containerRes = await fetch(`${base}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(containerBody),
    })
    const container = await containerRes.json()
    if (!containerRes.ok || !container.id) {
      return { success: false, error: container.error?.message ?? 'Container creation failed' }
    }

    // Step 2: Publish container
    const publishRes = await fetch(`${base}/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: container.id, access_token: accessToken }),
    })
    const published = await publishRes.json()
    if (!publishRes.ok || !published.id) {
      return { success: false, error: published.error?.message ?? 'Publish failed' }
    }

    return { success: true, postId: published.id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ─── Facebook ─────────────────────────────────────────────────────────────────

export async function publishToFacebook(params: {
  accessToken: string
  pageId: string
  message: string
  mediaUrl?: string
}): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const { accessToken, pageId, message, mediaUrl } = params
    const base = `https://graph.facebook.com/v19.0`

    let endpoint = `${base}/${pageId}/feed`
    const body: Record<string, string> = { message, access_token: accessToken }

    if (mediaUrl) {
      endpoint = `${base}/${pageId}/photos`
      body.url = mediaUrl
      body.caption = message
      delete body.message
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok || !data.id) {
      return { success: false, error: data.error?.message ?? 'Post failed' }
    }

    return { success: true, postId: data.id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ─── LinkedIn ─────────────────────────────────────────────────────────────────

export async function publishToLinkedIn(params: {
  accessToken: string
  authorId: string
  text: string
  mediaUrl?: string
}): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const { accessToken, authorId, text, mediaUrl } = params

    const postBody: Record<string, unknown> = {
      author: `urn:li:person:${authorId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: mediaUrl ? 'IMAGE' : 'NONE',
          ...(mediaUrl && {
            media: [
              {
                status: 'READY',
                description: { text },
                media: mediaUrl,
                title: { text: text.slice(0, 60) },
              },
            ],
          }),
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }

    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postBody),
    })
    const data = await res.json()
    if (!res.ok) {
      return { success: false, error: data.message ?? 'LinkedIn post failed' }
    }

    return { success: true, postId: data.id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ─── Twitter / X ──────────────────────────────────────────────────────────────

export async function publishToTwitter(params: {
  accessToken: string
  accessSecret: string
  text: string
}): Promise<{ success: boolean; tweetId?: string; error?: string }> {
  try {
    const { accessToken, text } = params

    // Using Twitter API v2 with OAuth 2.0 bearer
    const res = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })
    const data = await res.json()
    if (!res.ok || !data.data?.id) {
      return { success: false, error: data.detail ?? data.title ?? 'Tweet failed' }
    }

    return { success: true, tweetId: data.data.id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ─── Google Business Profile ──────────────────────────────────────────────────

export async function publishToGoogleBusiness(params: {
  accessToken: string
  locationId: string
  summary: string
  mediaUrl?: string
  callToAction?: { actionType: string; url: string }
}): Promise<{ success: boolean; postName?: string; error?: string }> {
  try {
    const { accessToken, locationId, summary, mediaUrl, callToAction } = params

    const postBody: Record<string, unknown> = { summary }
    if (mediaUrl) {
      postBody.media = [{ mediaFormat: 'PHOTO', sourceUrl: mediaUrl }]
    }
    if (callToAction) {
      postBody.callToAction = {
        actionType: callToAction.actionType,
        url: callToAction.url,
      }
    }

    const res = await fetch(
      `https://mybusiness.googleapis.com/v4/accounts/-/locations/${locationId}/localPosts`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postBody),
      }
    )
    const data = await res.json()
    if (!res.ok || !data.name) {
      return { success: false, error: data.error?.message ?? 'GBP post failed' }
    }

    return { success: true, postName: data.name }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
