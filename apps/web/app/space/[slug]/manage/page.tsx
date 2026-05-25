"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  SPACE_LAYOUT_OPTIONS,
  SPACE_THEME_OPTIONS,
  type SpaceLayoutId,
  type SpacePresentationConfig,
  type SpaceThemeId,
} from "@station/config/space-presentation";
import { getSession } from "@/lib/auth";
import { apiGet, apiPatch } from "@/lib/api-client";

interface ManagedSpace {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  long_description: string | null;
  is_public: boolean;
  comments_default_enabled: boolean;
  presentation: SpacePresentationConfig;
}

interface ManageForm {
  title: string;
  shortDescription: string;
  longDescription: string;
  tagline: string;
  theme: SpaceThemeId;
  layout: SpaceLayoutId;
  isPublic: boolean;
  commentsDefaultEnabled: boolean;
}

export default function ManageSpacePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [space, setSpace] = useState<ManagedSpace | null>(null);
  const [form, setForm] = useState<ManageForm | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    async function load() {
      try {
        const session = await getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        setToken(session.access_token);
        const data = await apiGet<{ space: ManagedSpace }>(`/spaces/${slug}/manage`, session.access_token);
        if (cancelled) return;
        setSpace(data.space);
        setForm({
          title: data.space.title,
          shortDescription: data.space.short_description ?? "",
          longDescription: data.space.long_description ?? "",
          tagline: data.space.presentation.tagline,
          theme: data.space.presentation.theme,
          layout: data.space.presentation.layout,
          isPublic: data.space.is_public,
          commentsDefaultEnabled: data.space.comments_default_enabled ?? true,
        });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load Space settings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router, slug]);

  function set<K extends keyof ManageForm>(field: K, value: ManageForm[K]) {
    setForm((current) => current ? { ...current, [field]: value } : current);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!space || !form || !token) return;

    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const response = await apiPatch<{ space: ManagedSpace }>(
        `/spaces/${space.id}`,
        {
          title: form.title,
          shortDescription: form.shortDescription || null,
          longDescription: form.longDescription || null,
          tagline: form.tagline || "",
          theme: form.theme,
          layout: form.layout,
          isPublic: form.isPublic,
          commentsDefaultEnabled: form.commentsDefaultEnabled,
        },
        token
      );
      setSpace(response.space);
      setForm({
        title: response.space.title,
        shortDescription: response.space.short_description ?? "",
        longDescription: response.space.long_description ?? "",
        tagline: response.space.presentation.tagline,
        theme: response.space.presentation.theme,
        layout: response.space.presentation.layout,
        isPublic: response.space.is_public,
        commentsDefaultEnabled: response.space.comments_default_enabled ?? true,
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save Space.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="container">
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#7f8aa0" }}>Loading...</div>
      </main>
    );
  }

  if (!space || !form) {
    return (
      <main className="container">
        <div className="space-form-error">{error ?? "Space not found."}</div>
      </main>
    );
  }

  return (
    <main className="container space-builder-page">
      <div className="space-builder-heading">
        <div>
          <div className="kicker">Space settings</div>
          <h1>Edit {space.title}</h1>
          <p>Shape the public microsite without opening up arbitrary custom styling.</p>
        </div>
        <Link href={`/space/${space.slug}`} className="button">View Space</Link>
      </div>

      {error && <div className="space-form-error">{error}</div>}
      {saved && <div className="space-form-success">Saved.</div>}

      <form onSubmit={handleSubmit} className="space-builder-grid">
        <section className="space-builder-panel">
          <Field label="Title" required>
            <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={100} required />
          </Field>

          <Field label="Tagline" help="Shown in the public hero.">
            <input className="input" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} maxLength={160} />
          </Field>

          <Field label="Short description">
            <input className="input" value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} maxLength={300} />
          </Field>

          <Field label="About this Space">
            <textarea className="textarea" value={form.longDescription} onChange={(e) => set("longDescription", e.target.value)} style={{ minHeight: 150 }} />
          </Field>
        </section>

        <aside className="space-builder-panel">
          <Field label="Theme">
            <div className="space-choice-grid">
              {SPACE_THEME_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`space-choice space-choice-${option.id}`}
                  data-active={form.theme === option.id}
                  onClick={() => set("theme", option.id)}
                >
                  <span className="space-choice-swatch" />
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Layout">
            <select className="input" value={form.layout} onChange={(e) => set("layout", e.target.value as SpaceLayoutId)}>
              {SPACE_LAYOUT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label} - {option.description}</option>
              ))}
            </select>
          </Field>

          <Field label="Visibility">
            <div className="space-segmented-control">
              <button type="button" data-active={form.isPublic} onClick={() => set("isPublic", true)}>Public</button>
              <button type="button" data-active={!form.isPublic} onClick={() => set("isPublic", false)}>Private</button>
            </div>
          </Field>

          <label className="space-checkbox-control">
            <input type="checkbox" checked={form.commentsDefaultEnabled} onChange={(e) => set("commentsDefaultEnabled", e.target.checked)} />
            <span>Enable comments by default on new pages</span>
          </label>

          <div className={`space-mini-preview space-theme-${form.theme}`}>
            <span>{SPACE_LAYOUT_OPTIONS.find((option) => option.id === form.layout)?.label ?? "Editorial"}</span>
            <h2>{form.title}</h2>
            <p>{form.tagline || form.shortDescription || "Your public surface starts here."}</p>
          </div>

          <div className="space-form-actions">
            <Link href={`/space/${space.slug}`} className="button">Cancel</Link>
            <button type="submit" className="button primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </aside>
      </form>
    </main>
  );
}

function Field({ label, help, required, children }: { label: string; help?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="space-form-field">
      <span>
        {label}{required ? " *" : ""}
        {help && <small>{help}</small>}
      </span>
      {children}
    </label>
  );
}
