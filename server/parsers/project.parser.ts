import {
  findHeaderRow,
  isEmptyRow,
  normalizeEmpty,
  readFirstSheetRows,
  validateRequiredHeaders,
} from "./utils/excel.utils.js";

import { BadRequest } from "../utils/api-error.js";
import { parseMonth } from "./utils/date.utils.js";

export type ParsedProject = {
  refCode: string;
  name: string;
  // null when the price cell is empty or "-": the project exists but has no
  // price yet. Surfaced as a MISSING_PRICE warning downstream, never a crash.
  price: number | null;
  salesYear: number;
  salesMonth: number;
  category: string;
  status: string | null;
};

export function parseProjects(
  filePath: string
): ParsedProject[] {
  const rows = readFirstSheetRows(filePath);

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

  const dataRows = rows
    .slice(headerRowIndex + 1)
    .filter((row) => !isEmptyRow(row));

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
    const rawPrice = normalizeEmpty(row["Project Price"]);
    const price = rawPrice === null ? null : Number(rawPrice);

    if (!refCode) {
      throw new BadRequest("Project Ref Code is required");
    }

    if (!name) {
      throw new BadRequest(`Project (Billable) Name is required for ${refCode}`);
    }

    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      throw new BadRequest(
        `Invalid project price for ${refCode}: ${rawPrice}`
      );
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
