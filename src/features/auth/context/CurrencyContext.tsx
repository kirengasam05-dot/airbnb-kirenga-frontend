import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'

type Currency =
  | 'USD'
  | 'RWF'
  | 'EUR'
  | 'GBP'

const rates: Record<Currency, number> = {
  USD: 1,
  RWF: 1300,
  EUR: 0.92,
  GBP: 0.79,
}

const symbols: Record<Currency, string> = {
  USD: '$',
  RWF: 'RWF ',
  EUR: '€',
  GBP: '£',
}

type CurrencyContextValue = {
  currency: Currency
  setCurrency: (
    currency: Currency,
  ) => void
  formatPrice: (
    usdPrice: number,
  ) => string
}

const CurrencyContext =
  createContext<CurrencyContextValue | null>(
    null,
  )

export function CurrencyProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [currency, setCurrency] =
    useState<Currency>('RWF')

  const value = useMemo(() => {
    const formatPrice = (
      usdPrice: number,
    ) => {
      const converted =
        usdPrice * rates[currency]

      if (currency === 'RWF') {
        return `${symbols[currency]}${Math.round(
          converted,
        ).toLocaleString()}`
      }

      return `${symbols[currency]}${converted.toFixed(
        2,
      )}`
    }

    return {
      currency,
      setCurrency,
      formatPrice,
    }
  }, [currency])

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx =
    useContext(CurrencyContext)

  if (!ctx) {
    throw new Error(
      'useCurrency must be used inside CurrencyProvider',
    )
  }

  return ctx
}