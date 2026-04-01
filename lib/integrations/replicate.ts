// ─── Replicate API Integration ───────────────────────────────────────────────
// Uses SDXL Lightning for fast image generation (< 10s)

const REPLICATE_API_KEY = process.env.REPLICATE_API_TOKEN

interface PredictionInput {
  prompt: string
  negative_prompt?: string
  width?: number
  height?: number
  num_outputs?: number
}

interface Prediction {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed'
  output?: string[]
  error?: string
}

export async function createImagePrediction(input: PredictionInput): Promise<Prediction> {
  if (!REPLICATE_API_KEY) throw new Error('REPLICATE_API_TOKEN not configured')

  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: '727e49a643e999d602a896c774a0658ffefea21465756a6ce24b7ea4165eba6a',
      input: {
        prompt: input.prompt,
        negative_prompt: input.negative_prompt || 'blurry, low quality, distorted, watermark',
        width: input.width || 1024,
        height: input.height || 1024,
        num_outputs: input.num_outputs || 1,
        scheduler: 'K_EULER',
        num_inference_steps: 4,
      },
    }),
  })

  if (!res.ok) throw new Error(`Replicate API error: ${res.status}`)
  return res.json()
}

export async function getPrediction(id: string): Promise<Prediction> {
  if (!REPLICATE_API_KEY) throw new Error('REPLICATE_API_TOKEN not configured')
  const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
    headers: { 'Authorization': `Bearer ${REPLICATE_API_KEY}` },
  })
  if (!res.ok) throw new Error(`Replicate API error: ${res.status}`)
  return res.json()
}

export async function waitForPrediction(id: string, maxWait = 50000): Promise<Prediction> {
  const start = Date.now()
  while (Date.now() - start < maxWait) {
    const prediction = await getPrediction(id)
    if (prediction.status === 'succeeded' || prediction.status === 'failed') return prediction
    await new Promise(r => setTimeout(r, 1000))
  }
  throw new Error('Image generation timed out')
}
