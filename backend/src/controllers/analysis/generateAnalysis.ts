import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { Analysis } from "../../models/Analysis";
import { Resume } from "../../models/Resume";
import { analyzeResume } from "../../services/aiAnalysis";
import { User } from "../../models/User";

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

    const analysisResult = await analyzeResume(
      resume.content,
      jobDescription || "",
    );

    const analysis = await Analysis.create({
      userId: req.user._id,
      resumeId: resume._id,
      jobDescription: jobDescription || "",
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
