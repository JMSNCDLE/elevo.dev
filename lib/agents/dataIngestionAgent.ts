import { getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON } from './client'

export interface ParsedDataResult {
  cleanedData: string
  detectedFormat: string
  detectedColumns: string[]
  rowCount: number
  warnings: string[]
  confidence: number
}

export async function parseRawData(
  rawInput: string,
  expectedType: 'financial' | 'inventory' | 'advertising' | 'customer'
): Promise<ParsedDataResult> {
  const client = getClient()

  const response = await client.messages.create({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.MEDIUM,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('medium'),
    system: `You are ELEVO AI's Data Ingestion & Normalisation specialist — Dex. You are an expert at parsing, cleaning, and structuring raw business data.

You can handle any format including:
- CSV exports (from Excel, Google Sheets, etc.)
- Xero exports (P&L, Balance Sheet, Cash Flow)
- QuickBooks exports
- Bank statement pastes (text or CSV)
- Plain text data (copy-pasted from screens)
- Tab-separated or space-separated tables
- JSON data
- Markdown tables
- Messy human-typed data

Your job is to:
1. Detect the format automatically
2. Identify all columns/fields present
3. Count the number of data rows (excluding headers)
4. Clean the data: remove duplicate whitespace, fix obvious encoding issues, normalise currency symbols, standardise date formats
5. Flag any issues or data quality warnings
6. Return the cleaned data in a consistent, parseable format
7. Rate your confidence in the parse (0–1)

Be generous in what you accept. If data is ambiguous, make a reasonable assumption and note it as a warning.`,
    messages: [
      {
        role: 'user',
        content: `Parse and clean the following ${expectedType} data:

---
${rawInput.slice(0, 4000)}
---
${rawInput.length > 4000 ? `[Note: Input truncated, original length: ${rawInput.length} characters]` : ''}

Detect the format, identify all columns, count rows, clean the data, and flag any issues.

Return ONLY valid JSON:
{
  "cleanedData": "<the cleaned, normalised version of the input data — preserve structure but fix formatting>",
  "detectedFormat": "<e.g. 'CSV', 'Xero P&L Export', 'QuickBooks Transaction List', 'Bank Statement', 'Plain Text Table', 'JSON', 'Unknown'>",
  "detectedColumns": ["<column1>", "<column2>", "..."],
  "rowCount": <number of data rows, excluding any header row>,
  "warnings": ["<warning 1>", "<warning 2>"],
  "confidence": <0.0 to 1.0 — how confident you are in the parse>
}`,
      },
    ],
  })

  try {
    return parseJSON<ParsedDataResult>(extractText(response))
  } catch {
    return {
      cleanedData: rawInput,
      detectedFormat: 'unknown',
      detectedColumns: [],
      rowCount: 0,
      warnings: ['Could not parse input data. Please check the format and try again.'],
      confidence: 0,
    }
  }
}
