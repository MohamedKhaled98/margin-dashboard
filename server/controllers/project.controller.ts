import type { Request, Response } from "express";
import { getProjectDetailsData } from "../services/project/project-details.service.js";
import { getProjectsListData } from "../services/project/project.service.js";
import { BadRequest } from "../utils/api-error.js";

export async function getProjectsList(
    req: Request,
    res: Response
) {
    const list = await getProjectsListData();

    return res.json(list);
}

export async function getProjectDetails(
    req: Request,
    res: Response
) {
    const rawRefCode = req.params.refCode;
    const refCode =
        typeof rawRefCode === "string" ? rawRefCode.trim() : undefined;

    if (!refCode) {
        throw new BadRequest("A ref code is required")
    }

    const details = await getProjectDetailsData(refCode);

    return res.json(details);
}
