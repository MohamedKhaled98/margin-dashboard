import { Router } from "express";

import { upload } from "../middleware/upload.middleware.js";
import { uploadTimesheet } from "../controllers/import.controller.js";

const router = Router();

router.post(
  "/timesheet",
  upload.single("file"),
  uploadTimesheet
);

export default router;