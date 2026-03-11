import { Response } from "express";
import { Analysis } from "../../models/Analysis";
import { AuthRequest } from "../../middlewares/auth";

export const getAllAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 3;
    const skip = (page - 1) * limit;

    const analyses = await Analysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("resumeId", "metadata content.personalInfo");

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
