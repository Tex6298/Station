"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  socialPublishingActionLabel,
  socialPublishingAuthStyleLabel,
  socialPublishingCharacterLimitLabel,
  socialPublishingEmptyReadiness,
  socialPublishingIntroCopy,
  socialPublishingSafetyCopy,
  socialPublishingStatusLabel,
  type SocialPublishingReadinessResponse,
} from "@/lib/social-publishing-readiness";

export default function SocialSettingsPage() {
  const [readiness, setReadiness] = useState<SocialPublishingReadinessResponse>(socialPublishingEmptyReadiness());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadReadiness() {
      setLoading(true);
      setError(null);
      try {
        const session = await getSession();
        if (!session) {
          if (!cancelled) setError("Sign in to view social publishing readiness.");
          return;
        }
        const data = await apiGet<SocialPublishingReadinessResponse>("/social/readiness", session.access_token);
        if (!cancelled) setReadiness(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Social publishing readiness is unavailable.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadReadiness();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="container" style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ margin: "0 0 0.25rem" }}>Social publishing</h1>
        <p style={{ margin: 0, color: "#666", fontSize: "0.9rem", lineHeight: 1.6 }}>
          {socialPublishingIntroCopy()}
        </p>
      </div>

      <section className="card" style={{ marginBottom: "1rem", padding: "1rem 1.1rem" }}>
        <div style={{ display: "grid", gap: "0.45rem" }}>
          <strong style={{ color: "#1f2529" }}>Readiness fence active</strong>
          <span style={{ color: "#687078", fontSize: "0.9rem", lineHeight: 1.55 }}>
            {readiness.message || socialPublishingSafetyCopy()}
          </span>
          <span style={{ color: "#687078", fontSize: "0.82rem", lineHeight: 1.55 }}>
            {socialPublishingSafetyCopy()}
          </span>
        </div>
      </section>

      {loading && (
        <div className="card" style={{ padding: "2rem", textAlign: "center", color: "#687078" }}>
          Loading social publishing readiness...
        </div>
      )}

      {error && (
        <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {!loading && (
        <div style={{ display: "grid", gap: "0.85rem" }}>
          {readiness.supportedProviders.map((provider) => (
            <article key={provider.platform} className="card" style={{ display: "grid", gap: "0.7rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ margin: "0 0 0.25rem", fontSize: "1rem" }}>{provider.label}</h2>
                  <p style={{ margin: 0, color: "#687078", fontSize: "0.82rem" }}>
                    {socialPublishingCharacterLimitLabel(provider.characterLimit)}
                  </p>
                </div>
                <span style={{ border: "1px solid #d8d3c8", borderRadius: 999, padding: "0.2rem 0.55rem", color: "#687078", fontSize: "0.78rem" }}>
                  {socialPublishingStatusLabel(provider.status)}
                </span>
              </div>

              <div style={{ display: "grid", gap: "0.35rem", color: "#687078", fontSize: "0.85rem", lineHeight: 1.55 }}>
                <span>{socialPublishingAuthStyleLabel(provider.authStyle)}</span>
                {provider.oauthAppConfigured !== null && (
                  <span>OAuth app readiness: {provider.oauthAppConfigured ? "configured" : "not configured"}.</span>
                )}
                <span>Posting: {readiness.postingEnabled ? "enabled" : "paused"}.</span>
                <span>Credential storage: {readiness.credentialStorageAccepted ? "accepted" : "not accepted"}.</span>
              </div>

              <button
                type="button"
                disabled
                className="button"
                style={{ justifySelf: "start", cursor: "not-allowed", opacity: 0.7 }}
              >
                {socialPublishingActionLabel()}
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
