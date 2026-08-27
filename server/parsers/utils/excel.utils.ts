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
        throw new Error("Could not find header row");
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
      throw new Error(
        `Missing required columns: ${missingHeaders.join(", ")}`
      );
    }
  }