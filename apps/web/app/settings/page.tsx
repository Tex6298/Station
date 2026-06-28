"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { AiObservabilityPanel } from "@/components/settings/ai-observability-panel";
import { AiProviderSettingsPanel } from "@/components/settings/ai-provider-settings-panel";
import { StorageUsagePanel } from "@/components/settings/storage-usage-panel";
import { TokenUsagePanel } from "@/components/settings/token-usage-panel";
import { getSession } from "@/lib/auth";
import { billingTierReadbackLabel } from "@/lib/billing-tier-display";

const settingSections = [
  {
    title: "AI provider",
    description: "Choose Station platform routing or configure owner BYOK for OpenAI, Anthropic, and DeepSeek.",
    href: null,
    mark: "AI",
    status: "On this page",
  },
  {
    title: "Social publishing",
    description: "Connect Bluesky, Mastodon, Tumblr, LinkedIn, Reddit, WordPress, and Ghost to publish directly from Station.",
    href: "/settings/social",
    mark: "S",
  },
  {
    title: "Billing & plan",
    description: "Manage your subscription, upgrade your tier, or access the Stripe customer portal.",
    href: "/billing",
    mark: "B",
  },
  {
    title: "Profile",
    description: "Display name, username, avatar, bio, and public identity details.",
    href: null,
    mark: "P",
    status: "Coming soon",
  },
  {
    title: "Privacy",
    description: "Default visibility for new content, public persona behavior, and export controls.",
    href: null,
    mark: "V",
    status: "Coming soon",
  },
  {
    title: "Export workspace",
    description: "Generate a complete JSON and Markdown package of your Station workspace.",
    href: "/studio/export",
    mark: "E",
  },
  {
    title: "Notifications",
    description: "Forum replies and moderation status updates.",
    href: "/notifications",
    mark: "N",
  },
];

const notificationRows = [
  "Forum replies",
  "Archive completions",
  "Integrity session reminders",
  "Follower notifications",
  "Event reminders",
];

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

  useEffect(() => {
    let active = true;

    getSession()
      .then((session) => {
        if (!active) return;
        const tierLabel = billingTierReadbackLabel(session?.user.tier);
        setProfileSnapshot({
          status: tierLabel ? "ready" : "unavailable",
          tierLabel,
        });
      })
      .catch(() => {
        if (!active) return;
        setProfileSnapshot({ status: "unavailable", tierLabel: null });
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
            {settingSections.map((section) => {
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
            <section style={panel}>
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
              <p style={settingNote}>
                Notification settings are not persisted yet. Defaults remain enabled until the preference editor ships.
              </p>
              <div style={{ display: "grid", gap: 9 }}>
                {notificationRows.map((row) => (
                  <label key={row} style={toggleRow}>
                    <input type="checkbox" defaultChecked disabled />
                    {row}
                  </label>
                ))}
              </div>
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

const settingNote = {
  margin: "0 0 12px",
  color: "#687078",
  fontSize: 13,
  lineHeight: 1.55,
};

const toggleRow = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  color: "#1f2529",
  fontSize: 13,
};
