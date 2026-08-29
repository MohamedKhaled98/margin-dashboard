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

// Mirrors app/server/services/project/

export type ProjectEmployeeContribution = {
  employeeNo: string
  employeeName: string
  department: string | null
  designation: string | null
  hours: number
  hoursShare: number
  cost: number
  // All null when the project has no price row.
  revenueShare: number | null
  profit: number | null
  profitability: number | null
  missingSalary: boolean
}

export type ProjectDepartmentBreakdown = {
  department: string | null
  hours: number
  hoursShare: number
  cost: number
}

export type ProjectMonthBreakdown = {
  year: number
  month: number
  hours: number
  cost: number
}

export type ProjectDetails = {
  refCode: string
  name: string
  category: string | null
  status: string | null
  price: number | null
  salesYear: number | null
  salesMonth: number | null
  totalHours: number
  cost: number
  profit: number | null
  margin: number | null
  employees: ProjectEmployeeContribution[]
  departments: ProjectDepartmentBreakdown[]
  months: ProjectMonthBreakdown[]
  warnings: DashboardWarning[]
}

// Mirrors app/server/services/productivity/productivity.service.ts

export type EmployeeProductivity = {
  employeeNo: string
  employeeName: string
  department: string | null
  designation: string | null
  totalHours: number
  billableHours: number
  nonBillableHours: number
  productivity: number
}

export type ProductivityStats = {
  period: { year: number; month: number | null }
  totalHours: number
  billableHours: number
  nonBillableHours: number
  productivity: number | null
  billableCategories: string[]
  employees: EmployeeProductivity[]
}

// Mirrors app/server/services/department/department.service.ts

export type DepartmentEmployee = {
  employeeNo: string
  employeeName: string
  designation: string | null
  totalHours: number
  billableHours: number
  cost: number
  missingSalary: boolean
}

export type DepartmentBreakdown = {
  department: string | null
  employeeCount: number
  totalHours: number
  billableHours: number
  cost: number
  employees: DepartmentEmployee[]
}

export type DepartmentStats = {
  period: { year: number; month: number | null }
  totalHours: number
  totalCost: number
  departments: DepartmentBreakdown[]
}

// Mirrors app/server/services/category/category.service.ts

export type CategoryHours = {
  category: string
  billable: boolean
  hours: number
  share: number
  employeeCount: number
}

export type CategoryStats = {
  period: { year: number; month: number | null }
  totalHours: number
  billableHours: number
  nonBillableHours: number
  billableCategories: string[]
  categories: CategoryHours[]
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
