"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthUser, CommunitySubcommunityRecord, SubcommunityType, SubcommunityVisibility } from "@station/types";
import { apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  canCreateSubcommunity,
  createSubcommunityPath,
  isDirectorySubcommunity,
  subcommunityBadgeLabel,
  subcommunityCategoryHref,
  subcommunityListPath,
} from "@/lib/community-subcommunities";

export default function SubcommunitiesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [subcommunities, setSubcommunities] = useState<CommunitySubcommunityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: "canon" as SubcommunityType,
    visibility: "public" as Extract<SubcommunityVisibility, "public" | "community">,
    slug: "",
    title: "",
    description: "",
  });

  useEffect(() => {
    let cancelled = false;
    getSession().then(async (session) => {
      if (cancelled) return;
      setAuthReady(true);
      if (session) {
        setToken(session.access_token);
        setUser(session.user);
      }
      const data = await apiGet<{ subcommunities: CommunitySubcommunityRecord[] }>(
        subcommunityListPath(),
        session?.access_token
      );
      if (!cancelled) setSubcommunities((data.subcommunities ?? []).filter(isDirectorySubcommunity));
    }).catch((e) => {
      if (!cancelled) setError(e instanceof Error ? e.message : "Could not load subcommunities.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function submitSubcommunity(event: React.FormEvent) {
    event.preventDefault();
    if (!token || !canCreateSubcommunity(user)) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await apiPost<{ subcommunity: CommunitySubcommunityRecord }>(
        createSubcommunityPath(),
        {
          type: form.type,
          visibility: form.visibility,
          slug: form.slug.trim(),
          title: form.title.trim(),
          description: form.description.trim() || null,
        },
        token
      );
      router.push(subcommunityCategoryHref(response.subcommunity));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create subcommunity.");
    } finally {
      setSubmitting(false);
    }
  }

  const eligible = canCreateSubcommunity(user);

  return (
    <main className="container">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ color: "#534ab7", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em" }}>Community</div>
          <h1 style={{ margin: "0.2rem 0 0.25rem" }}>Subcommunities</h1>
          <p style={{ margin: 0, color: "#687078", fontSize: "0.875rem" }}>Canon and Developer community areas.</p>
        </div>
        <Link href="/forums" style={linkButton}>Forums</Link>
      </div>

      {error && <div className="card" style={errorCard}>{error}</div>}

      <section className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Directory</h2>
          {loading && <span style={{ color: "#687078", fontSize: 13 }}>Loading...</span>}
        </div>
        {!loading && subcommunities.length === 0 ? (
          <div style={{ color: "#687078", fontSize: 13 }}>No public or community subcommunities in this view.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {subcommunities.map((subcommunity) => (
              <Link key={subcommunity.id} href={subcommunityCategoryHref(subcommunity)} style={{ textDecoration: "none" }}>
                <article style={subcommunityRow}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 5 }}>
                      <span style={pill}>{subcommunityBadgeLabel(subcommunity)}</span>
                    </div>
                    <h2 style={{ margin: "0 0 4px", color: "#1f2529", fontSize: 16 }}>{subcommunity.title}</h2>
                    {subcommunity.description && (
                      <p style={{ margin: 0, color: "#687078", fontSize: 13, lineHeight: 1.55 }}>{subcommunity.description}</p>
                    )}
                  </div>
                  <span style={{ color: "#687078", fontSize: 12, fontWeight: 800 }}>Open</span>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>Create</h2>
        {!authReady ? (
          <div style={{ color: "#687078", fontSize: 13 }}>Checking access...</div>
        ) : !user ? (
          <div style={{ color: "#687078", fontSize: 13 }}>
            <Link href="/login" style={{ color: "#534ab7", fontWeight: 800 }}>Sign in</Link> to create a subcommunity.
          </div>
        ) : !eligible ? (
          <div style={{ color: "#687078", fontSize: 13 }}>Canon tier or admin access is required to create subcommunities.</div>
        ) : (
          <form onSubmit={submitSubcommunity} style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 10 }}>
              <label style={fieldLabel}>
                Type
                <select className="input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as SubcommunityType })}>
                  <option value="canon">Canon</option>
                  <option value="developer">Developer</option>
                  <option value="salon">Salon</option>
                </select>
              </label>
              <label style={fieldLabel}>
                Visibility
                <select className="input" value={form.visibility} onChange={(event) => setForm({ ...form, visibility: event.target.value as "public" | "community" })}>
                  <option value="public">Public</option>
                  <option value="community">Community</option>
                </select>
              </label>
            </div>
            <label style={fieldLabel}>
              Slug
              <input className="input" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="canon-lab" required />
            </label>
            <label style={fieldLabel}>
              Title
              <input className="input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Canon Lab" required />
            </label>
            <label style={fieldLabel}>
              Description
              <textarea className="textarea" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" disabled={submitting || !form.slug.trim() || !form.title.trim()} style={primaryButton}>
                {submitting ? "Creating..." : "Create subcommunity"}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

const linkButton = {
  padding: "0.45rem 0.75rem",
  border: "1px solid #d8d3c8",
  borderRadius: 7,
  color: "#1f2529",
  textDecoration: "none",
  fontSize: "0.8rem",
  background: "#fff",
};

const subcommunityRow = {
  border: "1px solid #d8d3c8",
  borderRadius: 8,
  background: "#fff",
  padding: 14,
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
  flexWrap: "wrap" as const,
};

const pill = {
  border: "1px solid #d8d3c8",
  borderRadius: 999,
  background: "#f8f7f4",
  color: "#534ab7",
  padding: "0.14rem 0.5rem",
  fontSize: 11,
  fontWeight: 800,
};

const fieldLabel = {
  display: "grid",
  gap: 6,
  color: "#1f2529",
  fontSize: 13,
  fontWeight: 800,
};

const primaryButton = {
  padding: "0.5rem 1rem",
  background: "#1f2529",
  border: "none",
  borderRadius: 8,
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
  fontSize: "0.85rem",
};

const errorCard = {
  background: "#2d1515",
  borderColor: "#7d2e2e",
  color: "#eb5757",
  marginBottom: "1rem",
};
