import { Router } from "express";

import {
  getSettings,
  updateSettings,
} from "../controllers/settings.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getSettings));
router.put("/", asyncHandler(updateSettings));

export default router;
