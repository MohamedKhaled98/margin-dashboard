export type CsvValue = string | number | null | undefined

function serializeField(value: CsvValue): string {
  if (value === null || value === undefined) return ''
  const text =
    typeof value === 'number'
      ? String(Math.round(value * 100) / 100)
      : String(value)
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

// Fraction → percentage number (0.4231 → 42.3), matching the UI's percent display.
export function csvPercent(value: number | null): number | null {
  return value === null ? null : Math.round(value * 1000) / 10
}

// Numbers are rounded to 2 decimals; null/undefined become empty cells.
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: CsvValue[][]
): void {
  const lines = [headers, ...rows].map((row) =>
    row.map(serializeField).join(',')
  )
  const blob = new Blob([lines.join('\r\n') + '\r\n'], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
