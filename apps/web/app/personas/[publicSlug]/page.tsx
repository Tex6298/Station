"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type {
  PublicPersonaChatResponse,
  PublicPersonaContextPreview,
  PublicPersonaEventsResponse,
  PublicPersonaReportConfirmation,
} from "@station/types/persona";
import { apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  type PublicPersonaChatMode,
  publicPersonaChatAccess,
  publicPersonaChatCopy,
  publicPersonaChatDisabledCopy,
  publicPersonaContextPreviewCopy,
  publicPersonaOptionalRead,
  publicPersonaReadbackCopy,
  publicPersonaUpdatesCopy,
  publicPersonaUpdatesEmptyCopy,
} from "@/lib/public-persona-route";

interface PublicPersona {
  name: string;
  shortDescription?: string | null;
  visibility: "public";
  avatarUrl?: string | null;
  publicSlug?: string | null;
  publicChat?: {
    enabled: boolean;
    mode: PublicPersonaChatMode;
  };
}

export default function PublicPersonaPage() {
  const { publicSlug } = useParams<{ publicSlug: string }>();
  const [persona, setPersona] = useState<PublicPersona | null>(null);
  const [preview, setPreview] = useState<PublicPersonaContextPreview | null>(null);
  const [events, setEvents] = useState<PublicPersonaEventsResponse | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [previewQuery, setPreviewQuery] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatReply, setChatReply] = useState<PublicPersonaChatResponse | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [reportState, setReportState] = useState<"idle" | "sending" | "sent" | "duplicate" | "error">("idle");
  const [reportError, setReportError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicSlug) return;
    let cancelled = false;

    async function loadPersona() {
      setLoading(true);
      setError(null);
      setPreviewError(null);
      setEventsError(null);
      setPreview(null);
      setEvents(null);
      try {
        const data = await apiGet<{ persona: PublicPersona }>(`/personas/public/${publicSlug}`);
        if (!cancelled) {
          setPersona(data.persona);
          setLoading(false);
        }

        void publicPersonaOptionalRead(
          apiGet<PublicPersonaContextPreview>(`/personas/public/${publicSlug}/context-preview`),
          "context-preview"
        )
          .then((previewData) => {
            if (!cancelled) setPreview(previewData);
          })
          .catch((err) => {
            if (!cancelled) {
              setPreviewError(err instanceof Error ? err.message : "Public context preview is temporarily unavailable.");
            }
          });

        void publicPersonaOptionalRead(
          apiGet<PublicPersonaEventsResponse>(`/personas/public/${publicSlug}/events`),
          "updates"
        )
          .then((eventData) => {
            if (!cancelled) setEvents(eventData);
          })
          .catch((err) => {
            if (!cancelled) {
              setEventsError(err instanceof Error ? err.message : "Public updates are temporarily unavailable.");
            }
          });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Public persona not found.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPersona();
    getSession()
      .then((session) => {
        if (!cancelled) setToken(session?.access_token ?? null);
      })
      .finally(() => {
        if (!cancelled) setSessionChecked(true);
      });
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
      const data = await publicPersonaOptionalRead(
        apiGet<PublicPersonaContextPreview>(`/personas/public/${publicSlug}/context-preview${suffix}`),
        "context-preview"
      );
      setPreview(data);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "Public context preview is temporarily unavailable.");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function sendPublicChat() {
    const chatAccess = publicPersonaChatAccess({
      enabled: persona?.publicChat?.enabled,
      mode: persona?.publicChat?.mode,
      hasSession: Boolean(token),
    });
    if (!publicSlug || !chatMessage.trim()) return;
    if (chatAccess !== "signed_in_alpha" && chatAccess !== "anonymous_alpha") return;
    setChatLoading(true);
    setChatError(null);
    setReportState("idle");
    setReportError(null);
    try {
      const data = await apiPost<PublicPersonaChatResponse>(
        `/personas/public/${publicSlug}/chat`,
        { message: chatMessage.trim() },
        token ?? undefined
      );
      setChatReply(data);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "Public chat is temporarily unavailable.");
    } finally {
      setChatLoading(false);
    }
  }

  async function reportPublicPersona() {
    if (!publicSlug || !token) return;
    setReportState("sending");
    setReportError(null);
    try {
      const data = await apiPost<PublicPersonaReportConfirmation>(
        `/personas/public/${publicSlug}/report`,
        {
          reason: "public_persona_chat",
          notes: "Visitor reported the public persona page or latest public chat response.",
        },
        token
      );
      setReportState(data.duplicate ? "duplicate" : "sent");
    } catch (err) {
      setReportState("error");
      setReportError(err instanceof Error ? err.message : "Could not submit report.");
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

  const chatAccess = publicPersonaChatAccess({
    enabled: persona.publicChat?.enabled,
    mode: persona.publicChat?.mode,
    hasSession: Boolean(token),
  });
  const chatModeLabel = persona.publicChat?.enabled
    ? persona.publicChat.mode === "anonymous_alpha" ? "Anonymous alpha" : "Signed-in alpha"
    : "Disabled";
  const canUsePublicChat = chatAccess === "signed_in_alpha" || chatAccess === "anonymous_alpha";

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

      <section className="public-persona-panel public-persona-updates" aria-label="Public updates">
        <div>
          <span>Public updates</span>
          <strong>Public sources</strong>
        </div>
        <p>{publicPersonaUpdatesCopy()}</p>

        {eventsError && <p className="public-persona-preview-error">{eventsError}</p>}
        {events && events.events.length === 0 && (
          <p className="public-persona-chat-state">{publicPersonaUpdatesEmptyCopy()}</p>
        )}
        {events && events.events.length > 0 && (
          <div className="public-persona-update-list">
            {events.events.map((event) => (
              <Link href={event.href} key={`${event.eventType}-${event.href}`}>
                <span>{event.label}</span>
                <strong>{event.title}</strong>
                <time dateTime={event.occurredAt}>{formatPublicPersonaEventDate(event.occurredAt)}</time>
                {event.excerpt && <em>{event.excerpt}</em>}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="public-persona-panel public-persona-chat" aria-label="Public chat">
        <div>
          <span>Public chat</span>
          <strong>{chatModeLabel}</strong>
        </div>
        <p>{persona.publicChat?.enabled ? publicPersonaChatCopy(persona.publicChat.mode) : publicPersonaChatDisabledCopy()}</p>

        {!sessionChecked && <p className="public-persona-chat-state">Checking session...</p>}

        {sessionChecked && !persona.publicChat?.enabled && (
          <p className="public-persona-chat-state">The public source preview remains available below.</p>
        )}

        {sessionChecked && chatAccess === "sign_in_required" && (
          <div className="public-persona-chat-state">
            <p>Sign in to use public chat.</p>
            <Link href={`/login?redirect=/personas/${publicSlug}`}>Sign in</Link>
          </div>
        )}

        {sessionChecked && canUsePublicChat && (
          <form
            className="public-persona-chat-form"
            onSubmit={(event) => {
              event.preventDefault();
              void sendPublicChat();
            }}
          >
            <label>
              <span>Message</span>
              <textarea
                value={chatMessage}
                maxLength={600}
                onChange={(event) => setChatMessage(event.target.value)}
                placeholder="Ask from public sources"
              />
            </label>
            <button type="submit" disabled={chatLoading || !chatMessage.trim()}>
              {chatLoading ? "Sending..." : "Send"}
            </button>
          </form>
        )}

        {chatError && <p className="public-persona-chat-error">{chatError}</p>}
        {chatReply && (
          <div className="public-persona-chat-reply">
            <strong>Reply</strong>
            <p>{chatReply.reply.content}</p>
            <div className="public-persona-chat-sources">
              {chatReply.sources.map((source) => (
                <Link href={source.href} key={`${source.type}-${source.href}`}>
                  <span>{source.label}</span>
                  <strong>{source.title}</strong>
                </Link>
              ))}
            </div>
            {token && (
              <button
                className="public-persona-report-button"
                type="button"
                disabled={reportState === "sending"}
                onClick={() => void reportPublicPersona()}
              >
                {reportState === "sending" ? "Reporting..." : "Report"}
              </button>
            )}
            {reportState === "sent" && <p className="public-persona-report-state">Report submitted.</p>}
            {reportState === "duplicate" && <p className="public-persona-report-state">Report already open.</p>}
            {reportState === "error" && <p className="public-persona-chat-error">{reportError}</p>}
          </div>
        )}
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
              <div>
                <span>Salon threads</span>
                <strong>{preview.preview.counts.publicSalonThreads}</strong>
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

function formatPublicPersonaEventDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Public source";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
