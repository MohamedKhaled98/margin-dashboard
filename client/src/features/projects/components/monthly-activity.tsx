import type { ProjectMonthBreakdown } from '@/api/types'
import { ExportCsvButton } from '@/components/export-csv-button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatAED, formatHours, formatMonthYear } from '@/lib/format'

export function MonthlyActivity({
  months,
}: {
  months: ProjectMonthBreakdown[]
}) {
  return (
    <Card size="sm" className="gap-3">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Monthly activity</CardTitle>
        <CardDescription>
          Cost varies by month because hourly rates are recomputed from each
          month's salaries and hours.
        </CardDescription>
        {months.length > 0 && (
          <CardAction>
            <ExportCsvButton
              filename="monthly-activity"
              headers={['Month', 'Hours', 'Cost (AED)']}
              getRows={() =>
                months.map((month) => [
                  `${month.year}-${String(month.month).padStart(2, '0')}`,
                  month.hours,
                  month.cost,
                ])
              }
            />
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {months.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hours logged against this ref code yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {months.map((month) => (
                <TableRow key={`${month.year}-${month.month}`}>
                  <TableCell className="font-medium">
                    {formatMonthYear(month.year, month.month)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[13px]">
                    {formatHours(month.hours)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[13px]">
                    {formatAED(month.cost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
