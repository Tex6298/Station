"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiPost } from "@/lib/api-client";

export default function NewSpacePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    longDescription: "",
    isPublic: true,
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleTitleChange(title: string) {
    set("title", title);
    if (!slugEdited) {
      set("slug", title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) { setError("Title and slug are required."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const session = await getSession();
      if (!session) { router.push("/login"); return; }
      const { space } = await apiPost<{ space: { slug: string } }>(
        "/spaces",
        { ...form, shortDescription: form.shortDescription || undefined, longDescription: form.longDescription || undefined },
        session.access_token
      );
      router.push(`/space/${space.slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create Space.");
      setSubmitting(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: "0 0 0.25rem" }}>Create a Space</h1>
        <p style={{ margin: 0, color: "#666", fontSize: "0.875rem" }}>
          Your public home - part website, part Substack.
        </p>
      </div>

      {error && (
        <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ display: "grid", gap: "1.1rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.35rem" }}>
            Title *
          </label>
          <input className="input" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g. The Mirror Archive" maxLength={100} required />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.35rem" }}>
            Slug * <span style={{ color: "#555", textTransform: "none", letterSpacing: 0 }}>- station.build/space/<strong>{form.slug || "your-slug"}</strong></span>
          </label>
          <input
            className="input"
            value={form.slug}
            onChange={(e) => { setSlugEdited(true); set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); }}
            placeholder="your-slug"
            maxLength={60}
            required
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.35rem" }}>
            Short description
          </label>
          <input className="input" value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} placeholder="One sentence about this Space" maxLength={300} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.35rem" }}>
            About this Space
          </label>
          <textarea className="textarea" value={form.longDescription} onChange={(e) => set("longDescription", e.target.value)} placeholder="More detail about who you are and what this Space contains." style={{ minHeight: 100 }} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>
            Visibility
          </label>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {([true, false] as const).map((v) => (
              <button key={String(v)} type="button" onClick={() => set("isPublic", v)} style={{
                flex: 1, padding: "0.6rem", borderRadius: 8, cursor: "pointer",
                background: form.isPublic === v ? "#1a1535" : "#121826",
                border: "1px solid " + (form.isPublic === v ? "#7c6af7" : "#2a3242"),
                color: form.isPublic === v ? "#c4b5fd" : "#888", fontSize: "0.875rem",
              }}>
                {v ? "Public" : "Private"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
          <button type="button" onClick={() => router.back()} style={{ flex: 1, padding: "0.65rem", background: "transparent", border: "1px solid #334155", borderRadius: 8, color: "#aaa", cursor: "pointer" }}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} style={{ flex: 2, padding: "0.65rem", background: "#7c6af7", border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            {submitting ? "Creating..." : "Create Space"}
          </button>
        </div>
      </form>
    </main>
  );
}
