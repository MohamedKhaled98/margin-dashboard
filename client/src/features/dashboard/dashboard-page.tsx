import { useQuery } from '@tanstack/react-query'
import { FileX2, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { monthName } from '@/lib/format'

import { WarningsSection } from '@/components/warnings-section'

import { DepartmentsSection } from './components/departments-section'
import { PeriodFilter } from './components/period-filter'
import {
  StatTileGrid,
  StatTileGridSkeleton,
} from './components/stat-tile-grid'
import { dashboardStatsQuery } from './queries'
import { usePeriodParams } from './use-period-params'

export function DashboardPage() {
  const { year, month, setPeriod } = usePeriodParams()

  const { data, isPending, isError, error, refetch } = useQuery(
    dashboardStatsQuery(year, month)
  )

  const isEmpty =
    data !== undefined && data.totalHours === 0 && data.projectsSold === 0

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {year} · {month ? monthName(month) : 'Full year'}
          </p>
        </div>
        <PeriodFilter year={year} month={month} onChange={setPeriod} />
      </header>

      {isPending && <StatTileGridSkeleton />}

      {isError && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
            <TriangleAlert className="size-6 text-destructive" />
            <p className="text-sm font-medium">Couldn't load the dashboard</p>
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
            <p className="text-sm font-medium">No data for this period</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Import the timesheet, salary, and project price spreadsheets, or
              pick a different period.
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
            <StatTileGrid stats={data} />
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Departments
            </h2>
            <DepartmentsSection year={year} month={month} />
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Data quality
            </h2>
            <WarningsSection warnings={data.warnings} />
          </section>
        </div>
      )}
    </div>
  )
}
