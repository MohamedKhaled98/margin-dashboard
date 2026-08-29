// Mirrors app/server/services/dashboard/dashboard.service.ts

export type RateWarning = {
  code: 'MISSING_SALARY' | 'NO_BILLABLE_HOURS'
  message: string
  employeeNo?: string
  employeeName?: string
  months: number[]
}

export type MissingPriceWarning = {
  code: 'MISSING_PRICE'
  message: string
  refCode: string
  projectName: string | null
}

export type DashboardWarning = RateWarning | MissingPriceWarning

export type Assumptions = {
  billableCategories: string[]
  monthlyOverhead: number
}

export type ProjectSummary = {
  refCode: string
  name: string
  category: string
  status: string | null
  hours: number
  revenue: number
  cost: number
  profit: number
  margin: number | null
}

export type DashboardStats = {
  period: { year: number; month: number | null }
  totalHours: number
  billableHours: number
  nonBillableHours: number
  cost: number
  revenue: number
  profit: number
  margin: number | null
  projectsSold: number
  assumptions: Assumptions
  warnings: DashboardWarning[]
}
