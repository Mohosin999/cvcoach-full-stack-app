import { Response } from 'express';
import { AuthRequest } from '../../types';
import { Analysis } from '../../models/Analysis';

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
