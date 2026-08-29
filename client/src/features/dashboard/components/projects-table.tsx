import { useQuery } from '@tanstack/react-query'

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatAED, formatHours, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

import { projectsListQuery } from '../queries'

export function ProjectsTable() {
  const { data, isPending, isError, error } = useQuery(projectsListQuery())

  return (
    <Card size="sm" className="gap-3">
      <CardHeader>
        <CardDescription>
          Full project lifetime — price against every hour ever logged, so this
          table is not affected by the period filter.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPending && (
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="h-8 animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">{error.message}</p>
        )}

        {data && data.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No priced projects yet — import the project prices spreadsheet.
          </p>
        )}

        {data && data.length > 0 && (
          <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((project) => (
                <TableRow key={project.refCode}>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <p className="max-w-48 truncate font-medium">
                            {project.name}
                          </p>
                        }
                      />
                      <TooltipContent side="top" align="start">
                        {project.name}
                      </TooltipContent>
                    </Tooltip>
                    <p className="font-mono text-xs text-muted-foreground">
                      {project.refCode}
                    </p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.status ?? '—'}
                  </TableCell>
                  <TableCell className='text-right font-mono text-[13px]'>
                    {project.hours > 0 ? formatHours(project.hours) : '—'}
                  </TableCell>
                  <TableCell className='text-right font-mono text-[13px]'>
                    {formatAED(project.revenue)}
                  </TableCell>
                  <TableCell className='text-right font-mono text-[13px]'>
                    {formatAED(project.cost)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-mono text-[13px] font-medium',
                      project.profit < 0 && 'text-destructive'
                    )}
                  >
                    {formatAED(project.profit)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-mono text-[13px] font-medium',
                      project.margin !== null &&
                        project.margin < 0 &&
                        'text-destructive'
                    )}
                  >
                    {formatPercent(project.margin)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  )
}
