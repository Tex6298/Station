import { getSupabaseAdmin } from "../lib/supabase";
import { invalidateOperationalCacheForChange } from "./operational-cache.service";

export type MemoryTrustLevel = "user_stated" | "agreed_upon" | "model_suggested" | "llm_extracted";
export type MemoryLifecycleStatus = "active" | "superseded" | "rejected" | "expired" | "quarantined";
export type OwnerMemoryScope = "shared_user_profile" | "working_style" | "preference" | "boundary" | "project_context";

export async function ensureMemoryLifecycle(input: {
  memoryItemId: string;
  ownerUserId: string;
  personaId: string;
  sourceType?: string | null;
}) {
  const sb = getSupabaseAdmin();
  const defaults = defaultsForSource(input.sourceType);

  const { data } = await (sb as any)
    .from("memory_item_lifecycle")
    .select("*")
    .eq("memory_item_id", input.memoryItemId)
    .eq("owner_user_id", input.ownerUserId)
    .maybeSingle();

  if (data) return data;

  const { data: created, error } = await (sb as any)
    .from("memory_item_lifecycle")
    .insert({
      memory_item_id: input.memoryItemId,
      owner_user_id: input.ownerUserId,
      persona_id: input.personaId,
      trust_level: defaults.trustLevel,
      confidence: defaults.confidence,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return created;
}

export async function updateMemoryLifecycle(input: {
  memoryItemId: string;
  ownerUserId: string;
  trustLevel?: MemoryTrustLevel;
  status?: MemoryLifecycleStatus;
  confidence?: number;
  decayRate?: number;
  expiresAt?: string | null;
  supersededByMemoryItemId?: string | null;
  evidence?: unknown[];
  reinforce?: boolean;
}) {
  const sb = getSupabaseAdmin();
  const payload: Record<string, unknown> = {};

  if (input.trustLevel !== undefined) payload.trust_level = input.trustLevel;
  if (input.status !== undefined) payload.status = input.status;
  if (input.confidence !== undefined) payload.confidence = input.confidence;
  if (input.decayRate !== undefined) payload.decay_rate = input.decayRate;
  if (input.expiresAt !== undefined) payload.expires_at = input.expiresAt;
  if (input.supersededByMemoryItemId !== undefined) {
    payload.superseded_by_memory_item_id = input.supersededByMemoryItemId;
  }
  if (input.evidence !== undefined) payload.evidence = input.evidence;
  if (input.reinforce) {
    payload.last_reinforced_at = new Date().toISOString();
  }

  const { data: current, error: currentError } = await (sb as any)
    .from("memory_item_lifecycle")
    .select("reinforcement_count")
    .eq("memory_item_id", input.memoryItemId)
    .eq("owner_user_id", input.ownerUserId)
    .maybeSingle();

  if (currentError) throw new Error(currentError.message);
  if (input.reinforce) payload.reinforcement_count = (current?.reinforcement_count ?? 0) + 1;

  const { data, error } = await (sb as any)
    .from("memory_item_lifecycle")
    .update(payload)
    .eq("memory_item_id", input.memoryItemId)
    .eq("owner_user_id", input.ownerUserId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  await invalidateOperationalCacheForChange({
    type: "memory",
    ownerUserId: input.ownerUserId,
    personaId: data.persona_id,
    resourceId: input.memoryItemId,
  }).catch(() => undefined);
  return data;
}

export async function listOwnerMemoryBlocks(ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("owner_memory_blocks")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(25);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createOwnerMemoryBlock(input: {
  ownerUserId: string;
  title: string;
  content: string;
  scope: OwnerMemoryScope;
  trustLevel: MemoryTrustLevel;
  confidence?: number;
  sourceRefs?: unknown[];
}) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("owner_memory_blocks")
    .insert({
      owner_user_id: input.ownerUserId,
      title: input.title,
      content: input.content,
      scope: input.scope,
      trust_level: input.trustLevel,
      confidence: input.confidence ?? 1,
      source_refs: input.sourceRefs ?? [],
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  await invalidateOperationalCacheForChange({
    type: "memory",
    ownerUserId: input.ownerUserId,
    resourceId: data.id,
    operation: "owner_memory",
  }).catch(() => undefined);
  return data;
}

export async function ensurePersonaMemoryCycleState(personaId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await (sb as any)
    .from("persona_memory_cycle_states")
    .select("*")
    .eq("persona_id", personaId)
    .eq("owner_user_id", ownerUserId)
    .maybeSingle();

  if (data) return data;

  const { data: created, error } = await (sb as any)
    .from("persona_memory_cycle_states")
    .insert({ persona_id: personaId, owner_user_id: ownerUserId })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return created;
}

export async function buildPersonaMemoryBriefing(personaId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const [sharedBlocks, cycleState, memoryResult, edgeResult] = await Promise.all([
    listOwnerMemoryBlocks(ownerUserId),
    ensurePersonaMemoryCycleState(personaId, ownerUserId),
    (sb as any)
      .from("memory_items")
      .select("id, persona_id, title, summary, content, source_type, relevance_weight, created_at")
      .eq("persona_id", personaId)
      .eq("owner_user_id", ownerUserId)
      .order("created_at", { ascending: false })
      .limit(50),
    (sb as any)
      .from("memory_item_edges")
      .select("edge_type")
      .eq("persona_id", personaId)
      .eq("owner_user_id", ownerUserId),
  ]);

  if (memoryResult.error) throw new Error(memoryResult.error.message);
  if (edgeResult.error) throw new Error(edgeResult.error.message);

  const lifecycleByMemoryId = await loadMemoryLifecycleByItemIds({
    memoryItemIds: (memoryResult.data ?? []).map((row: any) => row.id),
    ownerUserId,
    personaId,
  });
  const memories = (memoryResult.data ?? []).map((row: any) => ({
    ...row,
    lifecycle: lifecycleByMemoryId.get(row.id) ?? null,
  }));

  const activeMemories = memories.filter((row: any) => isMemoryLifecycleInjectable(row.lifecycle));
  const lifecycleCounts = memories.reduce((counts: Record<string, number>, row: any) => {
    const status = runtimeLifecycleStatus(row.lifecycle);
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, {});
  const trustCounts = memories.reduce((counts: Record<string, number>, row: any) => {
    const trust = row.lifecycle?.trust_level ?? defaultsForSource(row.source_type).trustLevel;
    counts[trust] = (counts[trust] ?? 0) + 1;
    return counts;
  }, {});
  const edgeCounts = (edgeResult.data ?? []).reduce((counts: Record<string, number>, row: any) => {
    counts[row.edge_type] = (counts[row.edge_type] ?? 0) + 1;
    return counts;
  }, {});

  return {
    sharedBlocks: sharedBlocks.map(serializeOwnerMemoryBlock),
    cycleState: serializeCycleState(cycleState),
    activeMemories: activeMemories.slice(0, 12).map(serializeBriefingMemory),
    lifecycleCounts,
    trustCounts,
    edgeCounts,
  };
}

export async function loadMemoryLifecycleByItemIds(input: {
  memoryItemIds: string[];
  ownerUserId: string;
  personaId: string;
}) {
  if (input.memoryItemIds.length === 0) return new Map<string, any>();

  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("memory_item_lifecycle")
    .select("*")
    .eq("owner_user_id", input.ownerUserId)
    .eq("persona_id", input.personaId)
    .in("memory_item_id", input.memoryItemIds);

  if (error) throw new Error(error.message);
  return new Map((data ?? []).map((row: any) => [row.memory_item_id, row]));
}

export function serializeOwnerMemoryBlock(row: any) {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    title: row.title,
    content: row.content,
    scope: row.scope,
    trustLevel: row.trust_level,
    status: row.status,
    confidence: Number(row.confidence ?? 0),
    sourceRefs: row.source_refs ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function serializeMemoryLifecycle(row: any) {
  if (!row) return row;
  return {
    memoryItemId: row.memory_item_id,
    ownerUserId: row.owner_user_id,
    personaId: row.persona_id,
    trustLevel: row.trust_level,
    status: row.status,
    confidence: Number(row.confidence ?? 0),
    decayRate: Number(row.decay_rate ?? 0),
    reinforcementCount: row.reinforcement_count ?? 0,
    lastReinforcedAt: row.last_reinforced_at,
    expiresAt: row.expires_at,
    supersededByMemoryItemId: row.superseded_by_memory_item_id,
    evidence: row.evidence ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function runtimeLifecycleStatus(row: any): MemoryLifecycleStatus {
  const status = (row?.status ?? "active") as MemoryLifecycleStatus;
  if (status !== "active") return status;
  if (row?.superseded_by_memory_item_id) return "superseded";
  if (!row?.expires_at) return "active";

  const expiresAt = Date.parse(row.expires_at);
  if (!Number.isNaN(expiresAt) && expiresAt <= Date.now()) return "expired";
  return "active";
}

export function isMemoryLifecycleInjectable(row: any) {
  return runtimeLifecycleStatus(row) === "active";
}

function serializeCycleState(row: any) {
  return {
    personaId: row.persona_id,
    ownerUserId: row.owner_user_id,
    lastConsolidatedAt: row.last_consolidated_at,
    nextThresholdPct: row.next_threshold_pct,
    settings: row.settings ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function serializeBriefingMemory(row: any) {
  return {
    id: row.id,
    personaId: row.persona_id,
    title: row.title,
    summary: row.summary,
    contentPreview: String(row.summary ?? row.content ?? "").slice(0, 300),
    sourceType: row.source_type,
    relevanceWeight: row.relevance_weight,
    createdAt: row.created_at,
    lifecycle: serializeMemoryLifecycle(row.lifecycle),
  };
}

function defaultsForSource(sourceType?: string | null): { trustLevel: MemoryTrustLevel; confidence: number } {
  if (sourceType === "manual") return { trustLevel: "user_stated", confidence: 1 };
  if (sourceType === "calibration" || sourceType === "integrity_session") {
    return { trustLevel: "agreed_upon", confidence: 0.9 };
  }
  if (sourceType === "chat") return { trustLevel: "model_suggested", confidence: 0.75 };
  return { trustLevel: "llm_extracted", confidence: 0.7 };
}
