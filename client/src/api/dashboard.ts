import { api } from './client'
import type { DashboardStats, ProjectSummary } from './types'

export type Period = {
  year: number
  month?: number
}

export async function getDashboardStats(period: Period): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/dashboard/stats', {
    params: period,
  })

  return data
}

export async function getProjectsList(): Promise<ProjectSummary[]> {
  const { data } = await api.get<ProjectSummary[]>('/dashboard/projects')

  return data
}
