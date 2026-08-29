import { Router } from "express";
import { getProjectDetails, getProjectsList } from "../controllers/project.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getProjectsList));
router.get("/:refCode", asyncHandler(getProjectDetails));

export default router;
