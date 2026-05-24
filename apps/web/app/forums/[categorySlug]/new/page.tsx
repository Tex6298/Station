"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";

interface Category { id: string; slug: string; title: string; }
interface Persona  { id: string; name: string; }
interface Space    { id: string; slug: string; title: string; }

export default function NewThreadPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const router = useRouter();

  const [category, setCategory]   = useState<Category | null>(null);
  const [personas, setPersonas]   = useState<Persona[]>([]);
  const [spaces, setSpaces]       = useState<Space[]>([]);
  const [form, setForm] = useState({
    title: "",
    body: "",
    linkedPersonaId: "",
    linkedSpaceId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [authReady, setAuthReady]   = useState(false);

  useEffect(() => {
    if (!categorySlug) return;

    // Load category (public)
    apiGet<{ category: Category; threads: unknown[] }>(`/forums/categories/${categorySlug}`)
      .then((d) => setCategory(d.category))
      .catch(() => setError("Category not found."));

    // Load session-dependent data
    getSession().then(async (session) => {
      if (!session) { router.push("/login"); return; }
      setAuthReady(true);
      try {
        const [personaData, spaceData] = await Promise.all([
          apiGet<{ personas: Persona[] }>("/personas", session.access_token).catch(() => ({ personas: [] })),
          apiGet<{ spaces: Space[] }>("/spaces", session.access_token).catch(() => ({ spaces: [] })),
        ]);
        setPersonas(personaData.personas ?? []);
        setSpaces(spaceData.spaces ?? []);
      } catch { /* ignore */ }
    });
  }, [categorySlug, router]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setError("Title and body are required.");
      return;
    }
    if (!category) { setError("Category not loaded."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const session = await getSession();
      if (!session) { router.push("/login"); return; }

      const { thread } = await apiPost<{ thread: { id: string } }>(
        "/forums/threads",
        {
          categoryId: category.id,
          title: form.title.trim(),
          body: form.body.trim(),
          linkedPersonaId: form.linkedPersonaId || null,
          linkedSpaceId: form.linkedSpaceId || null,
        },
        session.access_token
      );

      router.push(`/forums/${categorySlug}/${thread.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create thread.");
      setSubmitting(false);
    }
  }

  if (error && !authReady && !category) {
    return (
      <main className="container">
        <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757" }}>{error}</div>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: 760 }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: "0.78rem", color: "#555", marginBottom: "1.5rem" }}>
        <Link href="/forums" style={{ color: "#666" }}>Forums</Link>
        {" / "}
        <Link href={`/forums/${categorySlug}`} style={{ color: "#666" }}>
          {category?.title ?? categorySlug}
        </Link>
        {" / "}
        <span style={{ color: "#aaa" }}>New thread</span>
      </div>

      {error && (
        <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        {/* Title */}
        <input
          className="input"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Thread title"
          maxLength={300}
          style={{ fontSize: "1.25rem", fontWeight: 600, background: "transparent", border: "none", borderBottom: "1px solid #1e2535", borderRadius: 0, padding: "0.75rem 1rem" }}
        />

        {/* Body */}
        <textarea
          className="textarea"
          value={form.body}
          onChange={(e) => set("body", e.target.value)}
          placeholder="Write your post..."
          style={{ minHeight: 280, fontSize: "0.95rem", lineHeight: 1.75 }}
        />

        {/* Optional links */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {personas.length > 0 && (
            <select className="select" value={form.linkedPersonaId} onChange={(e) => set("linkedPersonaId", e.target.value)} style={{ flex: 1, minWidth: 160, fontSize: "0.82rem" }}>
              <option value="">No linked persona</option>
              {personas.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          {spaces.length > 0 && (
            <select className="select" value={form.linkedSpaceId} onChange={(e) => set("linkedSpaceId", e.target.value)} style={{ flex: 1, minWidth: 160, fontSize: "0.82rem" }}>
              <option value="">No linked Space</option>
              {spaces.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ padding: "0.55rem 1.1rem", background: "transparent", border: "1px solid #334155", borderRadius: 8, color: "#aaa", cursor: "pointer", fontSize: "0.875rem" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{ padding: "0.55rem 1.25rem", background: "#7c6af7", border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}
          >
            {submitting ? "Posting..." : "Post thread"}
          </button>
        </div>
      </form>
    </main>
  );
}
