import { api } from './client'

export type AppSettings = {
  billableCategories: string[]
  monthlyOverhead: number
  availableCategories: string[]
}

export type SettingsInput = {
  billableCategories: string[]
  monthlyOverhead: number
}

export async function getSettings(): Promise<AppSettings> {
  const { data } = await api.get<AppSettings>('/settings')

  return data
}

export async function updateSettings(input: SettingsInput): Promise<AppSettings> {
  const { data } = await api.put<AppSettings>('/settings', input)

  return data
}
