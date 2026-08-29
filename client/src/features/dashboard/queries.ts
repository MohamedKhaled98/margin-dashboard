import { queryOptions } from '@tanstack/react-query'

import { getDashboardStats } from '@/api/dashboard'
import { getDepartmentStats } from '@/api/departments'

export const dashboardStatsQuery = (year: number, month?: number) =>
  queryOptions({
    queryKey: ['dashboard', 'stats', { year, month: month ?? null }] as const,
    queryFn: () => getDashboardStats({ year, month }),
  })

export const departmentStatsQuery = (year: number, month?: number) =>
  queryOptions({
    queryKey: ['departments', { year, month: month ?? null }] as const,
    queryFn: () => getDepartmentStats({ year, month }),
  })
