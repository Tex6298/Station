import Link from "next/link";
import type { CSSProperties } from "react";
import { AiObservabilityPanel } from "@/components/settings/ai-observability-panel";
import { StorageUsagePanel } from "@/components/settings/storage-usage-panel";
import { TokenUsagePanel } from "@/components/settings/token-usage-panel";

const settingSections = [
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
    description: "Forum replies, archive completions, integrity reminders, followers, and events.",
    href: null,
    mark: "N",
    status: "Coming soon",
  },
];

const notificationRows = [
  "Forum replies",
  "Archive completions",
  "Integrity session reminders",
  "Follower notifications",
  "Event reminders",
];

export default function SettingsPage() {
  return (
    <main style={{ minHeight: "calc(100vh - 52px)", background: "#f4f3ef", color: "#1f2529" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px clamp(16px, 4vw, 32px) 48px" }}>
        <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ color: "#534ab7", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>
              Account
            </div>
            <h1 style={{ margin: "8px 0 6px", color: "#1f2529", fontSize: "clamp(30px, 5vw, 46px)", lineHeight: 1.05 }}>
              Settings
            </h1>
            <p style={{ margin: 0, color: "#687078", fontSize: 15, lineHeight: 1.6, maxWidth: 720 }}>
              Manage your identity, subscription, connected accounts, privacy defaults, notifications, and workspace data.
            </p>
          </div>
          <Link href="/studio" style={primaryLink}>Back to Studio</Link>
        </header>

        <div style={settingsLayout}>
          <section style={settingsCards}>
            {settingSections.map((section) => {
              const content = (
                <article style={section.href ? card : unavailableCard}>
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
                  <div style={{ color: "#687078", fontSize: 12 }}>Creator tier</div>
                </div>
              </div>
              <button type="button" disabled style={{ ...disabledButton, width: "100%", marginTop: 14 }}>
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
              <button type="button" disabled style={disabledDangerButton}>Delete account unavailable</button>
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

const primaryLink = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  border: "1px solid #1f2529",
  borderRadius: 8,
  background: "#1f2529",
  color: "#fff",
  padding: "0 14px",
  fontSize: 14,
  fontWeight: 800,
  textDecoration: "none",
};

const secondaryButton = {
  ...primaryLink,
  background: "#ffffff",
  borderColor: "#d8d3c8",
  color: "#1f2529",
  cursor: "pointer",
};

const disabledButton = {
  ...secondaryButton,
  color: "#687078",
  cursor: "not-allowed",
  opacity: 0.72,
};

const toggleRow = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  color: "#1f2529",
  fontSize: 13,
};

const dangerButton = {
  ...secondaryButton,
  borderColor: "#7d2e2e",
  color: "#fecaca",
};

const disabledDangerButton = {
  ...dangerButton,
  cursor: "not-allowed",
  opacity: 0.72,
};
