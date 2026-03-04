import { Router, Response } from 'express';
import { Resume } from '../models/Resume';
import { authenticate, AuthRequest, requireCredits } from '../middleware/auth';
import { upload, uploadErrorHandler } from '../config/multer';
import { parseResumeFile } from '../services/resumeParser';
import fs from 'fs';
import path from 'path';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const resumes = await Resume.find({ userId: req.user._id, isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-originalFormat');

    const total = await Resume.countDocuments({ userId: req.user._id, isActive: true });

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
  requireCredits,
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
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { isActive: false } },
      { new: true }
    );

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

export default router;
