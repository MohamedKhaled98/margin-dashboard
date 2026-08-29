import { api } from './client'
import type { Period } from './dashboard'
import type { DepartmentStats } from './types'

export async function getDepartmentStats(period: Period): Promise<DepartmentStats> {
  const { data } = await api.get<DepartmentStats>('/departments', {
    params: period,
  })

  return data
}
