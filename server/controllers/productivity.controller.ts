import type { Request, Response } from "express";
import { getProductivityData } from "../services/productivity/productivity.service.js";
import { parsePeriod } from "../utils/parse-period.js";

export async function getProductivity(req: Request, res: Response) {
  const { year, month } = parsePeriod(req);

  const stats = await getProductivityData(year, month);

  return res.json(stats);
}
