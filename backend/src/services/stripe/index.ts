import Stripe from "stripe";
import { User } from "../../models/User";
import { Payment } from "../../models/Payment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20" as any,
});

const PRO_PLAN_CREDITS = 500;
const ENTERPRISE_PLAN_CREDITS = 1500;

const PLAN_PRICES: Record<string, number> = {
  pro: 19, // $19
  enterprise: 49, // $49
};

interface CreateCheckoutSessionParams {
  userId: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
}

export const createCheckoutSession = async ({
  userId,
  planId,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const price = PLAN_PRICES[planId];
  if (!price) {
    throw new Error("Invalid plan");
  }

  // Create checkout session with line items (no product needed)
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
            description: `Upgrade to ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan`,
          },
          unit_amount: price * 100, // Amount in cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: user._id.toString(),
      planId,
      email: user.email,
      credits: planId === "pro" ? PRO_PLAN_CREDITS : ENTERPRISE_PLAN_CREDITS,
    },
    client_reference_id: user._id.toString(),
  });

  return { sessionId: session.id, url: session.url };
};

export const handleWebhookEvent = async (
  signature: string,
  body: Buffer
) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Skip webhook verification if no secret configured (testing)
  if (!webhookSecret) {
    console.log("⚠️ Webhook secret not configured, skipping verification (testing mode)");
    console.log("ℹ️ Payment will be processed via /payment/verify endpoint instead");
    return { received: true, skipped: true };
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  } catch (error: any) {
    console.error("Webhook processing error:", error.message);
    throw error;
  }
};

const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
  const { userId, planId, email } = session.metadata || {};
  const amount = session.amount_total || 0;

  if (!userId || !planId) {
    throw new Error("Invalid session metadata");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const planKey = planId.toLowerCase();
  const credits =
    planKey === "pro" ? PRO_PLAN_CREDITS : ENTERPRISE_PLAN_CREDITS;

  user.subscription.plan = planKey as "free" | "pro" | "enterprise";
  user.subscription.credits += credits;
  user.subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await user.save();

  await Payment.create({
    user: userId,
    email,
    amount: amount / 100,
    currency: session.currency || "usd",
    status: "completed",
    paymentMethod: "stripe",
    planId,
    credits,
    stripeSessionId: session.id,
  });

  return { user, credits };
};

export const getStripePublishableKey = () => {
  return process.env.STRIPE_PUBLISHABLE_KEY || "";
};

export { stripe };
