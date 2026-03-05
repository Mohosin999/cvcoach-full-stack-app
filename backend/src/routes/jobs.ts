import { Router, Response } from 'express';
import { JobDescription } from '../models/JobDescription';
import { authenticate, AuthRequest } from '../middlewares/auth';
import Joi from 'joi';

const router = Router();

const jobSchema = Joi.object({
  title: Joi.string().required().min(2).max(100),
  company: Joi.string().max(100),
  description: Joi.string().required().min(10)
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const jobs = await JobDescription.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await JobDescription.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: jobs,
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
      message: 'Error fetching job descriptions'
    });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = jobSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const job = await JobDescription.create({
      ...value,
      userId: req.user._id
    });

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving job description'
    });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const job = await JobDescription.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching job description'
    });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = jobSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const job = await JobDescription.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: value },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating job description'
    });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const job = await JobDescription.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found'
      });
    }

    res.json({
      success: true,
      message: 'Job description deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting job description'
    });
  }
});

export default router;
