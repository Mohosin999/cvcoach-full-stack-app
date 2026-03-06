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

router.post('/add-free-credits', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const FREE_CREDIT_AMOUNT = 20;
    const MAX_FREE_CREDITS_PER_DAY = 1;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let canUseFreeCredits = true;
    let usedToday = 0;

    if (user.lastFreeCreditDate) {
      const lastCreditDate = new Date(user.lastFreeCreditDate);
      const lastCreditDay = new Date(lastCreditDate.getFullYear(), lastCreditDate.getMonth(), lastCreditDate.getDate());
      
      if (lastCreditDay.getTime() === todayStart.getTime()) {
        usedToday = user.freeCreditsUsedToday || 0;
        if (usedToday >= MAX_FREE_CREDITS_PER_DAY) {
          canUseFreeCredits = false;
        }
      }
    }

    if (!canUseFreeCredits) {
      return res.status(429).json({
        success: false,
        message: `You've already used your free credits for today. Come back tomorrow!`,
        canUseFreeCredits: false,
        remainingCredits: user.subscription.credits
      });
    }

    user.subscription.credits += FREE_CREDIT_AMOUNT;
    user.lastFreeCreditDate = now;
    user.freeCreditsUsedToday = usedToday + 1;
    await user.save();

    const updatedUser = await User.findById(user._id).select('-__v');

    res.json({
      success: true,
      data: {
        credits: updatedUser?.subscription.credits || user.subscription.credits,
        canUseFreeCredits: false,
        message: `Added ${FREE_CREDIT_AMOUNT} free credits!`
      }
    });
  } catch (error) {
    console.error('Error adding free credits:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding free credits'
    });
  }
});

router.get('/free-credits-status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const MAX_FREE_CREDITS_PER_DAY = 1;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let canUseFreeCredits = true;
    let usedToday = 0;

    if (user.lastFreeCreditDate) {
      const lastCreditDate = new Date(user.lastFreeCreditDate);
      const lastCreditDay = new Date(lastCreditDate.getFullYear(), lastCreditDate.getMonth(), lastCreditDate.getDate());
      
      if (lastCreditDay.getTime() === todayStart.getTime()) {
        usedToday = user.freeCreditsUsedToday || 0;
        if (usedToday >= MAX_FREE_CREDITS_PER_DAY) {
          canUseFreeCredits = false;
        }
      }
    }

    res.json({
      success: true,
      data: {
        canUseFreeCredits,
        usedToday,
        remainingToday: Math.max(0, MAX_FREE_CREDITS_PER_DAY - usedToday)
      }
    });
  } catch (error) {
    console.error('Error checking free credits status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking free credits status'
    });
  }
});

export default router;
