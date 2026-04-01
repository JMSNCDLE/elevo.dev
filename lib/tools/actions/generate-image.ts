import type { ToolDefinition } from './types'

export const generateImageTool: ToolDefinition = {
  name: 'generate_image',
  description: 'Generate an image using AI. Returns a URL to the generated image.',
  input_schema: {
    type: 'object',
    properties: {
      prompt: { type: 'string', description: 'What to generate' },
      style: { type: 'string', enum: ['professional', 'playful', 'minimal', 'bold'], description: 'Visual style' },
      width: { type: 'number', description: 'Image width in pixels' },
      height: { type: 'number', description: 'Image height in pixels' },
    },
    required: ['prompt'],
  },
  sensitive: false,
  async execute(input) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://elevo.dev'}/api/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) return { success: false, message: 'Image generation failed' }
    const data = await res.json()
    return { success: true, message: `Image generated: ${data.url}`, data }
  },
}
