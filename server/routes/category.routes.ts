import { Router } from "express";
import { getCategoryStats } from "../controllers/category.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getCategoryStats));

export default router;
