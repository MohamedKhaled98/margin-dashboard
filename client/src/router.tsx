import { createBrowserRouter } from 'react-router'

import { AppLayout } from '@/components/layout/app-layout'
import { CategoriesPage } from '@/features/categories/categories-page'
import { DashboardPage } from '@/features/dashboard/dashboard-page'
import { ImportsPage } from '@/features/imports/imports-page'
import { ProductivityPage } from '@/features/productivity/productivity-page'
import { ProjectDetailsPage } from '@/features/projects/project-details-page'
import { ProjectsPage } from '@/features/projects/projects-page'
import { SettingsPage } from '@/features/settings/settings-page'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'projects', Component: ProjectsPage },
      { path: 'projects/:refCode', Component: ProjectDetailsPage },
      { path: 'productivity', Component: ProductivityPage },
      { path: 'categories', Component: CategoriesPage },
      { path: 'imports', Component: ImportsPage },
      { path: 'settings', Component: SettingsPage },
    ],
  },
])
