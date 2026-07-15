"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { AuthUser, CommunityModerationSafetyAction, CommunityWitnessCounts, CommunityWitnessKind } from "@station/types";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  getViewerModerationActions,
  moderateComment,
  moderateThread,
  moderationActionLabel,
} from "@/lib/community-moderation";
import { canUseThreadWatch, threadWatchPath } from "@/lib/community-notifications";
import {
  addCommentWitness,
  addThreadWitness,
  COMMUNITY_WITNESS_KINDS,
  communityWitnessAvailability,
  getViewerWitnesses,
  getWitnessCounts,
  removeCommentWitness,
  removeThreadWitness,
  witnessAvailabilityLabel,
} from "@/lib/community-witness";
import {
  communityTrustBoundaryCopy,
  communityViewerWitnessSummary,
  communityWitnessKindLabel,
  communityWitnessReadbackRows,
  communityWitnessTrustSummary,
} from "@/lib/community-trust-readback";
import {
  forumCountLabel,
  forumParticipationActionLabel,
  forumParticipationReadbackLabel,
  forumThreadActivityLabel,
  forumThreadCategoryLabel,
  forumThreadKindLabels,
  forumThreadStatusLabel,
} from "@/lib/forum-copy";

interface Author { username: string; display_name: string | null; avatar_url: string | null; }
interface Thread {
  id: string; title: string; body: string; status: string;
  visibility?: string; is_pinned?: boolean; is_hidden?: boolean; linked_document_id?: string | null;
  moderation_state?: string | null; viewer_moderation_actions?: CommunityModerationSafetyAction[];
  score: number; vote_count?: number; viewer_vote?: number; comment_count: number; created_at: string;
  witness_counts?: CommunityWitnessCounts; viewer_witnesses?: CommunityWitnessKind[];
  author_user_id: string; author: Author | null;
  category: { id: string; slug: string; title: string } | null;
  document?: { id: string; title: string; space: { slug: string } | null } | null;
}
interface Comment {
  id: string; body: string; status: string; score: number;
  vote_count?: number; viewer_vote?: number;
  witness_counts?: CommunityWitnessCounts; viewer_witnesses?: CommunityWitnessKind[];
  is_pinned?: boolean; is_hidden?: boolean; reported_count?: number;
  moderation_state?: string | null; viewer_moderation_actions?: CommunityModerationSafetyAction[];
  created_at: string; author_user_id: string; author: Author | null;
}
interface ModerationAction {
  id: string;
  actionType: string;
  reason?: string | null;
  createdAt: string;
}
interface ThreadWatchResponse {
  isWatching: boolean;
  watch: { id: string; userId: string; threadId: string; isMuted: boolean } | null;
}
type SessionState = { access_token: string; user: AuthUser };
type WitnessTargetType = "thread" | "comment";
type WatchViewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; isWatching: boolean }
  | { status: "updating"; previousIsWatching: boolean }
  | { status: "error"; kind: "load" | "update" };

const WATCH_LOAD_ERROR_TITLE = "Watch state unavailable";
const WATCH_LOAD_ERROR_COPY = "Station could not confirm whether you are watching this thread. Retry before changing watch state.";
const WATCH_UPDATE_ERROR_TITLE = "Watch change unconfirmed";
const WATCH_UPDATE_ERROR_COPY = "Station could not confirm the result of that change. Reload watch state before trying again.";

export default function ThreadPage() {
  const { categorySlug, threadId } = useParams<{ categorySlug: string; threadId: string }>();
  const [thread, setThread]       = useState<Thread | null>(null);
  const [comments, setComments]   = useState<Comment[]>([]);
  const [moderationActions, setModerationActions] = useState<ModerationAction[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [session, setSession]     = useState<SessionState | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentFeedback, setCommentFeedback] = useState<{ tone: "error" | "success"; message: string } | null>(null);
  const [watchState, setWatchState] = useState<WatchViewState>({ status: "idle" });
  const [watchFeedback, setWatchFeedback] = useState<string | null>(null);
  const [witnessUpdating, setWitnessUpdating] = useState<string | null>(null);
  const [witnessFeedback, setWitnessFeedback] = useState<string | null>(null);
  const [moderationUpdating, setModerationUpdating] = useState<string | null>(null);
  const [moderationFeedback, setModerationFeedback] = useState<{ tone: "error" | "success"; message: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadThreadData = useCallback(async (accessToken?: string) => {
    const data = await apiGet<{ thread: Thread; comments: Comment[]; moderationActions?: ModerationAction[] }>(
      `/threads/${threadId}`,
      accessToken
    );
    setThread(data.thread);
    setComments(data.comments);
    setModerationActions(data.moderationActions ?? []);
    return data;
  }, [threadId]);

  const loadWatchState = useCallback(async (threadId: string, accessToken: string) => {
    setWatchState({ status: "loading" });
    setWatchFeedback(null);
    try {
      const watch = parseThreadWatchResponse(await apiGet<unknown>(threadWatchPath(threadId), accessToken));
      if (!watch) {
        setWatchState({ status: "error", kind: "load" });
        return;
      }
      setWatchState({ status: "ready", isWatching: watch.isWatching });
    } catch {
      setWatchState({ status: "error", kind: "load" });
    }
  }, []);

  useEffect(() => {
    if (!threadId) return;
    getSession().then(async (sess) => {
      const data = await loadThreadData(sess?.access_token);
      if (sess) {
        const nextSession = { access_token: sess.access_token, user: sess.user };
        setSession(nextSession);
        if (canUseThreadWatch(sess.user)) {
          void loadWatchState(data.thread.id, sess.access_token);
        }
      }
    }).catch((e) => {
      setError(e instanceof Error ? e.message : "Thread not found.");
    }).finally(() => setLoading(false));
  }, [loadThreadData, loadWatchState, threadId]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !session) return;
    setSubmitting(true);
    setCommentFeedback(null);
    try {
      const data = await apiPost<{ comment: Comment }>(
        "/comments",
        { parentType: "thread", parentId: threadId, body: newComment.trim() },
        session.access_token
      );
      setComments((prev) => [...prev, data.comment]);
      setNewComment("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) {
      setCommentFeedback({ tone: "error", message: e instanceof Error ? e.message : "Could not post comment." });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!session) return;
    try {
      await apiDelete(`/comments/${commentId}`, session.access_token);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch { /* silent */ }
  }

  async function voteThread(value: -1 | 1) {
    if (!session || !thread) return;
    setCommentFeedback(null);
    try {
      const response = await apiPost<{ thread: { id: string; score: number; vote_count?: number } }>(
        `/threads/${thread.id}/vote`,
        { value },
        session.access_token
      );
      setThread({ ...thread, score: response.thread.score, vote_count: response.thread.vote_count, viewer_vote: value });
    } catch (e) {
      setCommentFeedback({ tone: "error", message: "Could not update discussion feedback." });
    }
  }

  async function voteComment(commentId: string, value: -1 | 1) {
    if (!session) return;
    setCommentFeedback(null);
    try {
      const response = await apiPost<{ comment: { id: string; score: number; vote_count?: number } }>(
        `/comments/${commentId}/vote`,
        { value },
        session.access_token
      );
      setComments((current) => current.map((comment) => comment.id === commentId
        ? { ...comment, score: response.comment.score, vote_count: response.comment.vote_count, viewer_vote: value }
        : comment));
    } catch (e) {
      setCommentFeedback({ tone: "error", message: "Could not update discussion feedback." });
    }
  }

  async function report(targetType: "thread" | "comment", targetId: string) {
    if (!session) return;
    setCommentFeedback(null);
    try {
      await apiPost("/reports", { targetType, targetId, reason: "community_review" }, session.access_token);
      setCommentFeedback({ tone: "success", message: "Report sent for moderation review." });
    } catch (e) {
      setCommentFeedback({ tone: "error", message: e instanceof Error ? e.message : "Could not report." });
    }
  }

  async function toggleThreadWatch() {
    if (!session || !thread || !canUseThreadWatch(session.user)) return;
    if (watchState.status !== "ready") return;
    const previousIsWatching = watchState.isWatching;
    const expectedIsWatching = !previousIsWatching;
    setWatchState({ status: "updating", previousIsWatching });
    setWatchFeedback(null);
    try {
      const path = threadWatchPath(thread.id);
      const data = parseThreadWatchResponse(previousIsWatching
        ? await apiDelete<unknown>(path, session.access_token)
        : await apiPut<unknown>(path, {}, session.access_token));
      if (!data || data.isWatching !== expectedIsWatching) {
        setWatchState({ status: "error", kind: "update" });
        return;
      }
      setWatchState({ status: "ready", isWatching: data.isWatching });
      setWatchFeedback(data.isWatching ? "Thread watched." : "Thread unwatched.");
    } catch {
      setWatchState({ status: "error", kind: "update" });
    }
  }

  function retryWatchState() {
    if (!session || !thread || !canUseThreadWatch(session.user)) return;
    void loadWatchState(thread.id, session.access_token);
  }

  async function toggleWitness(
    targetType: WitnessTargetType,
    targetId: string,
    kind: CommunityWitnessKind,
    selected: boolean
  ) {
    if (!session) return;
    const key = `${targetType}:${targetId}:${kind}`;
    setWitnessUpdating(key);
    setWitnessFeedback(null);
    setCommentFeedback(null);
    try {
      const data = targetType === "thread"
        ? selected
          ? await removeThreadWitness(session.access_token, targetId, kind)
          : await addThreadWitness(session.access_token, targetId, kind)
        : selected
          ? await removeCommentWitness(session.access_token, targetId, kind)
          : await addCommentWitness(session.access_token, targetId, kind);

      if (targetType === "thread") {
        setThread((current) => current?.id === targetId
          ? {
              ...current,
              witness_counts: data.witness.witness_counts,
              viewer_witnesses: data.witness.viewer_witnesses ?? [],
            }
          : current);
      } else {
        setComments((current) => current.map((comment) => comment.id === targetId
          ? {
              ...comment,
              witness_counts: data.witness.witness_counts,
              viewer_witnesses: data.witness.viewer_witnesses ?? [],
            }
          : comment));
      }
    } catch (e) {
      setWitnessFeedback(e instanceof Error ? e.message : "Could not update witness state.");
    } finally {
      setWitnessUpdating(null);
    }
  }

  async function handleModeration(
    targetType: WitnessTargetType,
    targetId: string,
    action: CommunityModerationSafetyAction
  ) {
    if (!session) return;
    const key = `${targetType}:${targetId}:${action}`;
    setModerationUpdating(key);
    setModerationFeedback(null);
    setCommentFeedback(null);
    try {
      if (targetType === "thread") {
        const data = await moderateThread(session.access_token, targetId, action);
        setThread((current) => current?.id === targetId
          ? { ...current, ...data.thread, viewer_moderation_actions: [] }
          : current);
      } else {
        const data = await moderateComment(session.access_token, targetId, action);
        setComments((current) => {
          if (action === "hide" || action === "remove") {
            return current.filter((comment) => comment.id !== targetId);
          }
          return current.map((comment) => comment.id === targetId
            ? { ...comment, ...data.comment, viewer_moderation_actions: [] }
            : comment);
        });
      }

      setModerationFeedback({ tone: "success", message: "Moderation action applied." });
      try {
        await loadThreadData(session.access_token);
      } catch (refreshError) {
        if (targetType === "thread" && (action === "hide" || action === "remove")) {
          setError("Moderation action applied. This thread is no longer visible here.");
        } else {
          throw refreshError;
        }
      }
    } catch (e) {
      setModerationFeedback({ tone: "error", message: e instanceof Error ? e.message : "Could not apply moderation action." });
    } finally {
      setModerationUpdating(null);
    }
  }

  if (loading) return <main className="container forum-thread-detail"><div className="card forum-thread-detail-state" style={{ textAlign: "center", padding: "3rem" }}>Loading...</div></main>;
  if (error || !thread) return <main className="container forum-thread-detail"><div className="card forum-thread-detail-state" data-tone="danger">{error ?? "Not found."}</div></main>;

  const isLocked   = thread.status === "locked";
  const canComment = !!session && !isLocked;
  const canWatchThread = canUseThreadWatch(session?.user);
  const threadKindLabels = forumThreadKindLabels({
    isPinned: thread.is_pinned,
    linkedDocumentId: thread.linked_document_id,
    visibility: thread.visibility,
  });
  const threadDetailLabels = [
    forumThreadCategoryLabel(thread.category?.title ?? categorySlug),
    forumThreadStatusLabel(thread.status),
    ...threadKindLabels,
  ];

  return (
    <main className="container forum-thread-detail" style={{ maxWidth: 780 }}>
      {/* Breadcrumb */}
      <div className="forum-thread-detail-breadcrumb">
        <Link href="/forums">Forums</Link>
        {" / "}
        <Link href={`/forums/${categorySlug}`}>
          {thread.category?.title ?? categorySlug}
        </Link>
        {" / "}
        <span>{thread.title}</span>
      </div>

      {/* Thread body */}
      <div className="card forum-thread-detail-card forum-thread-detail-primary" style={{ marginBottom: "1.5rem" }}>
        <div className="forum-thread-detail-labels">
          {threadDetailLabels.map((label) => (
            <span key={label} data-tone={label === "Document discussion" ? "document" : label === "Locked thread" ? "locked" : undefined}>
              {label}
            </span>
          ))}
          <span className="forum-thread-detail-faint">
            {forumThreadActivityLabel(thread.created_at, "Posted")}
          </span>
        </div>
        <h1 className="forum-thread-detail-title">{thread.title}</h1>
        {thread.author && (
          <div className="forum-thread-detail-meta">
            posted by {thread.author.display_name ?? thread.author.username}
          </div>
        )}
        <div className="forum-thread-detail-body">
          {thread.body}
        </div>
        <div className="forum-thread-detail-actions">
          <strong>{forumParticipationReadbackLabel()}</strong>
          <span>{forumCountLabel(thread.comment_count, "reply", "replies")}</span>
          {session && (
            <>
              {session.user.id !== thread.author_user_id ? (
                <>
                  <button type="button" onClick={() => voteThread(1)} className="forum-thread-detail-button" data-active={thread.viewer_vote === 1}>{forumParticipationActionLabel(1)}</button>
                  <button type="button" onClick={() => voteThread(-1)} className="forum-thread-detail-button" data-active={thread.viewer_vote === -1}>{forumParticipationActionLabel(-1)}</button>
                  <button type="button" onClick={() => report("thread", thread.id)} className="forum-thread-detail-button">Report</button>
                </>
              ) : (
                <span className="forum-thread-detail-faint">Own post</span>
              )}
            </>
          )}
        </div>
        <WitnessControls
          targetType="thread"
          target={thread}
          session={session}
          updatingKey={witnessUpdating}
          onToggle={toggleWitness}
        />
        <ModerationControls
          targetType="thread"
          target={thread}
          session={session}
          updatingKey={moderationUpdating}
          onAction={handleModeration}
        />
        {moderationFeedback && (
          <div className="forum-thread-detail-feedback" data-tone={moderationFeedback.tone}>
            {moderationFeedback.message}
          </div>
        )}
        <div className="forum-thread-detail-watch">
          {!session ? (
            <span>Sign in to watch replies on this thread.</span>
          ) : !canWatchThread ? (
            <span>Thread watching is available to private tier and above.</span>
          ) : (
            <WatchStatePanel
              state={watchState}
              onRetry={retryWatchState}
              onToggle={toggleThreadWatch}
            />
          )}
          {watchFeedback && <span>{watchFeedback}</span>}
        </div>
        {witnessFeedback && (
          <div className="forum-thread-detail-feedback" data-tone="error">
            {witnessFeedback}
          </div>
        )}
        {thread.document?.space && (
          <div style={{ marginTop: "1rem" }}>
            <Link
              href={`/space/${thread.document.space.slug}/documents/${thread.document.id}`}
              className="forum-thread-detail-source-link"
            >
              Read source document: {thread.document.title}
            </Link>
          </div>
        )}
      </div>

      {moderationActions.length > 0 && (
        <div className="card forum-thread-detail-card" style={{ marginBottom: "1.5rem" }}>
          <div className="forum-thread-detail-section-label">
            Moderation log
          </div>
          <div style={{ display: "grid", gap: "0.45rem" }}>
            {moderationActions.map((action) => (
              <div key={action.id} className="forum-thread-detail-meta">
                {action.actionType} - {new Date(action.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                {action.reason ? ` - ${action.reason}` : ""}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div className="forum-thread-detail-section-label">
          {forumCountLabel(comments.length, "reply", "replies")}
        </div>

        {comments.length === 0 && (
          <div className="card forum-thread-detail-state" style={{ fontStyle: "italic" }}>No replies yet.</div>
        )}

        <div style={{ display: "grid", gap: "0.65rem" }}>
          {comments.map((c) => (
            <div key={c.id} className="card forum-thread-detail-card forum-thread-detail-comment" style={{ padding: "0.875rem 1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem", gap: "0.5rem" }}>
                <span className="forum-thread-detail-comment-meta">
                  {c.author?.display_name ?? c.author?.username ?? "unknown"}
                  {" / "}
                  {new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                {session?.user.id === c.author_user_id && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="forum-thread-detail-inline-action"
                    title="Delete"
                  >
                    x
                  </button>
                )}
                {session && session.user.id !== c.author_user_id && (
                  <button
                    onClick={() => report("comment", c.id)}
                    className="forum-thread-detail-inline-action"
                    title="Report"
                  >
                    report
                  </button>
                )}
              </div>
              <div className="forum-thread-detail-comment-body">
                {c.body}
              </div>
              <div className="forum-thread-detail-comment-actions">
                <span>{forumParticipationReadbackLabel("comment")}</span>
                {session && session.user.id !== c.author_user_id && (
                  <>
                    <button type="button" onClick={() => voteComment(c.id, 1)} className="forum-thread-detail-button" data-active={c.viewer_vote === 1}>{forumParticipationActionLabel(1)}</button>
                    <button type="button" onClick={() => voteComment(c.id, -1)} className="forum-thread-detail-button" data-active={c.viewer_vote === -1}>{forumParticipationActionLabel(-1)}</button>
                  </>
                )}
                {session && session.user.id === c.author_user_id && (
                  <span className="forum-thread-detail-faint">Own comment</span>
                )}
              </div>
              <WitnessControls
                targetType="comment"
                target={c}
                session={session}
                updatingKey={witnessUpdating}
                onToggle={toggleWitness}
              />
              <ModerationControls
                targetType="comment"
                target={c}
                session={session}
                updatingKey={moderationUpdating}
                onAction={handleModeration}
              />
            </div>
          ))}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* Reply form */}
      {canComment && (
        <div className="card forum-thread-detail-card">
          <div className="forum-thread-detail-section-label">
            Leave a reply
          </div>
          {commentFeedback && (
            <div className="forum-thread-detail-notice" data-tone={commentFeedback.tone}>
              {commentFeedback.message}
            </div>
          )}
          <form onSubmit={handleComment} style={{ display: "grid", gap: "0.75rem" }}>
            <textarea
              className="textarea"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleComment(e as unknown as React.FormEvent); }}
              placeholder="Write your reply... (Ctrl+Enter to submit)"
              style={{ minHeight: 100, fontSize: "0.9rem", lineHeight: 1.65 }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="forum-thread-detail-submit"
              >
                {submitting ? "Posting..." : "Post reply"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!session && (
        <div className="card forum-thread-detail-state" style={{ textAlign: "center", padding: "1.5rem" }}>
          <Link href="/login">Sign in</Link> to join the discussion.
        </div>
      )}

      {isLocked && (
        <div className="card forum-thread-detail-state" style={{ textAlign: "center", padding: "1rem", fontStyle: "italic" }}>
          This thread is locked.
        </div>
      )}
    </main>
  );
}

function parseThreadWatchResponse(value: unknown): ThreadWatchResponse | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Partial<ThreadWatchResponse>;
  if (typeof candidate.isWatching !== "boolean") return null;
  if (candidate.watch !== null && candidate.watch !== undefined && typeof candidate.watch !== "object") return null;
  return {
    isWatching: candidate.isWatching,
    watch: candidate.watch ?? null,
  };
}

function WatchStatePanel({
  state,
  onRetry,
  onToggle,
}: {
  state: WatchViewState;
  onRetry: () => void;
  onToggle: () => void;
}) {
  if (state.status === "idle" || state.status === "loading") {
    return <span>Loading watch state...</span>;
  }

  if (state.status === "updating") {
    return <span>Saving watch state...</span>;
  }

  if (state.status === "error") {
    const title = state.kind === "load" ? WATCH_LOAD_ERROR_TITLE : WATCH_UPDATE_ERROR_TITLE;
    const copy = state.kind === "load" ? WATCH_LOAD_ERROR_COPY : WATCH_UPDATE_ERROR_COPY;
    return (
      <>
        <strong>{title}</strong>
        <span>{copy}</span>
        <button type="button" onClick={onRetry} className="forum-thread-detail-button">Retry watch state</button>
      </>
    );
  }

  if (state.status === "ready") {
    return (
      <>
        <button type="button" onClick={onToggle} className="forum-thread-detail-button">
          {state.isWatching ? "Unwatch thread" : "Watch thread"}
        </button>
        <span>{state.isWatching ? "Watching replies" : "Not watching"}</span>
      </>
    );
  }

  return null;
}

function WitnessControls({
  targetType,
  target,
  session,
  updatingKey,
  onToggle,
}: {
  targetType: WitnessTargetType;
  target: Pick<Thread | Comment, "id" | "author_user_id" | "witness_counts" | "viewer_witnesses">;
  session: SessionState | null;
  updatingKey: string | null;
  onToggle: (
    targetType: WitnessTargetType,
    targetId: string,
    kind: CommunityWitnessKind,
    selected: boolean
  ) => void;
}) {
  const availability = communityWitnessAvailability(session?.user ?? null, target);
  const counts = getWitnessCounts(target);
  const viewerWitnesses = getViewerWitnesses(target);
  const readbackRows = communityWitnessReadbackRows(counts);
  const canToggle = availability === "eligible";

  return (
    <div className="forum-thread-detail-witness">
      <div className="forum-thread-detail-witness-header">
        <span className="forum-thread-detail-witness-title">Witness</span>
        <span>{communityWitnessTrustSummary(counts)}</span>
      </div>
      {COMMUNITY_WITNESS_KINDS.map((kind) => {
        const selected = viewerWitnesses.includes(kind);
        const key = `${targetType}:${target.id}:${kind}`;
        const label = communityWitnessKindLabel(kind);
        if (!canToggle) {
          return (
            <span key={kind} className="forum-thread-detail-witness-pill">
              {label} {counts[kind]}
            </span>
          );
        }
        return (
          <button
            key={kind}
            type="button"
            aria-pressed={selected}
            disabled={updatingKey !== null}
            onClick={() => onToggle(targetType, target.id, kind, selected)}
            className="forum-thread-detail-witness-button"
            data-active={selected}
            data-loading={updatingKey === key}
          >
            {updatingKey === key ? "Saving..." : `${label} ${counts[kind]}`}
          </button>
        );
      })}
      <span className="forum-thread-detail-faint">{witnessAvailabilityLabel(availability)}</span>
      <div className="forum-thread-detail-witness-meaning" aria-label={`${targetType} community trust readback`}>
        {readbackRows.map((row) => (
          <span key={row.kind}>
            {row.label}: {row.description}
          </span>
        ))}
      </div>
      <div className="forum-thread-detail-witness-boundary">
        {communityViewerWitnessSummary(viewerWitnesses)} {communityTrustBoundaryCopy()}
      </div>
    </div>
  );
}

function ModerationControls({
  targetType,
  target,
  session,
  updatingKey,
  onAction,
}: {
  targetType: WitnessTargetType;
  target: Pick<Thread | Comment, "id" | "viewer_moderation_actions">;
  session: SessionState | null;
  updatingKey: string | null;
  onAction: (
    targetType: WitnessTargetType,
    targetId: string,
    action: CommunityModerationSafetyAction
  ) => void;
}) {
  const actions = getViewerModerationActions(session?.user ?? null, target);
  if (actions.length === 0) return null;

  return (
    <div className="forum-thread-detail-moderation">
      <span className="forum-thread-detail-moderation-title">Moderation</span>
      {actions.map((action) => {
        const key = `${targetType}:${target.id}:${action}`;
        const updating = updatingKey === key;
        return (
          <button
            key={action}
            type="button"
            disabled={updatingKey !== null}
            onClick={() => onAction(targetType, target.id, action)}
            className="forum-thread-detail-moderation-button"
            data-strong={action === "remove" || action === "restore"}
            data-loading={updating}
          >
            {updating ? "Saving..." : moderationActionLabel(action)}
          </button>
        );
      })}
    </div>
  );
}
