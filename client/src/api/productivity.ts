import { api } from './client'
import type { Period } from './dashboard'
import type { ProductivityStats } from './types'

export async function getProductivity(period: Period): Promise<ProductivityStats> {
  const { data } = await api.get<ProductivityStats>('/productivity', {
    params: period,
  })

  return data
}
