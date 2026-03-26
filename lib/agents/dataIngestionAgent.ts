import { createMessage, getClient, MODELS, MAX_TOKENS, buildThinkingConfig, buildEffortConfig, extractText, parseJSON } from './client'

export interface AdRow {
  date: string
  platform: string
  impressions: number
  clicks: number
  spend: number
  revenue: number
  conversions: number
}

export interface ParsedAdData {
  rows: AdRow[]
  detectedPlatform: string
  rowCount: number
  warnings: string[]
  confidence: number
}

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

  const response = await createMessage({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.MEDIUM,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('medium'),
    system: `You are ELEVO AI's Data Ingestion & Normalisation Agent — Dex. You are an expert at parsing, cleaning, and structuring raw business data.

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

/**
 * Parse advertising CSV data from Google Ads or Meta Ads exports
 * Recognises Google Ads columns: Campaign, Impressions, Clicks, Cost, Conversions, Revenue
 * Recognises Meta Ads columns: Campaign name, Reach, Impressions, Clicks, Amount spent, Results
 */
export async function parseAdvertisingData(rawInput: string): Promise<ParsedAdData> {
  const response = await createMessage({
    model: MODELS.SPECIALIST,
    max_tokens: MAX_TOKENS.MEDIUM,
    thinking: buildThinkingConfig(),
    ...buildEffortConfig('medium'),
    system: `You are ELEVO's advertising data parser — Dex. You specialise in parsing Google Ads and Meta Ads CSV exports.

Google Ads columns to look for: Campaign, Date, Impressions, Clicks, Cost/Spend, Conversions, Conv. value/Revenue
Meta Ads columns to look for: Campaign name, Date, Reach, Impressions, Clicks (all), Amount spent, Results

Map all data to a standardised format. Detect the platform automatically.
If "Date" column is missing, use today's date (YYYY-MM-DD format) for each row.
Ensure spend/cost values are numeric (remove currency symbols).
Revenue from Google Ads = "Conv. value". Revenue from Meta = try "Purchase value" or "Result value" or 0 if not present.

Return ONLY valid JSON:
{
  "rows": [
    { "date": "YYYY-MM-DD", "platform": "<Google Ads|Meta Ads|Unknown>", "impressions": 0, "clicks": 0, "spend": 0.00, "revenue": 0.00, "conversions": 0 }
  ],
  "detectedPlatform": "<Google Ads|Meta Ads|Unknown>",
  "rowCount": 0,
  "warnings": [],
  "confidence": 0.0
}`,
    messages: [
      {
        role: 'user',
        content: `Parse this advertising data:\n\n${rawInput.slice(0, 5000)}${rawInput.length > 5000 ? '\n[truncated]' : ''}`,
      },
    ],
  })

  try {
    return parseJSON<ParsedAdData>(extractText(response))
  } catch {
    return {
      rows: [],
      detectedPlatform: 'Unknown',
      rowCount: 0,
      warnings: ['Could not parse advertising data. Please check the format and try again.'],
      confidence: 0,
    }
  }
}
