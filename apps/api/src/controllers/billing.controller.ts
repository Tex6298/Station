import type { Request, Response } from "express";
import {
  createCheckoutSession,
  createPortalSession,
  getBillingStatus,
  handleWebhookEvent,
} from "../services/billing.service";
import { checkoutSchema, portalSchema } from "../schemas/billing.schema";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// -- GET /billing/me -----------------------------------------------------------
export async function handleGetBillingStatus(req: Request, res: Response): Promise<void> {
  try {
    const status = await getBillingStatus(req.user!.id);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed to fetch billing status." });
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
      email: (req as Request & { userEmail?: string }).userEmail ?? "",
      tier: parsed.data.tier,
      interval: parsed.data.interval,
      successUrl: parsed.data.successUrl ?? `${APP_URL}/billing?success=1`,
      cancelUrl:  parsed.data.cancelUrl  ?? `${APP_URL}/billing?cancelled=1`,
    });
    res.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout creation failed.";
    res.status(400).json({ error: message });
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
      email: (req as Request & { userEmail?: string }).userEmail ?? "",
      returnUrl: parsed.data.returnUrl ?? `${APP_URL}/billing`,
    });
    res.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Portal creation failed.";
    res.status(400).json({ error: message });
  }
}

// -- POST /billing/webhook -----------------------------------------------------
// NOTE: This route receives raw Buffer body - wired separately in app.ts
export async function handleWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    res.status(400).json({ error: "Missing stripe-signature header." });
    return;
  }

  try {
    const eventType = await handleWebhookEvent(req.body as Buffer, signature);
    res.json({ received: true, type: eventType });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook handling failed.";
    res.status(400).json({ error: message });
  }
}
