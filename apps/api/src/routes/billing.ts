import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import {
  handleGetBillingStatus,
  handleCreateCheckout,
  handleCreatePortal,
  handleWebhook,
} from "../controllers/billing.controller";

export const billingRouter = Router();

// -- Webhook - raw body, no auth (Stripe signs the payload itself) -------------
// express.raw() middleware is applied at the app level for this path - see app.ts
billingRouter.post("/webhook", handleWebhook);

// -- Authenticated billing routes ----------------------------------------------
billingRouter.use(requireAuth);

// GET  /billing/me       - current tier + subscription status
billingRouter.get("/me", handleGetBillingStatus);

// POST /billing/checkout - create Stripe Checkout session -> returns { url }
billingRouter.post("/checkout", handleCreateCheckout);

// POST /billing/portal   - create Stripe Customer Portal session -> returns { url }
billingRouter.post("/portal", handleCreatePortal);
