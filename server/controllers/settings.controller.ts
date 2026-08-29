import type { Request, Response } from "express";

import {
  getSettingsData,
  updateSettingsData,
} from "../services/settings/settings.service.js";
import { BadRequest } from "../utils/api-error.js";

export async function getSettings(_req: Request, res: Response) {
  const settings = await getSettingsData();

  return res.json(settings);
}

export async function updateSettings(req: Request, res: Response) {
  const { billableCategories, monthlyOverhead } = req.body ?? {};

  if (
    !Array.isArray(billableCategories) ||
    billableCategories.length === 0 ||
    billableCategories.some(
      (category) => typeof category !== "string" || !category.trim()
    )
  ) {
    throw new BadRequest(
      "billableCategories must be a non-empty list of category names"
    );
  }

  if (
    typeof monthlyOverhead !== "number" ||
    !Number.isFinite(monthlyOverhead) ||
    monthlyOverhead < 0
  ) {
    throw new BadRequest("monthlyOverhead must be a number of 0 or more");
  }

  const settings = await updateSettingsData({
    billableCategories: billableCategories.map((category: string) =>
      category.trim()
    ),
    monthlyOverhead,
  });

  return res.json(settings);
}
