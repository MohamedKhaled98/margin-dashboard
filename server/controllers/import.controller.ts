import type { Request, Response } from "express";
import fs from "fs/promises";

import { parseTimesheet } from "../parsers/timesheet.parser.js";
import { importTimesheet } from "../services/import/timesheet-import.service.js";
import { importSalaries } from "../services/import/salary-import.service.js";
import { importProjects } from "../services/import/project-import.service.js";
import { parseSalary } from "../parsers/salary.parser.js";
import { parseProjects } from "../parsers/project.parser.js";

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

export async function uploadSalary(
    req: Request,
    res: Response
  ) {
    if (!req.file) {
      return res.status(400).json({
        message: "Salary file is required",
      });
    }
  
    const salaries = parseSalary(req.file.path);
  
    await importSalaries(salaries);
  
    return res.json({
      message: "Salary imported successfully",
      rows: salaries.length,
    });
  }

  export async function uploadProjects(
    req: Request,
    res: Response
  ) {
    if (!req.file) {
      return res.status(400).json({
        message: "Project file is required",
      });
    }
  
    const projects = parseProjects(req.file.path);
  
    await importProjects(projects);
  
    return res.json({
      message: "Projects imported successfully",
      rows: projects.length,
    });
  }