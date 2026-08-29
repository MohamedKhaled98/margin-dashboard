import type { DashboardStats } from '@/api/types'
import { formatAED, formatHours, formatPercent } from '@/lib/format'

import { StatTile, StatTileSkeleton, type StatTileProps } from './stat-tile'

function signTone(value: number): StatTileProps['tone'] {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'default'
}

export function StatTileGrid({ stats }: { stats: DashboardStats }) {
  const utilization =
    stats.totalHours > 0 ? stats.billableHours / stats.totalHours : null

  const tiles: StatTileProps[] = [
    {
      label: 'Revenue',
      value: formatAED(stats.revenue),
      hint: `${stats.projectsSold} ${stats.projectsSold === 1 ? 'project' : 'projects'} sold`,
    },
    {
      label: 'Cost',
      value: formatAED(stats.cost),
      hint:
        stats.assumptions.monthlyOverhead > 0
          ? `incl. ${formatAED(stats.assumptions.monthlyOverhead)}/mo overhead`
          : 'no monthly overhead configured',
    },
    {
      label: 'Profit',
      value: formatAED(stats.profit),
      hint: 'revenue − cost',
      tone: signTone(stats.profit),
    },
    {
      label: 'Margin',
      value: formatPercent(stats.margin),
      hint: stats.margin === null ? 'no revenue in this period' : 'profit ÷ revenue',
      tone: stats.margin === null ? 'default' : signTone(stats.margin),
    },
    {
      label: 'Total hours',
      value: formatHours(stats.totalHours),
      hint: `${formatHours(stats.nonBillableHours)} non-billable`,
    },
    {
      label: 'Billable hours',
      value: formatHours(stats.billableHours),
      hint: `${formatPercent(utilization)} of all logged time`,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tiles.map((tile) => (
        <StatTile key={tile.label} {...tile} />
      ))}
    </div>
  )
}

export function StatTileGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <StatTileSkeleton key={index} />
      ))}
    </div>
  )
}
