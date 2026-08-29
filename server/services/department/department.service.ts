import { TimesheetEntry } from "../../models/timesheet.js";
import { getAssumptions, getRatesForPeriod } from "../calc/rate.service.js";

export type DepartmentEmployee = {
  employeeNo: string;
  employeeName: string;
  designation: string | null;
  totalHours: number;
  billableHours: number;
  cost: number;
  missingSalary: boolean;
};

export type DepartmentBreakdown = {
  department: string | null;
  employeeCount: number;
  totalHours: number;
  billableHours: number;
  cost: number;
  employees: DepartmentEmployee[];
};

export type DepartmentStats = {
  period: { year: number; month: number | null };
  totalHours: number;
  totalCost: number;
  departments: DepartmentBreakdown[];
};

// Hours and cost per department, with the per-person breakdown inside each.
// Cost is what the department's people are paid: the sum of their salaries
// over the months they logged hours in — not the billable-rate allocation.
export async function getDepartmentStatsData(
  year: number,
  month?: number
): Promise<DepartmentStats> {
  const assumptions = await getAssumptions();
  const monthlyRates = await getRatesForPeriod(year, month, assumptions);

  const employeeTotals = new Map<
    string,
    Omit<DepartmentEmployee, "employeeName" | "designation">
  >();

  for (const rates of monthlyRates) {
    for (const employee of rates.employees) {
      const totals = employeeTotals.get(employee.employeeNo) ?? {
        employeeNo: employee.employeeNo,
        totalHours: 0,
        billableHours: 0,
        cost: 0,
        missingSalary: false,
      };

      totals.totalHours += employee.totalHours;
      totals.billableHours += employee.billableHours;
      totals.cost += employee.salary ?? 0;
      totals.missingSalary = totals.missingSalary || employee.salary === null;

      employeeTotals.set(employee.employeeNo, totals);
    }
  }

  // Department, designation and name come from the timesheet rows themselves.
  const identities = await TimesheetEntry.aggregate<{
    _id: string;
    employeeName: string;
    department: string | null;
    designation: string | null;
  }>([
    { $match: { year, ...(month ? { month } : {}) } },
    {
      $group: {
        _id: "$employeeNo",
        employeeName: { $first: "$employeeName" },
        department: { $first: "$department" },
        designation: { $first: "$designation" },
      },
    },
  ]);

  const identityByEmployee = new Map(
    identities.map((identity) => [identity._id, identity])
  );

  const departmentTotals = new Map<string | null, DepartmentBreakdown>();

  for (const totals of employeeTotals.values()) {
    const identity = identityByEmployee.get(totals.employeeNo);

    const employee: DepartmentEmployee = {
      ...totals,
      employeeName: identity?.employeeName ?? totals.employeeNo,
      designation: identity?.designation ?? null,
    };

    const departmentKey = identity?.department ?? null;

    const department = departmentTotals.get(departmentKey) ?? {
      department: departmentKey,
      employeeCount: 0,
      totalHours: 0,
      billableHours: 0,
      cost: 0,
      employees: [],
    };

    department.employeeCount += 1;
    department.totalHours += employee.totalHours;
    department.billableHours += employee.billableHours;
    department.cost += employee.cost;
    department.employees.push(employee);

    departmentTotals.set(departmentKey, department);
  }

  const departments = [...departmentTotals.values()]
    .map((department) => ({
      ...department,
      employees: department.employees.sort((a, b) => b.cost - a.cost),
    }))
    .sort((a, b) => b.cost - a.cost);

  return {
    period: { year, month: month ?? null },
    totalHours: departments.reduce(
      (sum, department) => sum + department.totalHours,
      0
    ),
    totalCost: departments.reduce(
      (sum, department) => sum + department.cost,
      0
    ),
    departments,
  };
}
