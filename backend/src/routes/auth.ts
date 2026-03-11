import { Router, Response } from "express";
import passport from "passport";
import { authenticate, AuthRequest } from "../middlewares/auth";
import { generateAccessToken, generateRefreshToken } from "../config/jwt";
import {
  register,
  login,
  getMe,
  refreshToken,
  logout,
} from "../controllers/auth";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login?error=auth_failed",
  }),
  async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user;

      const accessToken = generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
      });

      const refreshToken = generateRefreshToken({
        userId: user._id.toString(),
        email: user.email,
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(
        process.env.FRONTEND_URL || "http://localhost:3000/dashboard",
      );
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect("/login?error=callback_failed");
    }
  },
);

router.get("/me", authenticate, getMe);

router.post("/refresh", refreshToken);

router.post("/logout", logout);

export default router;
