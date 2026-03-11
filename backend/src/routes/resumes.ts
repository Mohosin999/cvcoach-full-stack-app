import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import {
  getAllResumes,
  uploadResume,
  createResumeFromContent,
  deleteAllResumes,
  getSingleResume,
  updateResume,
  deleteResume,
} from "../controllers/resumes";

const router = Router();

router.post("/content", authenticate, createResumeFromContent);

router.delete("/delete-all", authenticate, deleteAllResumes);

router.get("/:id", authenticate, getSingleResume);

router.put("/:id", authenticate, updateResume);

router.delete("/:id", authenticate, deleteResume);

router.get("/", authenticate, getAllResumes);

router.post("/", authenticate, uploadResume);

export default router;
