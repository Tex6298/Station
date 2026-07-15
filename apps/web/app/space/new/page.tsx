"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SPACE_LAYOUT_OPTIONS,
  SPACE_THEME_OPTIONS,
  type SpaceLayoutId,
  type SpaceThemeId,
} from "@station/config/space-presentation";
import { getSession } from "@/lib/auth";
import { ApiRequestError, apiGet, apiPost, getBillingStatus } from "@/lib/api-client";
import {
  deriveSpaceCreateAccess,
  staleSpaceCreateCopy,
  type SpaceCreateAccess,
} from "@/lib/space-create-entitlement";

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
  isPublic: false,
};

type GateState =
  | { status: "loading" }
  | SpaceCreateAccess;

export default function NewSpacePage() {
  const router = useRouter();
  const [form, setForm] = useState<NewSpaceForm>(initialForm);
  const [slugEdited, setSlugEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [gate, setGate] = useState<GateState>({ status: "loading" });
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [staleRetryMessage, setStaleRetryMessage] = useState<string | null>(null);

  const runPreflight = useCallback(async () => {
    setGate({ status: "loading" });
    try {
      const session = await getSession();
      if (!session) {
        router.push(`/login?redirect=${encodeURIComponent("/space/new")}`);
        return;
      }

      setToken(session.accessToken);
      const [billing, spaces] = await Promise.all([
        getBillingStatus(session.accessToken),
        apiGet<unknown>("/spaces", session.accessToken),
      ]);
      setGate(deriveSpaceCreateAccess({ user: session.user, billing, spaces }));
    } catch {
      setGate({ status: "unverifiable" });
    } finally {
      setSubmitting(false);
    }
  }, [router]);

  useEffect(() => {
    void runPreflight();
  }, [runPreflight]);

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
    if (gate.status !== "allowed" || submitting || !token) return;
    if (!form.title.trim() || !form.slug.trim()) {
      setError("Title and slug are required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setStaleRetryMessage(null);
    try {
      const { space } = await apiPost<{ space: { slug: string } }>(
        "/spaces",
        {
          ...form,
          shortDescription: form.shortDescription || undefined,
          longDescription: form.longDescription || undefined,
          tagline: form.tagline || undefined,
        },
        token
      );
      router.push(`/space/${space.slug}`);
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 403) {
        setError(staleSpaceCreateCopy());
        setStaleRetryMessage("A fresh access check is running.");
        await runPreflight();
        return;
      }
      setError("Could not create Space.");
      setSubmitting(false);
    }
  }

  if (gate.status === "loading") {
    return (
      <main className="container space-create-page">
        <SpaceAccessNotice
          title="Checking Space access"
          body="Station is confirming your currently verified tier and owner Space count before opening the builder."
        />
      </main>
    );
  }

  if (gate.status === "below-tier") {
    return (
      <main className="container space-create-page">
        <SpaceAccessNotice
          title="Creator tier required"
          body="Space creation is not available for this account at its currently verified tier. No Space was created. Review plan details or return to your existing Spaces."
          actions={[
            { label: "Review plan details", href: "/billing" },
            { label: "View My Spaces", href: "/space" },
          ]}
        />
      </main>
    );
  }

  if (gate.status === "limit-reached") {
    return (
      <main className="container space-create-page">
        <SpaceAccessNotice
          title="Space limit reached"
          body={`Your currently verified plan allows ${gate.limitLabel}, and you already have ${gate.countLabel}. No Space was created. Manage an existing Space or review plan details before trying again.`}
          actions={[
            { label: "Review plan details", href: "/billing" },
            { label: "View My Spaces", href: "/space" },
          ]}
        />
      </main>
    );
  }

  if (gate.status === "unverifiable") {
    return (
      <main className="container space-create-page">
        <SpaceAccessNotice
          title="Could not check Space access"
          body="Station could not confirm your currently verified tier and owner Space count. Retry before opening the builder. No Space was created."
          actions={[
            { label: "Retry access check", onClick: runPreflight },
            { label: "View My Spaces", href: "/space" },
          ]}
        />
      </main>
    );
  }

  return (
    <main className="container space-create-page space-builder-page">
      <div className="space-builder-heading">
        <div>
          <div className="kicker">Owner Space</div>
          <h1>Create a Space</h1>
          <p>Create privately by default, then choose when this Space is ready for public readback.</p>
        </div>
      </div>

      {error && <div className="space-form-error">{error}</div>}
      {staleRetryMessage && <div className="space-create-inline-status">{staleRetryMessage}</div>}

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
            <div className="space-segmented-control" role="group" aria-label="Space visibility">
              <button type="button" aria-pressed={!form.isPublic} data-active={!form.isPublic} onClick={() => set("isPublic", false)}>
                Private
              </button>
              <button type="button" aria-pressed={form.isPublic} data-active={form.isPublic} onClick={() => set("isPublic", true)}>
                Public
              </button>
            </div>
            <p className="space-create-visibility-copy">
              {form.isPublic
                ? "Public makes this Space and its published pages readable outside your private owner workspace as soon as creation succeeds."
                : "Private keeps this Space out of public readback after creation. Review it before choosing to make it public."}
            </p>
          </Field>

          <div className={`space-mini-preview space-theme-${form.theme}`} data-visibility={form.isPublic ? "public" : "private"}>
            <span>{form.isPublic ? "Public preview" : "Private draft"}</span>
            <h2>{form.title || "Untitled Space"}</h2>
            <p>{form.tagline || form.shortDescription || (form.isPublic ? "Your public surface starts here." : "This Space stays out of public readback after creation.")}</p>
          </div>

          <div className="space-form-actions">
            <button type="button" className="button" onClick={() => router.back()}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting || gate.status !== "allowed"}>
              {submitting ? "Creating..." : "Create Space"}
            </button>
          </div>
        </aside>
      </form>
    </main>
  );
}

function SpaceAccessNotice({
  title,
  body,
  actions = [],
}: {
  title: string;
  body: string;
  actions?: Array<{ label: string; href: string } | { label: string; onClick: () => void | Promise<void> }>;
}) {
  return (
    <section className="space-create-notice" aria-labelledby="space-create-notice-title">
      <h1 id="space-create-notice-title">{title}</h1>
      <p>{body}</p>
      {actions.length > 0 && (
        <div className="space-create-actions">
          {actions.map((action) =>
            "href" in action ? (
              <Link key={action.label} href={action.href}>{action.label}</Link>
            ) : (
              <button key={action.label} type="button" onClick={action.onClick}>{action.label}</button>
            )
          )}
        </div>
      )}
    </section>
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
