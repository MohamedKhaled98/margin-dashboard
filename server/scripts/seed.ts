// One-time sample-data loader: imports the exercise's three sample
// spreadsheets through the same parser/import pipeline the upload
// endpoints use, then exits. Safe to run on every container start —
// it skips itself once the database already has data.
//
// File locations and the Mongo URI are overridable via env vars so this
// also works inside Docker, where paths differ from the local checkout:
//   MONGODB_URI, SEED_TIMESHEET_PATH, SEED_SALARY_PATH, SEED_PROJECTS_PATH
// Set FORCE_SEED=1 to re-run against a database that already has data.

import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import mongoose from "mongoose";

import { Employee } from "../models/employee.js";
import { Project } from "../models/project.js";
import { TimesheetEntry } from "../models/timesheet.js";

import { parseSalary } from "../parsers/salary.parser.js";
import { parseProjects } from "../parsers/project.parser.js";
import { parseTimesheet } from "../parsers/timesheet.parser.js";

import { importSalaries } from "../services/import/salary-import.service.js";
import { importProjects } from "../services/import/project-import.service.js";
import { importTimesheet } from "../services/import/timesheet-import.service.js";

const SERVER_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://localhost:27017/margindashboard";

const FILES = {
  salary: process.env.SEED_SALARY_PATH ?? path.join(SERVER_ROOT, "salaries-2025.xlsx"),
  projects: process.env.SEED_PROJECTS_PATH ?? path.join(SERVER_ROOT, "project-prices-2025.xlsx"),
  timesheet: process.env.SEED_TIMESHEET_PATH ?? path.join(SERVER_ROOT, "timesheet-2025.xlsx"),
};

async function alreadySeeded(): Promise<boolean> {
  const [employees, projects, timesheetEntries] = await Promise.all([
    Employee.estimatedDocumentCount(),
    Project.estimatedDocumentCount(),
    TimesheetEntry.estimatedDocumentCount(),
  ]);

  return employees > 0 || projects > 0 || timesheetEntries > 0;
}

async function seedFile(
  label: string,
  filePath: string,
  run: (filePath: string) => Promise<number>
) {
  if (!existsSync(filePath)) {
    console.log(`[seed] skipping ${label} — no file at ${filePath}`);
    return;
  }

  const rows = await run(filePath);
  console.log(`[seed] imported ${rows} ${label} row(s) from ${filePath}`);
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log(`[seed] connected to ${MONGODB_URI}`);

  if ((await alreadySeeded()) && process.env.FORCE_SEED !== "1") {
    console.log(
      "[seed] database already has data — skipping (set FORCE_SEED=1 to reseed anyway)"
    );
    await mongoose.disconnect();
    return;
  }

  // Salaries first: this is what creates the Employee records.
  await seedFile("salary", FILES.salary, async (filePath) => {
    const salaries = parseSalary(filePath);
    await importSalaries(salaries);
    return salaries.length;
  });

  await seedFile("project", FILES.projects, async (filePath) => {
    const projects = parseProjects(filePath);
    await importProjects(projects);
    return projects.length;
  });

  await seedFile("timesheet", FILES.timesheet, async (filePath) => {
    const entries = parseTimesheet(filePath);
    await importTimesheet(entries);
    return entries.length;
  });

  console.log("[seed] done");
  await mongoose.disconnect();
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[seed] failed:", error);
    process.exit(1);
  });
