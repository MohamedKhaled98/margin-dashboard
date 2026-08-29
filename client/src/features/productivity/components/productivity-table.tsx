import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatHours, formatPercent } from '@/lib/format'

import type { EmployeeProductivity } from '@/api/types'

type ProductivityTableProps = {
  employees: EmployeeProductivity[]
  billableCategories: string[]
}

export function ProductivityTable({
  employees,
  billableCategories,
}: ProductivityTableProps) {
  return (
    <Card size="sm" className="gap-3">
      <CardHeader>
        <CardDescription>
          Billable share of each person's logged time in this period. Billable
          categories: {billableCategories.join(', ')} — configurable in
          Settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Billable</TableHead>
              <TableHead className="text-right">Non-billable</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Productivity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.employeeNo}>
                <TableCell>
                  <p className="font-medium">{employee.employeeName}</p>
                  <p className="text-xs text-muted-foreground">
                    {employee.designation ?? '—'}
                  </p>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {employee.department ?? '—'}
                </TableCell>
                <TableCell className="text-right font-mono text-[13px]">
                  {formatHours(employee.billableHours)}
                </TableCell>
                <TableCell className="text-right font-mono text-[13px]">
                  {formatHours(employee.nonBillableHours)}
                </TableCell>
                <TableCell className="text-right font-mono text-[13px]">
                  {formatHours(employee.totalHours)}
                </TableCell>
                <TableCell className="text-right font-mono text-[13px] font-medium">
                  {formatPercent(employee.productivity)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
