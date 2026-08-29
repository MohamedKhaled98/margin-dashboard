

import type { Request, Response } from "express";
import { getDashboardStatsData } from "../services/dashboard/dashboard.service.js";
import { BadRequest } from "../utils/api-error.js";


export async function getDashboardStats(
    req: Request,
    res: Response
) {
    const year = Number(req.query.year);
    const month = req.query.month ? Number(req.query.month) : undefined;

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
        throw new BadRequest("A valid year is required")
    }

    if (month !== undefined && (!Number.isInteger(month) || month < 1 || month > 12)) {
        throw new BadRequest("month must be between 1 and 12")
    }

    const stats = await getDashboardStatsData(year, month);

    return res.json(stats);
}
