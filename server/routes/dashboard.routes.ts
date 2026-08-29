import { Router } from "express";
import { getDashboardStats, getProjectsList } from "../controllers/dashboard.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/stats", asyncHandler(getDashboardStats));
router.get("/projects", asyncHandler(getProjectsList));

export default router;