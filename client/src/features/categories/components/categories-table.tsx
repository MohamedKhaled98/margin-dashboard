import { ExportCsvButton } from '@/components/export-csv-button'
import {
  Card,
  CardAction,
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
import { csvPercent } from '@/lib/csv'
import { formatHours, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

import type { CategoryHours } from '@/api/types'

type CategoriesTableProps = {
  categories: CategoryHours[]
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
  return (
    <Card size="sm" className="gap-3">
      <CardHeader>
        <CardDescription>
          Every hour logged in this period, split by category. Which categories
          count as billable is configurable in Settings.
        </CardDescription>
        {categories.length > 0 && (
          <CardAction>
            <ExportCsvButton
              filename="categories"
              headers={['Category', 'Type', 'People', 'Hours', 'Share %']}
              getRows={() =>
                categories.map((category) => [
                  category.category,
                  category.billable ? 'Billable' : 'Internal',
                  category.employeeCount,
                  category.hours,
                  csvPercent(category.share),
                ])
              }
            />
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">People</TableHead>
              <TableHead className="text-right">Hours</TableHead>
              <TableHead className="text-right">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.category}>
                <TableCell className="font-medium">
                  {category.category}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      category.billable
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {category.billable ? 'Billable' : 'Internal'}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-[13px]">
                  {category.employeeCount}
                </TableCell>
                <TableCell className="text-right font-mono text-[13px]">
                  {formatHours(category.hours)}
                </TableCell>
                <TableCell className="text-right font-mono text-[13px] font-medium">
                  {formatPercent(category.share)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
