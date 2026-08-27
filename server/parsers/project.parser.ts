import  xlsx from "xlsx";

import {
  findHeaderRow,
  normalizeEmpty,
  validateRequiredHeaders,
} from "./utils/excel.utils.js";

import { parseMonth } from "./utils/date.utils.js";

export type ParsedProject = {
  refCode: string;
  name: string;
  price: number;
  salesYear: number;
  salesMonth: number;
  category: string;
  status: string | null;
};

export function parseProjects(
  filePath: string
): ParsedProject[] {
  const workbook = xlsx.readFile(filePath);

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName!];

  const rows = xlsx.utils.sheet_to_json<unknown[]>(sheet!, {
    header: 1,
    defval: null,
  });

  const headerRowIndex = findHeaderRow(rows, [
    "ref code",
    "project (billable) name",
    "project price",
    "sales month",
  ]);

  const headers = rows[headerRowIndex] as unknown[];

  validateRequiredHeaders(headers, [
    "Ref Code",
    "Project (Billable) Name",
    "Project Price",
    "Sales month",
    "Category",
    "Status",
  ]);

  const dataRows = rows.slice(headerRowIndex + 1);

  const rawObjects = dataRows.map((row) => {
    const result: Record<string, unknown> = {};

    headers.forEach((header, index) => {
      result[String(header).trim()] = row[index];
    });

    return result;
  });

  return rawObjects.map((row) => {
    const refCode = String(row["Ref Code"] ?? "").trim();
    const name = String(row["Project (Billable) Name"] ?? "").trim();
    const price = Number(row["Project Price"]);

    if (!refCode) {
      throw new Error("Project Ref Code is required");
    }

    if (!name) {
      throw new Error(`Project (Billable) Name is required for ${refCode}`);
    }

    if (!Number.isFinite(price) || price < 0) {
      throw new Error(`Invalid project price for ${refCode}`);
    }

    const { year, month } = parseMonth(
      String(row["Sales month"])
    );

    return {
      refCode,
      name,
      price,
      salesYear: year,
      salesMonth: month,
      category: String(row["Category"] ?? "").trim(),
      status: toNullableString(
        normalizeEmpty(row["Status"])
      ),
    };
  });
}

function toNullableString(value: unknown): string | null {
  if (value === null) return null;

  return String(value).trim();
}