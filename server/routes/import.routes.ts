import { Router } from "express";

import { upload } from "../middleware/upload.middleware.js";
import { uploadProjects, uploadSalary, uploadTimesheet } from "../controllers/import.controller.js";

const router = Router();

router.post(
  "/timesheet",
  upload.single("file"),
  uploadTimesheet
);

router.post(
    "/salary",
    upload.single("file"),
    uploadSalary
  );
  
  router.post(
    "/projects",
    upload.single("file"),
    uploadProjects
  );

export default router;