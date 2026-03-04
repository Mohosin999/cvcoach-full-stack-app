import { Router, Response } from 'express';
import { Analysis } from '../models/Analysis';
import { Resume } from '../models/Resume';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import { analyzeResume } from '../services/aiAnalysis';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const analyses = await Analysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('resumeId', 'metadata.originalName');

    const total = await Analysis.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: analyses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analyses'
    });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, jobDescription, jobTitle, company } = req.body;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Resume ID and job description are required'
      });
    }
    
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    console.log('=== RESUME FROM DB ===');
    console.log(JSON.stringify(resume?.content, null, 2));
    console.log('=== JOB DESCRIPTION ===');
    console.log(jobDescription.substring(0, 300));

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user || user.subscription.credits < 1) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient credits'
      });
    }

    const analysisResult = await analyzeResume(resume.content, jobDescription);

    const analysis = await Analysis.create({
      userId: req.user._id,
      resumeId: resume._id,
      jobDescription,
      jobTitle,
      company,
      ...analysisResult
    });

    user.subscription.credits -= 1;
    await user.save();

    res.status(201).json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error analyzing resume'
    });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('resumeId');

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analysis'
    });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    res.json({
      success: true,
      message: 'Analysis deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting analysis'
    });
  }
});

export default router;
