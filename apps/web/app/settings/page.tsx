import Link from "next/link";

const sections = [
  {
    href: "/settings/social",
    icon: "📡",
    title: "Social publishing",
    description: "Connect Bluesky, Mastodon, Tumblr, LinkedIn, Reddit, WordPress, and Ghost to publish directly from Station.",
  },
  {
    href: "/billing",
    icon: "💳",
    title: "Billing & plan",
    description: "Manage your subscription, upgrade your tier, or access the Stripe customer portal.",
  },
];

export default function SettingsPage() {
  return (
    <main className="container" style={{ maxWidth: 640 }}>
      <h1 style={{ margin: "0 0 1.5rem" }}>Settings</h1>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {sections.map((s) => (
          <Link key={s.href} href={s.href} style={{ textDecoration: "none" }}>
            <div className="card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start", cursor: "pointer" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: "#1a1f2e",
                border: "1px solid #2a2f3e", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "1.15rem", flexShrink: 0,
              }}>
                {s.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>{s.title}</div>
                <div style={{ fontSize: "0.83rem", color: "#666", lineHeight: 1.5 }}>{s.description}</div>
              </div>
              <span style={{ color: "#444", fontSize: "0.85rem", paddingTop: "0.1rem" }}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
