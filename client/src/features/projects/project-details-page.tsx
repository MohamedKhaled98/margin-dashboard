import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FileX2, TriangleAlert } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { ApiError } from '@/api/client'
import type { ProjectDetails } from '@/api/types'
import { StatTile, StatTileSkeleton, type StatTileProps } from '@/components/stat-tile'
import { WarningsSection } from '@/components/warnings-section'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatAED, formatHours, formatPercent, monthName } from '@/lib/format'

import { ContributionsTable } from './components/contributions-table'
import { DepartmentBreakdown } from './components/department-breakdown'
import { MonthlyActivity } from './components/monthly-activity'
import { projectDetailsQuery } from './queries'

function signTone(value: number | null): StatTileProps['tone'] {
  if (value === null) return 'default'
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'default'
}

function StatTiles({ details }: { details: ProjectDetails }) {
  const tiles: StatTileProps[] = [
    {
      label: 'Price',
      value: details.price === null ? '—' : formatAED(details.price),
      hint:
        details.price === null
          ? 'no price found — revenue counted as zero'
          : details.salesYear !== null && details.salesMonth !== null
            ? `sold ${monthName(details.salesMonth)} ${details.salesYear}`
            : undefined,
    },
    {
      label: 'Cost',
      value: formatAED(details.cost),
      hint: `${formatHours(details.totalHours)} across ${details.employees.length} ${
        details.employees.length === 1 ? 'person' : 'people'
      }`,
    },
    {
      label: 'Profit',
      value: details.profit === null ? '—' : formatAED(details.profit),
      hint: 'price − cost',
      tone: signTone(details.profit),
    },
    {
      label: 'Margin',
      value: formatPercent(details.margin),
      hint: 'profit ÷ price',
      tone: signTone(details.margin),
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => (
        <StatTile key={tile.label} {...tile} />
      ))}
    </div>
  )
}

export function ProjectDetailsPage() {
  const { refCode = '' } = useParams()

  const { data, isPending, isError, error, refetch } = useQuery(
    projectDetailsQuery(refCode)
  )

  const notFound =
    isError && error instanceof ApiError && error.status === 404

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Dashboard
      </Link>

      {isPending && (
        <div className="space-y-8">
          <div>
            <div className="h-7 w-72 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <StatTileSkeleton key={index} />
            ))}
          </div>
        </div>
      )}

      {notFound && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
            <FileX2 className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">Project not found</p>
            <p className="max-w-md text-sm text-muted-foreground">
              No price row or logged hours exist for{' '}
              <span className="font-mono">{refCode}</span>. It may have been
              replaced by a re-upload.
            </p>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link to="/" />}
            >
              Back to dashboard
            </Button>
          </CardContent>
        </Card>
      )}

      {isError && !notFound && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
            <TriangleAlert className="size-6 text-destructive" />
            <p className="text-sm font-medium">Couldn't load this project</p>
            <p className="max-w-md text-sm text-muted-foreground">{error.message}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {data && (
        <div className="space-y-8">
          <header>
            <h1 className="text-xl font-semibold tracking-tight text-balance">
              {data.name}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              <span className="font-mono">{data.refCode}</span>
              {data.category && <> · {data.category}</>}
              {data.status && <> · {data.status}</>}
            </p>
          </header>

          <StatTiles details={data} />

          <div className="grid items-start gap-4 lg:grid-cols-2">
            <DepartmentBreakdown departments={data.departments} />
            <MonthlyActivity months={data.months} />
          </div>

          <ContributionsTable details={data} />

          {data.warnings.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Data quality
              </h2>
              <WarningsSection warnings={data.warnings} linkToProject={false} />
            </section>
          )}
        </div>
      )}
    </div>
  )
}
