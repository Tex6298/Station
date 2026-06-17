import { getSupabaseAdmin } from "../lib/supabase";

export const PUBLISHING_APPROVAL_STATES = [
  "draft",
  "grounding_check",
  "human_review",
  "approved",
  "regenerate",
  "cancelled",
  "scheduled",
  "published",
  "archived",
] as const;

export type PublishingApprovalState = typeof PUBLISHING_APPROVAL_STATES[number];
export type PublishingApprovalVisibility = "public" | "community" | "unlisted";

const TERMINAL_STATES = new Set<PublishingApprovalState>(["cancelled", "published", "archived"]);

const ALLOWED_TRANSITIONS: Record<PublishingApprovalState, PublishingApprovalState[]> = {
  draft: ["grounding_check", "cancelled"],
  grounding_check: ["human_review", "regenerate", "cancelled"],
  human_review: ["approved", "regenerate", "cancelled"],
  approved: ["scheduled", "published", "archived"],
  regenerate: ["draft", "cancelled"],
  cancelled: ["draft"],
  scheduled: ["published", "cancelled", "archived"],
  published: ["archived"],
  archived: [],
};

interface TransitionOptions {
  note?: string | null;
  visibility?: PublishingApprovalVisibility;
  scheduledFor?: string | null;
  groundingSummary?: string | null;
}

function isMissingSingleError(error: any) {
  const message = String(error?.message ?? "");
  return error?.code === "PGRST116" || message.includes("Expected one");
}

function normalizeVisibility(value: string | null | undefined): PublishingApprovalVisibility {
  return value === "community" || value === "unlisted" ? value : "public";
}

function isPublicPublishVisibility(value: string | null | undefined) {
  return value === "public" || value === "community" || value === "unlisted";
}

function documentProjection(document: any) {
  return {
    id: document.id,
    title: document.title,
    slug: document.slug,
    document_type: document.document_type,
    status: document.status,
    visibility: document.visibility,
    published_at: document.published_at,
    updated_at: document.updated_at,
    created_at: document.created_at,
    space_id: document.space_id,
    persona_id: document.persona_id,
    provenance_type: document.provenance_type,
    source_type: document.source_type,
    source_label: document.source_label,
    discussion_thread_id: document.discussion_thread_id,
  };
}

function serializeItem(row: any) {
  const document = row.document ?? row.documents ?? null;
  return {
    id: row.id,
    documentId: row.document_id,
    ownerUserId: row.owner_user_id,
    state: row.state,
    visibility: row.visibility,
    scheduledFor: row.scheduled_for,
    groundingSummary: row.grounding_summary,
    reviewNote: row.review_note,
    requestedAt: row.requested_at,
    approvedAt: row.approved_at,
    publishedAt: row.published_at,
    cancelledAt: row.cancelled_at,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    document: document ? documentProjection(document) : null,
  };
}

function serializeEvent(row: any) {
  return {
    id: row.id,
    approvalItemId: row.approval_item_id,
    actorUserId: row.actor_user_id,
    eventType: row.event_type,
    fromState: row.from_state,
    toState: row.to_state,
    note: row.note,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

async function loadOwnedDocument(documentId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("author_user_id", ownerUserId)
    .single();

  if (error && !isMissingSingleError(error)) throw new Error(error.message);
  return data ?? null;
}

async function loadOwnedItemByDocument(documentId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("publishing_approval_items")
    .select("*")
    .eq("document_id", documentId)
    .eq("owner_user_id", ownerUserId)
    .single();

  if (error && !isMissingSingleError(error)) throw new Error(error.message);
  return data ?? null;
}

async function loadOwnedItem(itemId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("publishing_approval_items")
    .select("*")
    .eq("id", itemId)
    .eq("owner_user_id", ownerUserId)
    .single();

  if (error && !isMissingSingleError(error)) throw new Error(error.message);
  return data ?? null;
}

async function recordEvent(
  item: any,
  actorUserId: string,
  eventType: string,
  fromState: PublishingApprovalState | null,
  toState: PublishingApprovalState,
  note?: string | null,
  metadata: Record<string, unknown> = {},
) {
  const sb = getSupabaseAdmin();
  await sb
    .from("publishing_approval_events")
    .insert({
      approval_item_id: item.id,
      owner_user_id: item.owner_user_id,
      actor_user_id: actorUserId,
      document_id: item.document_id,
      event_type: eventType,
      from_state: fromState,
      to_state: toState,
      note: note ?? null,
      metadata,
    });
}

async function hydrateItem(item: any) {
  const document = await loadOwnedDocument(item.document_id, item.owner_user_id);
  return serializeItem({ ...item, document });
}

export async function listPublishingApprovals(ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("publishing_approval_items")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return Promise.all((data ?? []).map(hydrateItem));
}

export async function listPublishingApprovalEvents(itemId: string, ownerUserId: string) {
  const item = await loadOwnedItem(itemId, ownerUserId);
  if (!item) return null;

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("publishing_approval_events")
    .select("*")
    .eq("approval_item_id", item.id)
    .eq("owner_user_id", ownerUserId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(serializeEvent);
}

export async function enqueuePublishingApproval(
  documentId: string,
  ownerUserId: string,
  actorUserId: string,
  options: TransitionOptions = {},
) {
  const document = await loadOwnedDocument(documentId, ownerUserId);
  if (!document) return { status: "not_found" as const };
  if (document.status === "published") return { status: "invalid" as const, error: "Published documents are already outside the approval queue." };

  const sb = getSupabaseAdmin();
  const existing = await loadOwnedItemByDocument(documentId, ownerUserId);
  if (existing && !TERMINAL_STATES.has(existing.state)) {
    return { status: "ok" as const, item: await hydrateItem(existing), existing: true };
  }

  const visibility = normalizeVisibility(options.visibility ?? document.visibility);
  const payload: {
    owner_user_id: string;
    document_id: string;
    state: PublishingApprovalState;
    visibility: PublishingApprovalVisibility;
    grounding_summary: string | null;
    review_note: string | null;
    requested_at: string;
    approved_at: string | null;
    published_at: string | null;
    cancelled_at: string | null;
    archived_at: string | null;
  } = {
    owner_user_id: ownerUserId,
    document_id: document.id,
    state: "grounding_check",
    visibility,
    grounding_summary: options.groundingSummary ?? null,
    review_note: options.note ?? null,
    requested_at: new Date().toISOString(),
    approved_at: null,
    published_at: null,
    cancelled_at: null,
    archived_at: null,
  };

  const query = existing
    ? sb.from("publishing_approval_items").update(payload).eq("id", existing.id).select("*").single()
    : sb.from("publishing_approval_items").insert(payload).select("*").single();

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  await recordEvent(data, actorUserId, existing ? "requeued" : "enqueued", existing?.state ?? null, "grounding_check", options.note, {
    visibility,
    documentStatus: document.status,
    provenanceType: document.provenance_type,
    sourceType: document.source_type,
  });
  return { status: "ok" as const, item: await hydrateItem(data), existing: false };
}

export async function transitionPublishingApproval(
  itemId: string,
  ownerUserId: string,
  actorUserId: string,
  nextState: PublishingApprovalState,
  options: TransitionOptions = {},
) {
  const item = await loadOwnedItem(itemId, ownerUserId);
  if (!item) return { status: "not_found" as const };

  const currentState = item.state as PublishingApprovalState;
  if (!ALLOWED_TRANSITIONS[currentState]?.includes(nextState)) {
    return { status: "invalid" as const, error: `Cannot move publishing approval from ${currentState} to ${nextState}.` };
  }

  const document = await loadOwnedDocument(item.document_id, ownerUserId);
  if (!document) return { status: "not_found" as const };

  const now = new Date().toISOString();
  const update: Record<string, unknown> = {
    state: nextState,
    updated_at: now,
  };

  if (options.note !== undefined) update.review_note = options.note;
  if (options.groundingSummary !== undefined) update.grounding_summary = options.groundingSummary;
  if (options.visibility !== undefined) update.visibility = options.visibility;

  if (nextState === "approved") update.approved_at = now;
  if (nextState === "cancelled") update.cancelled_at = now;
  if (nextState === "archived") update.archived_at = now;
  if (nextState === "scheduled") {
    if (!options.scheduledFor) return { status: "invalid" as const, error: "scheduledFor is required for scheduled publishing." };
    update.scheduled_for = options.scheduledFor;
  }

  const sb = getSupabaseAdmin();
  if (nextState === "published") {
    const visibility = normalizeVisibility(options.visibility ?? item.visibility ?? document.visibility);
    if (!isPublicPublishVisibility(visibility)) {
      return { status: "invalid" as const, error: "Approval queue publishing requires public, community, or unlisted visibility." };
    }

    const { data: publishedDocument, error: publishError } = await sb
      .from("documents")
      .update({
        status: "published",
        visibility,
        published_at: now,
      })
      .eq("id", item.document_id)
      .eq("author_user_id", ownerUserId)
      .select("*")
      .single();

    if (publishError) throw new Error(publishError.message);
    update.visibility = visibility;
    update.published_at = now;
    update.scheduled_for = null;
    await recordEvent(item, actorUserId, "document_published", currentState, nextState, options.note, {
      visibility,
      documentStatus: publishedDocument.status,
      provenanceType: publishedDocument.provenance_type,
      sourceType: publishedDocument.source_type,
    });
  }

  const { data, error } = await sb
    .from("publishing_approval_items")
    .update(update)
    .eq("id", item.id)
    .eq("owner_user_id", ownerUserId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  if (nextState !== "published") {
    await recordEvent(data, actorUserId, `state_${nextState}`, currentState, nextState, options.note, {
      visibility: data.visibility,
      scheduledFor: data.scheduled_for,
    });
  }

  return { status: "ok" as const, item: await hydrateItem(data) };
}
