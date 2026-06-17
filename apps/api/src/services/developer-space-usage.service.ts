import type {
  DeveloperSpaceQuotaLimits,
  DeveloperSpaceUsage,
  DeveloperSpaceUsageCounters,
} from "@station/types";
import { getSupabaseAdmin } from "../lib/supabase";
import { assertQuotaAvailable } from "./operational-quota.service";

type UsageDelta = Partial<DeveloperSpaceUsageCounters>;

const ZERO_COUNTERS: DeveloperSpaceUsageCounters = {
  nodes: 0,
  events: 0,
  snapshots: 0,
  storageBytes: 0,
  publicReads: 0,
  exports: 0,
};

const QUOTA_LIMITS: Record<string, DeveloperSpaceQuotaLimits> = {
  visitor: { nodes: 0, events: 0, snapshots: 0, storageBytes: 0, publicReads: 0, exports: 0 },
  private: { nodes: 0, events: 0, snapshots: 0, storageBytes: 0, publicReads: 0, exports: 0 },
  creator: { nodes: 0, events: 0, snapshots: 0, storageBytes: 0, publicReads: 0, exports: 0 },
  canon: {
    nodes: 5_000,
    events: 100_000,
    snapshots: 10_000,
    storageBytes: 512 * 1024 * 1024,
    publicReads: 250_000,
    exports: 50,
  },
  institutional: {
    nodes: -1,
    events: -1,
    snapshots: -1,
    storageBytes: -1,
    publicReads: -1,
    exports: -1,
  },
};

function quotaForTier(tier?: string | null): DeveloperSpaceQuotaLimits {
  return QUOTA_LIMITS[tier ?? "visitor"] ?? QUOTA_LIMITS.visitor;
}

function usagePercent(used: number, limit: number) {
  if (limit < 0) return 0;
  if (limit <= 0) return used > 0 ? 100 : 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

function warningLevel(counters: DeveloperSpaceUsageCounters, limits: DeveloperSpaceQuotaLimits) {
  const percents = [
    usagePercent(counters.nodes, limits.nodes),
    usagePercent(counters.events, limits.events),
    usagePercent(counters.snapshots, limits.snapshots),
    usagePercent(counters.storageBytes, limits.storageBytes),
    usagePercent(counters.publicReads, limits.publicReads),
    usagePercent(counters.exports, limits.exports),
  ];
  const peak = Math.max(...percents);
  if (peak >= 100) return "blocked" as const;
  if (peak >= 90) return "warning" as const;
  if (peak >= 75) return "notice" as const;
  return "ok" as const;
}

function countersFromRow(row: any): DeveloperSpaceUsageCounters {
  return {
    nodes: Number(row?.ingested_nodes_count ?? 0),
    events: Number(row?.ingested_events_count ?? 0),
    snapshots: Number(row?.ingested_snapshots_count ?? 0),
    storageBytes: Number(row?.storage_bytes ?? 0),
    publicReads: Number(row?.public_detail_reads_count ?? 0),
    exports: Number(row?.export_count ?? 0),
  };
}

function serializeUsage(row: any, tier: string): DeveloperSpaceUsage {
  const counters = countersFromRow(row);
  const limits = quotaForTier(tier);
  return {
    developerSpaceId: row.developer_space_id,
    ownerUserId: row.owner_user_id,
    tier,
    counters,
    limits,
    percentUsed: {
      nodes: usagePercent(counters.nodes, limits.nodes),
      events: usagePercent(counters.events, limits.events),
      snapshots: usagePercent(counters.snapshots, limits.snapshots),
      storageBytes: usagePercent(counters.storageBytes, limits.storageBytes),
      publicReads: usagePercent(counters.publicReads, limits.publicReads),
      exports: usagePercent(counters.exports, limits.exports),
    },
    warningLevel: warningLevel(counters, limits),
    updatedAt: row.updated_at ?? null,
  };
}

async function loadOwnerTier(ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("profiles")
    .select("tier")
    .eq("id", ownerUserId)
    .single();
  return String(data?.tier ?? "visitor");
}

async function ensureUsageRow(space: { id: string; owner_user_id: string }) {
  const sb = getSupabaseAdmin();
  const { data: existing } = await sb
    .from("developer_space_usage")
    .select("*")
    .eq("developer_space_id", space.id)
    .single();

  if (existing) return existing;

  const { data: inserted, error } = await sb
    .from("developer_space_usage")
    .insert({
      developer_space_id: space.id,
      owner_user_id: space.owner_user_id,
      ingested_nodes_count: 0,
      ingested_events_count: 0,
      ingested_snapshots_count: 0,
      storage_bytes: 0,
      public_detail_reads_count: 0,
      export_count: 0,
    })
    .select("*")
    .single();

  if (error || !inserted) {
    throw new Error(error?.message ?? "Could not initialise Developer Space usage.");
  }

  return inserted;
}

export function estimateDeveloperSpaceStorageBytes(value: unknown) {
  return Buffer.byteLength(JSON.stringify(value ?? {}), "utf8");
}

export async function getDeveloperSpaceUsage(space: { id: string; owner_user_id: string }) {
  const [row, tier] = await Promise.all([
    ensureUsageRow(space),
    loadOwnerTier(space.owner_user_id),
  ]);
  return serializeUsage(row, tier);
}

export async function assertDeveloperSpaceUsageAvailable(
  space: { id: string; owner_user_id: string },
  delta: UsageDelta
) {
  const [current, tier] = await Promise.all([
    ensureUsageRow(space),
    loadOwnerTier(space.owner_user_id),
  ]);
  const counters = countersFromRow(current);
  const limits = quotaForTier(tier);

  assertQuotaAvailable({
    resource: "developer_space_nodes",
    limit: limits.nodes,
    used: counters.nodes,
    delta: delta.nodes ?? 0,
    message: "Developer Space node quota exceeded.",
  });
  assertQuotaAvailable({
    resource: "developer_space_events",
    limit: limits.events,
    used: counters.events,
    delta: delta.events ?? 0,
    message: "Developer Space event quota exceeded.",
  });
  assertQuotaAvailable({
    resource: "developer_space_snapshots",
    limit: limits.snapshots,
    used: counters.snapshots,
    delta: delta.snapshots ?? 0,
    message: "Developer Space snapshot quota exceeded.",
  });
  assertQuotaAvailable({
    resource: "developer_space_storage_bytes",
    limit: limits.storageBytes,
    used: counters.storageBytes,
    delta: delta.storageBytes ?? 0,
    message: "Developer Space storage quota exceeded.",
  });
  assertQuotaAvailable({
    resource: "developer_space_public_reads",
    limit: limits.publicReads,
    used: counters.publicReads,
    delta: delta.publicReads ?? 0,
    message: "Developer Space public-read quota exceeded.",
  });
  assertQuotaAvailable({
    resource: "developer_space_exports",
    limit: limits.exports,
    used: counters.exports,
    delta: delta.exports ?? 0,
    message: "Developer Space export quota exceeded.",
  });
}

export async function recordDeveloperSpaceUsage(
  space: { id: string; owner_user_id: string },
  delta: UsageDelta
) {
  const sb = getSupabaseAdmin();
  await assertDeveloperSpaceUsageAvailable(space, delta);
  const current = await ensureUsageRow(space);
  const next = {
    ingested_nodes_count: Number(current.ingested_nodes_count ?? 0) + (delta.nodes ?? 0),
    ingested_events_count: Number(current.ingested_events_count ?? 0) + (delta.events ?? 0),
    ingested_snapshots_count: Number(current.ingested_snapshots_count ?? 0) + (delta.snapshots ?? 0),
    storage_bytes: Number(current.storage_bytes ?? 0) + (delta.storageBytes ?? 0),
    public_detail_reads_count: Number(current.public_detail_reads_count ?? 0) + (delta.publicReads ?? 0),
    export_count: Number(current.export_count ?? 0) + (delta.exports ?? 0),
  };

  const { data: updated, error } = await sb
    .from("developer_space_usage")
    .update(next)
    .eq("developer_space_id", space.id)
    .select("*")
    .single();

  if (error || !updated) {
    throw new Error(error?.message ?? "Could not update Developer Space usage.");
  }

  const tier = await loadOwnerTier(space.owner_user_id);
  return serializeUsage(updated, tier);
}

export function zeroDeveloperSpaceUsage(
  space: { id: string; owner_user_id: string },
  tier = "visitor"
): DeveloperSpaceUsage {
  const limits = quotaForTier(tier);
  return {
    developerSpaceId: space.id,
    ownerUserId: space.owner_user_id,
    tier,
    counters: ZERO_COUNTERS,
    limits,
    percentUsed: {
      nodes: 0,
      events: 0,
      snapshots: 0,
      storageBytes: 0,
      publicReads: 0,
      exports: 0,
    },
    warningLevel: "ok",
    updatedAt: null,
  };
}
