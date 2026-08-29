import { api } from './client'
import type { Period } from './dashboard'
import type { CategoryStats } from './types'

export async function getCategoryStats(period: Period): Promise<CategoryStats> {
  const { data } = await api.get<CategoryStats>('/categories', {
    params: period,
  })

  return data
}
