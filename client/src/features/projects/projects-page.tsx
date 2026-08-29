import { ProjectsTable } from './components/projects-table'

export function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Every priced project across its full lifetime
        </p>
      </header>

      <ProjectsTable />
    </div>
  )
}
