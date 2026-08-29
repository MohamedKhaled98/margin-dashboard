import { Project } from "../../models/project.js";
import { TimesheetEntry } from "../../models/timesheet.js";
import {
  getAssumptions,
  getMonthlyRates,
  getRatesForPeriod,
  type MonthlyRates,
  type RateWarning,
} from "../calc/rate.service.js";

export type DashboardWarning =
  | (RateWarning & { months: number[] })
  | {
      code: "MISSING_PRICE";
      message: string;
      refCode: string;
      projectName: string | null;
    };

// Company-wide cost for a month: every billable hour charged at
// (direct + indirect rate). With clean data this equals salaries + overhead.
function monthCost(rates: MonthlyRates): number {
  return rates.employees.reduce(
    (sum, employee) =>
      sum +
      employee.billableHours *
        ((employee.directRate ?? 0) + rates.indirectRate),
    0
  );
}

// Revenue assumption: a project's full price is recognised in its sales month.
export async function getDashboardStatsData(year: number, month?: number) {
  const assumptions = await getAssumptions();
  const monthlyRates = await getRatesForPeriod(year, month, assumptions);
  console.log(`Monthly rates for ${year}${month ? `-${month}` : ""}:`, monthlyRates);
  let totalHours = 0;
  let billableHours = 0;
  let cost = 0;

  const rateWarnings = new Map<string, RateWarning & { months: number[] }>();

  for (const rates of monthlyRates) {
    totalHours += rates.totalHours;
    billableHours += rates.billableHours;
    cost += monthCost(rates);

    for (const warning of rates.warnings) {
      const key = `${warning.code}:${warning.employeeNo ?? ""}`;
      const existing = rateWarnings.get(key);

      if (existing) {
        existing.months.push(rates.month);
      } else {
        rateWarnings.set(key, { ...warning, months: [rates.month] });
      }
    }
  }

  const projects = await Project.find({
    salesYear: year,
    ...(month ? { salesMonth: month } : {}),
  }).lean();

  const revenue = projects.reduce((sum, project) => sum + project.price, 0);

  const priceWarnings = await findUnpricedRefCodes(
    year,
    month,
    assumptions.billableCategories
  );

  const profit = revenue - cost;

  return {
    period: { year, month: month ?? null },
    totalHours,
    billableHours,
    nonBillableHours: totalHours - billableHours,
    cost,
    revenue,
    profit,
    margin: revenue > 0 ? profit / revenue : null,
    projectsSold: projects.length,
    assumptions,
    warnings: [...rateWarnings.values(), ...priceWarnings],
  };
}

// Billable time logged against a ref code that has no price row.
async function findUnpricedRefCodes(
  year: number,
  month: number | undefined,
  billableCategories: string[]
): Promise<DashboardWarning[]> {
  const billableRefCodes = await TimesheetEntry.aggregate<{
    _id: string;
    projectName: string | null;
    hours: number;
  }>([
    {
      $match: {
        year,
        ...(month ? { month } : {}),
        category: { $in: billableCategories },
        refCode: { $ne: null },
      },
    },
    {
      $group: {
        _id: "$refCode",
        projectName: { $first: "$projectName" },
        hours: { $sum: "$hours" },
      },
    },
  ]);

  const pricedRefCodes = new Set(await Project.distinct("refCode"));

  return billableRefCodes
    .filter((group) => !pricedRefCodes.has(group._id))
    .map((group) => ({
      code: "MISSING_PRICE" as const,
      message: `${group.hours} billable hours logged on ${group._id} (${
        group.projectName ?? "unknown project"
      }) but it has no price row — its revenue is counted as zero`,
      refCode: group._id,
      projectName: group.projectName,
    }));
}

export type ProjectSummary = {
  refCode: string;
  name: string;
  category: string;
  status: string | null;
  hours: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number | null;
};

// Each project's full picture across every month it has hours in.
// Costing matches the dashboard: hours × (direct + indirect rate) per month.
export async function getProjectsListData(): Promise<ProjectSummary[]> {
  const assumptions = await getAssumptions();
  const projects = await Project.find().lean();

  const usage = await TimesheetEntry.aggregate<{
    _id: {
      refCode: string;
      year: number;
      month: number;
      employeeNo: string;
    };
    hours: number;
  }>([
    { $match: { refCode: { $ne: null } } },
    {
      $group: {
        _id: {
          refCode: "$refCode",
          year: "$year",
          month: "$month",
          employeeNo: "$employeeNo",
        },
        hours: { $sum: "$hours" },
      },
    },
  ]);

  // Cost rate per (month, employee), built once per month present in the data.
  const rateByMonthEmployee = new Map<string, number>();
  const months = new Map<string, { year: number; month: number }>();

  for (const group of usage) {
    months.set(`${group._id.year}-${group._id.month}`, {
      year: group._id.year,
      month: group._id.month,
    });
  }

  for (const { year, month } of months.values()) {
    const rates = await getMonthlyRates(year, month, assumptions);

    for (const employee of rates.employees) {
      rateByMonthEmployee.set(
        `${year}-${month}:${employee.employeeNo}`,
        (employee.directRate ?? 0) + rates.indirectRate
      );
    }
  }

  const usageByRefCode = new Map<string, { hours: number; cost: number }>();

  for (const group of usage) {
    const totals = usageByRefCode.get(group._id.refCode) ?? {
      hours: 0,
      cost: 0,
    };

    const rate =
      rateByMonthEmployee.get(
        `${group._id.year}-${group._id.month}:${group._id.employeeNo}`
      ) ?? 0;

    totals.hours += group.hours;
    totals.cost += group.hours * rate;
    usageByRefCode.set(group._id.refCode, totals);
  }

  return projects
    .map((project) => {
      const totals = usageByRefCode.get(project.refCode) ?? {
        hours: 0,
        cost: 0,
      };

      const profit = project.price - totals.cost;

      return {
        refCode: project.refCode,
        name: project.name,
        category: project.category,
        status: project.status ?? null,
        hours: totals.hours,
        revenue: project.price,
        cost: totals.cost,
        profit,
        margin: project.price > 0 ? profit / project.price : null,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}