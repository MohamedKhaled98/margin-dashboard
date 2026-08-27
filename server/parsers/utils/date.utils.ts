import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);

export function parseMonth(
  value: string,
  fallbackYear?: number
) {
  const formats = [
    "MMMM YYYY",
    "MMMM 'YY",
    "MMM YYYY",
    "MMM 'YY",
  ];

  for (const format of formats) {
    const date = dayjs(value.trim(), format, true);

    if (date.isValid()) {
      return {
        year: date.year(),
        month: date.month() + 1,
      };
    }
  }

  // Example: "January"
  if (fallbackYear) {
    const date = dayjs(
      `${value.trim()} ${fallbackYear}`,
      "MMMM YYYY",
      true
    );

    if (date.isValid()) {
      return {
        year: date.year(),
        month: date.month() + 1,
      };
    }
  }

  throw new Error(`Invalid month: ${value}`);
}