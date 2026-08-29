

import type { Request, Response } from "express";
import { getDashboardStatsData } from "../services/dashboard/dashboard.service.js";
import { parsePeriod } from "../utils/parse-period.js";


export async function getDashboardStats(
    req: Request,
    res: Response
) {
    const { year, month } = parsePeriod(req);

    const stats = await getDashboardStatsData(year, month);

    return res.json(stats);
}
