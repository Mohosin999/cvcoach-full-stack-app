import { Response } from 'express';
import { AuthRequest } from '../../types';
import { Analysis } from '../../models/Analysis';

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
