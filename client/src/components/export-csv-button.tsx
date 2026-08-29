import { Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { downloadCsv, type CsvValue } from '@/lib/csv'

type ExportCsvButtonProps = {
  /** Download name without the .csv extension. */
  filename: string
  headers: string[]
  /** Called on click so the CSV reflects the data currently on screen. */
  getRows: () => CsvValue[][]
}

export function ExportCsvButton({
  filename,
  headers,
  getRows,
}: ExportCsvButtonProps) {
  return (
    <Button
      variant="ghost"
      size="xs"
      aria-label="Export CSV"
      className="text-muted-foreground"
      onClick={() => downloadCsv(`${filename}.csv`, headers, getRows())}
    >
      <Download data-icon="inline-start" />
      CSV
    </Button>
  )
}
