import { queryOptions } from '@tanstack/react-query'

import { getDashboardStats } from '@/api/dashboard'

export const dashboardStatsQuery = (year: number, month?: number) =>
  queryOptions({
    queryKey: ['dashboard', 'stats', { year, month: month ?? null }] as const,
    queryFn: () => getDashboardStats({ year, month }),
  })
