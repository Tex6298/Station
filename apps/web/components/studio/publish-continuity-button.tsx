"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";

type ContinuitySourceType = "canon" | "integrity" | "archive_file" | "archive_import";
type PublicationVisibility = "private" | "unlisted" | "community" | "public";

interface SpaceOption {
  id: string;
  slug: string;
  title: string;
}

interface PublishedDocument {
  id: string;
  title: string;
  visibility: PublicationVisibility;
  status: "draft" | "published" | "archived";
}

interface Props {
  sourceType: ContinuitySourceType;
  sourceId: string;
  defaultTitle: string;
}

const SOURCE_LABELS: Record<ContinuitySourceType, string> = {
  canon: "Canon",
  integrity: "Integrity",
  archive_file: "Archive file",
  archive_import: "Archive import",
};

export function PublishContinuityButton({ sourceType, sourceId, defaultTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [spaces, setSpaces] = useState<SpaceOption[]>([]);
  const [spaceId, setSpaceId] = useState("");
  const [title, setTitle] = useState(defaultTitle);
  const [visibility, setVisibility] = useState<PublicationVisibility>("public");
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [result, setResult] = useState<{ document: PublishedDocument; space: SpaceOption } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function loadSpaces() {
      try {
        const session = await getSession();
        if (!session) return;
        const data = await apiGet<{ spaces: SpaceOption[] }>("/spaces", session.access_token);
        if (cancelled) return;
        setSpaces(data.spaces ?? []);
        setSpaceId((current) => current || data.spaces?.[0]?.id || "");
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load Spaces.");
      }
    }

    loadSpaces();
    return () => {
      cancelled = true;
    };
  }, [open]);

  async function publish(mode: "draft" | "publish") {
    if (!spaceId) {
      setError("Choose a Space first.");
      return;
    }

    setSaving(mode);
    setError(null);
    try {
      const session = await getSession();
      if (!session) {
        setError("Sign in to publish.");
        return;
      }

      const response = await apiPost<{ document: PublishedDocument; space: SpaceOption }>(
        "/documents/publish-from-continuity",
        {
          sourceType,
          sourceId,
          spaceId,
          title: title.trim() || defaultTitle,
          visibility,
          publish: mode === "publish",
        },
        session.access_token
      );
      setResult(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create document copy.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="studio-publish-control">
      <button className="button" type="button" onClick={() => setOpen((value) => !value)}>
        {open ? "Close publish" : "Publish copy"}
      </button>

      {open && (
        <div className="studio-publish-panel">
          <div>
            <span>{SOURCE_LABELS[sourceType]}</span>
            <strong>Create Station Document</strong>
          </div>

          <input
            className="input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-label="Published document title"
          />

          <div className="studio-publish-row">
            <select className="select" value={spaceId} onChange={(event) => setSpaceId(event.target.value)}>
              {spaces.length === 0 && <option value="">No Spaces available</option>}
              {spaces.map((space) => (
                <option key={space.id} value={space.id}>{space.title}</option>
              ))}
            </select>
            <select className="select" value={visibility} onChange={(event) => setVisibility(event.target.value as PublicationVisibility)}>
              <option value="public">Public</option>
              <option value="community">Community</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="studio-publish-actions">
            <button className="button" type="button" onClick={() => publish("draft")} disabled={saving !== null || spaces.length === 0}>
              {saving === "draft" ? "Creating..." : "Create draft"}
            </button>
            <button className="button primary" type="button" onClick={() => publish("publish")} disabled={saving !== null || spaces.length === 0}>
              {saving === "publish" ? "Publishing..." : "Publish"}
            </button>
          </div>

          {error && <div className="space-form-error">{error}</div>}
          {result && (
            <Link className="studio-publish-result" href={`/space/${result.space.slug}/documents/${result.document.id}`}>
              {result.document.status === "published" ? "Published" : "Draft created"}: {result.document.title}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
