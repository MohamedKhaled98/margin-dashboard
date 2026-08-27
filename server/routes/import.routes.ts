import { Router } from "express";

import { upload } from "../middleware/upload.middleware.js";
import { uploadProjects, uploadSalary, uploadTimesheet } from "../controllers/import.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post(
  "/timesheet",
  upload.single("file"),
  asyncHandler(uploadTimesheet) 
);

router.post(
    "/salary",
    upload.single("file"),
    asyncHandler(uploadSalary)
  );
  
  router.post(
    "/projects",
    upload.single("file"),
    asyncHandler(uploadProjects)
  );

export default router;