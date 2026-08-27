import type { Request, Response } from "express";
import fs from "fs/promises";

import { parseTimesheet } from "../parsers/timesheet.parser.js";
import { importTimesheet } from "../services/import/timesheet-import.service.js";

export async function uploadTimesheet(
  req: Request,
  res: Response
) {
  if (!req.file) {
    return res.status(400).json({
      message: "Timesheet file is required",
    });
  }

  try {
    const entries = parseTimesheet(req.file.path);

    await importTimesheet(entries);

    return res.json({
      message: "Timesheet imported successfully",
      rows: entries.length,
    });
  } finally {
    await fs.unlink(req.file.path).catch(() => {});
  }
}