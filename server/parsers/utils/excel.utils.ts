import xlsx from "xlsx";

import { BadRequest } from "../../utils/api-error.js";

export function normalizeCell(value: unknown) {
    return String(value ?? "")
        .trim()
        .toLowerCase();
}

export function normalizeEmpty(value: unknown): string | null {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === "-"
    ) {
      return null;
    }

    return String(value);
  }

export function isEmptyRow(row: unknown[]): boolean {
    return row.every((cell) => normalizeEmpty(cell) === null);
}

// Reads the first sheet of a workbook as raw rows.
export function readFirstSheetRows(filePath: string): unknown[][] {
    let workbook: xlsx.WorkBook;

    try {
        workbook = xlsx.readFile(filePath);
    } catch {
        throw new BadRequest(
            "Could not read this file as an Excel workbook — is it really an .xlsx file?"
        );
    }

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
        throw new BadRequest("The uploaded file contains no sheets");
    }

    return xlsx.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName]!, {
        header: 1,
        defval: null,
    });
}

export function findHeaderRow(
    rows: unknown[][],
    requiredHeaders: string[]
) {
    const index = rows.findIndex((row) => {
        const normalizedRow = row.map(normalizeCell);

        return requiredHeaders.every((header) =>
            normalizedRow.includes(header)
        );
    });

    if (index === -1) {
        throw new BadRequest("Could not find header row");
    }

    return index;
}

export function validateRequiredHeaders(
    headers: unknown[],
    requiredHeaders: string[]
  ) {
    const normalizedHeaders = headers.map((header) =>
      String(header ?? "").trim().toLowerCase()
    );

    const missingHeaders = requiredHeaders.filter(
      (required) =>
        !normalizedHeaders.includes(required.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      throw new BadRequest(
        `Missing required columns: ${missingHeaders.join(", ")}`
      );
    }
  }
