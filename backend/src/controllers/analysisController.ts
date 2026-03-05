import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { Analysis } from "../models/Analysis";
import { analyzeResume } from "../services/aiAnalysis";
import { User } from "../models/User";
import { Resume } from "../models/Resume";

export const getAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const analyses = await Analysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("resumeId", "metadata.originalName content.personalInfo.name");

    const total = await Analysis.countDocuments({ userId: req.user._id });

    return res.json({
      success: true,
      data: analyses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching analyses",
    });
  }
};

export const getAnalysisById = async (req: AuthRequest, res: Response) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("resumeId");

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    return res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching analysis",
    });
  }
};

export const generateAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, jobDescription, jobTitle, company } = req.body;

    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: "Resume ID is required",
      });
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user || user.subscription.credits < 1) {
      return res.status(403).json({
        success: false,
        message: "Insufficient credits. Please upgrade your plan.",
      });
    }

    const analysisResult = await analyzeResume(resume.content, jobDescription || '');

    const analysis = await Analysis.create({
      userId: req.user._id,
      resumeId: resume._id,
      jobDescription: jobDescription || '',
      jobTitle,
      company,
      ...analysisResult,
    });

    user.subscription.credits -= 1;
    await user.save();

    return res.status(201).json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error analyzing resume",
    });
  }
};

export const deleteAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    return res.json({
      success: true,
      message: "Analysis deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting analysis",
    });
  }
};

export const deleteAllAnalyses = async (req: AuthRequest, res: Response) => {
  try {
    await Analysis.deleteMany({ userId: req.user._id });

    return res.json({
      success: true,
      message: "All analyses deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting all analyses",
    });
  }
};
