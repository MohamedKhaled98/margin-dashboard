import { Employee } from "../../models/employee.js";
import type { ParsedTimesheetEntry } from "../../parsers/timesheet.parser.js";

;

export async function upsertEmployeesFromTimesheet(
  entries: ParsedTimesheetEntry[]
) {
  const uniqueEmployees = new Map<
    string,
    ParsedTimesheetEntry
  >();

  for (const entry of entries) {
    uniqueEmployees.set(entry.employeeNo, entry);
  }

  const operations = [...uniqueEmployees.values()].map(
    (entry) => ({
      updateOne: {
        filter: {
          employeeNo: entry.employeeNo,
        },

        update: {
          $set: {
            name: entry.employeeName,
            department: entry.department,
            designation: entry.designation,
          },
        },

        upsert: true,
      },
    })
  );
console.log(operations)
  if (operations.length === 0) return;

  await Employee.bulkWrite(operations);
}