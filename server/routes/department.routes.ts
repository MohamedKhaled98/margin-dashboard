import { Router } from "express";
import { getDepartmentStats } from "../controllers/department.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getDepartmentStats));

export default router;
