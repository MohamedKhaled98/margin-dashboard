import { queryOptions } from '@tanstack/react-query'

import { getSettings } from '@/api/settings'

export const settingsQuery = () =>
  queryOptions({
    queryKey: ['settings'] as const,
    queryFn: getSettings,
  })
