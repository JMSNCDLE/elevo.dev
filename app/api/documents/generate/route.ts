import { NextRequest, NextResponse } from 'next/server'
import { getUserContext } from '@/lib/auth/getUserContext'
import { generateDocx } from '@/lib/documents/generator'

export async function POST(req: NextRequest) {
  const ctx = await getUserContext()
  if (!ctx.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { title, sections, businessName } = await req.json()
  if (!title || !sections) return NextResponse.json({ error: 'title and sections required' }, { status: 400 })

  try {
    const buffer = await generateDocx(title, sections, {
      businessName: businessName || 'Your Business',
      language: ctx.language,
    })

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${title.replace(/[^a-zA-Z0-9]/g, '-')}.docx"`,
      },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[documents/generate]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
