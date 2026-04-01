import { Response } from 'express';
import { AuthRequest } from '../../middlewares';
import { User } from '../../models/User';
import {
  createAtsScoreHistory,
  getAtsScoreHistory,
  getAtsScoreHistoryById,
  deleteAtsScoreHistory,
  deleteAllAtsScoreHistory,
} from '../../services/atsScoreHistory';

export const analyzeAtsScore = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeName, resumeContent } = req.body;

    if (!resumeContent) {
      return res.status(400).json({
        success: false,
        message: 'Resume content is required',
      });
    }

    // Check user credits (ATS Score costs 5 credits)
    const user = await User.findById(req.user._id);
    if (!user || user.subscription.credits < 5) {
      return res.status(403).json({
        success: false,
        message: `Insufficient credits. This task requires 5 credits. You have ${user?.subscription.credits || 0} credits.`,
      });
    }

    const score = await createAtsScoreHistory(
      req.user._id.toString(),
      resumeName || 'Untitled Resume',
      resumeContent
    );

    // Deduct 5 credits for ATS Score Analysis
    user.subscription.credits -= 5;
    await user.save();

    res.status(201).json({
      success: true,
      data: score,
      credits: user.subscription.credits,
      message: "✅ Credit deducted successfully! Task: ATS Score Analysis, Credits deducted: 5",
    });
  } catch (error: any) {
    console.error('ATS Score analysis error:', error);
    const status = error.message.includes('Insufficient credits') ? 403 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Failed to analyze ATS score',
    });
  }
};

export const getAtsScores = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 3;

    const result = await getAtsScoreHistory(
      req.user._id.toString(),
      page,
      limit
    );

    res.json({
      success: true,
      data: result.scores,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Get ATS scores error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get ATS scores',
    });
  }
};

export const getAtsScore = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const score = await getAtsScoreHistoryById(req.user._id.toString(), id);

    res.json({
      success: true,
      data: score,
    });
  } catch (error: any) {
    console.error('Get ATS score error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'ATS Score not found',
    });
  }
};

export const deleteAtsScoreController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    await deleteAtsScoreHistory(req.user._id.toString(), id);

    res.json({
      success: true,
      message: 'ATS Score deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete ATS score error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Failed to delete ATS Score',
    });
  }
};

export const deleteAllAtsScoresController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    await deleteAllAtsScoreHistory(req.user._id.toString());

    res.json({
      success: true,
      message: 'All ATS Scores deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete all ATS scores error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete ATS Scores',
    });
  }
};
