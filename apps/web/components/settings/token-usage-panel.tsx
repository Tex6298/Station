"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";

type TopupPack = {
  id: string;
  name: string;
  priceGbp: number;
  tokens: number;
  approximateTurns: number;
};

type TokenUsage = {
  tierLabel: string;
  resetDate: string;
  tokensUsed: number;
  tokensLimit: number;
  topupTokens: number;
  effectiveLimit: number;
  percentUsed: number;
  warningLevel: "ok" | "notice" | "warning" | "blocked" | "review";
  modelExperience: string;
  availableTopups: TopupPack[];
  purchaseHistory: Array<{
    id: string;
    packId: string;
    amountPence: number;
    tokensPurchased: number;
    expiresAt: string;
    status: string;
    createdAt: string;
  }>;
};

export function TokenUsagePanel({ compact = false }: { compact?: boolean }) {
  const [usage, setUsage] = useState<TokenUsage | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [buyingPackId, setBuyingPackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) return;
      const accessToken = session.accessToken ?? session.access_token;
      setToken(accessToken);
      try {
        const data = await apiGet<{ usage: TokenUsage }>("/token-credits/me", accessToken);
        setUsage(data.usage);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load token usage.");
      }
    });
  }, []);

  async function buyTopup(packId: string) {
    if (!token) return;
    setBuyingPackId(packId);
    setError(null);
    try {
      const data = await apiPost<{ url: string }>("/token-credits/topups/checkout", { packId }, token);
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start checkout.");
    } finally {
      setBuyingPackId(null);
    }
  }

  if (error) return <p style={{ margin: 0, color: "#fca5a5", fontSize: 12 }}>{error}</p>;
  if (!usage) return <p style={{ margin: 0, color: "#7d8796", fontSize: 12 }}>Loading usage...</p>;

  const tone = usage.warningLevel === "blocked" ? "#ef4444" : usage.warningLevel === "warning" || usage.warningLevel === "review" ? "#f59e0b" : usage.warningLevel === "notice" ? "#facc15" : "#22c55e";

  return (
    <div style={{ display: "grid", gap: compact ? 8 : 12 }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, color: "#d1d5db", fontSize: compact ? 12 : 13, marginBottom: 6 }}>
          <span>{formatTokens(usage.tokensUsed)} used</span>
          <span>{formatTokens(usage.effectiveLimit)} available</span>
        </div>
        <div style={{ height: compact ? 7 : 9, borderRadius: 999, background: "#0b1220", border: "1px solid #202938", overflow: "hidden" }}>
          <div style={{ width: `${Math.min(100, usage.percentUsed)}%`, height: "100%", background: tone }} />
        </div>
        {usage.warningLevel !== "ok" ? (
          <p style={{ margin: "7px 0 0", color: tone, fontSize: 12 }}>
            {warningCopy(usage.warningLevel, usage.resetDate)}
          </p>
        ) : null}
      </div>

      {!compact ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Metric label="Plan" value={usage.tierLabel} />
            <Metric label="Experience" value={usage.modelExperience} />
            <Metric label="Monthly allocation" value={formatTokens(usage.tokensLimit)} />
            <Metric label="Top-up balance" value={formatTokens(usage.topupTokens)} />
          </div>

          {usage.availableTopups.length > 0 ? (
            <div style={{ display: "grid", gap: 8 }}>
              {usage.availableTopups.map((pack) => (
                <div key={pack.id} style={{ border: "1px solid #253044", borderRadius: 8, padding: 10, background: "#0c1320" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, color: "#f8fafc", fontSize: 13, fontWeight: 800 }}>
                    <span>{pack.name}</span>
                    <span>GBP {pack.priceGbp}</span>
                  </div>
                  <p style={{ margin: "5px 0 0", color: "#8ea0b8", fontSize: 12, lineHeight: 1.45 }}>
                    {formatTokens(pack.tokens)} tokens, about {pack.approximateTurns.toLocaleString()} turns.
                  </p>
                  <button
                    type="button"
                    onClick={() => buyTopup(pack.id)}
                    disabled={!token || buyingPackId === pack.id}
                    style={buyButton}
                  >
                    {buyingPackId === pack.id ? "Opening..." : "Buy"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, color: "#8ea0b8", fontSize: 12, lineHeight: 1.5 }}>
              Developer accounts use soft-cap review instead of standard top-up packs.
            </p>
          )}

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ color: "#f8fafc", fontSize: 13, fontWeight: 800 }}>Purchase history</div>
            {usage.purchaseHistory?.length ? usage.purchaseHistory.map((purchase) => (
              <div key={purchase.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, color: "#a9b0bd", fontSize: 12 }}>
                <span>{purchase.packId} / {purchase.status}</span>
                <span>GBP {(purchase.amountPence / 100).toFixed(0)} / expires {formatDate(purchase.expiresAt)}</span>
              </div>
            )) : (
              <p style={{ margin: 0, color: "#8ea0b8", fontSize: 12 }}>No top-up purchases yet.</p>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid #253044", borderRadius: 8, padding: 9, background: "#0c1320" }}>
      <div style={{ color: "#687386", fontSize: 11 }}>{label}</div>
      <div style={{ color: "#e5e7eb", fontSize: 13, fontWeight: 800, marginTop: 3 }}>{value}</div>
    </div>
  );
}

const buyButton = {
  marginTop: 9,
  width: "100%",
  border: "1px solid #2563eb",
  borderRadius: 8,
  background: "#2563eb",
  color: "#fff",
  minHeight: 34,
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
};

function warningCopy(level: TokenUsage["warningLevel"], resetDate: string) {
  if (level === "blocked") return `Monthly allocation used. Resets ${resetDate}.`;
  if (level === "review") return "Developer usage is above the review threshold.";
  if (level === "warning") return "Approaching the monthly token limit.";
  return "75% of the monthly allocation has been used.";
}

function formatTokens(tokens: number) {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(tokens >= 10_000_000 ? 0 : 1)}M`;
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`;
  return tokens.toLocaleString();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
