import { Response } from 'express';
import { AuthRequest } from '../../middlewares';
import { User } from '../../models/User';
import {
  createResumeBuildHistory,
  getResumeBuildHistory,
  getResumeBuildHistoryById,
  deleteResumeBuildHistory,
  deleteAllResumeBuildHistory,
  updateResumeBuildHistory,
} from '../../services/resumeBuildHistory';

export const saveResumeBuild = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeContent, resumeName } = req.body;

    if (!resumeContent) {
      return res.status(400).json({
        success: false,
        message: 'Resume content is required',
      });
    }

    // Check user credits (Resume Build costs 10 credits)
    const user = await User.findById(req.user._id);
    if (!user || user.subscription.credits < 10) {
      return res.status(403).json({
        success: false,
        message: `Insufficient credits. This task requires 10 credits. You have ${user?.subscription.credits || 0} credits.`,
      });
    }

    const build = await createResumeBuildHistory(
      req.user._id.toString(),
      resumeContent
    );

    // Deduct 10 credits for Resume Build
    user.subscription.credits -= 10;
    await user.save();

    res.status(201).json({
      success: true,
      data: build,
      credits: user.subscription.credits,
      message: "✅ Credit deducted successfully! Task: Resume Build, Credits deducted: 10",
    });
  } catch (error: any) {
    console.error('Save resume build error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save resume build',
    });
  }
};

export const getResumeBuilds = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 3;

    const result = await getResumeBuildHistory(
      req.user._id.toString(),
      page,
      limit
    );

    res.json({
      success: true,
      data: result.builds,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Get Resume Builds error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get Resume Builds',
    });
  }
};

export const getResumeBuild = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const build = await getResumeBuildHistoryById(req.user._id.toString(), id);

    res.json({
      success: true,
      data: build,
    });
  } catch (error: any) {
    console.error('Get Resume Build error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Resume Build not found',
    });
  }
};

export const deleteResumeBuildController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    await deleteResumeBuildHistory(req.user._id.toString(), id);

    res.json({
      success: true,
      message: 'Resume Build deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete Resume Build error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Failed to delete Resume Build',
    });
  }
};

export const deleteAllResumeBuildsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    await deleteAllResumeBuildHistory(req.user._id.toString());

    res.json({
      success: true,
      message: 'All Resume Builds deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete all Resume Builds error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete Resume Builds',
    });
  }
};

export const updateResumeBuildController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { resumeContent } = req.body;

    if (!resumeContent) {
      return res.status(400).json({
        success: false,
        message: 'Resume content is required',
      });
    }

    const build = await updateResumeBuildHistory(
      req.user._id.toString(),
      id,
      resumeContent
    );

    res.json({
      success: true,
      data: build,
    });
  } catch (error: any) {
    console.error('Update resume build error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update resume build',
    });
  }
};
