import { useSearchParams } from 'react-router'

// The sample dataset is 2025; there is no "available years" endpoint yet,
// so the default (and the year filter options) live in this constant.
export const DEFAULT_YEAR = 2025
export const YEARS = [2025]

function parseIntParam(value: string | null): number | undefined {
  if (!value) return undefined

  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : undefined
}

// URL search params are the only source of filter state, so filtered views
// survive refresh and can be shared as links.
export function usePeriodParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const year = parseIntParam(searchParams.get('year')) ?? DEFAULT_YEAR

  const rawMonth = parseIntParam(searchParams.get('month'))
  const month =
    rawMonth !== undefined && rawMonth >= 1 && rawMonth <= 12
      ? rawMonth
      : undefined

  function setPeriod(nextYear: number, nextMonth?: number) {
    const next = new URLSearchParams()
    next.set('year', String(nextYear))

    if (nextMonth !== undefined) {
      next.set('month', String(nextMonth))
    }

    setSearchParams(next, { replace: true })
  }

  return { year, month, setPeriod }
}
