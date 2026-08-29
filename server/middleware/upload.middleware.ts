import multer from "multer";
import path from "path";

import { BadRequest } from "../utils/api-error.js";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,

  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (extension !== ".xlsx") {
      return cb(new BadRequest("Only .xlsx files are allowed"));
    }

    cb(null, true);
  },
});