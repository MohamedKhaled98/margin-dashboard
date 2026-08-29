import type { Request, Response } from "express";
import { getCategoryStatsData } from "../services/category/category.service.js";
import { parsePeriod } from "../utils/parse-period.js";

export async function getCategoryStats(req: Request, res: Response) {
  const { year, month } = parsePeriod(req);

  const stats = await getCategoryStatsData(year, month);

  return res.json(stats);
}
