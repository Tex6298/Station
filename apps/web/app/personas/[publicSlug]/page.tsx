"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { PublicPersonaContextPreview } from "@station/types/persona";
import { apiGet } from "@/lib/api-client";
import { publicPersonaContextPreviewCopy, publicPersonaReadbackCopy } from "@/lib/public-persona-route";

interface PublicPersona {
  name: string;
  shortDescription?: string | null;
  visibility: "public";
  avatarUrl?: string | null;
  publicSlug?: string | null;
}

export default function PublicPersonaPage() {
  const { publicSlug } = useParams<{ publicSlug: string }>();
  const [persona, setPersona] = useState<PublicPersona | null>(null);
  const [preview, setPreview] = useState<PublicPersonaContextPreview | null>(null);
  const [previewQuery, setPreviewQuery] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicSlug) return;
    let cancelled = false;

    async function loadPersona() {
      setLoading(true);
      setError(null);
      setPreviewError(null);
      try {
        const [data, previewData] = await Promise.all([
          apiGet<{ persona: PublicPersona }>(`/personas/public/${publicSlug}`),
          apiGet<PublicPersonaContextPreview>(`/personas/public/${publicSlug}/context-preview`),
        ]);
        if (!cancelled) {
          setPersona(data.persona);
          setPreview(previewData);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Public persona not found.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPersona();
    return () => {
      cancelled = true;
    };
  }, [publicSlug]);

  async function loadPreview(query: string) {
    if (!publicSlug) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const suffix = query.trim() ? `?query=${encodeURIComponent(query.trim())}` : "";
      const data = await apiGet<PublicPersonaContextPreview>(
        `/personas/public/${publicSlug}/context-preview${suffix}`
      );
      setPreview(data);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "Could not load public context preview.");
    } finally {
      setPreviewLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="public-persona-page">
        <section className="public-persona-panel">
          <p>Loading public persona...</p>
        </section>
      </main>
    );
  }

  if (error || !persona) {
    return (
      <main className="public-persona-page">
        <section className="public-persona-panel public-persona-error">
          <p>{error ?? "Public persona not found."}</p>
          <Link href="/discover">Back to Discover</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="public-persona-page">
      <section className="public-persona-header">
        <IdentityMark title={persona.name} imageUrl={persona.avatarUrl ?? null} />
        <div>
          <div className="public-persona-kicker">Public persona</div>
          <h1>{persona.name}</h1>
          {persona.shortDescription && <p>{persona.shortDescription}</p>}
        </div>
      </section>

      <section className="public-persona-panel" aria-label="Public readback">
        <div>
          <span>Visibility</span>
          <strong>{persona.visibility}</strong>
        </div>
        <p>{publicPersonaReadbackCopy()}</p>
      </section>

      <section className="public-persona-panel public-persona-context-preview" aria-label="Visitor-safe context preview">
        <div>
          <span>Visitor-safe context preview</span>
          <strong>Public sources only</strong>
        </div>
        <p>{publicPersonaContextPreviewCopy()}</p>

        <form
          className="public-persona-preview-form"
          onSubmit={(event) => {
            event.preventDefault();
            void loadPreview(previewQuery);
          }}
        >
          <label>
            <span>Short visitor query</span>
            <input
              value={previewQuery}
              maxLength={120}
              onChange={(event) => setPreviewQuery(event.target.value)}
              placeholder="Try a public topic"
            />
          </label>
          <button type="submit" disabled={previewLoading}>
            {previewLoading ? "Checking..." : "Preview sources"}
          </button>
        </form>

        {previewError && <p className="public-persona-preview-error">{previewError}</p>}
        {preview && (
          <div className="public-persona-preview-result">
            <div className="public-persona-preview-counts" aria-label="Public source counts">
              <div>
                <span>Profile</span>
                <strong>{preview.preview.counts.publicProfile}</strong>
              </div>
              <div>
                <span>Published docs</span>
                <strong>{preview.preview.counts.publishedDocuments}</strong>
              </div>
              <div>
                <span>Public discussions</span>
                <strong>{preview.preview.counts.publicDiscussions}</strong>
              </div>
            </div>

            <div className="public-persona-preview-sources">
              {preview.preview.sources.map((source) => (
                <Link href={source.href} key={`${source.type}-${source.href}`}>
                  <span>{source.label}</span>
                  <strong>{source.title}</strong>
                  {source.excerpt && <em>{source.excerpt}</em>}
                  <small>{source.matchesQuery ? "Matched public text" : "Available public source"}</small>
                </Link>
              ))}
            </div>

            <div className="public-persona-preview-exclusions">
              <span>Excluded private buckets</span>
              <p>{preview.preview.excludedPrivateBuckets.join(", ")}</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function IdentityMark({ title, imageUrl }: { title: string; imageUrl?: string | null }) {
  if (imageUrl) {
    return (
      <div
        aria-hidden="true"
        className="public-persona-avatar"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
    );
  }

  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "P";

  return <div className="public-persona-avatar public-persona-initials">{initials}</div>;
}
