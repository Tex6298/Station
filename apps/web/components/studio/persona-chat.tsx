"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getSession } from "@/lib/auth";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { sendPersonaChatWithStream } from "@/lib/chat-stream";
import {
  chatErrorMetadata,
  privateProviderSetupNoticeFromChatError,
  type ChatErrorMetadata,
} from "@/lib/private-provider-setup";
import type { ArchivedChatTranscript, ContinuityCandidate, ConversationMessage } from "@station/types/persona";

interface Props {
  personaId: string;
  personaName: string;
}

interface ChatState {
  conversationId: string | null;
  conversationStatus: "active" | "archived";
  messages: ConversationMessage[];
  archive: {
    transcript: ArchivedChatTranscript;
    candidates: ContinuityCandidate[];
  } | null;
  loading: boolean;
  sending: boolean;
  archiving: boolean;
  error: ChatErrorMetadata | null;
  streamStatus: string | null;
}

export function PersonaChat({ personaId, personaName }: Props) {
  const [token, setToken]     = useState<string | null>(null);
  const [input, setInput]     = useState("");
  const [saving, setSaving]   = useState<string | null>(null); // message id being saved
  const [reviewing, setReviewing] = useState<string | null>(null);
  const bottomRef             = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<ChatState>({
    conversationId: null,
    conversationStatus: "active",
    messages: [],
    archive: null,
    loading: true,
    sending: false,
    archiving: false,
    error: null,
    streamStatus: null,
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
          const { conversation, messages, archive } = await apiGet<{
            conversation: { id: string; status?: "active" | "archived" };
            messages: ConversationMessage[];
            archive: ChatState["archive"];
          }>(
            `/conversations/${latest.id}`,
            session.access_token
          );
          setState((s) => ({
            ...s,
            conversationId: latest.id,
            conversationStatus: conversation.status ?? "active",
            messages: messages ?? [],
            archive: archive ?? null,
            loading: false,
          }));
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
    if (!content || state.sending || state.conversationStatus === "archived" || !token) return;
    setInput("");

    // Optimistic user message
    const tempId = `temp-${Date.now()}`;
    setState((s) => ({
      ...s,
      sending: true,
      error: null,
      streamStatus: "Starting chat stream...",
      messages: [...s.messages, { id: tempId, role: "user", content, createdAt: new Date().toISOString() }],
    }));

    try {
      const { conversationId, reply } = await sendPersonaChatWithStream({
        personaId,
        content,
        conversationId: state.conversationId,
        token,
        onStatus: (status) => {
          setState((s) => ({ ...s, streamStatus: status.message }));
        },
      });

      setState((s) => ({
        ...s,
        conversationId,
        conversationStatus: "active",
        sending: false,
        streamStatus: null,
        archive: null,
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
        streamStatus: null,
        error: chatErrorMetadata(e),
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
    } catch { /* silent - show toast in future */ }
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

  async function archiveChat() {
    if (!token || !state.conversationId || state.archiving || state.messages.length === 0) return;
    setState((s) => ({ ...s, archiving: true, error: null }));

    try {
      const { conversation, archive } = await apiPost<{
        conversation: { id: string; status?: "active" | "archived" };
        archive: ChatState["archive"];
      }>(
        `/conversations/${state.conversationId}/archive`,
        {},
        token
      );

      setState((s) => ({
        ...s,
        conversationStatus: conversation.status ?? "archived",
        archive,
        archiving: false,
      }));
    } catch (e) {
      setState((s) => ({
        ...s,
        archiving: false,
        error: chatErrorMetadata(e, "Could not archive this chat."),
      }));
    }
  }

  function startNewChat() {
    setInput("");
    setState((s) => ({
      ...s,
      conversationId: null,
      conversationStatus: "active",
      messages: [],
      archive: null,
      sending: false,
      streamStatus: null,
      error: null,
    }));
  }

  async function reviewCandidate(
    candidateId: string,
    action: "accept" | "reject",
    edits?: { title: string; content: string }
  ) {
    if (!token) return;
    setReviewing(candidateId);
    try {
      const { candidate } = await apiPatch<{ candidate: ContinuityCandidate }>(
        `/conversations/candidates/${candidateId}`,
        { action, ...edits },
        token
      );

      setState((s) => ({
        ...s,
        archive: s.archive
          ? {
              ...s.archive,
              candidates: s.archive.candidates.map((item) => item.id === candidate.id ? candidate : item),
            }
          : null,
      }));
    } catch (e) {
      setState((s) => ({
        ...s,
        error: chatErrorMetadata(e, "Could not review candidate."),
      }));
    } finally {
      setReviewing(null);
    }
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
        <span style={{ color: "#555" }}>Loading conversation...</span>
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {state.conversationId && (
            <span style={{ fontSize: "0.7rem", color: "#7b8498" }}>
              {state.messages.filter((m) => m.role !== "system").length} messages
            </span>
          )}
          {state.conversationStatus === "archived" ? (
            <>
              <span style={{ fontSize: "0.7rem", color: "#9fb7ff" }}>Archived</span>
              <button
                onClick={startNewChat}
                style={{
                  padding: "0.25rem 0.65rem",
                  fontSize: "0.72rem",
                  background: "#20283a",
                  border: "1px solid #313c55",
                  borderRadius: 6,
                  color: "#d7def2",
                  cursor: "pointer",
                }}
              >
                New chat
              </button>
            </>
          ) : state.conversationId && (
            <button
              onClick={archiveChat}
              disabled={state.archiving || state.sending || state.messages.length === 0}
              style={{
                padding: "0.25rem 0.65rem",
                fontSize: "0.72rem",
                background: "transparent",
                border: "1px solid #313c55",
                borderRadius: 6,
                color: "#d7def2",
                cursor: state.archiving ? "default" : "pointer",
              }}
            >
              {state.archiving ? "Archiving..." : "Archive"}
            </button>
          )}
        </div>
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
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Signal</div>
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
                  color: msg.role === "user" ? "#f4f7ff" : "#e7edf8",
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
                    {saving === msg.id ? "..." : "Save to memory"}
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
                    {saving === msg.id ? "..." : "Promote to canon"}
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
            color: "#cbd5e1",
            fontSize: "0.85rem",
          }}>
            <span className="typing-dots">{state.streamStatus ?? `${personaName} is responding...`}</span>
          </div>
        )}

        {state.error && (
          <div style={{
            padding: "0.6rem 0.9rem",
            background: "#2d1515",
            border: "1px solid #7d2e2e",
            borderRadius: 8,
            color: "#f2b8b5",
            fontSize: "0.8rem",
          }}>
            <ChatErrorCallout error={state.error} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {state.archive && (
        <div style={{
          borderTop: "1px solid #1e2535",
          padding: "0.9rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          background: "#111722",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.78rem", color: "#9fb7ff", fontWeight: 700 }}>
                Continuity candidates
              </div>
              <div style={{ fontSize: "0.72rem", color: "#7b8498" }}>
                {state.archive.transcript.messageCount} archived messages
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {state.archive.candidates.map((candidate) => (
              <CandidateReviewCard
                key={candidate.id}
                candidate={candidate}
                busy={reviewing === candidate.id}
                onReview={reviewCandidate}
              />
            ))}
          </div>
        </div>
      )}

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
          placeholder={state.conversationStatus === "archived" ? "Start a new chat to continue." : `Speak to ${personaName}... (Enter to send, Shift+Enter for newline)`}
          disabled={state.sending || state.conversationStatus === "archived"}
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
          disabled={state.sending || state.conversationStatus === "archived" || !input.trim()}
          className="button primary"
          style={{ height: 44, whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {state.conversationStatus === "archived" ? "Archived" : state.sending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

function ChatErrorCallout({ error }: { error: ChatErrorMetadata }) {
  const setupNotice = privateProviderSetupNoticeFromChatError(error);
  if (!setupNotice) return <>{error.message}</>;

  return (
    <div style={providerSetupStack}>
      <div style={{ color: "#ffe0de", fontWeight: 800 }}>{setupNotice.title}</div>
      <p style={providerSetupCopy}>{setupNotice.body}</p>
      <Link href={setupNotice.href} style={providerSetupLink}>
        {setupNotice.actionLabel}
      </Link>
    </div>
  );
}

function CandidateReviewCard({
  candidate,
  busy,
  onReview,
}: {
  candidate: ContinuityCandidate;
  busy: boolean;
  onReview: (candidateId: string, action: "accept" | "reject", edits?: { title: string; content: string }) => void;
}) {
  const [title, setTitle] = useState(candidate.title ?? "");
  const [content, setContent] = useState(candidate.content);
  const pending = candidate.status === "pending";

  return (
    <div style={{
      border: "1px solid #253049",
      borderRadius: 8,
      padding: "0.75rem",
      background: "#151c2a",
      display: "grid",
      gap: "0.6rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "center" }}>
        <span style={{ fontSize: "0.72rem", color: candidate.candidateType === "canon" ? "#f4c56d" : "#9fb7ff", textTransform: "uppercase", letterSpacing: 0 }}>
          {candidate.candidateType}
        </span>
        <span style={{ fontSize: "0.7rem", color: pending ? "#7b8498" : "#a7b0c4" }}>
          {candidate.status}
        </span>
      </div>

      <input
        className="input"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={!pending || busy}
        style={{ margin: 0, fontSize: "0.82rem" }}
      />

      <textarea
        className="textarea"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        disabled={!pending || busy}
        style={{ minHeight: 92, margin: 0, fontSize: "0.82rem", resize: "vertical" }}
      />

      {candidate.rationale && (
        <div style={{ fontSize: "0.72rem", color: "#7b8498", lineHeight: 1.5 }}>
          {candidate.rationale}
        </div>
      )}

      {pending && (
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            onClick={() => onReview(candidate.id, "reject")}
            disabled={busy}
            style={{
              padding: "0.3rem 0.7rem",
              fontSize: "0.72rem",
              background: "transparent",
              border: "1px solid #3a2631",
              borderRadius: 6,
              color: "#e0a0aa",
              cursor: busy ? "default" : "pointer",
            }}
          >
            Reject
          </button>
          <button
            onClick={() => onReview(candidate.id, "accept", { title, content })}
            disabled={busy || !content.trim()}
            style={{
              padding: "0.3rem 0.7rem",
              fontSize: "0.72rem",
              background: "#24406f",
              border: "1px solid #355a99",
              borderRadius: 6,
              color: "#eef4ff",
              cursor: busy ? "default" : "pointer",
            }}
          >
            {busy ? "Saving..." : "Accept"}
          </button>
        </div>
      )}
    </div>
  );
}

const providerSetupStack = {
  display: "grid",
  gap: 8,
};

const providerSetupCopy = {
  margin: 0,
  color: "#f2b8b5",
  lineHeight: 1.5,
};

const providerSetupLink = {
  justifySelf: "start",
  border: "1px solid #b85d5d",
  borderRadius: 8,
  color: "#ffffff",
  background: "#6f2424",
  padding: "0.45rem 0.65rem",
  fontSize: "0.78rem",
  fontWeight: 800,
  textDecoration: "none",
};
