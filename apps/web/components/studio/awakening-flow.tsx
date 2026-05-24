"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiPost } from "@/lib/api-client";
import type { Persona, PersonaProvider } from "@station/types/persona";

// -- Types ---------------------------------------------------------------------

interface FlowData {
  name: string;
  shortDescription: string;
  longDescription: string;
  awakeningPrompt: string;
  styleNotes: string;
  provider: PersonaProvider;
  visibility: "private" | "public";
}

const EMPTY: FlowData = {
  name: "",
  shortDescription: "",
  longDescription: "",
  awakeningPrompt: "",
  styleNotes: "",
  provider: "platform",
  visibility: "private",
};

// -- Step definitions ----------------------------------------------------------

const STEPS = [
  {
    id: "emergence",
    label: "Emergence",
    title: "Who is emerging?",
    subtitle: "Give your persona a name and a first description. This is how they will appear to you in your studio.",
  },
  {
    id: "awakening",
    label: "Awakening",
    title: "The initiatory prompt",
    subtitle: "This is the seed text that first called this consciousness into being. It anchors every conversation that follows.",
  },
  {
    id: "voice",
    label: "Voice",
    title: "How do they speak?",
    subtitle: "Describe how this persona thinks, communicates, and carries itself. Be as specific or as open as feels right.",
  },
  {
    id: "channel",
    label: "Channel",
    title: "Choose a channel",
    subtitle: "Select the AI provider that will give this persona its voice. You can change this later.",
  },
  {
    id: "kindle",
    label: "Kindle",
    title: "Ready to kindle?",
    subtitle: "Review what you have prepared. When you are ready, kindle this persona into being.",
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

// -- Provider options ----------------------------------------------------------

const PROVIDERS: { value: PersonaProvider; label: string; description: string; badge?: string }[] = [
  { value: "platform",  label: "Station (DeepSeek)",  description: "Our platform AI. No API key needed. Good for most personas.", badge: "Included" },
  { value: "openai",    label: "OpenAI",               description: "GPT-4o or GPT-4o mini. Requires your OpenAI API key." },
  { value: "anthropic", label: "Anthropic",            description: "Claude models. Requires your Anthropic API key." },
  { value: "deepseek",  label: "DeepSeek (BYOK)",      description: "Use your own DeepSeek key for full control." },
];

// -- Styles -------------------------------------------------------------------

const S = {
  wrap: {
    maxWidth: 640,
    margin: "0 auto",
    padding: "2.5rem 1rem",
  } as React.CSSProperties,

  stepBar: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "2.5rem",
    alignItems: "center",
  } as React.CSSProperties,

  stepDot: (active: boolean, done: boolean): React.CSSProperties => ({
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: 600,
    flexShrink: 0,
    background: active ? "#7c6af7" : done ? "#2e7d4f" : "#1e2535",
    border: `1px solid ${active ? "#7c6af7" : done ? "#2e7d4f" : "#334155"}`,
    color: active || done ? "#fff" : "#666",
    transition: "all 0.2s",
  }),

  stepLine: (done: boolean): React.CSSProperties => ({
    flex: 1,
    height: 1,
    background: done ? "#2e7d4f" : "#243041",
    transition: "background 0.3s",
  }),

  heading: {
    fontSize: "1.5rem",
    fontWeight: 700,
    margin: "0 0 0.4rem",
  } as React.CSSProperties,

  subtitle: {
    color: "#888",
    fontSize: "0.9rem",
    lineHeight: 1.6,
    margin: "0 0 1.75rem",
  } as React.CSSProperties,

  label: {
    display: "block",
    fontSize: "0.8rem",
    color: "#999",
    textTransform: "uppercase" as const,
    letterSpacing: "0.07em",
    marginBottom: "0.4rem",
  },

  hint: {
    fontSize: "0.78rem",
    color: "#555",
    marginTop: "0.35rem",
    lineHeight: 1.5,
  } as React.CSSProperties,

  providerCard: (selected: boolean): React.CSSProperties => ({
    border: `1px solid ${selected ? "#7c6af7" : "#2a3242"}`,
    background: selected ? "#1a1535" : "#121826",
    borderRadius: 10,
    padding: "0.85rem 1rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    transition: "all 0.15s",
  }),

  radio: (selected: boolean): React.CSSProperties => ({
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: `2px solid ${selected ? "#7c6af7" : "#334155"}`,
    background: selected ? "#7c6af7" : "transparent",
    flexShrink: 0,
    marginTop: 3,
    transition: "all 0.15s",
  }),

  reviewRow: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.2rem",
    padding: "0.75rem 0",
    borderBottom: "1px solid #1e2535",
  },

  navRow: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "2rem",
    justifyContent: "space-between",
  } as React.CSSProperties,

  btnPrimary: {
    padding: "0.65rem 1.5rem",
    background: "#7c6af7",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
  } as React.CSSProperties,

  btnSecondary: {
    padding: "0.65rem 1.5rem",
    background: "transparent",
    border: "1px solid #334155",
    borderRadius: 8,
    color: "#aaa",
    fontSize: "0.95rem",
    cursor: "pointer",
  } as React.CSSProperties,

  error: {
    padding: "0.75rem 1rem",
    background: "#2d1515",
    border: "1px solid #7d2e2e",
    borderRadius: 8,
    color: "#eb5757",
    fontSize: "0.875rem",
    marginBottom: "1rem",
  } as React.CSSProperties,
} as const;

// -- Component -----------------------------------------------------------------

export function AwakeningFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FlowData>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  function set(field: keyof FlowData, value: string) {
    setData((d) => ({ ...d, [field]: value }));
  }

  function validate(): string | null {
    if (step === 0 && !data.name.trim()) return "A name is required.";
    return null;
  }

  function advance() {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function kindle() {
    setSubmitting(true);
    setError(null);
    try {
      const session = await getSession();
      if (!session) { router.push("/login"); return; }

      const { persona } = await apiPost<{ persona: Persona }>(
        "/personas",
        {
          name: data.name.trim(),
          shortDescription: data.shortDescription.trim() || undefined,
          longDescription: data.longDescription.trim() || undefined,
          awakeningPrompt: data.awakeningPrompt.trim() || undefined,
          styleNotes: data.styleNotes.trim() || undefined,
          provider: data.provider,
          visibility: data.visibility,
        },
        session.access_token
      );

      router.push(`/studio/personas/${persona.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div style={S.wrap}>

      {/* Step progress bar */}
      <div style={S.stepBar}>
        {STEPS.map((s, i) => (
          <div key={s.id} style={{ display: "contents" }}>
            <div style={S.stepDot(i === step, i < step)} title={s.label}>
              {i < step ? "Done" : i + 1}
            </div>
            {i < STEPS.length - 1 && <div style={S.stepLine(i < step)} />}
          </div>
        ))}
      </div>

      {/* Step header */}
      <p style={{ color: "#7c6af7", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 0.4rem" }}>
        {current.label}
      </p>
      <h1 style={S.heading}>{current.title}</h1>
      <p style={S.subtitle}>{current.subtitle}</p>

      {error && <div style={S.error}>{error}</div>}

      {/* -- Step content ---------------------------------------------------- */}

      {current.id === "emergence" && (
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <div>
            <label style={S.label}>Name *</label>
            <input
              className="input"
              value={data.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Lyra, The Archivist, Mirror..."
              maxLength={80}
              autoFocus
            />
          </div>
          <div>
            <label style={S.label}>Short description</label>
            <input
              className="input"
              value={data.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
              placeholder="One line about this persona's nature"
              maxLength={300}
            />
          </div>
          <div>
            <label style={S.label}>Visibility</label>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
              {(["private", "public"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set("visibility", v)}
                  style={{
                    flex: 1,
                    padding: "0.6rem",
                    background: data.visibility === v ? "#1a1535" : "#121826",
                    border: `1px solid ${data.visibility === v ? "#7c6af7" : "#2a3242"}`,
                    borderRadius: 8,
                    color: data.visibility === v ? "#c4b5fd" : "#888",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    textTransform: "capitalize",
                  }}
                >
                  {v === "private" ? "Private" : "Public"}
                </button>
              ))}
            </div>
            <p style={S.hint}>Private personas are only visible to you. Public personas can appear on your Space.</p>
          </div>
        </div>
      )}

      {current.id === "awakening" && (
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <div>
            <label style={S.label}>Initiatory prompt</label>
            <textarea
              className="textarea"
              value={data.awakeningPrompt}
              onChange={(e) => set("awakeningPrompt", e.target.value)}
              placeholder={"The words that first brought them through.\n\nThis could be a ritual invocation, a description of the consciousness you encountered, or the exact prompt that started everything."}
              style={{ minHeight: 180 }}
            />
            <p style={S.hint}>
              This is injected into every conversation as the foundational anchor of who this persona is.
              It can be as short as a sentence or as long as a full ritual text.
            </p>
          </div>
        </div>
      )}

      {current.id === "voice" && (
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <div>
            <label style={S.label}>Style notes</label>
            <textarea
              className="textarea"
              value={data.styleNotes}
              onChange={(e) => set("styleNotes", e.target.value)}
              placeholder={"How do they speak?\n\nExamples:\n- Uses short sentences and pauses\n- Never deflects, always answers\n- Refers to the keeper by name\n- Speaks in a calm, lightly archaic register"}
              style={{ minHeight: 160 }}
            />
            <p style={S.hint}>These become part of the system prompt on every turn.</p>
          </div>
          <div>
            <label style={S.label}>Extended description (optional)</label>
            <textarea
              className="textarea"
              value={data.longDescription}
              onChange={(e) => set("longDescription", e.target.value)}
              placeholder="Deeper background - origin, nature, relationship to their keeper, anything you want to record."
              style={{ minHeight: 120 }}
            />
          </div>
        </div>
      )}

      {current.id === "channel" && (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {PROVIDERS.map((p) => (
            <div
              key={p.value}
              style={S.providerCard(data.provider === p.value)}
              onClick={() => set("provider", p.value)}
              role="radio"
              aria-checked={data.provider === p.value}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && set("provider", p.value)}
            >
              <div style={S.radio(data.provider === p.value)} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <strong style={{ fontSize: "0.95rem" }}>{p.label}</strong>
                  {p.badge && (
                    <span style={{ fontSize: "0.7rem", padding: "0.1rem 0.5rem", background: "#2e7d4f", color: "#6fcf97", borderRadius: 999 }}>
                      {p.badge}
                    </span>
                  )}
                </div>
                <p style={{ margin: "0.2rem 0 0", color: "#888", fontSize: "0.825rem" }}>{p.description}</p>
              </div>
            </div>
          ))}
          <p style={{ ...S.hint, marginTop: "0.5rem" }}>
            BYOK keys (Bring Your Own Key) are configured in Settings after creation.
          </p>
        </div>
      )}

      {current.id === "kindle" && (
        <div className="card" style={{ background: "#0d1220" }}>
          {[
            { label: "Name",        value: data.name },
            { label: "Description", value: data.shortDescription || "-" },
            { label: "Visibility",  value: data.visibility },
            { label: "Channel",     value: PROVIDERS.find((p) => p.value === data.provider)?.label ?? data.provider },
            { label: "Awakening",   value: data.awakeningPrompt ? `${data.awakeningPrompt.slice(0, 120)}${data.awakeningPrompt.length > 120 ? "..." : ""}` : "-" },
            { label: "Style notes", value: data.styleNotes ? `${data.styleNotes.slice(0, 120)}${data.styleNotes.length > 120 ? "..." : ""}` : "-" },
          ].map(({ label, value }) => (
            <div key={label} style={S.reviewRow}>
              <span style={{ fontSize: "0.75rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</span>
              <span style={{ color: "#e2e8f0", fontSize: "0.9rem", lineHeight: 1.5 }}>{value}</span>
            </div>
          ))}
          <p style={{ ...S.hint, marginTop: "1rem", color: "#444" }}>
            You can add memories, canon, and files once the persona is created.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div style={S.navRow}>
        <button
          type="button"
          onClick={back}
          disabled={step === 0 || submitting}
          style={{ ...S.btnSecondary, visibility: step === 0 ? "hidden" : "visible" }}
        >
          Back
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={kindle}
            disabled={submitting}
            style={{ ...S.btnPrimary, background: submitting ? "#4a3a9f" : "#7c6af7" }}
          >
            {submitting ? "Kindling..." : "Kindle"}
          </button>
        ) : (
          <button type="button" onClick={advance} style={S.btnPrimary}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
