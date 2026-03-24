"use client";

import { useEffect, useRef, useState } from "react";
import { getSession } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api-client";
import type { ConversationMessage } from "@station/types/persona";

interface Props {
  personaId: string;
  personaName: string;
}

interface ChatState {
  conversationId: string | null;
  messages: ConversationMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;
}

export function PersonaChat({ personaId, personaName }: Props) {
  const [token, setToken]     = useState<string | null>(null);
  const [input, setInput]     = useState("");
  const [saving, setSaving]   = useState<string | null>(null); // message id being saved
  const bottomRef             = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<ChatState>({
    conversationId: null,
    messages: [],
    loading: true,
    sending: false,
    error: null,
  });

  // Load session + most recent conversation on mount
  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) { setState((s) => ({ ...s, loading: false })); return; }
      setToken(session.access_token);
      try {
        const { conversations } = await apiGet<{ conversations: Array<{ id: string }> }>(
          `/conversations/persona/${personaId}`,
          session.access_token
        );
        if (conversations.length > 0) {
          const latest = conversations[0];
          const { messages } = await apiGet<{ messages: ConversationMessage[] }>(
            `/conversations/${latest.id}`,
            session.access_token
          );
          setState((s) => ({ ...s, conversationId: latest.id, messages: messages ?? [], loading: false }));
        } else {
          setState((s) => ({ ...s, loading: false }));
        }
      } catch {
        setState((s) => ({ ...s, loading: false }));
      }
    });
  }, [personaId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  async function send() {
    const content = input.trim();
    if (!content || state.sending || !token) return;
    setInput("");

    // Optimistic user message
    const tempId = `temp-${Date.now()}`;
    setState((s) => ({
      ...s,
      sending: true,
      error: null,
      messages: [...s.messages, { id: tempId, role: "user", content, createdAt: new Date().toISOString() }],
    }));

    try {
      const { conversationId, reply } = await apiPost<{
        conversationId: string;
        reply: ConversationMessage;
      }>(
        `/conversations/persona/${personaId}/chat`,
        { content, conversationId: state.conversationId ?? undefined },
        token
      );

      setState((s) => ({
        ...s,
        conversationId,
        sending: false,
        messages: [
          ...s.messages.filter((m) => m.id !== tempId),
          { id: tempId, role: "user" as const, content, createdAt: new Date().toISOString() },
          reply,
        ],
      }));
    } catch (e) {
      setState((s) => ({
        ...s,
        sending: false,
        error: e instanceof Error ? e.message : "Message failed.",
        messages: s.messages.filter((m) => m.id !== tempId),
      }));
      setInput(content); // restore input
    }
  }

  async function saveAsMemory(messageId: string) {
    if (!token || !state.conversationId) return;
    setSaving(messageId);
    try {
      await apiPost(
        `/conversations/${state.conversationId}/save-memory`,
        { messageId },
        token
      );
    } catch { /* silent — show toast in future */ }
    finally { setSaving(null); }
  }

  async function saveAsCanon(messageId: string) {
    if (!token || !state.conversationId) return;
    setSaving(messageId);
    try {
      await apiPost(
        `/conversations/${state.conversationId}/save-canon`,
        { messageId },
        token
      );
    } catch { /* silent */ }
    finally { setSaving(null); }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  if (state.loading) {
    return (
      <div className="card" style={{ minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#555" }}>Loading conversation…</span>
      </div>
    );
  }

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 0, padding: 0, overflow: "hidden" }}>

      {/* Header */}
      <div style={{
        padding: "0.75rem 1rem",
        borderBottom: "1px solid #1e2535",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
          Talking with {personaName}
        </span>
        {state.conversationId && (
          <span style={{ fontSize: "0.7rem", color: "#444" }}>
            {state.messages.filter((m) => m.role !== "system").length} messages
          </span>
        )}
      </div>

      {/* Message list */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        padding: "1rem",
        minHeight: 340,
        maxHeight: 520,
        overflowY: "auto",
      }}>
        {state.messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#444", marginTop: "4rem", fontSize: "0.9rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>◎</div>
            Begin speaking to {personaName}.
          </div>
        )}

        {state.messages
          .filter((m) => m.role !== "system")
          .map((msg) => (
            <div key={msg.id}>
              <div
                style={{
                  borderRadius: 12,
                  padding: "0.75rem 1rem",
                  background: msg.role === "user" ? "#1d3a7a" : "#1a1f2e",
                  border: `1px solid ${msg.role === "user" ? "#2e4f9f" : "#252d3e"}`,
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  marginLeft: msg.role === "user" ? "auto" : 0,
                  whiteSpace: "pre-wrap",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                }}
              >
                {msg.content}
              </div>

              {/* Save buttons for assistant messages */}
              {msg.role === "assistant" && state.conversationId && (
                <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.3rem" }}>
                  <button
                    onClick={() => saveAsMemory(msg.id)}
                    disabled={saving === msg.id}
                    style={{
                      padding: "0.2rem 0.6rem",
                      fontSize: "0.7rem",
                      background: "transparent",
                      border: "1px solid #2a3242",
                      borderRadius: 6,
                      color: "#555",
                      cursor: "pointer",
                    }}
                    title="Save to archive as memory"
                  >
                    {saving === msg.id ? "…" : "Save to memory"}
                  </button>
                  <button
                    onClick={() => saveAsCanon(msg.id)}
                    disabled={saving === msg.id}
                    style={{
                      padding: "0.2rem 0.6rem",
                      fontSize: "0.7rem",
                      background: "transparent",
                      border: "1px solid #2a3242",
                      borderRadius: 6,
                      color: "#555",
                      cursor: "pointer",
                    }}
                    title="Promote to canon (always injected)"
                  >
                    {saving === msg.id ? "…" : "Promote to canon"}
                  </button>
                </div>
              )}
            </div>
          ))}

        {state.sending && (
          <div style={{
            borderRadius: 12,
            padding: "0.75rem 1rem",
            background: "#1a1f2e",
            border: "1px solid #252d3e",
            maxWidth: "85%",
            color: "#444",
            fontSize: "0.85rem",
          }}>
            <span className="typing-dots">{personaName} is responding…</span>
          </div>
        )}

        {state.error && (
          <div style={{
            padding: "0.6rem 0.9rem",
            background: "#2d1515",
            border: "1px solid #7d2e2e",
            borderRadius: 8,
            color: "#eb5757",
            fontSize: "0.8rem",
          }}>
            {state.error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        borderTop: "1px solid #1e2535",
        padding: "0.75rem",
        display: "flex",
        gap: "0.6rem",
        alignItems: "flex-end",
      }}>
        <textarea
          className="textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Speak to ${personaName}… (Enter to send, Shift+Enter for newline)`}
          disabled={state.sending}
          style={{
            flex: 1,
            minHeight: 60,
            maxHeight: 160,
            resize: "vertical",
            margin: 0,
          }}
        />
        <button
          onClick={send}
          disabled={state.sending || !input.trim()}
          className="button primary"
          style={{ height: 44, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {state.sending ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
