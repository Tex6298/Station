"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { AiObservabilityPanel } from "@/components/settings/ai-observability-panel";
import { AiProviderSettingsPanel } from "@/components/settings/ai-provider-settings-panel";
import { NotificationPreferencesPanel } from "@/components/settings/notification-preferences-panel";
import { StorageUsagePanel } from "@/components/settings/storage-usage-panel";
import { TokenUsagePanel } from "@/components/settings/token-usage-panel";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import { billingTierReadbackLabel } from "@/lib/billing-tier-display";
import { SETTINGS_DESTINATION_SECTIONS } from "@/lib/settings-navigation";
import type { PersonaSummary } from "@station/types/persona";

const PROVIDER_LABELS: Record<string, string> = {
  platform: "Station",
  openai: "OpenAI",
  anthropic: "Anthropic",
  deepseek: "DeepSeek",
  gemini: "Gemini",
};

type ProfileSnapshotState = {
  status: "loading" | "ready" | "unavailable";
  tierLabel: string | null;
};

const initialProfileSnapshot: ProfileSnapshotState = {
  status: "loading",
  tierLabel: null,
};

export default function SettingsPage() {
  const [profileSnapshot, setProfileSnapshot] = useState<ProfileSnapshotState>(initialProfileSnapshot);
  const [personas, setPersonas] = useState<PersonaSummary[]>([]);
  const [personasLoading, setPersonasLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getSession()
      .then(async (session) => {
        if (!active) return;
        const tierLabel = billingTierReadbackLabel(session?.user.tier);
        setProfileSnapshot({
          status: tierLabel ? "ready" : "unavailable",
          tierLabel,
        });

        if (!session?.accessToken) {
          setPersonasLoading(false);
          return;
        }
        try {
          const data = await apiGet<{ personas: PersonaSummary[] }>("/personas", session.accessToken);
          if (!active) return;
          setPersonas(data.personas ?? []);
        } catch {
          if (active) setPersonas([]);
        } finally {
          if (active) setPersonasLoading(false);
        }
      })
      .catch(() => {
        if (!active) return;
        setProfileSnapshot({ status: "unavailable", tierLabel: null });
        setPersonasLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="station-page">
      <div className="station-page-inner">
        <header className="station-page-header">
          <div>
            <div className="station-eyebrow">Account</div>
            <h1 className="station-page-title">Settings</h1>
            <p className="station-page-lede">
              Manage your identity, subscription, connected accounts, privacy defaults, notifications, and workspace data.
            </p>
          </div>
          <Link href="/studio" className="station-link-button">Back to Studio</Link>
        </header>

        <div style={settingsLayout}>
          <section style={settingsCards}>
            {SETTINGS_DESTINATION_SECTIONS.map((section) => {
              const content = (
                <article className="station-card" style={section.href ? card : unavailableCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                    <span style={markBox}>{section.mark}</span>
                    {section.status && <span style={statusPill}>{section.status}</span>}
                  </div>
                  <h2 style={{ margin: "12px 0 7px", color: "#1f2529", fontSize: 16 }}>{section.title}</h2>
                  <p style={{ margin: 0, color: "#687078", fontSize: 13, lineHeight: 1.55 }}>{section.description}</p>
                </article>
              );

              return section.href ? (
                <Link key={section.title} href={section.href} style={{ textDecoration: "none" }}>
                  {content}
                </Link>
              ) : (
                <div key={section.title} aria-disabled="true">
                  {content}
                </div>
              );
            })}
          </section>

          <aside style={settingsAside}>
            <section id="ai-provider" style={panel}>
              <h2 style={sectionTitle}>AI Provider</h2>
              <AiProviderSettingsPanel />
            </section>

            <section style={panel}>
              <h2 style={sectionTitle}>Usage and Credits</h2>
              <TokenUsagePanel />
            </section>

            <section style={panel}>
              <h2 style={sectionTitle}>Storage</h2>
              <StorageUsagePanel />
            </section>

            <section style={panel}>
              <h2 style={sectionTitle}>AI Activity</h2>
              <AiObservabilityPanel />
            </section>

            <section style={panel}>
              <h2 style={sectionTitle}>Profile Snapshot</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ ...markBox, width: 42, height: 42, borderRadius: "50%" }}>A</span>
                <div>
                  <div style={{ color: "#1f2529", fontSize: 14, fontWeight: 800 }}>Station user</div>
                  <div style={{ color: "#687078", fontSize: 12 }}>
                    {profileSnapshot.status === "loading"
                      ? "Loading tier..."
                      : profileSnapshot.tierLabel ?? "Tier unavailable"}
                  </div>
                </div>
              </div>
              <button type="button" disabled className="station-disabled-action" style={{ width: "100%", marginTop: 14 }}>
                Profile editor coming soon
              </button>
            </section>

            <section style={panel}>
              <h2 style={sectionTitle}>Notification Preferences</h2>
              <NotificationPreferencesPanel />
            </section>

            <section style={panel}>
              <h2 style={sectionTitle}>Danger Zone</h2>
              <p style={{ margin: "0 0 12px", color: "#d9a2a2", fontSize: 13, lineHeight: 1.55 }}>
                Account deletion is not self-service yet. Contact Station support for deletion or export requests.
              </p>
              <button type="button" disabled className="station-disabled-action">Delete account unavailable</button>
            </section>
          </aside>
        </div>

        <section style={{ ...panel, marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={sectionTitle}>Your companions</h2>
            <Link href="/studio/new" className="station-link-button">Add persona</Link>
          </div>
          {personasLoading ? (
            <p style={{ margin: 0, color: "#687078", fontSize: 13 }}>Loading companions...</p>
          ) : personas.length === 0 ? (
            <p style={{ margin: 0, color: "#687078", fontSize: 13 }}>No personas yet.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 10 }}>
              {personas.map((persona) => (
                <Link
                  key={persona.id}
                  href={`/studio/personas/${persona.id}/edit`}
                  style={{ textDecoration: "none" }}
                >
                  <article className="station-card" style={card}>
                    <h3 style={{ margin: "0 0 5px", color: "#1f2529", fontSize: 14 }}>{persona.name}</h3>
                    <p style={{ margin: 0, color: "#687078", fontSize: 12 }}>
                      {PROVIDER_LABELS[persona.provider] ?? persona.provider} - {persona.visibility}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const panel = {
  border: "1px solid #d8d3c8",
  background: "#ffffff",
  borderRadius: 8,
  padding: 16,
};

const settingsLayout: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 18,
  alignItems: "flex-start",
};

const settingsCards: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
  gap: 12,
  flex: "1 1 620px",
  minWidth: 0,
};

const settingsAside: CSSProperties = {
  display: "grid",
  gap: 14,
  flex: "1 1 330px",
  minWidth: 0,
};

const card = {
  ...panel,
  minHeight: 170,
};

const unavailableCard = {
  ...card,
  opacity: 0.72,
};

const markBox = {
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "1px solid #d8d3c8",
  background: "#f8f7f4",
  color: "#534ab7",
  display: "grid",
  placeItems: "center",
  fontSize: 12,
  fontWeight: 800,
};

const sectionTitle = {
  margin: "0 0 12px",
  color: "#1f2529",
  fontSize: 16,
};

const statusPill = {
  border: "1px solid #d8d3c8",
  borderRadius: 999,
  background: "#f8f7f4",
  color: "#687078",
  padding: "0.18rem 0.5rem",
  fontSize: 11,
  fontWeight: 800,
};
