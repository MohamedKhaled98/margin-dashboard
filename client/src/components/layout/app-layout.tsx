import { NavLink, Outlet } from 'react-router'
import {
  ChartNoAxesColumn,
  LayoutDashboard,
  Percent,
  Settings,
  Upload,
} from 'lucide-react'

import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/productivity', label: 'Productivity', icon: ChartNoAxesColumn },
  { to: '/imports', label: 'Imports', icon: Upload },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppLayout() {
  return (
    <div className="flex min-h-svh">
      <aside className="flex w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
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

        <nav className="flex flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
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
      </aside>

      <main className="flex-1 overflow-y-auto bg-muted/40">
        <Outlet />
      </main>
    </div>
  )
}
