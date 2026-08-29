import { CircleCheck, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardWarning } from '@/api/types'
import { monthName } from '@/lib/format'

const CODE_LABELS: Record<DashboardWarning['code'], string> = {
  MISSING_SALARY: 'No salary',
  NO_BILLABLE_HOURS: 'No billable hours',
  MISSING_PRICE: 'No price',
}

export function WarningsSection({
  warnings,
  linkToProject = true,
}: {
  warnings: DashboardWarning[]
  // Off on the project details page, where the link would point to itself.
  linkToProject?: boolean
}) {
  if (warnings.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <CircleCheck className="size-4 text-emerald-500" />
        No data-quality issues in this period.
      </p>
    )
  }

  return (
    <Card size="sm" className="gap-3 bg-amber-500/5 ring-amber-500/25">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-amber-400">
          <TriangleAlert className="size-4" />
          {warnings.length} {warnings.length === 1 ? 'issue affects' : 'issues affect'} the
          figures above
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {warnings.map((warning, index) => (
            <li key={index} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 shrink-0 rounded-md border border-amber-500/40 px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-amber-400">
                {CODE_LABELS[warning.code]}
              </span>
              <div>
                <p className="text-foreground/90">{warning.message}</p>
                {warning.code !== 'MISSING_PRICE' &&
                  warning.months.length > 0 && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Affected months:{' '}
                      {warning.months.map(monthName).join(', ')}
                    </p>
                  )}
                {warning.code === 'MISSING_PRICE' && linkToProject && (
                  <Link
                    to={`/projects/${encodeURIComponent(warning.refCode)}`}
                    className="mt-0.5 inline-block text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
                  >
                    View project
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
