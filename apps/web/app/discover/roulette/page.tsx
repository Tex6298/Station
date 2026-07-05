"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { PublicPersonaChatResponse, PublicPersonaRouletteCard } from "@station/types/persona";
import { apiUrl } from "@/lib/api-client";
import {
  DISCOVER_ROULETTE_MAX_VISITOR_MESSAGES,
  discoverRouletteAfterSubmittedMessage,
  discoverRouletteCanSend,
  discoverRouletteExhaustedCopy,
  discoverRouletteInitialEncounterState,
  discoverRouletteParseSession,
  discoverRouletteSerializeSession,
  type DiscoverRouletteEncounterState,
} from "@/lib/discover-roulette";

const SESSION_KEY_PREFIX = "station.discoverRoulette";

interface EncounterMessage {
  role: "visitor" | "persona";
  content: string;
}

export default function DiscoverRouletteEncounterPage() {
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "unavailable">("loading");
  const [persona, setPersona] = useState<PublicPersonaRouletteCard | null>(null);
  const [encounter, setEncounter] = useState<DiscoverRouletteEncounterState>(() => discoverRouletteInitialEncounterState());
  const [messages, setMessages] = useState<EncounterMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionKey = useMemo(
    () => persona?.publicSlug ? `${SESSION_KEY_PREFIX}.${persona.publicSlug}` : null,
    [persona?.publicSlug]
  );
  const remaining = Math.max(0, DISCOVER_ROULETTE_MAX_VISITOR_MESSAGES - encounter.submittedMessages);
  const canSend = discoverRouletteCanSend(encounter) && !pending;

  useEffect(() => {
    let cancelled = false;
    async function draw() {
      setStatus("loading");
      try {
        const seed = `${Date.now()}`;
        const response = await fetch(
          apiUrl(`/personas/public/roulette?limit=1&chatMode=anonymous_alpha&seed=${encodeURIComponent(seed)}`),
          { cache: "no-store" }
        );
        if (!response.ok) throw new Error("Persona roulette unavailable.");
        const data = await response.json() as { personas?: PublicPersonaRouletteCard[] };
        const selected = (data.personas ?? [])[0] ?? null;
        if (cancelled) return;
        if (!selected || selected.publicChat?.mode !== "anonymous_alpha" || !selected.publicChat.enabled) {
          setPersona(null);
          setEncounter(discoverRouletteInitialEncounterState());
          setStatus("empty");
          return;
        }
        setPersona(selected);
        setEncounter(discoverRouletteParseSession(
          window.sessionStorage.getItem(`${SESSION_KEY_PREFIX}.${selected.publicSlug}`),
          selected.publicSlug
        ));
        setStatus("ready");
      } catch {
        if (!cancelled) {
          setPersona(null);
          setEncounter(discoverRouletteInitialEncounterState());
          setStatus("unavailable");
        }
      }
    }

    void draw();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sessionKey || !persona) return;
    window.sessionStorage.setItem(sessionKey, discoverRouletteSerializeSession(encounter));
  }, [encounter, persona, sessionKey]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!persona || !message || !canSend) return;

    setPending(true);
    setError(null);
    setInput("");
    setMessages((current) => [...current, { role: "visitor", content: message }]);

    try {
      const response = await fetch(apiUrl(`/personas/public/${persona.publicSlug}/chat`), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(typeof body?.error === "string" ? body.error : "Public persona chat is temporarily unavailable.");
      }
      const data = await response.json() as PublicPersonaChatResponse;
      setMessages((current) => [...current, { role: "persona", content: data.reply.content }]);
      setEncounter((current) => discoverRouletteAfterSubmittedMessage(current));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Public persona chat is temporarily unavailable.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main style={{ minHeight: "calc(100vh - 52px)", background: "#10130f", color: "#f8fafc" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px clamp(16px, 4vw, 36px) 48px", display: "grid", gap: 18 }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "#a3e635", fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>Protected alpha</div>
            <h1 style={{ margin: "8px 0 6px", fontSize: "clamp(30px, 5vw, 48px)", lineHeight: 1.05 }}>Persona Roulette</h1>
            <p style={{ margin: 0, color: "#cbd5c0", maxWidth: 620, lineHeight: 1.55 }}>
              A public text encounter with one owner-enabled anonymous alpha persona. Messages are not saved by this page.
            </p>
          </div>
          <Link href="/discover" style={secondaryButton}>Back to Discover</Link>
        </header>

        <section style={panel}>
          {status === "loading" ? (
            <StateCopy title="Drawing a persona" body="Looking for an anonymous-eligible public persona." />
          ) : status === "empty" ? (
            <StateCopy title="No eligible encounter" body="No anonymous-enabled public persona is available right now." />
          ) : status === "unavailable" ? (
            <StateCopy title="Roulette unavailable" body="Persona Roulette could not load safely. Try Discover or sign in to explore Station." />
          ) : persona ? (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div>
                  <div style={{ color: "#a3e635", fontSize: 12, fontWeight: 800 }}>Current draw</div>
                  <h2 style={{ margin: "4px 0", fontSize: 24 }}>{persona.name}</h2>
                  {persona.shortDescription && <p style={{ margin: 0, color: "#cbd5c0", lineHeight: 1.5 }}>{persona.shortDescription}</p>}
                </div>
                <div style={{ color: "#d9f99d", fontWeight: 800 }}>{remaining} / {DISCOVER_ROULETTE_MAX_VISITOR_MESSAGES} messages left</div>
              </div>

              <div style={threadBox} aria-live="polite">
                {messages.length === 0 ? (
                  <div style={{ color: "#cbd5c0" }}>Ask one public-safe question to begin.</div>
                ) : messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} style={message.role === "visitor" ? visitorBubble : personaBubble}>
                    <strong>{message.role === "visitor" ? "You" : persona.name}</strong>
                    <p style={{ margin: "6px 0 0", whiteSpace: "pre-wrap" }}>{message.content}</p>
                  </div>
                ))}
              </div>

              {encounter.exhausted ? (
                <div style={noticeBox}>
                  <strong>Encounter complete</strong>
                  <p style={{ margin: "6px 0 0" }}>{discoverRouletteExhaustedCopy()}</p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                    <Link href="/signup" style={primaryButton}>Create your Studio</Link>
                    <Link href="/login" style={secondaryButton}>Sign in</Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={submitMessage} style={{ display: "grid", gap: 10 }}>
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.currentTarget.value)}
                    disabled={!canSend}
                    maxLength={600}
                    placeholder="Ask a short public-safe question..."
                    style={textarea}
                  />
                  {error && <div style={{ color: "#fecaca", fontSize: 13 }}>{error}</div>}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <button type="submit" disabled={!input.trim() || !canSend} style={primaryButton}>
                      {pending ? "Sending..." : "Send"}
                    </button>
                    <Link href="/signup" style={secondaryButton}>Create your own</Link>
                  </div>
                </form>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function StateCopy({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <h2 style={{ margin: 0, fontSize: 24 }}>{title}</h2>
      <p style={{ margin: 0, color: "#cbd5c0", lineHeight: 1.55 }}>{body}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
        <Link href="/discover" style={secondaryButton}>Explore Discover</Link>
        <Link href="/signup" style={primaryButton}>Create account</Link>
      </div>
    </div>
  );
}

const panel = {
  border: "1px solid #2e3a25",
  borderRadius: 8,
  background: "#171d14",
  padding: "clamp(16px, 4vw, 24px)",
} as const;
const threadBox = {
  minHeight: 260,
  border: "1px solid #2e3a25",
  borderRadius: 8,
  background: "#0f140d",
  padding: 14,
  display: "grid",
  alignContent: "start",
  gap: 10,
} as const;
const visitorBubble = {
  justifySelf: "end",
  maxWidth: "min(86%, 620px)",
  borderRadius: 8,
  background: "#2d3b22",
  padding: 12,
} as const;
const personaBubble = {
  justifySelf: "start",
  maxWidth: "min(86%, 620px)",
  borderRadius: 8,
  background: "#20271d",
  padding: 12,
} as const;
const noticeBox = {
  border: "1px solid #4d5f32",
  borderRadius: 8,
  background: "#202817",
  padding: 14,
  color: "#f8fafc",
} as const;
const textarea = {
  minHeight: 92,
  borderRadius: 8,
  border: "1px solid #3b4a2a",
  background: "#0f140d",
  color: "#f8fafc",
  padding: 12,
  resize: "vertical",
} as const;
const primaryButton = {
  border: "1px solid #a3e635",
  borderRadius: 8,
  background: "#a3e635",
  color: "#16200d",
  padding: "10px 14px",
  fontWeight: 800,
  textDecoration: "none",
  cursor: "pointer",
} as const;
const secondaryButton = {
  border: "1px solid #3b4a2a",
  borderRadius: 8,
  background: "#171d14",
  color: "#f8fafc",
  padding: "10px 14px",
  fontWeight: 800,
  textDecoration: "none",
  cursor: "pointer",
} as const;
