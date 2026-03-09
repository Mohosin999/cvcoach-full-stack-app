import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../config/jwt";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token = req.cookies.accessToken;

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - No token provided",
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    User.findById(decoded.userId)
      .then((user) => {
        if (!user) {
          return res.status(401).json({
            success: false,
            message: "Unauthorized - User not found",
          });
        }
        req.user = user;
        next();
      })
      .catch(next);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid token",
    });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const token =
    req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Token invalid, continue without auth
    }
  }

  next();
};

export const requireCredits = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (req.user.subscription.credits <= 0) {
    return res.status(403).json({
      success: false,
      message: "Insufficient credits. Please upgrade your plan.",
      code: "INSUFFICIENT_CREDITS",
    });
  }

  next();
};
