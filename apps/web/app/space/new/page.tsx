"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SPACE_LAYOUT_OPTIONS,
  SPACE_THEME_OPTIONS,
  type SpaceLayoutId,
  type SpaceThemeId,
} from "@station/config/space-presentation";
import { getSession } from "@/lib/auth";
import { apiPost } from "@/lib/api-client";

interface NewSpaceForm {
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  tagline: string;
  theme: SpaceThemeId;
  layout: SpaceLayoutId;
  isPublic: boolean;
}

const initialForm: NewSpaceForm = {
  title: "",
  slug: "",
  shortDescription: "",
  longDescription: "",
  tagline: "",
  theme: "atlas",
  layout: "editorial",
  isPublic: true,
};

export default function NewSpacePage() {
  const router = useRouter();
  const [form, setForm] = useState<NewSpaceForm>(initialForm);
  const [slugEdited, setSlugEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof NewSpaceForm>(field: K, value: NewSpaceForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleTitleChange(title: string) {
    set("title", title);
    if (!slugEdited) {
      set("slug", slugify(title));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      setError("Title and slug are required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const session = await getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { space } = await apiPost<{ space: { slug: string } }>(
        "/spaces",
        {
          ...form,
          shortDescription: form.shortDescription || undefined,
          longDescription: form.longDescription || undefined,
          tagline: form.tagline || undefined,
        },
        session.access_token
      );
      router.push(`/space/${space.slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create Space.");
      setSubmitting(false);
    }
  }

  return (
    <main className="container space-builder-page">
      <div className="space-builder-heading">
        <div>
          <div className="kicker">Public identity</div>
          <h1>Create a Space</h1>
          <p>Your authored public home for works, personas, collections, and identity.</p>
        </div>
      </div>

      {error && <div className="space-form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="space-builder-grid">
        <section className="space-builder-panel">
          <Field label="Title" required>
            <input className="input" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="The Mirror Archive" maxLength={100} required />
          </Field>

          <Field label="Slug" help={`station.build/space/${form.slug || "your-slug"}`} required>
            <input
              className="input"
              value={form.slug}
              onChange={(e) => {
                setSlugEdited(true);
                set("slug", slugify(e.target.value));
              }}
              placeholder="your-slug"
              maxLength={60}
              required
            />
          </Field>

          <Field label="Tagline" help="Shown in the hero. Keep it punchy.">
            <input className="input" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="A living archive of continuity experiments." maxLength={160} />
          </Field>

          <Field label="Short description">
            <input className="input" value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} placeholder="One sentence about this Space" maxLength={300} />
          </Field>

          <Field label="About this Space">
            <textarea className="textarea" value={form.longDescription} onChange={(e) => set("longDescription", e.target.value)} placeholder="More detail about what lives here." style={{ minHeight: 130 }} />
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

          <div className={`space-mini-preview space-theme-${form.theme}`}>
            <span>{SPACE_LAYOUT_OPTIONS.find((option) => option.id === form.layout)?.label ?? "Editorial"}</span>
            <h2>{form.title || "Untitled Space"}</h2>
            <p>{form.tagline || form.shortDescription || "Your public surface starts here."}</p>
          </div>

          <div className="space-form-actions">
            <button type="button" className="button" onClick={() => router.back()}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create Space"}
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

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60);
}
