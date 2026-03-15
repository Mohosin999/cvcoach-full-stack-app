import { Response } from 'express';
import { AuthRequest } from '../../types';
import { Analysis } from '../../models/Analysis';

export const getSingleAnalysis = async (req: AuthRequest, res: Response) => {
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
