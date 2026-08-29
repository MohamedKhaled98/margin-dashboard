import { TimesheetEntry } from "../../models/timesheet.js";
import { getAssumptions } from "../calc/rate.service.js";

export type CategoryHours = {
  category: string;
  billable: boolean;
  hours: number;
  share: number;
  employeeCount: number;
};

export type CategoryStats = {
  period: { year: number; month: number | null };
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  billableCategories: string[];
  categories: CategoryHours[];
};

// Hours per category — where the time actually goes. Billable categories
// come from settings, same as the cost model.
export async function getCategoryStatsData(
  year: number,
  month?: number
): Promise<CategoryStats> {
  const { billableCategories } = await getAssumptions();

  const hoursByCategory = await TimesheetEntry.aggregate<{
    _id: string;
    hours: number;
    employeeCount: number;
  }>([
    { $match: { year, ...(month ? { month } : {}) } },
    {
      $group: {
        _id: "$category",
        hours: { $sum: "$hours" },
        employees: { $addToSet: "$employeeNo" },
      },
    },
    {
      $project: {
        hours: 1,
        employeeCount: { $size: "$employees" },
      },
    },
  ]);

  const totalHours = hoursByCategory.reduce(
    (sum, group) => sum + group.hours,
    0
  );

  const billableSet = new Set(billableCategories);

  const categories: CategoryHours[] = hoursByCategory
    .map((group) => ({
      category: group._id,
      billable: billableSet.has(group._id),
      hours: group.hours,
      share: totalHours > 0 ? group.hours / totalHours : 0,
      employeeCount: group.employeeCount,
    }))
    .sort((a, b) => b.hours - a.hours);

  const billableHours = categories
    .filter((category) => category.billable)
    .reduce((sum, category) => sum + category.hours, 0);

  return {
    period: { year, month: month ?? null },
    totalHours,
    billableHours,
    nonBillableHours: totalHours - billableHours,
    billableCategories,
    categories,
  };
}
