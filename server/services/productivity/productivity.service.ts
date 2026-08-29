import { TimesheetEntry } from "../../models/timesheet.js";
import { getAssumptions } from "../calc/rate.service.js";

export type EmployeeProductivity = {
  employeeNo: string;
  employeeName: string;
  department: string | null;
  designation: string | null;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  productivity: number;
};

export type ProductivityStats = {
  period: { year: number; month: number | null };
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  productivity: number | null;
  billableCategories: string[];
  employees: EmployeeProductivity[];
};

// Productivity = billable hours ÷ total hours logged, per employee.
// Billable categories come from settings, same as the cost model.
export async function getProductivityData(
  year: number,
  month?: number
): Promise<ProductivityStats> {
  const { billableCategories } = await getAssumptions();

  const hoursByEmployee = await TimesheetEntry.aggregate<{
    _id: string;
    employeeName: string;
    department: string | null;
    designation: string | null;
    totalHours: number;
    billableHours: number;
  }>([
    { $match: { year, ...(month ? { month } : {}) } },
    {
      $group: {
        _id: "$employeeNo",
        employeeName: { $first: "$employeeName" },
        department: { $first: "$department" },
        designation: { $first: "$designation" },
        totalHours: { $sum: "$hours" },
        billableHours: {
          $sum: {
            $cond: [{ $in: ["$category", billableCategories] }, "$hours", 0],
          },
        },
      },
    },
  ]);

  const employees: EmployeeProductivity[] = hoursByEmployee
    .filter((group) => group.totalHours > 0)
    .map((group) => ({
      employeeNo: group._id,
      employeeName: group.employeeName,
      department: group.department ?? null,
      designation: group.designation ?? null,
      totalHours: group.totalHours,
      billableHours: group.billableHours,
      nonBillableHours: group.totalHours - group.billableHours,
      productivity: group.billableHours / group.totalHours,
    }))
    .sort(
      (a, b) => b.productivity - a.productivity || b.totalHours - a.totalHours
    );

  const totalHours = employees.reduce(
    (sum, employee) => sum + employee.totalHours,
    0
  );
  const billableHours = employees.reduce(
    (sum, employee) => sum + employee.billableHours,
    0
  );

  return {
    period: { year, month: month ?? null },
    totalHours,
    billableHours,
    nonBillableHours: totalHours - billableHours,
    productivity: totalHours > 0 ? billableHours / totalHours : null,
    billableCategories,
    employees,
  };
}
