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
  const [token, setToken] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

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

  function focusComposerOnly() {
    composerRef.current?.focus();
  }

  function prefillThreadSummary() {
    setInput(returnToThreadSummaryRequest(personaName));
    composerRef.current?.focus();
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
      <div className="card studio-persona-chat studio-persona-chat-loading" aria-busy="true">
        <span>Opening private companion workspace...</span>
      </div>
    );
  }

  const visibleMessages = state.messages.filter((m) => m.role !== "system");
  const showReturnThreadCard =
    !state.loading &&
    state.conversationStatus === "active" &&
    Boolean(state.conversationId) &&
    visibleMessages.length > 0 &&
    !state.sending;
  const chatStateLabel = state.conversationStatus === "archived"
    ? "Archived"
    : state.conversationId
      ? "Active"
      : "New";

  return (
    <div className="card studio-persona-chat">
      <div className="studio-persona-chat-header">
        <div className="studio-persona-chat-heading">
          <span className="studio-persona-chat-kicker">Companion workspace</span>
          <strong>Talk with {personaName}</strong>
        </div>
        <div className="studio-persona-chat-header-actions">
          <span className={`studio-persona-chat-state-pill studio-persona-chat-state-${chatStateLabel.toLowerCase()}`}>
            {chatStateLabel}
          </span>
          {state.conversationId && (
            <span className="studio-persona-chat-count">
              {visibleMessages.length} messages
            </span>
          )}
          {state.conversationStatus === "archived" ? (
            <button onClick={startNewChat} className="studio-persona-chat-button studio-persona-chat-button-secondary">
              New chat
            </button>
          ) : state.conversationId && (
            <button
              onClick={archiveChat}
              disabled={state.archiving || state.sending || state.messages.length === 0}
              className="studio-persona-chat-button studio-persona-chat-button-secondary"
            >
              {state.archiving ? "Archiving..." : "Archive"}
            </button>
          )}
        </div>
      </div>

      {showReturnThreadCard && (
        <div className="studio-persona-chat-return" aria-label="Return to active thread">
          <div className="studio-persona-chat-return-text">
            <span>Pick up where you left off</span>
            <p>Return to the live thread with {personaName}, ask for an owner-editable recap, or begin again.</p>
          </div>
          <div className="studio-persona-chat-return-actions">
            <button onClick={focusComposerOnly} className="studio-persona-chat-button studio-persona-chat-button-primary">
              Pick up where you left off
            </button>
            <button onClick={prefillThreadSummary} className="studio-persona-chat-button studio-persona-chat-button-secondary">
              Ask for recap
            </button>
            <button onClick={startNewChat} className="studio-persona-chat-button studio-persona-chat-button-danger">
              Start fresh
            </button>
          </div>
        </div>
      )}

      <div className="studio-persona-chat-thread" aria-live={state.sending ? "polite" : "off"}>
        {visibleMessages.length === 0 && (
          <div className="studio-persona-chat-empty">
            <strong>Start with {personaName}</strong>
            <span>Share what you want to work through, remember, or shape next.</span>
          </div>
        )}

        {visibleMessages.map((msg) => (
          <div
            key={msg.id}
            className={`studio-persona-chat-message-row studio-persona-chat-message-row-${msg.role}`}
          >
            <div className={`studio-persona-chat-bubble studio-persona-chat-bubble-${msg.role}`}>
              {msg.content}
            </div>

            {msg.role === "assistant" && state.conversationId && (
              <div className="studio-persona-chat-message-actions" aria-label="Assistant message actions">
                <button
                  onClick={() => saveAsMemory(msg.id)}
                  disabled={saving === msg.id}
                  className="studio-persona-chat-button studio-persona-chat-button-quiet"
                  title="Save to archive as memory"
                >
                  {saving === msg.id ? "Saving..." : "Save to memory"}
                </button>
                <button
                  onClick={() => saveAsCanon(msg.id)}
                  disabled={saving === msg.id}
                  className="studio-persona-chat-button studio-persona-chat-button-quiet"
                  title="Promote to canon (always injected)"
                >
                  {saving === msg.id ? "Saving..." : "Promote to canon"}
                </button>
              </div>
            )}
          </div>
        ))}

        {state.sending && (
          <div className="studio-persona-chat-message-row studio-persona-chat-message-row-assistant">
            <div className="studio-persona-chat-bubble studio-persona-chat-bubble-assistant studio-persona-chat-bubble-pending">
              <span className="typing-dots">{state.streamStatus ?? `${personaName} is responding...`}</span>
            </div>
          </div>
        )}

        {state.error && (
          <div className="studio-persona-chat-error" role="status">
            <ChatErrorCallout error={state.error} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {state.archive && (
        <div className="studio-persona-chat-archive">
          <div className="studio-persona-chat-archive-header">
            <div>
              <span>Continuity candidates</span>
              <p>{state.archive.transcript.messageCount} archived messages</p>
            </div>
          </div>
          <div className="studio-persona-chat-candidate-list">
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

      <div className="studio-persona-chat-composer">
        <textarea
          ref={composerRef}
          className="textarea studio-persona-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={state.conversationStatus === "archived" ? "Start a new chat to continue." : `Write privately to ${personaName}... (Enter to send, Shift+Enter for newline)`}
          disabled={state.sending || state.conversationStatus === "archived"}
        />
        <button
          onClick={send}
          disabled={state.sending || state.conversationStatus === "archived" || !input.trim()}
          className="button primary studio-persona-chat-send"
        >
          {state.conversationStatus === "archived" ? "Archived" : state.sending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

function returnToThreadSummaryRequest(personaName: string) {
  return `Summarize this thread with ${personaName} in a short owner-editable recap. Include the decisions, open questions, and what we should continue next.`;
}

function ChatErrorCallout({ error }: { error: ChatErrorMetadata }) {
  const setupNotice = privateProviderSetupNoticeFromChatError(error);
  if (!setupNotice) return <>{error.message}</>;

  return (
    <div className="studio-persona-chat-provider-setup">
      <strong>{setupNotice.title}</strong>
      <p>{setupNotice.body}</p>
      <Link href={setupNotice.href} className="studio-persona-chat-provider-link">
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
    <div className="studio-persona-chat-candidate">
      <div className="studio-persona-chat-candidate-meta">
        <span className={`studio-persona-chat-candidate-type studio-persona-chat-candidate-type-${candidate.candidateType}`}>
          {candidate.candidateType}
        </span>
        <span className="studio-persona-chat-candidate-status">{candidate.status}</span>
      </div>

      <input
        className="input studio-persona-chat-candidate-input"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={!pending || busy}
      />

      <textarea
        className="textarea studio-persona-chat-candidate-textarea"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        disabled={!pending || busy}
      />

      {candidate.rationale && (
        <div className="studio-persona-chat-candidate-rationale">
          {candidate.rationale}
        </div>
      )}

      {pending && (
        <div className="studio-persona-chat-candidate-actions">
          <button
            onClick={() => onReview(candidate.id, "reject")}
            disabled={busy}
            className="studio-persona-chat-button studio-persona-chat-button-danger"
          >
            Reject
          </button>
          <button
            onClick={() => onReview(candidate.id, "accept", { title, content })}
            disabled={busy || !content.trim()}
            className="studio-persona-chat-button studio-persona-chat-button-primary"
          >
            {busy ? "Saving..." : "Accept"}
          </button>
        </div>
      )}
    </div>
  );
}
