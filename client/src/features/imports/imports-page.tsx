import { UploadCard } from './components/upload-card'

const IMPORTS = [
  {
    kind: 'timesheet',
    title: 'Timesheet',
    description:
      'Hours per person, task, and month. Re-uploading a month replaces that month only.',
  },
  {
    kind: 'salary',
    title: 'Salaries',
    description: 'One row per person, one column per month.',
  },
  {
    kind: 'projects',
    title: 'Project prices',
    description: 'One row per project, joined to the timesheet by ref code.',
  },
] as const

export function ImportsPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Import data</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Upload the three spreadsheets. Re-uploading a corrected file updates
          the existing data instead of duplicating it.
        </p>
      </header>

      <div className="grid gap-4">
        {IMPORTS.map((item) => (
          <UploadCard key={item.kind} {...item} />
        ))}
      </div>
    </div>
  )
}
