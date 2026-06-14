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
  billingPlanAction,
  checkoutTierFor,
  isActiveSubscriptionStatus,
  type CheckoutTier,
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
      <main className="container">
        <div className="card"><p>Loading billing info...</p></div>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>Billing</h1>

      {success && (
        <div className="card" style={{ background: "#e9f5ee", borderColor: "rgba(59, 143, 99, 0.35)", marginBottom: "1.5rem" }}>
          <p style={{ color: "#25633f", margin: 0 }}>
            Subscription activated. Welcome to {TIER_LABELS[currentTier]}!
          </p>
        </div>
      )}

      {cancelled && (
        <div className="card" style={{ background: "#f8e6e3", borderColor: "rgba(157, 60, 53, 0.35)", marginBottom: "1.5rem" }}>
          <p style={{ color: "#eb5757", margin: 0 }}>Checkout cancelled - no charge was made.</p>
        </div>
      )}

      {error && (
        <div className="card" style={{ background: "#f8e6e3", borderColor: "rgba(157, 60, 53, 0.35)", marginBottom: "1.5rem" }}>
          <p style={{ color: "#eb5757", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Current plan */}
      <div className="card" style={{ marginBottom: "2rem" }}>
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
          features={["Unlimited personas", "Full archive + RAG", "Public page (Space)", "Publish posts & essays", "Forum access"]}
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

      <div className="card" style={{ marginTop: "2rem", background: "#ffffff" }}>
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
  action: "current" | "activate" | "upgrade";
  onUpgrade: () => void;
  onUpgradeYearly?: () => void;
  loading: boolean;
  featured?: boolean;
}) {
  return (
    <div
      className="card"
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

      {action === "current" ? (
        <button disabled style={{ width: "100%", padding: "0.5rem", background: "#f8f7f4", border: "1px solid #d8d3c8", borderRadius: 6, color: "#687078", cursor: "default", fontSize: "0.875rem" }}>
          Current plan
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button
            onClick={onUpgrade}
            disabled={loading}
            style={{ width: "100%", padding: "0.5rem", background: featured ? "#534ab7" : "#1f2529", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: "0.875rem" }}
          >
            {loading ? "Loading..." : action === "activate" ? `Activate ${name}` : `Upgrade - ${price}/mo`}
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
    </div>
  );
}
