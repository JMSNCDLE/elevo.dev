import { NextRequest, NextResponse } from 'next/server'
import { getUserContext } from '@/lib/auth/getUserContext'

export async function POST(req: NextRequest) {
  const ctx = await getUserContext()
  if (!ctx.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  // Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  let text = ''

  if (file.name.endsWith('.pdf')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
      const data = await pdfParse(buffer)
      text = data.text
    } catch {
      text = '[PDF extraction failed — please paste the text manually]'
    }
  } else if (file.name.endsWith('.csv')) {
    text = buffer.toString('utf-8')
  } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    try {
      const XLSX = await import('xlsx')
      const workbook = XLSX.read(buffer)
      const sheets = workbook.SheetNames.map((name: string) => {
        const sheet = workbook.Sheets[name]
        return `--- Sheet: ${name} ---\n${XLSX.utils.sheet_to_csv(sheet)}`
      })
      text = sheets.join('\n\n')
    } catch {
      text = '[Spreadsheet extraction failed — please paste the data manually]'
    }
  } else {
    text = buffer.toString('utf-8')
  }

  // Truncate to ~100k chars for Claude context
  if (text.length > 100000) {
    text = text.substring(0, 100000) + '\n\n[Document truncated — showing first 100,000 characters]'
  }

  return NextResponse.json({ text, fileName: file.name, fileType: file.type })
}
