import { z } from "zod";

export const checkoutSchema = z.object({
  tier: z.enum(["private", "creator", "canon"]),
  interval: z.enum(["monthly", "yearly"]).default("monthly"),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export const portalSchema = z.object({
  returnUrl: z.string().url().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type PortalInput = z.infer<typeof portalSchema>;
