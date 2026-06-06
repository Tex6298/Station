import Stripe from "stripe";

export const STRIPE_API_VERSION = "2026-05-27.dahlia";

let _stripe: Stripe.Stripe | null = null;

export function setStripeForTests(client: Stripe.Stripe | null) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("setStripeForTests can only be used while NODE_ENV is test.");
  }
  _stripe = client;
}

/**
 * Returns a singleton Stripe client.
 * Throws if STRIPE_SECRET_KEY is not set.
 */
export function getStripe(): Stripe.Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  _stripe = new Stripe(key, { apiVersion: STRIPE_API_VERSION });
  return _stripe;
}
