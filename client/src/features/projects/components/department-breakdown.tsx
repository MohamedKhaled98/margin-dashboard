import type { ProjectDepartmentBreakdown } from '@/api/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatAED, formatHours, formatPercent } from '@/lib/format'

export function DepartmentBreakdown({
  departments,
}: {
  departments: ProjectDepartmentBreakdown[]
}) {
  return (
    <Card size="sm" className="gap-3">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          Hours by department
        </CardTitle>
      </CardHeader>
      <CardContent>
        {departments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hours logged against this ref code yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {departments.map((department) => (
              <li key={department.department ?? '(none)'}>
                <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium">
                    {department.department ?? 'Unassigned'}
                  </span>
                  <span className="shrink-0 font-mono text-[13px]">
                    {formatHours(department.hours)}
                    <span className="text-muted-foreground">
                      {' '}
                      · {formatPercent(department.hoursShare)} ·{' '}
                      {formatAED(department.cost)}
                    </span>
                  </span>
                </div>
                <div
                  className="h-2 rounded-full bg-muted"
                  role="img"
                  aria-label={`${department.department ?? 'Unassigned'}: ${formatPercent(department.hoursShare)} of project hours`}
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.max(department.hoursShare * 100, 1)}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
