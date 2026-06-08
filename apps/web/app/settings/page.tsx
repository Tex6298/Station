import Link from "next/link";
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
    href: "/settings",
    mark: "P",
  },
  {
    title: "Privacy",
    description: "Default visibility for new content, public persona behavior, and export controls.",
    href: "/settings",
    mark: "V",
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
    href: "/settings",
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

export default function SettingsPage() {
  return (
    <main style={{ minHeight: "calc(100vh - 52px)", background: "#0b0e14" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px clamp(16px, 4vw, 32px) 48px" }}>
        <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ color: "#93c5fd", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>
              Account
            </div>
            <h1 style={{ margin: "8px 0 6px", color: "#f8fafc", fontSize: "clamp(30px, 5vw, 46px)", lineHeight: 1.05 }}>
              Settings
            </h1>
            <p style={{ margin: 0, color: "#a9b0bd", fontSize: 15, lineHeight: 1.6, maxWidth: 720 }}>
              Manage your identity, subscription, connected accounts, privacy defaults, notifications, and workspace data.
            </p>
          </div>
          <Link href="/studio" style={primaryLink}>Back to Studio</Link>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 330px", gap: 18, alignItems: "start" }}>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {settingSections.map((section) => (
              <Link key={section.title} href={section.href} style={{ textDecoration: "none" }}>
                <article style={card}>
                  <span style={markBox}>{section.mark}</span>
                  <h2 style={{ margin: "12px 0 7px", color: "#f8fafc", fontSize: 16 }}>{section.title}</h2>
                  <p style={{ margin: 0, color: "#a9b0bd", fontSize: 13, lineHeight: 1.55 }}>{section.description}</p>
                </article>
              </Link>
            ))}
          </section>

          <aside style={{ display: "grid", gap: 14 }}>
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
                  <div style={{ color: "#f8fafc", fontSize: 14, fontWeight: 800 }}>Station user</div>
                  <div style={{ color: "#8ea0b8", fontSize: 12 }}>Creator tier</div>
                </div>
              </div>
              <button type="button" style={{ ...secondaryButton, width: "100%", marginTop: 14 }}>Edit profile</button>
            </section>

            <section style={panel}>
              <h2 style={sectionTitle}>Notification Preferences</h2>
              <div style={{ display: "grid", gap: 9 }}>
                {notificationRows.map((row) => (
                  <label key={row} style={toggleRow}>
                    <input type="checkbox" defaultChecked />
                    {row}
                  </label>
                ))}
              </div>
            </section>

            <section style={panel}>
              <h2 style={sectionTitle}>Danger Zone</h2>
              <p style={{ margin: "0 0 12px", color: "#d9a2a2", fontSize: 13, lineHeight: 1.55 }}>
                Account deletion will use a 30-day grace period before full data deletion.
              </p>
              <button type="button" style={dangerButton}>Delete account</button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

const panel = {
  border: "1px solid #263244",
  background: "#101622",
  borderRadius: 8,
  padding: 16,
};

const card = {
  ...panel,
  minHeight: 170,
};

const markBox = {
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#bfdbfe",
  display: "grid",
  placeItems: "center",
  fontSize: 12,
  fontWeight: 800,
};

const sectionTitle = {
  margin: "0 0 12px",
  color: "#f8fafc",
  fontSize: 16,
};

const primaryLink = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  border: "1px solid #2563eb",
  borderRadius: 8,
  background: "#2563eb",
  color: "#fff",
  padding: "0 14px",
  fontSize: 14,
  fontWeight: 800,
  textDecoration: "none",
};

const secondaryButton = {
  ...primaryLink,
  background: "#111827",
  borderColor: "#334155",
  color: "#d1d5db",
  cursor: "pointer",
};

const toggleRow = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  color: "#d1d5db",
  fontSize: 13,
};

const dangerButton = {
  ...secondaryButton,
  borderColor: "#7d2e2e",
  color: "#fecaca",
};
