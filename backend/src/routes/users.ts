import { Router, Response } from 'express';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middlewares/auth';
import Joi from 'joi';

const router = Router();

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  preferences: Joi.object({
    theme: Joi.string().valid('light', 'dark', 'system'),
    defaultTemplate: Joi.string(),
    notifications: Joi.boolean()
  })
});

router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: value },
      { new: true, runValidators: true }
    ).select('-__v');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

router.delete('/account', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting account'
    });
  }
});

router.post('/use-credit', authenticate, async (req: AuthRequest, res: Response) => {
  try {
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
        message: 'Insufficient credits'
      });
    }

    user.subscription.credits -= 1;
    await user.save();

    res.json({
      success: true,
      data: {
        credits: user.subscription.credits
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error using credit'
    });
  }
});

export default router;
