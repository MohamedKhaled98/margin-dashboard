import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/stats", asyncHandler(getDashboardStats));

export default router;
