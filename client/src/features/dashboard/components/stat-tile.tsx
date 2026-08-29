import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type StatTileProps = {
  label: string
  value: string
  hint?: string
  tone?: 'default' | 'positive' | 'negative'
}

export function StatTile({ label, value, hint, tone = 'default' }: StatTileProps) {
  return (
    <Card size="sm" className="gap-2">
      <CardHeader>
        <CardDescription className="text-xs font-medium tracking-wide uppercase">
          {label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            'font-mono text-2xl font-medium tracking-tight',
            tone === 'positive' && 'text-emerald-500',
            tone === 'negative' && 'text-destructive'
          )}
        >
          {value}
        </p>
        {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  )
}

export function StatTileSkeleton() {
  return (
    <Card size="sm" className="gap-2">
      <CardHeader>
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-7 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-24 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}
