import { NextRequest, NextResponse } from 'next/server'
import { getUserContext } from '@/lib/auth/getUserContext'
import { createImagePrediction, waitForPrediction } from '@/lib/integrations/replicate'

export async function POST(req: NextRequest) {
  const ctx = await getUserContext()
  if (!ctx.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { prompt, style, width, height } = await req.json()
  if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 })

  try {
    const styleMap: Record<string, string> = {
      professional: 'professional, corporate, clean, modern,',
      playful: 'colorful, fun, energetic, vibrant,',
      minimal: 'minimalist, clean lines, simple, elegant,',
      bold: 'bold, high contrast, striking, dramatic,',
    }
    const enhancedPrompt = `${styleMap[style] || ''} ${prompt}, high quality, detailed`

    const prediction = await createImagePrediction({
      prompt: enhancedPrompt,
      width: width || 1024,
      height: height || 1024,
    })

    const result = await waitForPrediction(prediction.id)
    if (result.status === 'failed') throw new Error(result.error || 'Generation failed')

    return NextResponse.json({
      url: result.output?.[0],
      prompt: enhancedPrompt,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[generate-image]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
