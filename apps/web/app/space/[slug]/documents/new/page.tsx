"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api-client";

interface Persona { id: string; name: string; }
interface Space   { id: string; title: string; slug: string; }

function toSlug(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 120);
}

export default function NewDocumentPage() {
  const { slug }  = useParams<{ slug: string }>();
  const router    = useRouter();
  const [space, setSpace]       = useState<Space | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    body: "",
    documentType: "post" as string,
    personaId: "" as string,
    visibility: "public" as string,
    commentsEnabled: true,
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) return;
      const [spaceData, personaData] = await Promise.all([
        apiGet<{ space: Space }>(`/spaces/${slug}`, session.access_token).catch(() => null),
        apiGet<{ personas: Persona[] }>("/personas", session.access_token).catch(() => ({ personas: [] })),
      ]);
      if (spaceData) setSpace(spaceData.space);
      setPersonas(personaData?.personas ?? []);
    });
  }, [slug]);

  function set(field: string, value: unknown) { setForm((f) => ({ ...f, [field]: value })); }

  function handleTitleChange(title: string) {
    set("title", title);
    if (!slugEdited) set("slug", toSlug(title));
  }

  async function handleSave(publish: boolean) {
    if (!form.title.trim() || !form.slug.trim()) { setError("Title and slug are required."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const session = await getSession();
      if (!session) { router.push("/login"); return; }

      const { document } = await apiPost<{ document: { id: string } }>(
        "/documents",
        {
          spaceId: space?.id,
          personaId: form.personaId || null,
          title: form.title,
          slug: form.slug,
          body: form.body,
          documentType: form.documentType,
          visibility: form.visibility,
          commentsEnabled: form.commentsEnabled,
        },
        session.access_token
      );

      if (publish) {
        await apiPost(`/documents/${document.id}/publish`, { visibility: form.visibility }, session.access_token);
      }

      router.push(`/space/${slug}/documents/${document.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save document.");
      setSubmitting(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: "1rem", fontSize: "0.8rem", color: "#555" }}>
        <Link href="/space" style={{ color: "#666" }}>Spaces</Link>
        {" / "}
        <Link href={`/space/${slug}`} style={{ color: "#666" }}>{space?.title ?? slug}</Link>
        {" / "}
        <span style={{ color: "#aaa" }}>New post</span>
      </div>

      {error && <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757", marginBottom: "1rem" }}>{error}</div>}

      <div style={{ display: "grid", gap: "1rem" }}>
        {/* Title */}
        <input className="input" value={form.title} onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Title" style={{ fontSize: "1.4rem", padding: "0.75rem 1rem", background: "transparent", border: "none", borderBottom: "1px solid #1e2535", borderRadius: 0, fontWeight: 600 }} />

        {/* Slug + type row */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: 180 }}>
            <input className="input" value={form.slug}
              onChange={(e) => { setSlugEdited(true); set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); }}
              placeholder="post-slug" style={{ fontSize: "0.85rem" }} />
          </div>
          <select className="select" value={form.documentType} onChange={(e) => set("documentType", e.target.value)} style={{ flex: 1, minWidth: 130 }}>
            <option value="post">Post</option>
            <option value="essay">Essay</option>
            <option value="manifesto">Manifesto</option>
            <option value="constitution">Constitution</option>
            <option value="update">Update</option>
            <option value="other">Other</option>
          </select>
          <select className="select" value={form.personaId} onChange={(e) => set("personaId", e.target.value)} style={{ flex: 1, minWidth: 140 }}>
            <option value="">No linked persona</option>
            {personas.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Body */}
        <textarea className="textarea" value={form.body} onChange={(e) => set("body", e.target.value)}
          placeholder="Write your post here..." style={{ minHeight: 360, fontSize: "0.95rem", lineHeight: 1.75 }} />

        {/* Options + actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <select className="select" value={form.visibility} onChange={(e) => set("visibility", e.target.value)} style={{ fontSize: "0.8rem" }}>
              <option value="public">Public</option>
              <option value="community">Community</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
            <label style={{ display: "flex", gap: "0.4rem", alignItems: "center", fontSize: "0.8rem", color: "#888", cursor: "pointer" }}>
              <input type="checkbox" checked={form.commentsEnabled} onChange={(e) => set("commentsEnabled", e.target.checked)} />
              Comments
            </label>
          </div>

          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button onClick={() => handleSave(false)} disabled={submitting}
              style={{ padding: "0.55rem 1.1rem", background: "transparent", border: "1px solid #334155", borderRadius: 8, color: "#aaa", cursor: "pointer", fontSize: "0.875rem" }}>
              {submitting ? "Saving..." : "Save draft"}
            </button>
            <button onClick={() => handleSave(true)} disabled={submitting}
              style={{ padding: "0.55rem 1.25rem", background: "#7c6af7", border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>
              {submitting ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
