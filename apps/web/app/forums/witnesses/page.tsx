"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CommunityAuthorRecognitionRecord } from "@station/types";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  authorRecognitionApiPath,
  authorRecognitionHref,
  authorRecognitionKindLabel,
  authorRecognitionLabel,
  canReadAuthorRecognition,
  recognitionCountItems,
  sanitizeAuthorRecognitions,
  totalRecognitionCount,
  type AuthorRecognitionState,
} from "@/lib/community-author-recognition";
import {
  authorRecognitionPrivateBoundaryCopy,
  authorRecognitionTrustRows,
} from "@/lib/community-trust-readback";

function formatDate(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ForumWitnessesPage() {
  const [authState, setAuthState] = useState<AuthorRecognitionState>("checking");
  const [token, setToken] = useState<string | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recognitions, setRecognitions] = useState<CommunityAuthorRecognitionRecord[]>([]);

  const loadRecognitions = useCallback(async (accessToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<{ recognitions: unknown[] }>(authorRecognitionApiPath(50), accessToken);
      setRecognitions(sanitizeAuthorRecognitions(data.recognitions));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load recognition readback.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getSession().then((session) => {
      if (cancelled) return;
      if (!session) {
        setAuthState("signed-out");
        setLoading(false);
        return;
      }

      setTier(session.user.tier);
      if (!canReadAuthorRecognition(session.user)) {
        setAuthState("below-tier");
        setLoading(false);
        return;
      }

      setAuthState("eligible");
      setToken(session.access_token);
      void loadRecognitions(session.access_token);
    });

    return () => {
      cancelled = true;
    };
  }, [loadRecognitions]);

  const totalReceived = useMemo(
    () => recognitions.reduce((sum, recognition) => sum + totalRecognitionCount(recognition.witnessCounts), 0),
    [recognitions]
  );
  const trustRows = useMemo(
    () => authorRecognitionTrustRows({
      contributionCount: recognitions.length,
      witnessMarkCount: totalReceived,
    }),
    [recognitions.length, totalReceived]
  );

  if (authState === "checking") {
    return (
      <main className="container" style={{ maxWidth: 860 }}>
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#687078" }}>Loading...</div>
      </main>
    );
  }

  if (authState === "signed-out") {
    return (
      <main className="container" style={{ maxWidth: 760 }}>
        <Breadcrumb current="My recognition" />
        <div className="card" style={{ color: "#687078" }}>
          <Link href="/login" style={{ color: "#534ab7", fontWeight: 800 }}>Sign in</Link> to view private recognition readback.
        </div>
      </main>
    );
  }

  if (authState === "below-tier") {
    return (
      <main className="container" style={{ maxWidth: 760 }}>
        <Breadcrumb current="My recognition" />
        <div className="card" style={{ color: "#687078" }}>
          Private tier or above is required to view recognition readback. Current tier: {tier ?? "visitor"}.
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: 920 }}>
      <Breadcrumb current="My recognition" />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <div>
          <h1 style={{ margin: "0 0 0.25rem", fontSize: "1.55rem" }}>My recognition</h1>
          <p style={{ margin: 0, color: "#687078", fontSize: "0.86rem" }}>
            {authorRecognitionPrivateBoundaryCopy()}
          </p>
        </div>
        <button
          type="button"
          onClick={() => token ? loadRecognitions(token) : undefined}
          style={{ padding: "0.45rem 0.8rem", border: "1px solid #d8d3c8", borderRadius: 7, background: "#fff", color: "#1f2529", cursor: "pointer", fontSize: "0.8rem" }}
        >
          Refresh
        </button>
      </div>

      <section style={{ border: "1px solid #d8d3c8", borderRadius: 8, background: "#fff", padding: "0.9rem 1rem", marginBottom: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.85rem" }}>
        {trustRows.map((row) => (
          <div key={row.label}>
            <div style={{ color: "#687078", fontSize: "0.78rem", marginBottom: "0.2rem" }}>{row.label}</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1f2529" }}>{row.value}</div>
            <div style={{ color: "#687078", fontSize: "0.74rem", marginTop: "0.25rem" }}>{row.body}</div>
          </div>
        ))}
      </section>

      {error && (
        <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ color: "#687078", textAlign: "center", padding: "2rem" }}>Loading recognition...</div>
      ) : recognitions.length === 0 ? (
        <div className="card" style={{ color: "#687078", textAlign: "center", padding: "2rem" }}>
          No recognition readback yet.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {recognitions.map((recognition) => (
            <RecognitionRow key={`${recognition.targetType}:${recognition.targetId}`} recognition={recognition} />
          ))}
        </div>
      )}
    </main>
  );
}

function Breadcrumb({ current }: { current: string }) {
  return (
    <div style={{ fontSize: "0.78rem", color: "#8b8f92", marginBottom: "1.5rem" }}>
      <Link href="/forums" style={{ color: "#687078" }}>Forums</Link>
      {" / "}
      <span style={{ color: "#534ab7" }}>{current}</span>
    </div>
  );
}

function RecognitionRow({ recognition }: { recognition: CommunityAuthorRecognitionRecord }) {
  const href = authorRecognitionHref(recognition);
  const label = authorRecognitionLabel(recognition);
  const countItems = recognitionCountItems(recognition.witnessCounts);
  const updated = formatDate(recognition.targetContext.updatedAt ?? recognition.targetContext.createdAt);

  return (
    <article className="card" style={{ display: "grid", gap: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "#534ab7", fontSize: "0.72rem", fontWeight: 800, marginBottom: "0.25rem" }}>
            {authorRecognitionKindLabel(recognition.targetType)}
          </div>
          <h2 style={{ margin: 0, color: "#1f2529", fontSize: "1rem" }}>
            {href ? (
              <Link href={href} style={{ color: "#1f2529", textDecoration: "none" }}>{label}</Link>
            ) : (
              label
            )}
          </h2>
          {recognition.targetType === "comment" && (
            <div style={{ marginTop: "0.25rem", color: "#687078", fontSize: "0.78rem" }}>Comment contribution</div>
          )}
        </div>
        <div style={{ color: "#687078", fontSize: "0.76rem", textAlign: "right" }}>
          {updated ? `Updated ${updated}` : "Date unavailable"}
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
        {countItems.map((item) => (
          <span key={item.key} style={{ border: "1px solid #d8d3c8", borderRadius: 999, padding: "0.18rem 0.5rem", background: "#f8f7f4", color: "#1f2529", fontSize: "0.76rem" }}>
            {item.label}: {item.value}
          </span>
        ))}
      </div>

      {!href && (
        <div style={{ color: "#687078", fontSize: "0.78rem" }}>
          This item has no safe forum link available.
        </div>
      )}
    </article>
  );
}
