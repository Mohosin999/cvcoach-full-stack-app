import { Router, Response } from 'express';
import { Resume } from '../models/Resume';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middlewares/auth';
import { upload, uploadErrorHandler } from '../config/multer';
import { parseResumeFile } from '../services/resumeParser';
import {
  generateSummary,
  generateExperienceBulletPoints,
  generateProjectDescription,
  generateSkills,
  generateAchievement,
  generateCertification
} from '../services/resumeGenerator';
import fs from 'fs';
import path from 'path';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const resumes = await Resume.find({ userId: req.user._id, isActive: true, sourceType: 'builder' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-originalFormat');

    const total = await Resume.countDocuments({ userId: req.user._id, isActive: true, sourceType: 'builder' });

    res.json({
      success: true,
      data: resumes,
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
      message: 'Error fetching resumes'
    });
  }
});

router.post('/', 
  authenticate, 
  upload.single('resume'),
  uploadErrorHandler,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const parsedContent = await parseResumeFile(req.file.path, req.file.mimetype);

      const resume = await Resume.create({
        userId: req.user._id,
        sourceType: 'uploaded',
        originalFormat: {
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path
        },
        content: parsedContent,
        metadata: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype
        },
        isActive: true
      });

      res.status(201).json({
        success: true,
        data: resume
      });
    } catch (error: any) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Error uploading resume'
      });
    }
  }
);

router.post('/content',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Content is required'
        });
      }

      // Check if user has enough credits
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.subscription.credits <= 0) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient credits. Please upgrade your plan.'
        });
      }

      // Deduct one credit
      user.subscription.credits -= 1;
      await user.save();

      const resume = await Resume.create({
        userId: req.user._id,
        sourceType: 'builder',
        content,
        metadata: {
          filename: `resume_${Date.now()}.json`,
          originalName: content.personalInfo?.fullName || 'Resume',
          size: JSON.stringify(content).length,
          type: 'application/json'
        },
        isActive: true
      });

      res.status(201).json({
        success: true,
        data: resume,
        remainingCredits: user.subscription.credits
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error creating resume'
      });
    }
  }
);

router.delete('/delete-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await Resume.deleteMany(
      { userId: req.user._id, isActive: true }
    );

    return res.json({
      success: true,
      message: `Deleted ${result.deletedCount} resumes successfully`
    });
  } catch (error) {
    console.error('Error deleting all resumes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting all resumes'
    });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.json({
      success: true,
      data: resume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching resume'
    });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.json({
      success: true,
      data: resume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating resume'
    });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting resume'
    });
  }
});

router.post('/ai/generate-summary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { jobTitle, skills, experience } = req.body;

    if (!jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required'
      });
    }

    const summary = await generateSummary(jobTitle, skills || [], experience);

    res.json({
      success: true,
      data: { summary }
    });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate summary'
    });
  }
});

router.post('/ai/generate-experience', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { jobTitle, company, yearsExperience, skills } = req.body;

    if (!jobTitle || !company) {
      return res.status(400).json({
        success: false,
        message: 'Job title and company are required'
      });
    }

    const description = await generateExperienceBulletPoints(
      jobTitle,
      company,
      yearsExperience || 1,
      skills || []
    );

    res.json({
      success: true,
      data: { description }
    });
  } catch (error: any) {
    console.error('Error generating experience:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate experience'
    });
  }
});

router.post('/ai/generate-project', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { projectName, technologies } = req.body;

    if (!projectName) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    const description = await generateProjectDescription(projectName, technologies || []);

    res.json({
      success: true,
      data: { description }
    });
  } catch (error: any) {
    console.error('Error generating project:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate project'
    });
  }
});

router.post('/ai/generate-skills', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { jobTitle } = req.body;

    if (!jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required'
      });
    }

    const skills = await generateSkills(jobTitle);

    res.json({
      success: true,
      data: { skills }
    });
  } catch (error: any) {
    console.error('Error generating skills:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate skills'
    });
  }
});

router.post('/ai/generate-achievements', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { jobTitle, experience } = req.body;

    if (!jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required'
      });
    }

    const achievements = await generateAchievement(jobTitle, experience);

    res.json({
      success: true,
      data: { achievements }
    });
  } catch (error: any) {
    console.error('Error generating achievements:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate achievements'
    });
  }
});

router.post('/ai/generate-certifications', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { jobTitle } = req.body;

    if (!jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required'
      });
    }

    const certifications = await generateCertification(jobTitle);

    res.json({
      success: true,
      data: { certifications }
    });
  } catch (error: any) {
    console.error('Error generating certifications:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate certifications'
    });
  }
});

export default router;
