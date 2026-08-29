import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CircleCheck, LoaderCircle, TriangleAlert } from 'lucide-react'

import { updateSettings, type AppSettings } from '@/api/settings'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SettingsForm({ initial }: { initial: AppSettings }) {
  const [billable, setBillable] = useState<Set<string>>(
    new Set(initial.billableCategories)
  )
  const [overhead, setOverhead] = useState(String(initial.monthlyOverhead))
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      // Assumptions feed every calculation, so refresh everything.
      queryClient.invalidateQueries()
    },
  })

  function toggleCategory(category: string, checked: boolean) {
    const next = new Set(billable)

    if (checked) {
      next.add(category)
    } else {
      next.delete(category)
    }

    setBillable(next)
    mutation.reset()
  }

  const overheadValue = Number(overhead)
  const overheadValid =
    overhead.trim() !== '' &&
    Number.isFinite(overheadValue) &&
    overheadValue >= 0

  const canSave = billable.size > 0 && overheadValid && !mutation.isPending

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()

        if (!canSave) return

        mutation.mutate({
          billableCategories: [...billable],
          monthlyOverhead: overheadValue,
        })
      }}
    >
      <Card size="sm" className="gap-4">
        <CardHeader>
          <CardTitle className="text-sm">Billable categories</CardTitle>
          <CardDescription>
            Hours in these categories are charged to projects. Everything else
            counts as internal time and goes into the indirect cost pool.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {initial.availableCategories.map((category) => (
            <Label
              key={category}
              className="flex items-center gap-2.5 text-sm font-normal"
            >
              <Checkbox
                checked={billable.has(category)}
                onCheckedChange={(checked) =>
                  toggleCategory(category, checked === true)
                }
              />
              {category}
            </Label>
          ))}
        </CardContent>
        {billable.size === 0 && (
          <CardContent className="text-sm text-destructive">
            At least one category must be billable.
          </CardContent>
        )}
      </Card>

      <Card size="sm" className="gap-4">
        <CardHeader>
          <CardTitle className="text-sm">Monthly overhead</CardTitle>
          <CardDescription>
            Rent, licences, and other fixed costs added to the indirect cost
            pool each month, in AED.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="number"
            min={0}
            step={1000}
            value={overhead}
            onChange={(event) => {
              setOverhead(event.target.value)
              mutation.reset()
            }}
            aria-invalid={!overheadValid}
            className="max-w-48"
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!canSave}>
          {mutation.isPending && <LoaderCircle className="size-4 animate-spin" />}
          {mutation.isPending ? 'Saving…' : 'Save changes'}
        </Button>

        {mutation.isSuccess && (
          <p className="flex items-center gap-1.5 text-sm text-emerald-500">
            <CircleCheck className="size-4" />
            Saved — all figures now use these assumptions
          </p>
        )}

        {mutation.isError && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <TriangleAlert className="size-4" />
            {mutation.error.message}
          </p>
        )}
      </div>
    </form>
  )
}
