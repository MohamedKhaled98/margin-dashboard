import { TriangleAlert } from 'lucide-react'

import type { ProjectDetails } from '@/api/types'
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { csvPercent } from '@/lib/csv'
import { formatAED, formatHours, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

function money(value: number | null): string {
  return value === null ? '—' : formatAED(value)
}

export function ContributionsTable({ details }: { details: ProjectDetails }) {
  const { employees } = details

  return (
    <Card size="sm" className="gap-3">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          Per-employee contribution
        </CardTitle>
        <CardDescription>
          Revenue share is the project price split by each person's share of
          hours; cost is their hours at that month's direct + indirect rate.
        </CardDescription>
        {employees.length > 0 && (
          <CardAction>
            <ExportCsvButton
              filename={`contributions-${details.refCode}`}
              headers={[
                'Employee No',
                'Employee',
                'Designation',
                'Department',
                'Hours',
                'Hours Share %',
                'Cost (AED)',
                'Revenue Share (AED)',
                'Profit (AED)',
                'Margin %',
              ]}
              getRows={() => [
                ...employees.map((employee) => [
                  employee.employeeNo,
                  employee.employeeName,
                  employee.designation,
                  employee.department,
                  employee.hours,
                  csvPercent(employee.hoursShare),
                  employee.cost,
                  employee.revenueShare,
                  employee.profit,
                  csvPercent(employee.profitability),
                ]),
                [
                  '',
                  'Total',
                  '',
                  '',
                  details.totalHours,
                  '',
                  details.cost,
                  details.price,
                  details.profit,
                  csvPercent(details.margin),
                ],
              ]}
            />
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hours logged against this ref code yet.
          </p>
        ) : (
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Revenue share</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.employeeNo}>
                    <TableCell>
                      <p className="flex items-center gap-1.5 font-medium">
                        {employee.employeeName}
                        {employee.missingSalary && (
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <TriangleAlert className="size-3.5 shrink-0 text-amber-400" />
                              }
                            />
                            <TooltipContent side="top">
                              No salary row in some months they worked on this
                              project — their cost is understated.
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {employee.designation ?? employee.employeeNo}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {employee.department ?? '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[13px]">
                      {formatHours(employee.hours)}
                      <span className="text-muted-foreground">
                        {' '}
                        · {formatPercent(employee.hoursShare)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-[13px]">
                      {formatAED(employee.cost)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[13px]">
                      {money(employee.revenueShare)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-mono text-[13px] font-medium',
                        employee.profit !== null &&
                          employee.profit < 0 &&
                          'text-destructive'
                      )}
                    >
                      {money(employee.profit)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-mono text-[13px] font-medium',
                        employee.profitability !== null &&
                          employee.profitability < 0 &&
                          'text-destructive'
                      )}
                    >
                      {formatPercent(employee.profitability)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="font-medium">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-mono text-[13px] font-medium">
                    {formatHours(details.totalHours)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[13px] font-medium">
                    {formatAED(details.cost)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[13px] font-medium">
                    {money(details.price)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-mono text-[13px] font-medium',
                      details.profit !== null &&
                        details.profit < 0 &&
                        'text-destructive'
                    )}
                  >
                    {money(details.profit)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-mono text-[13px] font-medium',
                      details.margin !== null &&
                        details.margin < 0 &&
                        'text-destructive'
                    )}
                  >
                    {formatPercent(details.margin)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  )
}
