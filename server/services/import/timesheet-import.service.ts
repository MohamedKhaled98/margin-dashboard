import { TimesheetEntry } from "../../models/timesheet.js";
import type { ParsedTimesheetEntry } from "../../parsers/timesheet.parser.js";

export async function importTimesheet(
  entries: ParsedTimesheetEntry[]
) {
  if (entries.length === 0) return;

  const periods = new Map<string, { year: number; month: number }>();

  for (const entry of entries) {
    periods.set(`${entry.year}-${entry.month}`, {
      year: entry.year,
      month: entry.month,
    });
  }

  for (const { year, month } of periods.values()) {
    await TimesheetEntry.deleteMany({
      year,
      month,
    });

    const monthEntries = entries.filter(
      (entry) =>
        entry.year === year &&
        entry.month === month
    );

    await TimesheetEntry.insertMany(monthEntries);
  }
}