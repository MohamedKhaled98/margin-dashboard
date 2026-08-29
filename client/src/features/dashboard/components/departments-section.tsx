import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TriangleAlert } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatAED, formatHours, monthName } from '@/lib/format'

import type { DepartmentBreakdown } from '@/api/types'

import { departmentStatsQuery } from '../queries'

type DepartmentsSectionProps = {
  year: number
  month?: number
}

export function DepartmentsSection({ year, month }: DepartmentsSectionProps) {
  const { data, isPending, isError, error } = useQuery(
    departmentStatsQuery(year, month)
  )

  const [selected, setSelected] = useState<DepartmentBreakdown | null>(null)

  return (
    <Card size="sm" className="gap-3">
      <CardContent>
        {isPending && (
          <div className="space-y-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-8 animate-pulse rounded bg-muted" />
            ))}
          </div>
        )}

        {isError && (
          <p className="flex items-center gap-2 text-sm text-destructive">
            <TriangleAlert className="size-4" /> {error.message}
          </p>
        )}

        {data && data.departments.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hours logged in this period.
          </p>
        )}

        {data && data.departments.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">People</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.departments.map((department) => (
                <TableRow
                  key={department.department ?? '(none)'}
                  tabIndex={0}
                  className="cursor-pointer focus-visible:bg-muted/50 focus-visible:outline-none"
                  onClick={() => setSelected(department)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') setSelected(department)
                  }}
                >
                  <TableCell className="font-medium">
                    {department.department ?? 'No department'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[13px]">
                    {department.employeeCount}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[13px]">
                    {formatHours(department.totalHours)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[13px] font-medium">
                    {formatAED(department.cost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Sheet
          open={selected !== null}
          onOpenChange={(open) => {
            if (!open) setSelected(null)
          }}
        >
          {selected && (
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{selected.department ?? 'No department'}</SheetTitle>
                <SheetDescription>
                  {year} · {month ? monthName(month) : 'Full year'} —{' '}
                  {formatHours(selected.totalHours)} logged,{' '}
                  {formatAED(selected.cost)} cost across{' '}
                  {selected.employeeCount}{' '}
                  {selected.employeeCount === 1 ? 'person' : 'people'}
                </SheetDescription>
              </SheetHeader>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Person</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selected.employees.map((employee) => (
                    <TableRow key={employee.employeeNo}>
                      <TableCell>
                        <p className="font-medium">{employee.employeeName}</p>
                        <p className="text-xs text-muted-foreground">
                          {employee.designation ?? '—'}
                          {employee.missingSalary && ' · missing salary'}
                        </p>
                      </TableCell>
                      <TableCell className="text-right font-mono text-[13px]">
                        {formatHours(employee.totalHours)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-[13px] font-medium">
                        {formatAED(employee.cost)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SheetContent>
          )}
        </Sheet>
      </CardContent>
    </Card>
  )
}
