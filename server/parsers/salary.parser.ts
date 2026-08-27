import xlsx from "xlsx";
import { findHeaderRow, normalizeEmpty, validateRequiredHeaders } from "./utils/excel.utils.js";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData.js";

dayjs.extend(localeData)

export type ParsedSalary = {
    employeeNo: string;
    employeeName: string;
    year: number;
    month: number;
    amount: number;
};

export function parseSalary(filePath: string) {

    const workbook = xlsx.readFile(filePath);

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName!];

    const rows = xlsx.utils.sheet_to_json<unknown[]>(sheet!, {
        header: 1,
        defval: null,
    });

    const headerRowIndex = findHeaderRow(rows, [
        "employee no.",
        "employee name",
        "january",
        "december",
    ]);
    const headers = rows[headerRowIndex] as unknown[];

    validateRequiredHeaders(headers, [
        "Employee No.",
        "Employee Name",
        ...dayjs.months()
      ]);
   
    const dataRows = rows.slice(headerRowIndex + 1);

    const rawObjects = dataRows.map((row) => {
        const result: Record<string, unknown> = {};


        headers!.forEach((header, index) => {
            result[String(header).trim()] = row[index];
        });

        return result;
    });

    const salaries = rawObjects.flatMap((row) => {
        const employeeNo = String(
            row["Employee No."] ?? ""
        ).trim();

        const employeeName = String(
            row["Employee Name"] ?? ""
        ).trim();

        return dayjs.months().flatMap((monthName, index) => {
            const value = normalizeEmpty(row[monthName]);

            if (value === null) {
                return [];
            }
            const amount = Number(value);

            if (!Number.isFinite(amount) || amount < 0) {
                throw new Error(
                  `Invalid salary for ${employeeName} - ${monthName}: ${value}`
                );
              }

            return [
                {
                    employeeNo,
                    employeeName,
                    year: 2025,
                    month: index + 1,
                    amount: Number(value),
                },
            ];
        });
    });

    //   console.log(salaries);
    return salaries;
}