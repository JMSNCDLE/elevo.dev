// ─── Social OAuth Helpers ─────────────────────────────────────────────────────
// Generates OAuth redirect URLs and exchanges codes for tokens.

export type SocialPlatform = 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'tiktok' | 'google'

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'
}

// ─── Instagram ────────────────────────────────────────────────────────────────

export function getInstagramOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID ?? '',
    redirect_uri: `${getBaseUrl()}/api/social/callback/instagram`,
    scope: 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement',
    response_type: 'code',
    state,
  })
  return `https://www.facebook.com/v19.0/dialog/oauth?${params}`
}

export async function exchangeInstagramCode(code: string): Promise<{
  accessToken: string
  userId: string
  pageId?: string
  pageName?: string
}> {
  const tokenRes = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.INSTAGRAM_APP_ID ?? '',
      client_secret: process.env.INSTAGRAM_APP_SECRET ?? '',
      redirect_uri: `${getBaseUrl()}/api/social/callback/instagram`,
      code,
    }),
  })
  const token = await tokenRes.json()
  if (!token.access_token) throw new Error(token.error?.message ?? 'Token exchange failed')

  // Get IG user ID linked to the page
  const pagesRes = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?access_token=${token.access_token}`
  )
  const pages = await pagesRes.json()
  const page = pages.data?.[0]

  if (!page) return { accessToken: token.access_token, userId: '' }

  const igRes = await fetch(
    `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
  )
  const igData = await igRes.json()
  const igUserId = igData.instagram_business_account?.id ?? ''

  return {
    accessToken: page.access_token,
    userId: igUserId,
    pageId: page.id,
    pageName: page.name,
  }
}

// ─── Facebook ─────────────────────────────────────────────────────────────────

export function getFacebookOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID ?? '',
    redirect_uri: `${getBaseUrl()}/api/social/callback/facebook`,
    scope: 'pages_manage_posts,pages_read_engagement,pages_show_list',
    response_type: 'code',
    state,
  })
  return `https://www.facebook.com/v19.0/dialog/oauth?${params}`
}

export async function exchangeFacebookCode(code: string): Promise<{
  accessToken: string
  pageId: string
  pageName: string
}> {
  const tokenRes = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID ?? '',
      client_secret: process.env.FACEBOOK_APP_SECRET ?? '',
      redirect_uri: `${getBaseUrl()}/api/social/callback/facebook`,
      code,
    }),
  })
  const token = await tokenRes.json()
  if (!token.access_token) throw new Error(token.error?.message ?? 'Token exchange failed')

  const pagesRes = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?access_token=${token.access_token}`
  )
  const pages = await pagesRes.json()
  const page = pages.data?.[0]
  if (!page) throw new Error('No Facebook pages found')

  return { accessToken: page.access_token, pageId: page.id, pageName: page.name }
}

// ─── LinkedIn ─────────────────────────────────────────────────────────────────

export function getLinkedInOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID ?? '',
    redirect_uri: `${getBaseUrl()}/api/social/callback/linkedin`,
    state,
    scope: 'openid profile w_member_social',
  })
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`
}

export async function exchangeLinkedInCode(code: string): Promise<{
  accessToken: string
  authorId: string
  name: string
}> {
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${getBaseUrl()}/api/social/callback/linkedin`,
      client_id: process.env.LINKEDIN_CLIENT_ID ?? '',
      client_secret: process.env.LINKEDIN_CLIENT_SECRET ?? '',
    }),
  })
  const token = await tokenRes.json()
  if (!token.access_token) throw new Error('LinkedIn token exchange failed')

  const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  })
  const profile = await profileRes.json()

  return {
    accessToken: token.access_token,
    authorId: profile.sub,
    name: profile.name ?? '',
  }
}

// ─── Twitter / X ──────────────────────────────────────────────────────────────

export function getTwitterOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.TWITTER_API_KEY ?? '',
    redirect_uri: `${getBaseUrl()}/api/social/callback/twitter`,
    scope: 'tweet.read tweet.write users.read offline.access',
    state,
    code_challenge: 'challenge',
    code_challenge_method: 'plain',
  })
  return `https://twitter.com/i/oauth2/authorize?${params}`
}

export async function exchangeTwitterCode(code: string): Promise<{
  accessToken: string
  userId: string
  username: string
}> {
  const creds = Buffer.from(
    `${process.env.TWITTER_API_KEY}:${process.env.TWITTER_API_SECRET}`
  ).toString('base64')

  const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${creds}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${getBaseUrl()}/api/social/callback/twitter`,
      code_verifier: 'challenge',
    }),
  })
  const token = await tokenRes.json()
  if (!token.access_token) throw new Error('Twitter token exchange failed')

  const meRes = await fetch('https://api.twitter.com/2/users/me', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  })
  const me = await meRes.json()

  return {
    accessToken: token.access_token,
    userId: me.data?.id ?? '',
    username: me.data?.username ?? '',
  }
}

// ─── TikTok ───────────────────────────────────────────────────────────────────

export function getTikTokOAuthUrl(state: string): string {
  if (!process.env.TIKTOK_CLIENT_KEY) {
    throw new Error('TikTok integration coming soon — TIKTOK_CLIENT_KEY not configured')
  }
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY,
    redirect_uri: `${getBaseUrl()}/api/social/callback/tiktok`,
    response_type: 'code',
    scope: 'user.info.basic,video.publish',
    state,
  })
  return `https://www.tiktok.com/v2/auth/authorize?${params}`
}

export async function exchangeTikTokCode(code: string): Promise<{
  accessToken: string
  userId: string
  displayName: string
}> {
  if (!process.env.TIKTOK_CLIENT_KEY || !process.env.TIKTOK_CLIENT_SECRET) {
    throw new Error('TikTok integration coming soon — TIKTOK_CLIENT_KEY/SECRET not configured')
  }
  const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${getBaseUrl()}/api/social/callback/tiktok`,
    }),
  })
  const token = await tokenRes.json()
  if (!token.data?.access_token) throw new Error('TikTok token exchange failed')

  return {
    accessToken: token.data.access_token,
    userId: token.data.open_id,
    displayName: '',
  }
}

// ─── Google ───────────────────────────────────────────────────────────────────

export function getGoogleOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? '',
    redirect_uri: `${getBaseUrl()}/api/social/callback/google`,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/business.manage https://www.googleapis.com/auth/userinfo.profile',
    access_type: 'offline',
    prompt: 'consent',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function exchangeGoogleCode(code: string): Promise<{
  accessToken: string
  refreshToken: string
  userId: string
  name: string
}> {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri: `${getBaseUrl()}/api/social/callback/google`,
      grant_type: 'authorization_code',
    }),
  })
  const token = await tokenRes.json()
  if (!token.access_token) throw new Error('Google token exchange failed')

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  })
  const profile = await profileRes.json()

  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token ?? '',
    userId: profile.id,
    name: profile.name ?? '',
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────

export function getOAuthUrl(platform: SocialPlatform, state: string): string {
  switch (platform) {
    case 'instagram': return getInstagramOAuthUrl(state)
    case 'facebook': return getFacebookOAuthUrl(state)
    case 'linkedin': return getLinkedInOAuthUrl(state)
    case 'twitter': return getTwitterOAuthUrl(state)
    case 'tiktok': return getTikTokOAuthUrl(state)
    case 'google': return getGoogleOAuthUrl(state)
  }
}
