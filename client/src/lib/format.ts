const aed = new Intl.NumberFormat('en-AE', {
  style: 'currency',
  currency: 'AED',
  maximumFractionDigits: 0,
})

const hours = new Intl.NumberFormat('en', { maximumFractionDigits: 1 })

const percent = new Intl.NumberFormat('en', {
  style: 'percent',
  maximumFractionDigits: 1,
})

export function formatAED(value: number): string {
  return aed.format(value)
}

export function formatHours(value: number): string {
  return `${hours.format(value)} h`
}

export function formatPercent(value: number | null): string {
  return value === null ? '—' : percent.format(value)
}

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
].map((label, index) => ({ value: index + 1, label }))

export function monthName(month: number): string {
  return MONTHS[month - 1]?.label ?? String(month)
}

export function formatMonthYear(year: number, month: number): string {
  return `${monthName(month).slice(0, 3)} ${year}`
}
