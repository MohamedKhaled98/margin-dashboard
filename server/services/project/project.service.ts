import { Project } from "../../models/project.js";
import { TimesheetEntry } from "../../models/timesheet.js";
import { getAssumptions, getMonthlyRates } from "../calc/rate.service.js";

export type ProjectSummary = {
  refCode: string;
  name: string;
  category: string;
  status: string | null;
  hours: number;
  // revenue/profit are null when the project has no price (no row in the
  // prices sheet, or a row with an empty price cell).
  revenue: number | null;
  cost: number;
  profit: number | null;
  margin: number | null;
  missingPrice: boolean;
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

  const summaries: ProjectSummary[] = projects.map((project) => {
    const totals = usageByRefCode.get(project.refCode) ?? {
      hours: 0,
      cost: 0,
    };

    const price = project.price ?? null;
    const profit = price !== null ? price - totals.cost : null;

    return {
      refCode: project.refCode,
      name: project.name,
      category: project.category,
      status: project.status ?? null,
      hours: totals.hours,
      revenue: price,
      cost: totals.cost,
      profit,
      margin: price !== null && price > 0 && profit !== null ? profit / price : null,
      missingPrice: price === null,
    };
  });

  // Billable ref codes with logged hours but no row in the prices sheet:
  // they still cost money, so they belong in the list, flagged.
  const knownRefCodes = new Set(projects.map((project) => project.refCode));

  const unpricedRefCodes = await TimesheetEntry.aggregate<{
    _id: string;
    projectName: string | null;
    category: string;
  }>([
    {
      $match: {
        refCode: { $ne: null, $nin: [...knownRefCodes] },
        category: { $in: assumptions.billableCategories },
      },
    },
    {
      $group: {
        _id: "$refCode",
        projectName: { $first: "$projectName" },
        category: { $first: "$category" },
      },
    },
  ]);

  for (const group of unpricedRefCodes) {
    const totals = usageByRefCode.get(group._id) ?? { hours: 0, cost: 0 };

    summaries.push({
      refCode: group._id,
      name: group.projectName ?? group._id,
      category: group.category,
      status: null,
      hours: totals.hours,
      revenue: null,
      cost: totals.cost,
      profit: null,
      margin: null,
      missingPrice: true,
    });
  }

  return summaries.sort(
    (a, b) => (b.revenue ?? 0) - (a.revenue ?? 0) || b.cost - a.cost
  );
}
