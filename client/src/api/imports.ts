import { api } from './client'

export type ImportKind = 'timesheet' | 'salary' | 'projects'

export type ImportResult = {
  message: string
  rows: number
}

export async function uploadImportFile(
  kind: ImportKind,
  file: File
): Promise<ImportResult> {
  const form = new FormData()
  form.append('file', file)

  const { data } = await api.post<ImportResult>(`/import/${kind}`, form)

  return data
}
