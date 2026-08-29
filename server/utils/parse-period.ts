import type { Request } from "express";
import { BadRequest } from "./api-error.js";

// Shared year/month query validation for period-filtered endpoints.
export function parsePeriod(req: Request): {
  year: number;
  month: number | undefined;
} {
  const year = Number(req.query.year);
  const month = req.query.month ? Number(req.query.month) : undefined;

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new BadRequest("A valid year is required");
  }

  if (
    month !== undefined &&
    (!Number.isInteger(month) || month < 1 || month > 12)
  ) {
    throw new BadRequest("month must be between 1 and 12");
  }

  return { year, month };
}
