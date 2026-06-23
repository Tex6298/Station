"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import { publicPersonaReadbackCopy } from "@/lib/public-persona-route";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicSlug) return;
    let cancelled = false;

    async function loadPersona() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<{ persona: PublicPersona }>(`/personas/public/${publicSlug}`);
        if (!cancelled) setPersona(data.persona);
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
