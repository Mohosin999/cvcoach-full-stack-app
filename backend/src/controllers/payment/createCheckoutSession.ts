import { Request, Response } from "express";
import { createCheckoutSession } from "../../services/stripe";

export const createCheckoutSessionController = async (
  req: Request,
  res: Response
) => {
  try {
    const { planId } = req.body;

    if (!planId || !["pro", "enterprise"].includes(planId)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const userId = (req.user as any)?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const successUrl = `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendUrl}/payment/cancel`;

    const { url } = await createCheckoutSession({
      userId,
      planId,
      successUrl,
      cancelUrl,
    });

    if (!url) {
      return res.status(500).json({ message: "Failed to create checkout session" });
    }

    res.json({ url });
  } catch (error: any) {
    console.error("Checkout session error:", error);
    res.status(500).json({ message: error.message || "Failed to create checkout session" });
  }
};
