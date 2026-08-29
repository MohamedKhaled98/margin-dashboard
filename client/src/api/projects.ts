import { api } from './client'
import type { ProjectDetails, ProjectSummary } from './types'

export async function getProjectsList(): Promise<ProjectSummary[]> {
  const { data } = await api.get<ProjectSummary[]>('/projects')

  return data
}

export async function getProjectDetails(refCode: string): Promise<ProjectDetails> {
  const { data } = await api.get<ProjectDetails>(
    `/projects/${encodeURIComponent(refCode)}`
  )

  return data
}
