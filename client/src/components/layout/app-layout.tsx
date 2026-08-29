import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import {
  ChartNoAxesColumn,
  ChartPie,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Percent,
  Settings,
  Upload,
} from 'lucide-react'

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/productivity', label: 'Productivity', icon: ChartNoAxesColumn },
  { to: '/categories', label: 'Categories', icon: ChartPie },
  { to: '/imports', label: 'Imports', icon: Upload },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 pt-6 pb-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Percent className="size-4" />
      </span>
      <div>
        <p className="text-sm font-semibold tracking-tight text-sidebar-foreground">
          Margin Dashboard
        </p>
        <p className="text-xs text-muted-foreground">Agency profitability</p>
      </div>
    </div>
  )
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
            )
          }
        >
          <Icon className="size-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <header className="flex items-center gap-3 border-b border-sidebar-border bg-sidebar px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation menu"
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          <Menu className="size-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Percent className="size-3.5" />
          </span>
          <p className="text-sm font-semibold tracking-tight text-sidebar-foreground">
            Margin Dashboard
          </p>
        </div>
      </header>

      <aside className="hidden w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <Brand />
        <NavList />
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent className="left-0 right-auto w-64 max-w-[80vw] gap-0 border-r border-l-0 bg-sidebar p-0 data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Brand />
          <NavList onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-y-auto bg-muted/40">
        <Outlet />
      </main>
    </div>
  )
}
