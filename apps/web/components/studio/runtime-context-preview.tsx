"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  RUNTIME_CONTEXT_SECTIONS,
  runtimeContextCountRows,
  runtimeContextSourcesByType,
  type RuntimeContextPreviewLike,
} from "@/lib/continuity-ui";

const DEFAULT_CONTEXT_QUERY = "What should this persona keep steady right now?";

interface RuntimeContextPreviewProps {
  personaId: string;
  title?: string;
  subtitle?: string;
  showCompiledPrompt?: boolean;
  showSourceContent?: boolean;
}

export function RuntimeContextPreview({
  personaId,
  title = "Continuity loaded for the next response",
  subtitle = "Runtime Context",
  showCompiledPrompt = true,
  showSourceContent = true,
}: RuntimeContextPreviewProps) {
  const [query, setQuery] = useState(DEFAULT_CONTEXT_QUERY);
  const [preview, setPreview] = useState<RuntimeContextPreviewLike | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = useCallback(async (nextQuery: string) => {
    setLoading(true);
    setError(null);
    try {
      const session = await getSession();
      if (!session) {
        setPreview(null);
        setError("Sign in to preview runtime context.");
        return;
      }

      const data = await apiGet<{ context: RuntimeContextPreviewLike }>(
        `/conversations/persona/${personaId}/context-preview?query=${encodeURIComponent(nextQuery)}`,
        session.access_token
      );
      setPreview(data.context);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not preview runtime context.");
    } finally {
      setLoading(false);
    }
  }, [personaId]);

  useEffect(() => {
    loadPreview(DEFAULT_CONTEXT_QUERY);
  }, [loadPreview]);

  return (
    <section className="studio-runtime-preview">
      <div className="studio-section-heading">
        <div className="section-label">{subtitle}</div>
        <h2>{title}</h2>
      </div>

      <form
        className="studio-runtime-query"
        onSubmit={(event) => {
          event.preventDefault();
          loadPreview(query);
        }}
      >
        <input
          className="input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Preview query"
        />
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Loading..." : "Preview"}
        </button>
      </form>

      {error && <div className="space-form-error">{error}</div>}

      {preview && (
        <>
          <div className="studio-runtime-counts" aria-label="Runtime context counts">
            {runtimeContextCountRows(preview).map((section) => (
              <span key={section.type}>
                {section.label}
                <strong>{section.value}</strong>
              </span>
            ))}
          </div>

          <p style={{ margin: "0 0 1rem", color: "#8ea0b8", fontSize: "0.92rem", lineHeight: 1.5 }}>
            Continuity records are source context for recall and ordering. They are not system instructions.
          </p>

          <div className="studio-runtime-sources">
            {RUNTIME_CONTEXT_SECTIONS.map((section) => {
              const sources = runtimeContextSourcesByType(preview, section.type);
              return (
                <div key={section.type} className="studio-runtime-source-group">
                  <h3>{section.label}</h3>
                  {sources.length === 0 ? (
                    <p>{section.empty}</p>
                  ) : (
                    sources.map((source) => (
                      <article key={`${source.type}-${source.id}`} className="studio-runtime-source">
                        <div>
                          <strong>{source.title || section.label}</strong>
                          <span>{source.reason}</span>
                        </div>
                        {showSourceContent && source.content ? <p>{source.content}</p> : null}
                      </article>
                    ))
                  )}
                </div>
              );
            })}
          </div>

          {showCompiledPrompt && preview.systemPrompt ? (
            <details className="studio-runtime-prompt">
              <summary>Compiled system prompt</summary>
              <pre>{preview.systemPrompt}</pre>
            </details>
          ) : null}
        </>
      )}
    </section>
  );
}
