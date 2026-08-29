import { queryOptions } from '@tanstack/react-query'

import { getProductivity } from '@/api/productivity'

export const productivityQuery = (year: number, month?: number) =>
  queryOptions({
    queryKey: ['productivity', { year, month: month ?? null }] as const,
    queryFn: () => getProductivity({ year, month }),
  })
