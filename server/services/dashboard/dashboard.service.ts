import { Project } from "../../models/project.js";
import { TimesheetEntry } from "../../models/timesheet.js";
import {
  getAssumptions,
  getRatesForPeriod,
  type MonthlyRates,
  type RateWarning,
} from "../calc/rate.service.js";

export type MissingPriceWarning = {
  code: "MISSING_PRICE";
  message: string;
  refCode: string;
  projectName: string | null;
};

export type DashboardWarning =
  | (RateWarning & { months: number[] })
  | MissingPriceWarning;

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

  const revenue = projects.reduce(
    (sum, project) => sum + (project.price ?? 0),
    0
  );

  const priceWarnings = await findUnpricedRefCodes(
    year,
    month,
    assumptions.billableCategories
  );

  // Projects sold this period whose price cell was empty in the sheet. The
  // hours-based scan above misses them because a project row exists.
  for (const project of projects) {
    if (project.price !== null) continue;
    if (priceWarnings.some((warning) => warning.refCode === project.refCode)) {
      continue;
    }

    priceWarnings.push({
      code: "MISSING_PRICE",
      message: `${project.name} (${project.refCode}) was sold this period but its price is missing — its revenue is counted as zero`,
      refCode: project.refCode,
      projectName: project.name,
    });
  }

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

// Billable time logged against a ref code that has no price. Covers both a
// missing row in the prices sheet and a row whose price cell was empty.
async function findUnpricedRefCodes(
  year: number,
  month: number | undefined,
  billableCategories: string[]
): Promise<MissingPriceWarning[]> {
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

  const pricedRefCodes = new Set(
    await Project.distinct("refCode", { price: { $ne: null } })
  );

  return billableRefCodes
    .filter((group) => !pricedRefCodes.has(group._id))
    .map((group) => ({
      code: "MISSING_PRICE" as const,
      message: `${Math.round(group.hours * 10) / 10} billable hours logged on ${group._id} (${
        group.projectName ?? "unknown project"
      }) but it has no price — its revenue is counted as zero`,
      refCode: group._id,
      projectName: group.projectName,
    }));
}
