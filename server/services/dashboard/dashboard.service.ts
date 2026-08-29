import { Project } from "../../models/project.js";
import { TimesheetEntry } from "../../models/timesheet.js";
import {
  getAssumptions,
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
