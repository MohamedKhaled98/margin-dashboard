import { Employee } from "../../models/employee.js";
import { MonthlySalary } from "../../models/monthly-salary.js";
import { Settings } from "../../models/settings.js";
import { TimesheetEntry } from "../../models/timesheet.js";

export type Assumptions = {
  billableCategories: string[];
  monthlyOverhead: number;
};

export type RateWarning = {
  code: "MISSING_SALARY" | "NO_BILLABLE_HOURS";
  message: string;
  employeeNo?: string;
  employeeName?: string;
};

export type EmployeeMonthRate = {
  employeeNo: string;
  employeeName: string;
  salary: number | null;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  directRate: number | null;
  nonBillableCost: number;
};

export type SupportStaffMember = {
  employeeNo: string;
  employeeName: string;
  salary: number;
};

export type MonthlyRates = {
  year: number;
  month: number;
  assumptions: Assumptions;
  employees: EmployeeMonthRate[];
  supportStaff: SupportStaffMember[];
  totalHours: number;
  billableHours: number;
  indirectPool: {
    supportSalaries: number;
    nonBillableCost: number;
    overhead: number;
    total: number;
  };
  indirectRate: number;
  warnings: RateWarning[];
};

export async function getAssumptions(): Promise<Assumptions> {
  const settings = await Settings.findOne().lean();

  return {
    billableCategories: settings?.billableCategories ?? [
      "Projects",
      "Enhancements",
      "Hosting",
    ],
    monthlyOverhead: settings?.monthlyOverhead ?? 0,
  };
}

export async function getMonthlyRates(
  year: number,
  month: number,
  assumptions?: Assumptions
): Promise<MonthlyRates> {
  const { billableCategories, monthlyOverhead } =
    assumptions ?? (await getAssumptions());

  const hoursByEmployee = await TimesheetEntry.aggregate<{
    _id: string;
    employeeName: string;
    totalHours: number;
    billableHours: number;
  }>([
    { $match: { year, month } },
    {
      $group: {
        _id: "$employeeNo",
        employeeName: { $first: "$employeeName" },
        totalHours: { $sum: "$hours" },
        billableHours: {
          $sum: {
            $cond: [
              { $in: ["$category", billableCategories] },
              "$hours",
              0,
            ],
          },
        },
      },
    },
  ]);

  const salaries = await MonthlySalary.find({ year, month }).lean();

  const salaryByEmployee = new Map(
    salaries.map((salary) => [salary.employeeNo, salary.amount])
  );

  const warnings: RateWarning[] = [];
  const employees: EmployeeMonthRate[] = [];

  let totalHours = 0;
  let billableHours = 0;
  let nonBillableCost = 0;

  for (const group of hoursByEmployee) {
    if (group.totalHours <= 0) continue;

    const salary = salaryByEmployee.get(group._id) ?? null;

    if (salary === null) {
      warnings.push({
        code: "MISSING_SALARY",
        message: `${group.employeeName} logged hours but has no salary row — their cost is counted as zero`,
        employeeNo: group._id,
        employeeName: group.employeeName,
      });
    }

    const directRate =
      salary === null ? null : salary / group.totalHours;

    const nonBillable = group.totalHours - group.billableHours;
    const employeeNonBillableCost =
      directRate === null ? 0 : nonBillable * directRate;

    employees.push({
      employeeNo: group._id,
      employeeName: group.employeeName,
      salary,
      totalHours: group.totalHours,
      billableHours: group.billableHours,
      nonBillableHours: nonBillable,
      directRate,
      nonBillableCost: employeeNonBillableCost,
    });

    totalHours += group.totalHours;
    billableHours += group.billableHours;
    nonBillableCost += employeeNonBillableCost;
  }

  // People with a salary this month but no logged hours: support staff.
  // Their whole salary goes into the indirect pool.
  const loggedEmployeeNos = new Set(
    employees.map((employee) => employee.employeeNo)
  );

  const supportEmployeeNos = salaries
    .filter((salary) => !loggedEmployeeNos.has(salary.employeeNo))
    .map((salary) => salary.employeeNo);

  const supportEmployees = await Employee.find({
    employeeNo: { $in: supportEmployeeNos },
  }).lean();

  const nameByEmployeeNo = new Map(
    supportEmployees.map((employee) => [employee.employeeNo, employee.name])
  );

  const supportStaff: SupportStaffMember[] = salaries
    .filter((salary) => !loggedEmployeeNos.has(salary.employeeNo))
    .map((salary) => ({
      employeeNo: salary.employeeNo,
      employeeName:
        nameByEmployeeNo.get(salary.employeeNo) ?? salary.employeeNo,
      salary: salary.amount,
    }));

  const supportSalaries = supportStaff.reduce(
    (sum, member) => sum + member.salary,
    0
  );

  const poolTotal = supportSalaries + nonBillableCost + monthlyOverhead;

  if (poolTotal > 0 && billableHours === 0) {
    warnings.push({
      code: "NO_BILLABLE_HOURS",
      message: `No billable hours in ${year}-${month}: the indirect pool has nowhere to go and project costs will be understated`,
    });
  }

  const indirectRate = billableHours > 0 ? poolTotal / billableHours : 0;

  return {
    year,
    month,
    assumptions: { billableCategories, monthlyOverhead },
    employees,
    supportStaff,
    totalHours,
    billableHours,
    indirectPool: {
      supportSalaries,
      nonBillableCost,
      overhead: monthlyOverhead,
      total: poolTotal,
    },
    indirectRate,
    warnings,
  };
}

export async function getRatesForPeriod(
  year: number,
  month?: number,
  assumptions?: Assumptions
): Promise<MonthlyRates[]> {
  const resolvedAssumptions = assumptions ?? (await getAssumptions());

  if (month) {
    return [await getMonthlyRates(year, month, resolvedAssumptions)];
  }

  const [timesheetMonths, salaryMonths] = await Promise.all([
    TimesheetEntry.distinct("month", { year }),
    MonthlySalary.distinct("month", { year }),
  ]);

  const months = [...new Set([...timesheetMonths, ...salaryMonths])].sort(
    (a, b) => a - b
  );

  return Promise.all(
    months.map((m) => getMonthlyRates(year, m, resolvedAssumptions))
  );
}

// Cost of one employee's hours in a given month: hours × (direct + indirect).
// Employees with no salary row contribute only the indirect component.
export function costOfHours(
  rates: MonthlyRates,
  employeeNo: string,
  hours: number
): number {
  const employee = rates.employees.find(
    (candidate) => candidate.employeeNo === employeeNo
  );

  const directRate = employee?.directRate ?? 0;

  return hours * (directRate + rates.indirectRate);
}
