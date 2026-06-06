import {
  LEGACY_STRIPE_PRICE_ENV_ALIASES,
  PAID_TIERS,
  STRIPE_PRICE_ENV_BY_TIER_INTERVAL,
  TIER_LIMITS,
  type BillingInterval,
  type PaidTier,
} from "@station/config";
import { getStripe } from "../lib/stripe";
import { getSupabaseAdmin } from "../lib/supabase";
import type { Tier } from "@station/db";
import { grantTopupFromStripeMetadata } from "./token-credits.service";

interface StripeSubscriptionForEntitlement {
  id: string;
  customer: string | { id?: string | null } | null;
  status: string;
  metadata?: Record<string, string | undefined> | null;
  items: {
    data: Array<{
      price?: {
        id?: string | null;
      } | null;
    }>;
  };
}

interface StripeWebhookEvent {
  type: string;
  data: {
    object: unknown;
  };
}

interface StripeCheckoutSessionForWebhook {
  id: string;
  mode?: string | null;
  subscription?: string | { id?: string | null } | null;
  payment_intent?: string | { id?: string | null } | null;
  metadata?: Record<string, string | undefined> | null;
}

interface StripePaymentIntentForWebhook {
  id: string;
  metadata?: Record<string, string | undefined> | null;
}

// Price ID helpers

/**
 * Stripe Price IDs are configured in the dashboard and stored as env vars.
 * Create products + prices at https://dashboard.stripe.com/products
 * then set these environment variables.
 */
function envValue(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function stripeObjectId(value: string | { id?: string | null } | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id ?? null;
}

export function getPriceId(tier: PaidTier, interval: BillingInterval): string {
  const primaryEnv = STRIPE_PRICE_ENV_BY_TIER_INTERVAL[tier][interval];
  const legacyEnvs = LEGACY_STRIPE_PRICE_ENV_ALIASES[tier]?.[interval] ?? [];
  const priceId = envValue(primaryEnv) ?? legacyEnvs.map(envValue).find(Boolean);

  if (!priceId) {
    throw new Error(
      `Stripe price ID not configured for ${tier} ${interval}. ` +
      "Use STRIPE_PRICE_BASIC_*, STRIPE_PRICE_CREATOR_*, or STRIPE_PRICE_CANON_* in your environment."
    );
  }
  return priceId;
}

/**
 * Maps a Stripe Price ID back to a Station tier.
 * Used in webhook handlers to determine which tier to grant.
 */
export function tierFromPriceId(priceId: string): Tier {
  for (const tier of PAID_TIERS) {
    for (const interval of ["monthly", "yearly"] as const) {
      const primaryEnv = STRIPE_PRICE_ENV_BY_TIER_INTERVAL[tier][interval];
      const envNames = [primaryEnv, ...(LEGACY_STRIPE_PRICE_ENV_ALIASES[tier]?.[interval] ?? [])];
      if (envNames.some((name) => envValue(name) === priceId)) return tier;
    }
  }
  return "visitor";
}

// Customer management

/**
 * Gets the Stripe customer ID for a user, or creates one if it doesn't exist.
 */
export async function getOrCreateCustomer(userId: string, email: string): Promise<string> {
  const sb = getSupabaseAdmin();

  const { data: profile } = await sb
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (profile?.stripe_customer_id) return profile.stripe_customer_id;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: email || undefined,
    metadata: { station_user_id: userId },
  });

  await sb
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer.id;
}

// Checkout and portal

/**
 * Creates a Stripe Checkout session for upgrading to a paid tier.
 */
export async function createCheckoutSession(input: {
  userId: string;
  email: string;
  tier: PaidTier;
  interval: BillingInterval;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const stripe = getStripe();
  const customerId = await getOrCreateCustomer(input.userId, input.email);
  const priceId = getPriceId(input.tier, input.interval);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    subscription_data: {
      metadata: {
        station_user_id: input.userId,
        station_tier: input.tier,
      },
    },
    metadata: {
      station_user_id: input.userId,
      station_tier: input.tier,
    },
  });

  if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
  return session.url;
}

/**
 * Creates a Stripe Customer Portal session so users can manage or cancel.
 */
export async function createPortalSession(input: {
  userId: string;
  email: string;
  returnUrl: string;
}): Promise<string> {
  const stripe = getStripe();
  const customerId = await getOrCreateCustomer(input.userId, input.email);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: input.returnUrl,
  });

  return session.url;
}

// Subscription sync

/**
 * Syncs a Stripe subscription to the matching user's profile tier.
 * Called from webhook handlers.
 */
export async function syncSubscriptionToProfile(subscription: StripeSubscriptionForEntitlement): Promise<void> {
  const sb = getSupabaseAdmin();

  const userId = subscription.metadata?.station_user_id;
  const customerId = stripeObjectId(subscription.customer);
  let targetUserId = userId ?? null;
  if (!userId) {
    if (!customerId) return;
    // Fall back to looking up by customer ID
    const { data: profile } = await sb
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();
    targetUserId = profile?.id ?? null;
  }

  if (!targetUserId) return;

  const isActive = ["active", "trialing"].includes(subscription.status);
  const priceId = subscription.items.data[0]?.price?.id ?? "";
  const tier: Tier = isActive ? tierFromPriceId(priceId) : "visitor";
  if (isActive && tier === "visitor") {
    throw new Error("Active Stripe subscription used an unknown Station Price ID.");
  }

  await sb
    .from("profiles")
    .update({
      tier,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
    })
    .eq("id", targetUserId);
}

// Webhook event handler

/**
 * Validates and processes an incoming Stripe webhook event.
 * Returns the event type for logging.
 */
export async function handleWebhookEvent(
  rawBody: Buffer,
  signature: string
): Promise<string> {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set.");

  let event: StripeWebhookEvent;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret) as StripeWebhookEvent;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook signature invalid.";
    throw new Error(`Webhook verification failed: ${msg}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as StripeCheckoutSessionForWebhook;
      if (session.mode === "payment") {
        const paymentId = stripeObjectId(session.payment_intent) ?? session.id;
        await grantTopupFromStripeMetadata(session.metadata ?? {}, paymentId);
      } else if (session.mode === "subscription" && session.subscription) {
        const subscriptionId = stripeObjectId(session.subscription);
        if (!subscriptionId) break;
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );
        await syncSubscriptionToProfile(subscription as StripeSubscriptionForEntitlement);
      }
      break;
    }

    case "payment_intent.succeeded": {
      const intent = event.data.object as StripePaymentIntentForWebhook;
      await grantTopupFromStripeMetadata(intent.metadata ?? {}, intent.id);
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as StripeSubscriptionForEntitlement;
      await syncSubscriptionToProfile(subscription);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as StripeSubscriptionForEntitlement;
      // Downgrade to visitor on cancellation
      await syncSubscriptionToProfile({ ...subscription, status: "canceled" });
      break;
    }

    // Silently ignore other event types
    default:
      break;
  }

  return event.type;
}

// Status query

export interface BillingStatus {
  tier: Tier;
  subscriptionId: string | null;
  subscriptionStatus: string | null;
  customerId: string | null;
  limits: (typeof TIER_LIMITS)[Tier];
}

export async function getBillingStatus(userId: string): Promise<BillingStatus> {
  const sb = getSupabaseAdmin();

  const { data: profile } = await sb
    .from("profiles")
    .select("tier, stripe_subscription_id, subscription_status, stripe_customer_id")
    .eq("id", userId)
    .single();

  return {
    tier: (profile?.tier ?? "visitor") as Tier,
    subscriptionId: profile?.stripe_subscription_id ?? null,
    subscriptionStatus: profile?.subscription_status ?? null,
    customerId: profile?.stripe_customer_id ?? null,
    limits: TIER_LIMITS[(profile?.tier ?? "visitor") as Tier],
  };
}
