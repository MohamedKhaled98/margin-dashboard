import {
  findHeaderRow,
  isEmptyRow,
  normalizeEmpty,
  readFirstSheetRows,
  validateRequiredHeaders,
} from "./utils/excel.utils.js";
import { parseMonth } from "./utils/date.utils.js";

export type ParsedTimesheetEntry = {
  year: number;
  month: number;
  employeeNo: string;
  employeeName: string;
  expenseType: string;
  department: string | null;
  designation: string | null;
  category: string;
  refCode: string | null;
  projectName: string | null;
  company: string | null;
  description: string | null;
  hours: number;
};

export function parseTimesheet(filePath: string): ParsedTimesheetEntry[] {
  const rows = readFirstSheetRows(filePath);

  const headerRowIndex = findHeaderRow(rows, [
    "month",
    "employee no.",
    "employee name",
    "category",
    "hours",
  ]);

  const headers = rows[headerRowIndex] as unknown[];

  validateRequiredHeaders(headers, [
    "Month",
    "Employee No.",
    "Employee Name",
    "Type of Expense",
    "Department",
    "Designation",
    "Category",
    "Ref Code",
    "Project (Billable) / Task (Unbillable) Name",
    "Company Name (Billable)/ Fixed Costs (Unbillable)",
    "Description",
    "Hours",
  ]);

  const dataRows = rows
    .slice(headerRowIndex + 1)
    .filter((row) => !isEmptyRow(row));

  const objects = dataRows.map((row) => {
    const result: Record<string, unknown> = {};

    headers?.forEach((header, index) => {
      result[String(header ?? "").trim()] = row[index];
    });

    return result;
  });

  const normalizedObjects = objects.map((row) => {
    const { year, month } = parseMonth(String(row["Month"]));
    return {
      year,
      month,
      employeeNo: String(row["Employee No."] ?? "").trim(),
      employeeName: String(row["Employee Name"] ?? "").trim(),
      expenseType: String(row["Type of Expense"] ?? "").trim(),
      department: normalizeEmpty(row["Department"]),
      designation: normalizeEmpty(row["Designation"]),
      category: String(row["Category"] ?? "").trim(),
      refCode: normalizeEmpty(row["Ref Code"]),
      projectName: normalizeEmpty(row["Project (Billable) / Task (Unbillable) Name"]),
      company: normalizeEmpty(row["Company Name (Billable)/ Fixed Costs (Unbillable)"]),
      description: normalizeEmpty(row["Description"]),
      hours: Number(row["Hours"] ?? 0),
    };
  });

  return normalizedObjects;
}

