"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getSession } from "@/lib/auth";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { sendPersonaChatWithStream } from "@/lib/chat-stream";
import {
  chatErrorMetadata,
  privateProviderSetupNoticeFromChatError,
  type ChatErrorMetadata,
} from "@/lib/private-provider-setup";
import {
  personaConversationBelongsToPersona,
  personaConversationTitle,
  type PersonaConversationSummary,
} from "@/lib/persona-conversations";
import type { ArchivedChatTranscript, ContinuityCandidate, ConversationMessage } from "@station/types/persona";

interface Props {
  personaId: string;
  personaName: string;
  selectedConversationId: string | null;
  onStartNewChat: () => void;
  onConversationCreated: (conversationId: string) => void;
  onConversationArchived: () => void;
}

interface ChatState {
  conversationId: string | null;
  conversationTitle: string | null;
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

function emptyChatState(loading: boolean): ChatState {
  return {
    conversationId: null,
    conversationTitle: null,
    conversationStatus: "active",
    messages: [],
    archive: null,
    loading,
    sending: false,
    archiving: false,
    error: null,
    streamStatus: null,
  };
}

export function PersonaChat({
  personaId,
  personaName,
  selectedConversationId,
  onStartNewChat,
  onConversationCreated,
  onConversationArchived,
}: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const selectionGenerationRef = useRef(0);
  const selectionKeyRef = useRef(`${personaId}:${selectedConversationId ?? "new"}`);

  const [state, setState] = useState<ChatState>(() => emptyChatState(true));

  useLayoutEffect(() => {
    const nextKey = `${personaId}:${selectedConversationId ?? "new"}`;
    if (selectionKeyRef.current !== nextKey) {
      selectionKeyRef.current = nextKey;
      selectionGenerationRef.current += 1;
    }
  }, [personaId, selectedConversationId]);

  // The route owns thread selection. Loading an explicit thread never silently
  // falls back to a different conversation.
  useEffect(() => {
    let cancelled = false;
    const requestGeneration = selectionGenerationRef.current;
    setInput("");
    setToken(null);
    setSaving(null);
    setReviewing(null);
    setState(emptyChatState(true));

    getSession().then(async (session) => {
      if (cancelled || selectionGenerationRef.current !== requestGeneration) return;
      if (!session) {
        setState(emptyChatState(false));
        return;
      }
      setToken(session.access_token);

      if (!selectedConversationId) {
        setState(emptyChatState(false));
        return;
      }

      try {
        const { conversation, messages, archive } = await apiGet<{
          conversation: PersonaConversationSummary;
          messages: ConversationMessage[];
          archive: ChatState["archive"];
        }>(
          `/conversations/${encodeURIComponent(selectedConversationId)}?personaId=${encodeURIComponent(personaId)}`,
          session.access_token,
        );

        if (!personaConversationBelongsToPersona(conversation, personaId)) {
          throw new Error("This conversation is not available in the selected persona workspace.");
        }

        if (!cancelled && selectionGenerationRef.current === requestGeneration) {
          setState({
            ...emptyChatState(false),
            conversationId: conversation.id,
            conversationTitle: personaConversationTitle(conversation),
            conversationStatus: conversation.status ?? "active",
            messages: messages ?? [],
            archive: archive ?? null,
          });
        }
      } catch (error) {
        if (!cancelled && selectionGenerationRef.current === requestGeneration) {
          setState({
            ...emptyChatState(false),
            error: chatErrorMetadata(error, "Could not open this conversation."),
          });
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [personaId, selectedConversationId]);

  // Keep chat auto-scroll inside the thread so loading an existing conversation does not move the page.
  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;

    thread.scrollTo({
      top: thread.scrollHeight,
      behavior: state.sending ? "smooth" : "auto",
    });
  }, [state.messages, state.sending]);

  async function send() {
    const content = input.trim();
    if (!content || state.sending || state.conversationStatus === "archived" || !token) return;
    const requestGeneration = selectionGenerationRef.current;
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
      const creatingConversation = state.conversationId === null;
      const { conversationId, reply } = await sendPersonaChatWithStream({
        personaId,
        content,
        conversationId: state.conversationId,
        token,
        onStatus: (status) => {
          if (selectionGenerationRef.current !== requestGeneration) return;
          setState((s) => ({ ...s, streamStatus: status.message }));
        },
      });

      if (selectionGenerationRef.current !== requestGeneration) return;

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
      if (creatingConversation) onConversationCreated(conversationId);
    } catch (e) {
      if (selectionGenerationRef.current !== requestGeneration) return;
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
    const requestGeneration = selectionGenerationRef.current;
    setSaving(messageId);
    try {
      await apiPost(
        `/conversations/${state.conversationId}/save-memory`,
        { messageId },
        token
      );
    } catch { /* silent - show toast in future */ }
    finally {
      if (selectionGenerationRef.current === requestGeneration) setSaving(null);
    }
  }

  async function saveAsCanon(messageId: string) {
    if (!token || !state.conversationId) return;
    const requestGeneration = selectionGenerationRef.current;
    setSaving(messageId);
    try {
      await apiPost(
        `/conversations/${state.conversationId}/save-canon`,
        { messageId },
        token
      );
    } catch { /* silent */ }
    finally {
      if (selectionGenerationRef.current === requestGeneration) setSaving(null);
    }
  }

  async function archiveChat() {
    if (!token || !state.conversationId || state.archiving || state.messages.length === 0) return;
    const requestGeneration = selectionGenerationRef.current;
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

      if (selectionGenerationRef.current !== requestGeneration) return;

      setState((s) => ({
        ...s,
        conversationStatus: conversation.status ?? "archived",
        archive,
        archiving: false,
      }));
      onConversationArchived();
    } catch (e) {
      if (selectionGenerationRef.current !== requestGeneration) return;
      setState((s) => ({
        ...s,
        archiving: false,
        error: chatErrorMetadata(e, "Could not archive this chat."),
      }));
    }
  }

  function startNewChat() {
    selectionGenerationRef.current += 1;
    setInput("");
    setState((s) => ({
      ...s,
      conversationId: null,
      conversationTitle: null,
      conversationStatus: "active",
      messages: [],
      archive: null,
      sending: false,
      streamStatus: null,
      error: null,
    }));
    onStartNewChat();
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
    const requestGeneration = selectionGenerationRef.current;
    setReviewing(candidateId);
    try {
      const { candidate } = await apiPatch<{ candidate: ContinuityCandidate }>(
        `/conversations/candidates/${candidateId}`,
        { action, ...edits },
        token
      );

      if (selectionGenerationRef.current !== requestGeneration) return;

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
      if (selectionGenerationRef.current !== requestGeneration) return;
      setState((s) => ({
        ...s,
        error: chatErrorMetadata(e, "Could not review candidate."),
      }));
    } finally {
      if (selectionGenerationRef.current === requestGeneration) setReviewing(null);
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
  const selectedConversationUnavailable = Boolean(selectedConversationId && !state.conversationId && state.error);
  const chatStateLabel = selectedConversationUnavailable
    ? "Unavailable"
    : state.conversationStatus === "archived"
    ? "Archived"
    : state.conversationId
      ? "Active"
      : "New";

  return (
    <div className="card studio-persona-chat" data-selected-conversation={state.conversationId ?? "new"}>
      <div className="studio-persona-chat-header">
        <div className="studio-persona-chat-heading">
          <span className="studio-persona-chat-kicker">Private conversation</span>
          <strong>{state.conversationTitle ?? `Talk with ${personaName}`}</strong>
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

      <div
        ref={threadRef}
        className="studio-persona-chat-thread"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-busy={state.sending}
      >
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
      </div>

      <div className="studio-persona-chat-composer">
        <label className="visually-hidden" htmlFor={`persona-chat-composer-${personaId}`}>
          Message {personaName}
        </label>
        <textarea
          id={`persona-chat-composer-${personaId}`}
          ref={composerRef}
          className="textarea studio-persona-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={selectedConversationUnavailable
            ? "Choose another thread or start a new chat."
            : state.conversationStatus === "archived"
              ? "Start a new chat to continue."
              : `Write privately to ${personaName}... (Enter to send, Shift+Enter for newline)`}
          disabled={state.sending || state.conversationStatus === "archived" || selectedConversationUnavailable}
        />
        <button
          onClick={send}
          disabled={state.sending || state.conversationStatus === "archived" || selectedConversationUnavailable || !input.trim()}
          className="button primary studio-persona-chat-send"
        >
          {selectedConversationUnavailable ? "Unavailable" : state.conversationStatus === "archived" ? "Archived" : state.sending ? "..." : "Send"}
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
  const titleId = `candidate-title-${candidate.id}`;
  const contentId = `candidate-content-${candidate.id}`;

  return (
    <div className="studio-persona-chat-candidate">
      <div className="studio-persona-chat-candidate-meta">
        <span className={`studio-persona-chat-candidate-type studio-persona-chat-candidate-type-${candidate.candidateType}`}>
          {candidate.candidateType}
        </span>
        <span className="studio-persona-chat-candidate-status">{candidate.status}</span>
      </div>

      <label className="visually-hidden" htmlFor={titleId}>Candidate title</label>
      <input
        id={titleId}
        className="input studio-persona-chat-candidate-input"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={!pending || busy}
      />

      <label className="visually-hidden" htmlFor={contentId}>Candidate content</label>
      <textarea
        id={contentId}
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
