import { queryOptions } from '@tanstack/react-query'

import { getProjectDetails, getProjectsList } from '@/api/projects'

export const projectsListQuery = () =>
  queryOptions({
    queryKey: ['projects', 'list'] as const,
    queryFn: getProjectsList,
  })

export const projectDetailsQuery = (refCode: string) =>
  queryOptions({
    queryKey: ['projects', 'details', refCode] as const,
    queryFn: () => getProjectDetails(refCode),
  })
