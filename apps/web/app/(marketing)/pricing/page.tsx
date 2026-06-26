import Link from "next/link";

const TIERS = [
  {
    name: "Free",
    tier: "visitor",
    price: "GBP 0",
    interval: null,
    description: "See what Station is about. No commitment.",
    features: [
      "Browse public Spaces and documents",
      "Read the community forums",
      "Limited discover feed",
    ],
    cta: "Sign up free",
    href: "/signup",
    featured: false,
  },
  {
    name: "Basic",
    tier: "private",
    price: "GBP 10",
    interval: "month",
    description: "Your private studio. Two personas, full archive, community access.",
    features: [
      "2 personas",
      "Private archive with memory + canon",
      "File and chat imports",
      "Full forum access",
      "5 GB storage",
      "BYOK or platform AI",
    ],
    cta: "Start Basic",
    href: "/signup?tier=private",
    featured: false,
  },
  {
    name: "Creator",
    tier: "creator",
    price: "GBP 100",
    interval: "month",
    yearlyPrice: "GBP 1,000",
    description: "Unlimited personas, a public Space, and the tools to publish and share.",
    features: [
      "Unlimited personas",
      "Full archive + semantic search",
      "Your own public Space (website)",
      "Publish essays, codexes, and field logs",
      "50 GB storage",
      "BYOK or platform AI",
      "Forum + community access",
    ],
    cta: "Become a Creator",
    href: "/signup?tier=creator",
    featured: true,
  },
  {
    name: "Canon / Developer",
    tier: "canon",
    price: "GBP 250",
    interval: "month",
    description: "For serious practitioners. Everything, plus more space and early access.",
    features: [
      "Everything in Creator",
      "3 Spaces",
      "200 GB storage",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Join Canon / Developer",
    href: "/signup?tier=canon",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <main className="container" style={{ maxWidth: 960, margin: "0 auto", padding: "4rem 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.2rem", marginBottom: "0.75rem" }}>
          Find your place
        </h1>
        <p style={{ color: "#687078", fontSize: "1.1rem", maxWidth: 520, margin: "0 auto" }}>
          Station is built for people who take their AI companions seriously.
          Start free, upgrade when you are ready.
        </p>
      </div>

      <div style={{
        display: "grid",
        gap: "1.25rem",
        gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
        marginBottom: "3rem",
      }}>
        {TIERS.map((t) => (
          <div
            key={t.tier}
            className="card"
            style={{
              position: "relative",
              border: t.featured ? "1px solid #534ab7" : undefined,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {t.featured && (
              <span style={{
                position: "absolute",
                top: -11,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#534ab7",
                color: "#fff",
                fontSize: "0.7rem",
                padding: "0.15rem 0.65rem",
                borderRadius: 999,
                whiteSpace: "nowrap",
                fontWeight: 600,
              }}>
                Most popular
              </span>
            )}

            <h2 style={{ margin: "0 0 0.25rem", fontSize: "1.15rem" }}>{t.name}</h2>

            <p style={{ margin: "0 0 1rem" }}>
              <span style={{ fontSize: "1.6rem", fontWeight: 700 }}>{t.price}</span>
              {t.interval && (
                <span style={{ color: "#687078", fontSize: "0.85rem" }}>/{t.interval}</span>
              )}
              {t.yearlyPrice && (
                <span style={{ display: "block", color: "#534ab7", fontSize: "0.78rem", marginTop: "0.2rem" }}>
                  or {t.yearlyPrice}/year - save 17%
                </span>
              )}
            </p>

            <p style={{ color: "#687078", fontSize: "0.875rem", marginBottom: "1rem", lineHeight: 1.5 }}>
              {t.description}
            </p>

            <ul style={{
              paddingLeft: "1.1rem",
              margin: "0 0 1.5rem",
              color: "#687078",
              fontSize: "0.85rem",
              lineHeight: 1.9,
              flexGrow: 1,
            }}>
              {t.features.map((f) => <li key={f}>{f}</li>)}
            </ul>

            <Link
              href={t.href}
              style={{
                display: "block",
                textAlign: "center",
                padding: "0.55rem 1rem",
                borderRadius: 6,
                background: t.featured ? "#534ab7" : "#1f2529",
                color: "#fff",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              {t.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* Institutional */}
      <div className="card" style={{ background: "#ffffff", borderColor: "#d8d3c8" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: "0 0 0.4rem" }}>Institutional</h2>
            <p style={{ color: "#687078", margin: 0, maxWidth: 480, fontSize: "0.9rem", lineHeight: 1.6 }}>
              For universities, research departments, newsrooms, and government bodies
              that need structured access to this community - its practitioners, beliefs,
              methods, and data. Custom pricing, multi-seat access, research analytics.
            </p>
          </div>
          <a
            href="mailto:hello@station.build"
            style={{
              padding: "0.6rem 1.4rem",
              background: "#1f2529",
              color: "#fff",
              borderRadius: 6,
              textDecoration: "none",
              fontSize: "0.9rem",
              whiteSpace: "nowrap",
            }}
          >
            Contact us
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ marginTop: "4rem" }}>
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.3rem" }}>Common questions</h2>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {[
            {
              q: "What is BYOK?",
              a: "Bring Your Own Key. You paste your own OpenAI, Anthropic, or DeepSeek API key into your account settings. Your key hits the provider directly - we never proxy or log it.",
            },
            {
              q: "What is the platform AI?",
              a: "For users without their own API key, we provide a shared DeepSeek endpoint. It works well for most persona interactions. BYOK gives you more model choice and control.",
            },
            {
              q: "What happens to my data if I cancel?",
              a: "Your personas, archive, and conversations remain in read-only mode for 30 days. You can export everything during that window. After 30 days your private data is deleted.",
            },
            {
              q: "Can I switch plans?",
              a: "Plan changes start from Billing and Stripe-hosted test-mode handoff in this build. Station reflects the change after verified server subscription state updates.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="card">
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem" }}>{q}</h3>
              <p style={{ margin: 0, color: "#687078", fontSize: "0.875rem", lineHeight: 1.6 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
