"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import {
  getBillingStatus,
  createCheckoutSession,
  createPortalSession,
  type BillingStatus,
} from "@/lib/api-client";
import {
  billingPlanActionDetail,
  billingPlanActionLabel,
  billingPlanAction,
  checkoutTierFor,
  isActiveSubscriptionStatus,
  type CheckoutTier,
  type BillingPlanAction,
} from "@/lib/billing-plan-actions";

const TIER_LABELS: Record<string, string> = {
  visitor:       "Free",
  private:       "Basic",
  creator:       "Creator",
  canon:         "Canon / Developer",
  institutional: "Institutional",
};

const TIER_COLOUR: Record<string, string> = {
  visitor:       "#687078",
  private:       "#534ab7",
  creator:       "#9d5b2f",
  canon:         "#8a6422",
  institutional: "#2878b9",
};

function formatLimit(value: number, unit: string) {
  if (value < 0) return `Unlimited ${unit}`;
  return `${value} ${unit}`;
}

function subscriptionSummary(status: string | null | undefined) {
  if (isActiveSubscriptionStatus(status)) {
    return "Stripe subscription is active or trialing. Use the portal for cancellation or subscription changes.";
  }
  if (status) {
    return "Stripe subscription is not active. Checkout activation can restart the recorded plan in test mode.";
  }
  return "No active Stripe subscription is recorded. Checkout opens a Stripe-hosted test-mode session.";
}

export default function BillingPage() {
  const [token, setToken]   = useState<string | null>(null);
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : null;
  const success   = searchParams?.get("success") === "1";
  const cancelled = searchParams?.get("cancelled") === "1";

  useEffect(() => {
    getSession().then((session) => {
      if (!session) { setLoading(false); return; }
      setToken(session.access_token);
      getBillingStatus(session.access_token)
        .then(setStatus)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    });
  }, []);

  async function handleUpgrade(tier: CheckoutTier, interval: "monthly" | "yearly") {
    if (!token) return;
    setActionLoading(true);
    setError(null);
    try {
      const { url } = await createCheckoutSession(token, tier, interval);
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed.");
      setActionLoading(false);
    }
  }

  async function handleManage() {
    if (!token) return;
    setActionLoading(true);
    setError(null);
    try {
      const { url } = await createPortalSession(token);
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open billing portal.");
      setActionLoading(false);
    }
  }

  const currentTier = status?.tier ?? "visitor";
  const isActive    = isActiveSubscriptionStatus(status?.subscriptionStatus);
  const currentCheckoutTier = checkoutTierFor(currentTier);

  if (loading) {
    return (
      <main className="station-page">
        <div className="station-page-inner station-page-inner-narrow">
          <div className="station-panel"><p>Loading billing info...</p></div>
        </div>
      </main>
    );
  }

  return (
    <main className="station-page">
      <div className="station-page-inner station-page-inner-narrow">
      <header className="station-page-header">
        <div>
          <div className="station-eyebrow">Account</div>
          <h1 className="station-page-title">Billing</h1>
          <p className="station-page-lede">Manage your Station plan, Stripe test-mode handoff, and server-authoritative limits.</p>
        </div>
      </header>

      {success && (
        <div className="station-notice" data-tone="success" style={{ marginBottom: "1.5rem" }}>
          <p style={{ margin: 0 }}>
            Subscription activated. Welcome to {TIER_LABELS[currentTier]}!
          </p>
        </div>
      )}

      {cancelled && (
        <div className="station-notice" data-tone="info" style={{ marginBottom: "1.5rem" }}>
          <p style={{ margin: 0 }}>Checkout was cancelled. Your Station plan was not changed.</p>
        </div>
      )}

      {error && (
        <div className="station-notice" data-tone="error" style={{ marginBottom: "1.5rem" }}>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Current plan */}
      <div className="station-panel" style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#687078", marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Current plan
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: TIER_COLOUR[currentTier] ?? "#1f2529",
          }}>
            {TIER_LABELS[currentTier] ?? currentTier}
          </span>
          {status?.subscriptionStatus && (
            <span style={{
              padding: "0.2rem 0.7rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              background: isActive ? "#e9f5ee" : "#f8e6e3",
              color: isActive ? "#25633f" : "#9d3c35",
              border: `1px solid ${isActive ? "rgba(59, 143, 99, 0.35)" : "rgba(157, 60, 53, 0.35)"}`,
            }}>
              {status.subscriptionStatus}
            </span>
          )}
        </div>
        <p style={{ color: "#687078", margin: "0.75rem 0 0", fontSize: "0.9rem", lineHeight: 1.55 }}>
          {subscriptionSummary(status?.subscriptionStatus)}
        </p>

        {currentCheckoutTier && isActive && (
          <button
            onClick={handleManage}
            disabled={actionLoading}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1.25rem",
              background: "transparent",
              border: "1px solid #d8d3c8",
              borderRadius: 6,
              color: "#1f2529",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            {actionLoading ? "Opening..." : "Manage / cancel subscription"}
          </button>
        )}

        {currentCheckoutTier && !isActive && (
          <button
            onClick={() => handleUpgrade(currentCheckoutTier, "monthly")}
            disabled={actionLoading}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1.25rem",
              background: "#1f2529",
              border: "none",
              borderRadius: 6,
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            {actionLoading ? "Opening..." : `Activate ${TIER_LABELS[currentTier] ?? currentTier}`}
          </button>
        )}

        {status?.limits && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.75rem", marginTop: "1rem" }}>
            <div>
              <p style={{ color: "#687078", fontSize: "0.75rem", margin: "0 0 0.25rem" }}>Spaces</p>
              <p style={{ margin: 0, color: "#1f2529", fontSize: "0.95rem" }}>{formatLimit(status.limits.spaces, "Spaces")}</p>
            </div>
            <div>
              <p style={{ color: "#687078", fontSize: "0.75rem", margin: "0 0 0.25rem" }}>Developer Spaces</p>
              <p style={{ margin: 0, color: "#1f2529", fontSize: "0.95rem" }}>{formatLimit(status.limits.developerSpaces, "Developer Spaces")}</p>
            </div>
            <div>
              <p style={{ color: "#687078", fontSize: "0.75rem", margin: "0 0 0.25rem" }}>Storage</p>
              <p style={{ margin: 0, color: "#1f2529", fontSize: "0.95rem" }}>{formatLimit(status.limits.storageGb, "GB")}</p>
            </div>
          </div>
        )}

        <div style={{ marginTop: "1rem", padding: "0.85rem 1rem", background: "#f8f7f4", border: "1px solid #d8d3c8", borderRadius: 8 }}>
          <p style={{ margin: "0 0 0.35rem", color: "#1f2529", fontWeight: 650 }}>Entitlements and token credits are separate.</p>
          <p style={{ margin: 0, color: "#687078", fontSize: "0.86rem", lineHeight: 1.55 }}>
            This plan controls tier limits such as Spaces, Developer Spaces, publishing, and storage. Token top-ups, where visible, add model-usage credit without changing your subscription tier.
          </p>
        </div>
      </div>

      {/* Plans */}
      <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem", color: "#687078", fontWeight: 500 }}>
        Available plans
      </h2>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        <PlanCard
          name="Basic"
          tier="private"
          price="GBP 10"
          interval="month"
          features={["2 personas", "Private archive", "Forum access", "Chat (BYOK or platform)"]}
          action={billingPlanAction({ currentTier, planTier: "private", subscriptionStatus: status?.subscriptionStatus })}
          onUpgrade={() => handleUpgrade("private", "monthly")}
          loading={actionLoading}
        />
        <PlanCard
          name="Creator"
          tier="creator"
          price="GBP 100"
          interval="month"
          yearlyPrice="GBP 1,000/year"
          features={["Unlimited personas", "Full archive + RAG", "Public page (Space)", "Publish essays & codexes", "Forum access"]}
          action={billingPlanAction({ currentTier, planTier: "creator", subscriptionStatus: status?.subscriptionStatus })}
          onUpgrade={() => handleUpgrade("creator", "monthly")}
          onUpgradeYearly={() => handleUpgrade("creator", "yearly")}
          loading={actionLoading}
          featured
        />
        <PlanCard
          name="Canon"
          tier="canon"
          price="GBP 250"
          interval="month"
          features={["Everything in Creator", "3 Spaces", "50 GB storage", "Priority support", "Early access to new features"]}
          action={billingPlanAction({ currentTier, planTier: "canon", subscriptionStatus: status?.subscriptionStatus })}
          onUpgrade={() => handleUpgrade("canon", "monthly")}
          loading={actionLoading}
        />
      </div>

      <div className="station-panel" style={{ marginTop: "2rem" }}>
        <h3 style={{ margin: "0 0 0.5rem" }}>Institutional</h3>
        <p style={{ color: "#687078", margin: "0 0 1rem", fontSize: "0.9rem" }}>
          For universities, research departments, newsrooms, and organisations that
          need structured access to this community. Custom pricing, multi-seat access,
          and research analytics.
        </p>
        <a href="mailto:hello@station.build" style={{ color: "#534ab7", fontSize: "0.9rem" }}>
          Contact us
        </a>
      </div>
      </div>
    </main>
  );
}

function PlanCard({
  name,
  tier,
  price,
  interval,
  yearlyPrice,
  features,
  action,
  onUpgrade,
  onUpgradeYearly,
  loading,
  featured,
}: {
  name: string;
  tier: string;
  price: string;
  interval: string;
  yearlyPrice?: string;
  features: string[];
  action: BillingPlanAction;
  onUpgrade: () => void;
  onUpgradeYearly?: () => void;
  loading: boolean;
  featured?: boolean;
}) {
  return (
    <div
      className="station-card"
      style={{
        border: featured ? "1px solid #534ab7" : undefined,
        position: "relative",
      }}
    >
      {featured && (
        <span style={{
          position: "absolute",
          top: -10,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#534ab7",
          color: "#fff",
          fontSize: "0.7rem",
          padding: "0.15rem 0.6rem",
          borderRadius: 999,
          whiteSpace: "nowrap",
        }}>
          Most popular
        </span>
      )}

      <h3 style={{ margin: "0 0 0.25rem" }}>{name}</h3>
      <p style={{ margin: "0 0 1rem", fontSize: "1.4rem", fontWeight: 700 }}>
        {price}<span style={{ fontSize: "0.85rem", color: "#687078", fontWeight: 400 }}>/{interval}</span>
      </p>

      <ul style={{ paddingLeft: "1.2rem", margin: "0 0 1.25rem", color: "#687078", fontSize: "0.875rem", lineHeight: 1.8 }}>
        {features.map((f) => <li key={f}>{f}</li>)}
      </ul>

      {action === "current" || action === "included" || action === "lower-tier" ? (
        <button disabled style={{ width: "100%", padding: "0.5rem", background: "#f8f7f4", border: "1px solid #d8d3c8", borderRadius: 6, color: "#687078", cursor: "default", fontSize: "0.875rem" }}>
          {billingPlanActionLabel(action, name, price)}
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button
            onClick={onUpgrade}
            disabled={loading}
            style={{ width: "100%", padding: "0.5rem", background: featured ? "#534ab7" : "#1f2529", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: "0.875rem" }}
          >
            {loading ? "Loading..." : billingPlanActionLabel(action, name, price)}
          </button>
          {action === "upgrade" && yearlyPrice && onUpgradeYearly && (
            <button
              onClick={onUpgradeYearly}
              disabled={loading}
              style={{ width: "100%", padding: "0.5rem", background: "transparent", border: "1px solid #534ab7", borderRadius: 6, color: "#534ab7", cursor: "pointer", fontSize: "0.8rem" }}
            >
              {loading ? "Loading..." : `Save 17% - ${yearlyPrice}`}
            </button>
          )}
        </div>
      )}
      <p style={{ margin: "0.65rem 0 0", color: "#687078", fontSize: "0.78rem", lineHeight: 1.45 }}>
        {billingPlanActionDetail(action)}
      </p>
    </div>
  );
}
