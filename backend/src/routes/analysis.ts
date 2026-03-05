import { Router, Response } from "express";
import { authenticate } from "../middlewares/auth";
import {
  deleteAnalysis,
  generateAnalysis,
  getAnalysis,
  getAnalysisById,
  deleteAllAnalyses,
} from "../controllers/analysisController";

const router = Router();

router.get("/", authenticate, getAnalysis);

router.post("/", authenticate, generateAnalysis);

router.delete("/delete-all", authenticate, deleteAllAnalyses);

router.get("/:id", authenticate, getAnalysisById);

router.delete("/:id", authenticate, deleteAnalysis);

export default router;
