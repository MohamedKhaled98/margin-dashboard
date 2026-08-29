import { useQuery } from '@tanstack/react-query'
import { FileX2, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatTile, StatTileSkeleton } from '@/components/stat-tile'
import { formatHours, formatPercent, monthName } from '@/lib/format'

import { PeriodFilter } from '@/features/dashboard/components/period-filter'
import { usePeriodParams } from '@/features/dashboard/use-period-params'

import { ProductivityTable } from './components/productivity-table'
import { productivityQuery } from './queries'

export function ProductivityPage() {
  const { year, month, setPeriod } = usePeriodParams()

  const { data, isPending, isError, error, refetch } = useQuery(
    productivityQuery(year, month)
  )

  const isEmpty = data !== undefined && data.employees.length === 0

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Productivity</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {year} · {month ? monthName(month) : 'Full year'}
          </p>
        </div>
        <PeriodFilter year={year} month={month} onChange={setPeriod} />
      </header>

      {isPending && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <StatTileSkeleton key={index} />
          ))}
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
            <TriangleAlert className="size-6 text-destructive" />
            <p className="text-sm font-medium">Couldn't load productivity</p>
            <p className="max-w-md text-sm text-muted-foreground">{error.message}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {isEmpty && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
            <FileX2 className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">No hours logged in this period</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Import the timesheet spreadsheet, or pick a different period.
            </p>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link to="/imports" />}
            >
              Import data
            </Button>
          </CardContent>
        </Card>
      )}

      {data && !isEmpty && (
        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Overview
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatTile
                label="Productivity"
                value={formatPercent(data.productivity)}
                hint="billable ÷ total hours logged"
              />
              <StatTile
                label="Billable hours"
                value={formatHours(data.billableHours)}
                hint={`${formatHours(data.nonBillableHours)} non-billable`}
              />
              <StatTile
                label="People"
                value={String(data.employees.length)}
                hint="logged hours in this period"
              />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              By employee
            </h2>
            <ProductivityTable
              employees={data.employees}
              billableCategories={data.billableCategories}
            />
          </section>
        </div>
      )}
    </div>
  )
}
