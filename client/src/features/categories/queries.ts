import { queryOptions } from '@tanstack/react-query'

import { getCategoryStats } from '@/api/categories'

export const categoryStatsQuery = (year: number, month?: number) =>
  queryOptions({
    queryKey: ['categories', { year, month: month ?? null }] as const,
    queryFn: () => getCategoryStats({ year, month }),
  })
