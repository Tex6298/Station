import type { Request, Response } from "express";
import {
  ActiveSubscriptionCheckoutBlockedError,
  BillingSubscriptionStateUnavailableError,
  createCheckoutSession,
  createPortalSession,
  getBillingStatus,
  handleWebhookEvent,
} from "../services/billing.service";
import { checkoutSchema, portalSchema } from "../schemas/billing.schema";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const BILLING_ERROR_RESPONSES = {
  status: {
    error: "Could not load billing status.",
    code: "billing_status_unavailable",
  },
  checkout: {
    error: "Could not create Checkout session.",
    code: "checkout_creation_failed",
  },
  portal: {
    error: "Could not create customer portal session.",
    code: "billing_portal_failed",
  },
  webhook: {
    error: "Webhook could not be verified or processed.",
    code: "billing_webhook_failed",
  },
  missingSignature: {
    error: "Missing stripe-signature header.",
    code: "missing_stripe_signature",
  },
  activeSubscription: {
    error: "An active subscription is already recorded. Use the customer portal to manage billing.",
    code: "active_subscription_exists",
  },
  subscriptionStateUnavailable: {
    error: "Could not verify current billing subscription state. Try again before starting Checkout.",
    code: "billing_subscription_state_unavailable",
  },
} as const;

// -- GET /billing/me -----------------------------------------------------------
export async function handleGetBillingStatus(req: Request, res: Response): Promise<void> {
  try {
    const status = await getBillingStatus(req.user!.id);
    res.json(status);
  } catch {
    res.status(500).json(BILLING_ERROR_RESPONSES.status);
  }
}

// -- POST /billing/checkout ----------------------------------------------------
export async function handleCreateCheckout(req: Request, res: Response): Promise<void> {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const url = await createCheckoutSession({
      userId: req.user!.id,
      email: req.user!.email,
      tier: parsed.data.tier,
      interval: parsed.data.interval,
      successUrl: parsed.data.successUrl ?? `${APP_URL}/billing?success=1`,
      cancelUrl:  parsed.data.cancelUrl  ?? `${APP_URL}/billing?cancelled=1`,
    });
    res.json({ url });
  } catch (err) {
    if (err instanceof ActiveSubscriptionCheckoutBlockedError) {
      res.status(409).json(BILLING_ERROR_RESPONSES.activeSubscription);
      return;
    }
    if (err instanceof BillingSubscriptionStateUnavailableError) {
      res.status(503).json(BILLING_ERROR_RESPONSES.subscriptionStateUnavailable);
      return;
    }
    res.status(400).json(BILLING_ERROR_RESPONSES.checkout);
  }
}

// -- POST /billing/portal ------------------------------------------------------
export async function handleCreatePortal(req: Request, res: Response): Promise<void> {
  const parsed = portalSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const url = await createPortalSession({
      userId: req.user!.id,
      email: req.user!.email,
      returnUrl: parsed.data.returnUrl ?? `${APP_URL}/billing`,
    });
    res.json({ url });
  } catch {
    res.status(400).json(BILLING_ERROR_RESPONSES.portal);
  }
}

// -- POST /billing/webhook -----------------------------------------------------
// NOTE: This route receives raw Buffer body - wired separately in app.ts
export async function handleWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    res.status(400).json(BILLING_ERROR_RESPONSES.missingSignature);
    return;
  }

  try {
    const eventType = await handleWebhookEvent(req.body as Buffer, signature);
    res.json({ received: true, type: eventType });
  } catch {
    res.status(400).json(BILLING_ERROR_RESPONSES.webhook);
  }
}
