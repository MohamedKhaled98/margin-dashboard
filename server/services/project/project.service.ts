import { Project } from "../../models/project.js";
import { TimesheetEntry } from "../../models/timesheet.js";
import { getAssumptions, getMonthlyRates } from "../calc/rate.service.js";

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
