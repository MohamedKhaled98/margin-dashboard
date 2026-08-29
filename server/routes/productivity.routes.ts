import { Router } from "express";
import { getProductivity } from "../controllers/productivity.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getProductivity));

export default router;
