import type { Request, Response } from "express";
import { getDepartmentStatsData } from "../services/department/department.service.js";
import { parsePeriod } from "../utils/parse-period.js";

export async function getDepartmentStats(req: Request, res: Response) {
  const { year, month } = parsePeriod(req);

  const stats = await getDepartmentStatsData(year, month);

  return res.json(stats);
}
