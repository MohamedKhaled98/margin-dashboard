import { createBrowserRouter } from 'react-router'

import { AppLayout } from '@/components/layout/app-layout'
import { ComingSoon } from '@/components/layout/coming-soon'
import { DashboardPage } from '@/features/dashboard/dashboard-page'
import { ImportsPage } from '@/features/imports/imports-page'
import { SettingsPage } from '@/features/settings/settings-page'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'projects', element: <ComingSoon title="Projects" /> },
      { path: 'productivity', element: <ComingSoon title="Productivity" /> },
      { path: 'imports', Component: ImportsPage },
      { path: 'settings', Component: SettingsPage },
    ],
  },
])
