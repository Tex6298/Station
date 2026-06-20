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
  const [watchState, setWatchState] = useState<ThreadWatchResponse | null>(null);
  const [watchLoading, setWatchLoading] = useState(false);
  const [watchUpdating, setWatchUpdating] = useState(false);
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

  useEffect(() => {
    if (!threadId) return;
    getSession().then(async (sess) => {
      const data = await loadThreadData(sess?.access_token);
      if (sess) {
        const nextSession = { access_token: sess.access_token, user: sess.user };
        setSession(nextSession);
        if (canUseThreadWatch(sess.user)) {
          setWatchLoading(true);
          try {
            const watch = await apiGet<ThreadWatchResponse>(threadWatchPath(data.thread.id), sess.access_token);
            setWatchState(watch);
          } catch (e) {
            setWatchFeedback(e instanceof Error ? e.message : "Could not load watch state.");
          } finally {
            setWatchLoading(false);
          }
        }
      }
    }).catch((e) => {
      setError(e instanceof Error ? e.message : "Thread not found.");
    }).finally(() => setLoading(false));
  }, [loadThreadData, threadId]);

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
      setCommentFeedback({ tone: "error", message: e instanceof Error ? e.message : "Could not vote." });
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
      setCommentFeedback({ tone: "error", message: e instanceof Error ? e.message : "Could not vote." });
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
    setWatchUpdating(true);
    setWatchFeedback(null);
    try {
      const path = threadWatchPath(thread.id);
      const data = watchState?.isWatching
        ? await apiDelete<ThreadWatchResponse>(path, session.access_token)
        : await apiPut<ThreadWatchResponse>(path, {}, session.access_token);
      setWatchState(data);
      setWatchFeedback(data.isWatching ? "Thread watched." : "Thread unwatched.");
    } catch (e) {
      setWatchFeedback(e instanceof Error ? e.message : "Could not update watch state.");
    } finally {
      setWatchUpdating(false);
    }
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

  if (loading) return <main className="container"><div className="card" style={{ textAlign: "center", padding: "3rem", color: "#687078" }}>Loading...</div></main>;
  if (error || !thread) return <main className="container"><div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757" }}>{error ?? "Not found."}</div></main>;

  const isLocked   = thread.status === "locked";
  const canComment = !!session && !isLocked;
  const canWatchThread = canUseThreadWatch(session?.user);

  return (
    <main className="container" style={{ maxWidth: 780 }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: "0.78rem", color: "#8b8f92", marginBottom: "1.5rem" }}>
        <Link href="/forums" style={{ color: "#687078" }}>Forums</Link>
        {" / "}
        <Link href={`/forums/${categorySlug}`} style={{ color: "#687078" }}>
          {thread.category?.title ?? categorySlug}
        </Link>
        {" / "}
        <span style={{ color: "#534ab7" }}>{thread.title}</span>
      </div>

      {/* Thread body */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap" }}>
          {isLocked && (
            <span style={{ fontSize: "0.72rem", padding: "0.1rem 0.45rem", borderRadius: 999, background: "#eeedfe", border: "1px solid #d8d3c8", color: "#534ab7" }}>
              locked
            </span>
          )}
          {thread.visibility && (
            <span style={{ fontSize: "0.72rem", padding: "0.1rem 0.45rem", borderRadius: 999, background: "#f8f7f4", border: "1px solid #d8d3c8", color: "#687078" }}>
              {thread.visibility}
            </span>
          )}
          {thread.linked_document_id && (
            <span style={{ fontSize: "0.72rem", padding: "0.1rem 0.45rem", borderRadius: 999, background: "#e9f5ee", border: "1px solid rgba(59, 143, 99, 0.35)", color: "#25633f" }}>
              document discussion
            </span>
          )}
          <span style={{ fontSize: "0.72rem", color: "#8b8f92" }}>
            {new Date(thread.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
        <h1 style={{ margin: "0 0 0.75rem", fontSize: "1.5rem", lineHeight: 1.25 }}>{thread.title}</h1>
        {thread.author && (
          <div style={{ fontSize: "0.78rem", color: "#687078", marginBottom: "1rem" }}>
            posted by {thread.author.display_name ?? thread.author.username}
          </div>
        )}
        <div style={{ lineHeight: 1.8, color: "#1f2529", whiteSpace: "pre-wrap", fontSize: "0.975rem" }}>
          {thread.body}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center", marginTop: "1rem", color: "#687078", fontSize: "0.78rem" }}>
          <strong style={{ color: "#1f2529" }}>{thread.score} votes</strong>
          {session && (
            <>
              {session.user.id !== thread.author_user_id ? (
                <>
                  <button type="button" onClick={() => voteThread(1)} style={voteButton(thread.viewer_vote === 1)}>Up</button>
                  <button type="button" onClick={() => voteThread(-1)} style={voteButton(thread.viewer_vote === -1)}>Down</button>
                  <button type="button" onClick={() => report("thread", thread.id)} style={utilityButton}>Report</button>
                </>
              ) : (
                <span style={{ color: "#8b8f92" }}>Own post</span>
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
          <div style={{
            color: moderationFeedback.tone === "success" ? "#25633f" : "#7d2e2e",
            fontSize: "0.78rem",
            marginTop: "0.6rem",
          }}>
            {moderationFeedback.message}
          </div>
        )}
        <div style={watchPanel}>
          {!session ? (
            <span>Sign in to watch replies on this thread.</span>
          ) : !canWatchThread ? (
            <span>Thread watching is available to private tier and above.</span>
          ) : watchLoading ? (
            <span>Loading watch state...</span>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleThreadWatch}
                disabled={watchUpdating}
                style={utilityButton}
              >
                {watchUpdating ? "Saving..." : watchState?.isWatching ? "Unwatch thread" : "Watch thread"}
              </button>
              <span>{watchState?.isWatching ? "Watching replies" : "Not watching"}</span>
            </>
          )}
          {watchFeedback && <span>{watchFeedback}</span>}
        </div>
        {witnessFeedback && (
          <div style={{ color: "#7d2e2e", fontSize: "0.78rem", marginTop: "0.6rem" }}>
            {witnessFeedback}
          </div>
        )}
        {thread.document?.space && (
          <div style={{ marginTop: "1rem" }}>
            <Link
              href={`/space/${thread.document.space.slug}/documents/${thread.document.id}`}
              style={{ color: "#25633f", fontSize: "0.82rem", textDecoration: "none" }}
            >
              Read source document: {thread.document.title}
            </Link>
          </div>
        )}
      </div>

      {moderationActions.length > 0 && (
        <div className="card" style={{ marginBottom: "1.5rem", borderColor: "#d8d3c8" }}>
          <div style={{ fontSize: "0.78rem", color: "#687078", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Moderation log
          </div>
          <div style={{ display: "grid", gap: "0.45rem" }}>
            {moderationActions.map((action) => (
              <div key={action.id} style={{ color: "#687078", fontSize: "0.8rem" }}>
                {action.actionType} - {new Date(action.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                {action.reason ? ` - ${action.reason}` : ""}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.78rem", color: "#687078", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {comments.length} {comments.length === 1 ? "reply" : "replies"}
        </div>

        {comments.length === 0 && (
          <div className="card" style={{ color: "#687078", fontStyle: "italic" }}>No replies yet.</div>
        )}

        <div style={{ display: "grid", gap: "0.65rem" }}>
          {comments.map((c) => (
            <div key={c.id} className="card" style={{ padding: "0.875rem 1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#687078" }}>
                  {c.author?.display_name ?? c.author?.username ?? "unknown"}
                  {" / "}
                  {new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                {session?.user.id === c.author_user_id && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    style={{ background: "none", border: "none", color: "#687078", cursor: "pointer", fontSize: "0.72rem", padding: "0.1rem 0.3rem" }}
                    title="Delete"
                  >
                    x
                  </button>
                )}
                {session && session.user.id !== c.author_user_id && (
                  <button
                    onClick={() => report("comment", c.id)}
                    style={{ background: "none", border: "none", color: "#687078", cursor: "pointer", fontSize: "0.72rem", padding: "0.1rem 0.3rem" }}
                    title="Report"
                  >
                    report
                  </button>
                )}
              </div>
              <div style={{ lineHeight: 1.7, color: "#1f2529", whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
                {c.body}
              </div>
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginTop: "0.65rem", color: "#687078", fontSize: "0.75rem" }}>
                <span>{c.score} votes</span>
                {session && session.user.id !== c.author_user_id && (
                  <>
                    <button type="button" onClick={() => voteComment(c.id, 1)} style={voteButton(c.viewer_vote === 1)}>Up</button>
                    <button type="button" onClick={() => voteComment(c.id, -1)} style={voteButton(c.viewer_vote === -1)}>Down</button>
                  </>
                )}
                {session && session.user.id === c.author_user_id && (
                  <span style={{ color: "#8b8f92" }}>Own comment</span>
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
        <div className="card">
          <div style={{ fontSize: "0.78rem", color: "#687078", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Leave a reply
          </div>
          {commentFeedback && (
            <div style={{
              background: commentFeedback.tone === "success" ? "#10251a" : "#2d1515",
              border: `1px solid ${commentFeedback.tone === "success" ? "#22583a" : "#7d2e2e"}`,
              color: commentFeedback.tone === "success" ? "#25633f" : "#eb5757",
              borderRadius: 6,
              padding: "0.5rem 0.75rem",
              marginBottom: "0.75rem",
              fontSize: "0.85rem",
            }}>
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
                style={{ padding: "0.5rem 1.25rem", background: "#1f2529", border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}
              >
                {submitting ? "Posting..." : "Post reply"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!session && (
        <div className="card" style={{ textAlign: "center", padding: "1.5rem", color: "#687078" }}>
          <Link href="/login" style={{ color: "#534ab7" }}>Sign in</Link> to join the discussion.
        </div>
      )}

      {isLocked && (
        <div className="card" style={{ textAlign: "center", padding: "1rem", color: "#687078", fontStyle: "italic" }}>
          This thread is locked.
        </div>
      )}
    </main>
  );
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
  const canToggle = availability === "eligible";

  return (
    <div style={witnessPanel}>
      <span style={{ color: "#1f2529", fontWeight: 600 }}>Witness</span>
      {COMMUNITY_WITNESS_KINDS.map((kind) => {
        const selected = viewerWitnesses.includes(kind);
        const key = `${targetType}:${target.id}:${kind}`;
        const label = witnessKindLabel(kind);
        if (!canToggle) {
          return (
            <span key={kind} style={witnessPill(false)}>
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
            style={witnessButton(selected, updatingKey === key)}
          >
            {updatingKey === key ? "Saving..." : `${label} ${counts[kind]}`}
          </button>
        );
      })}
      <span style={{ color: "#8b8f92" }}>{witnessAvailabilityLabel(availability)}</span>
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
    <div style={moderationPanel}>
      <span style={{ color: "#1f2529", fontWeight: 600 }}>Moderation</span>
      {actions.map((action) => {
        const key = `${targetType}:${target.id}:${action}`;
        const updating = updatingKey === key;
        return (
          <button
            key={action}
            type="button"
            disabled={updatingKey !== null}
            onClick={() => onAction(targetType, target.id, action)}
            style={moderationButton(action === "remove" || action === "restore", updating)}
          >
            {updating ? "Saving..." : moderationActionLabel(action)}
          </button>
        );
      })}
    </div>
  );
}

function witnessKindLabel(kind: CommunityWitnessKind) {
  if (kind === "helpful") return "Helpful";
  if (kind === "grounded") return "Grounded";
  return "Careful";
}

function voteButton(active: boolean) {
  return {
    border: "1px solid #d8d3c8",
    borderRadius: 6,
    background: active ? "#1f2529" : "#fff",
    color: active ? "#fff" : "#687078",
    fontSize: "0.72rem",
    padding: "0.15rem 0.45rem",
    cursor: "pointer",
  };
}

const utilityButton = {
  border: "1px solid #d8d3c8",
  borderRadius: 6,
  background: "#fff",
  color: "#687078",
  fontSize: "0.72rem",
  padding: "0.15rem 0.45rem",
  cursor: "pointer",
};

const watchPanel = {
  borderTop: "1px solid #ece8dd",
  marginTop: "1rem",
  paddingTop: "0.85rem",
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap" as const,
  alignItems: "center",
  color: "#687078",
  fontSize: "0.78rem",
};

const witnessPanel = {
  borderTop: "1px solid #ece8dd",
  marginTop: "0.85rem",
  paddingTop: "0.75rem",
  display: "flex",
  gap: "0.45rem",
  flexWrap: "wrap" as const,
  alignItems: "center",
  color: "#687078",
  fontSize: "0.75rem",
};

const moderationPanel = {
  borderTop: "1px solid #ece8dd",
  marginTop: "0.75rem",
  paddingTop: "0.75rem",
  display: "flex",
  gap: "0.45rem",
  flexWrap: "wrap" as const,
  alignItems: "center",
  color: "#687078",
  fontSize: "0.75rem",
};

function witnessButton(active: boolean, loading: boolean) {
  return {
    border: "1px solid #d8d3c8",
    borderRadius: 6,
    background: active ? "#25633f" : "#fff",
    color: active ? "#fff" : "#687078",
    fontSize: "0.72rem",
    padding: "0.16rem 0.48rem",
    cursor: loading ? "wait" : "pointer",
    opacity: loading ? 0.7 : 1,
  };
}

function witnessPill(active: boolean) {
  return {
    border: "1px solid #d8d3c8",
    borderRadius: 6,
    background: active ? "#e9f5ee" : "#f8f7f4",
    color: active ? "#25633f" : "#687078",
    fontSize: "0.72rem",
    padding: "0.16rem 0.48rem",
  };
}

function moderationButton(strong: boolean, loading: boolean) {
  return {
    border: "1px solid #d8d3c8",
    borderRadius: 6,
    background: strong ? "#2d1515" : "#fff",
    color: strong ? "#fff" : "#687078",
    fontSize: "0.72rem",
    padding: "0.16rem 0.48rem",
    cursor: loading ? "wait" : "pointer",
    opacity: loading ? 0.7 : 1,
  };
}
