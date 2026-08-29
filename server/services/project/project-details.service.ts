import { Project } from "../../models/project.js";
import { TimesheetEntry } from "../../models/timesheet.js";
import { NotFoundError } from "../../utils/api-error.js";
import {
  getAssumptions,
  getMonthlyRates,
  type RateWarning,
} from "../calc/rate.service.js";

export type ProjectWarning =
  | (RateWarning & { months: number[] })
  | {
      code: "MISSING_PRICE";
      message: string;
      refCode: string;
      projectName: string | null;
    };

export type ProjectEmployeeContribution = {
  employeeNo: string;
  employeeName: string;
  department: string | null;
  designation: string | null;
  hours: number;
  hoursShare: number;
  cost: number;
  // Both null when the project has no price row.
  revenueShare: number | null;
  profit: number | null;
  profitability: number | null;
  missingSalary: boolean;
};

export type ProjectDepartmentBreakdown = {
  department: string | null;
  hours: number;
  hoursShare: number;
  cost: number;
};

export type ProjectMonthBreakdown = {
  year: number;
  month: number;
  hours: number;
  cost: number;
};

export type ProjectDetails = {
  refCode: string;
  name: string;
  category: string | null;
  status: string | null;
  // price and sales date are null for ref codes that have logged hours
  // but no row in the project prices sheet.
  price: number | null;
  salesYear: number | null;
  salesMonth: number | null;
  totalHours: number;
  cost: number;
  profit: number | null;
  margin: number | null;
  employees: ProjectEmployeeContribution[];
  departments: ProjectDepartmentBreakdown[];
  months: ProjectMonthBreakdown[];
  warnings: ProjectWarning[];
};

// One project's full picture: every hour ever logged on its ref code, costed
// per month at (direct + indirect rate) — the same rule as the projects list.
export async function getProjectDetailsData(
  refCode: string
): Promise<ProjectDetails> {
  const assumptions = await getAssumptions();
  const project = await Project.findOne({ refCode }).lean();

  const usage = await TimesheetEntry.aggregate<{
    _id: { year: number; month: number; employeeNo: string };
    employeeName: string;
    department: string | null;
    designation: string | null;
    projectName: string | null;
    hours: number;
  }>([
    { $match: { refCode } },
    {
      $group: {
        _id: {
          year: "$year",
          month: "$month",
          employeeNo: "$employeeNo",
        },
        employeeName: { $first: "$employeeName" },
        department: { $first: "$department" },
        designation: { $first: "$designation" },
        projectName: { $first: "$projectName" },
        hours: { $sum: "$hours" },
      },
    },
  ]);

  if (!project && usage.length === 0) {
    throw new NotFoundError(
      `No project or logged hours found for ref code ${refCode}`
    );
  }

  // Cost rate and missing-salary flags per (month, employee), one rates
  // computation per month the project has hours in.
  const months = new Map<string, { year: number; month: number }>();

  for (const group of usage) {
    months.set(`${group._id.year}-${group._id.month}`, {
      year: group._id.year,
      month: group._id.month,
    });
  }

  const rateByMonthEmployee = new Map<string, number>();
  const missingSalaryMonths = new Map<string, number[]>();

  for (const { year, month } of months.values()) {
    const rates = await getMonthlyRates(year, month, assumptions);

    for (const employee of rates.employees) {
      rateByMonthEmployee.set(
        `${year}-${month}:${employee.employeeNo}`,
        (employee.directRate ?? 0) + rates.indirectRate
      );

      if (employee.salary === null) {
        const affected = missingSalaryMonths.get(employee.employeeNo) ?? [];
        affected.push(month);
        missingSalaryMonths.set(employee.employeeNo, affected);
      }
    }
  }

  const employeeTotals = new Map<
    string,
    Omit<ProjectEmployeeContribution, "hoursShare" | "revenueShare" | "profit" | "profitability">
  >();
  const monthTotals = new Map<string, ProjectMonthBreakdown>();
  // Months where a contributor both logged on this project and had no salary.
  const affectedSalaryMonths = new Map<string, Set<number>>();

  for (const group of usage) {
    const { year, month, employeeNo } = group._id;
    const rate =
      rateByMonthEmployee.get(`${year}-${month}:${employeeNo}`) ?? 0;
    const cost = group.hours * rate;

    const employee = employeeTotals.get(employeeNo) ?? {
      employeeNo,
      employeeName: group.employeeName,
      department: group.department ?? null,
      designation: group.designation ?? null,
      hours: 0,
      cost: 0,
      missingSalary: false,
    };

    if ((missingSalaryMonths.get(employeeNo) ?? []).includes(month)) {
      employee.missingSalary = true;
      const affected = affectedSalaryMonths.get(employeeNo) ?? new Set();
      affected.add(month);
      affectedSalaryMonths.set(employeeNo, affected);
    }

    employee.hours += group.hours;
    employee.cost += cost;
    employeeTotals.set(employeeNo, employee);

    const monthKey = `${year}-${month}`;
    const monthTotal = monthTotals.get(monthKey) ?? {
      year,
      month,
      hours: 0,
      cost: 0,
    };

    monthTotal.hours += group.hours;
    monthTotal.cost += cost;
    monthTotals.set(monthKey, monthTotal);
  }

  const totalHours = [...employeeTotals.values()].reduce(
    (sum, employee) => sum + employee.hours,
    0
  );
  const totalCost = [...employeeTotals.values()].reduce(
    (sum, employee) => sum + employee.cost,
    0
  );
  const price = project?.price ?? null;

  // Revenue share: price × (employee hours ÷ total project hours).
  const employees: ProjectEmployeeContribution[] = [...employeeTotals.values()]
    .map((employee) => {
      const revenueShare =
        price !== null && totalHours > 0
          ? price * (employee.hours / totalHours)
          : null;
      const profit =
        revenueShare !== null ? revenueShare - employee.cost : null;

      return {
        ...employee,
        hoursShare: totalHours > 0 ? employee.hours / totalHours : 0,
        revenueShare,
        profit,
        profitability:
          revenueShare !== null && revenueShare > 0
            ? (profit ?? 0) / revenueShare
            : null,
      };
    })
    .sort((a, b) => b.hours - a.hours);

  const departmentTotals = new Map<string | null, ProjectDepartmentBreakdown>();

  for (const employee of employees) {
    const department = departmentTotals.get(employee.department) ?? {
      department: employee.department,
      hours: 0,
      hoursShare: 0,
      cost: 0,
    };

    department.hours += employee.hours;
    department.cost += employee.cost;
    departmentTotals.set(employee.department, department);
  }

  const departments = [...departmentTotals.values()]
    .map((department) => ({
      ...department,
      hoursShare: totalHours > 0 ? department.hours / totalHours : 0,
    }))
    .sort((a, b) => b.hours - a.hours);

  const warnings: ProjectWarning[] = [];
  const projectName =
    project?.name ?? usage.find((group) => group.projectName)?.projectName ?? refCode;

  if (!project || project.price === null) {
    warnings.push({
      code: "MISSING_PRICE",
      message: `${totalHours} hours logged on ${refCode} but it has no price row — revenue is counted as zero and margins cannot be computed`,
      refCode,
      projectName,
    });
  }

  for (const employee of employees) {
    if (!employee.missingSalary) continue;

    warnings.push({
      code: "MISSING_SALARY",
      message: `${employee.employeeName} logged hours on this project but has no salary row in some months — their direct cost is counted as zero`,
      employeeNo: employee.employeeNo,
      employeeName: employee.employeeName,
      months: [...(affectedSalaryMonths.get(employee.employeeNo) ?? [])].sort(
        (a, b) => a - b
      ),
    });
  }

  const profit = price !== null ? price - totalCost : null;

  return {
    refCode,
    name: projectName,
    category: project?.category ?? null,
    status: project?.status ?? null,
    price,
    salesYear: project?.salesYear ?? null,
    salesMonth: project?.salesMonth ?? null,
    totalHours,
    cost: totalCost,
    profit,
    margin: price !== null && price > 0 && profit !== null ? profit / price : null,
    employees,
    departments,
    months: [...monthTotals.values()].sort(
      (a, b) => a.year - b.year || a.month - b.month
    ),
    warnings,
  };
}
