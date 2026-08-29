import { useQuery } from '@tanstack/react-query'
import { TriangleAlert } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

import { SettingsForm } from './components/settings-form'
import { settingsQuery } from './queries'

export function SettingsPage() {
  const { data, isPending, isError, error } = useQuery(settingsQuery())

  return (
    <div className="mx-auto max-w-3xl p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Assumptions behind every number on the dashboard. Changes apply
          immediately to all pages.
        </p>
      </header>

      {isPending && (
        <div className="space-y-3">
          <div className="h-40 animate-pulse rounded-3xl bg-muted" />
          <div className="h-24 animate-pulse rounded-3xl bg-muted" />
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="flex items-center gap-2 text-sm text-destructive">
            <TriangleAlert className="size-4" />
            {error.message}
          </CardContent>
        </Card>
      )}

      {data && <SettingsForm key={JSON.stringify(data)} initial={data} />}
    </div>
  )
}
