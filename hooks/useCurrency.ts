'use client'

import { useState, useEffect } from 'react'
import { detectCurrency, type Currency } from '@/lib/currency'

export function useCurrency(): Currency {
  const [currency, setCurrency] = useState<Currency>('EUR')

  useEffect(() => {
    setCurrency(detectCurrency())
  }, [])

  return currency
}
