import type { Database } from "@station/db";
import type { CommunityNotificationRecord, CommunityThreadWatchRecord } from "@station/types";
import { getSupabaseAdmin } from "../lib/supabase";

type CommunityNotificationRow = Database["public"]["Tables"]["community_notifications"]["Row"];
type CommunityNotificationPreferenceRow = Database["public"]["Tables"]["community_notification_preferences"]["Row"];
type CommunityThreadWatchRow = Database["public"]["Tables"]["community_thread_watches"]["Row"];
type ModerationReportRow = Database["public"]["Tables"]["moderation_reports"]["Row"];
type ModerationReviewRequestRow = Database["public"]["Tables"]["moderation_review_requests"]["Row"];

export function serializeCommunityThreadWatch(row: CommunityThreadWatchRow): CommunityThreadWatchRecord {
  return {
    id: row.id,
    userId: row.user_id,
    threadId: row.thread_id,
    isMuted: row.is_muted,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function serializeCommunityNotification(row: CommunityNotificationRow): CommunityNotificationRecord {
  return {
    id: row.id,
    type: row.notification_type,
    targetType: row.target_type,
    targetId: row.target_id,
    title: row.title,
    summary: row.summary,
    routeHref: row.route_href,
    metadata: row.metadata ?? {},
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export async function createCommunityNotification(input: {
  recipientUserId: string;
  actorUserId?: string | null;
  type: CommunityNotificationRow["notification_type"];
  targetType: CommunityNotificationRow["target_type"];
  targetId: string;
  eventKey: string;
  title: string;
  summary?: string | null;
  routeHref?: string | null;
  metadata?: Record<string, unknown>;
}) {
  if (input.actorUserId && input.actorUserId === input.recipientUserId) return null;

  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_notifications")
    .insert({
      recipient_user_id: input.recipientUserId,
      actor_user_id: input.actorUserId ?? null,
      notification_type: input.type,
      target_type: input.targetType,
      target_id: input.targetId,
      event_key: input.eventKey,
      title: input.title,
      summary: input.summary ?? null,
      route_href: input.routeHref ?? null,
      metadata: input.metadata ?? {},
    })
    .select("*")
    .single();

  if (isUniqueViolation(error)) return null;
  if (error) throw new Error(error.message ?? "Failed to create community notification.");
  return data as CommunityNotificationRow;
}

export async function notifyThreadComment(input: {
  threadId: string;
  commentId: string;
  commenterUserId: string;
}) {
  const sb = getSupabaseAdmin();
  const { data: thread } = await (sb as any)
    .from("threads")
    .select("id, title, author_user_id, status, visibility, is_hidden, category_id")
    .eq("id", input.threadId)
    .maybeSingle();

  if (!thread || thread.status === "removed" || thread.is_hidden) return [];

  const { data: category } = await (sb as any)
    .from("forum_categories")
    .select("id, slug")
    .eq("id", thread.category_id)
    .maybeSingle();

  const { data: watches } = await (sb as any)
    .from("community_thread_watches")
    .select("user_id")
    .eq("thread_id", input.threadId)
    .eq("is_muted", false);

  const recipients = new Set<string>();
  if (thread.author_user_id) recipients.add(thread.author_user_id);
  for (const watch of watches ?? []) recipients.add(watch.user_id);
  recipients.delete(input.commenterUserId);
  const eligibleRecipients = await filterForumReplyNotificationRecipients([...recipients]);

  const routeHref = category?.slug
    ? `/forums/${category.slug}/${thread.id}#comment-${input.commentId}`
    : null;
  const rows = [];
  for (const recipientUserId of eligibleRecipients) {
    const row = await createCommunityNotification({
      recipientUserId,
      actorUserId: input.commenterUserId,
      type: "thread_comment",
      targetType: "comment",
      targetId: input.commentId,
      eventKey: `thread_comment:${input.commentId}`,
      title: "New comment on a thread",
      summary: "A new comment was added to a thread you follow.",
      routeHref,
      metadata: {
        threadId: thread.id,
        threadTitle: thread.title ?? null,
      },
    });
    if (row) rows.push(row);
  }

  return rows;
}

async function filterForumReplyNotificationRecipients(recipientUserIds: string[]) {
  if (recipientUserIds.length === 0) return recipientUserIds;

  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_notification_preferences")
    .select("owner_user_id, forum_reply_notifications_enabled")
    .in("owner_user_id", recipientUserIds);

  if (error || !Array.isArray(data)) {
    throw new Error("Could not load notification preferences.");
  }

  const requestedRecipients = new Set(recipientUserIds);
  const disabled = new Set<string>();
  for (const candidate of data as unknown[]) {
    if (
      !candidate
      || typeof candidate !== "object"
      || Array.isArray(candidate)
      || typeof (candidate as Partial<CommunityNotificationPreferenceRow>).owner_user_id !== "string"
      || typeof (candidate as Partial<CommunityNotificationPreferenceRow>).forum_reply_notifications_enabled !== "boolean"
      || !requestedRecipients.has((candidate as CommunityNotificationPreferenceRow).owner_user_id)
    ) {
      throw new Error("Could not load notification preferences.");
    }

    const row = candidate as CommunityNotificationPreferenceRow;
    if (!row.forum_reply_notifications_enabled) disabled.add(row.owner_user_id);
  }
  return recipientUserIds.filter((recipientUserId) => !disabled.has(recipientUserId));
}

export async function notifyReportStatus(row: ModerationReportRow, actorUserId: string) {
  void actorUserId;
  return createCommunityNotification({
    recipientUserId: row.reporter_id,
    actorUserId: null,
    type: "report_status",
    targetType: "moderation_report",
    targetId: row.id,
    eventKey: `report_status:${row.id}:${row.status}:${row.reviewed_at ?? row.updated_at}`,
    title: "Report status updated",
    summary: `Your report is now ${row.status}.`,
    routeHref: "/forums/reports",
    metadata: {
      reportId: row.id,
      status: row.status,
    },
  });
}

export async function notifyReviewRequestStatus(row: ModerationReviewRequestRow, actorUserId: string) {
  void actorUserId;
  return createCommunityNotification({
    recipientUserId: row.requester_id,
    actorUserId: null,
    type: "review_request_status",
    targetType: "moderation_review_request",
    targetId: row.id,
    eventKey: `review_request_status:${row.id}:${row.status}:${row.reviewed_at ?? row.updated_at}`,
    title: "Review request status updated",
    summary: row.resolution_summary
      ? `Your review request is now ${row.status}: ${row.resolution_summary}`
      : `Your review request is now ${row.status}.`,
    routeHref: "/forums/reports",
    metadata: {
      reviewRequestId: row.id,
      status: row.status,
      resolutionSummary: row.resolution_summary ?? null,
    },
  });
}

function isUniqueViolation(error: { code?: string } | null | undefined) {
  return error?.code === "23505";
}
