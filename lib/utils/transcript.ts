/**
 * Extract transcript from video URLs (YouTube, etc.)
 * Falls back to null if extraction fails — caller should handle manual paste.
 */

export async function extractTranscript(url: string): Promise<string | null> {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return extractYouTubeTranscript(url)
  }
  // Future: add TikTok, Vimeo, etc.
  return null
}

async function extractYouTubeTranscript(url: string): Promise<string | null> {
  const videoId = extractYouTubeId(url)
  if (!videoId) return null

  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ELEVO-Clip/1.0)' },
    })
    const html = await response.text()

    // Extract captions URL from YouTube page data
    const captionMatch = html.match(/"captionTracks":\[{"baseUrl":"([^"]+)"/)
    if (!captionMatch) return null

    const captionUrl = captionMatch[1].replace(/\\u0026/g, '&')
    const captionRes = await fetch(captionUrl)
    const captionXml = await captionRes.text()

    // Parse XML captions to plain text
    const textParts = captionXml.match(/<text[^>]*>([^<]*)<\/text>/g)
    if (!textParts) return null

    return textParts
      .map(t => t.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'))
      .join(' ')
      .trim()
  } catch (e) {
    console.error('[transcript] YouTube extraction failed:', e)
    return null
  }
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|\/)([\w-]{11})/)
  return match ? match[1] : null
}
