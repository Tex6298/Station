import type { MemoryItemLifecycle, PersonaMemoryBriefing } from "@station/types/persona";

export type MemoryLifecycleDisplayStatus =
  | "active"
  | "quarantined"
  | "rejected"
  | "expired"
  | "superseded"
  | "missing_lifecycle";

export type MemoryLifecycleItemLike = {
  lifecycle?: MemoryItemLifecycle | null;
};

const STATUS_ORDER: MemoryLifecycleDisplayStatus[] = [
  "active",
  "quarantined",
  "rejected",
  "expired",
  "superseded",
  "missing_lifecycle",
];

export function memoryLifecycleDisplayStatus(
  lifecycle?: MemoryItemLifecycle | null,
  now = Date.now(),
): MemoryLifecycleDisplayStatus {
  if (!lifecycle) return "missing_lifecycle";
  if (lifecycle.status !== "active") return lifecycle.status;
  if (lifecycle.supersededByMemoryItemId) return "superseded";
  if (lifecycle.expiresAt) {
    const expiresAt = Date.parse(lifecycle.expiresAt);
    if (!Number.isNaN(expiresAt) && expiresAt <= now) return "expired";
  }
  return "active";
}

export function memoryLifecycleStatusLabel(status: MemoryLifecycleDisplayStatus) {
  if (status === "missing_lifecycle") return "Missing lifecycle";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function memoryRuntimeCopy(status: MemoryLifecycleDisplayStatus) {
  if (status === "active") {
    return "Eligible for runtime context.";
  }

  if (status === "missing_lifecycle") {
    return "Held out until lifecycle state is restored by the owner.";
  }

  return `Held out of runtime context while ${memoryLifecycleStatusLabel(status).toLowerCase()}.`;
}

export function memoryLifecycleCounters(
  items: MemoryLifecycleItemLike[],
  briefing?: PersonaMemoryBriefing | null,
) {
  const counts = Object.fromEntries(STATUS_ORDER.map((status) => [status, 0])) as Record<MemoryLifecycleDisplayStatus, number>;

  if (items.length > 0) {
    for (const item of items) {
      const status = memoryLifecycleDisplayStatus(item.lifecycle);
      counts[status] += 1;
    }
    return STATUS_ORDER.map((status) => ({
      status,
      label: memoryLifecycleStatusLabel(status),
      value: counts[status],
    }));
  }

  const sourceCounts = briefing?.lifecycleCounts ?? {};
  for (const status of STATUS_ORDER) {
    counts[status] = sourceCounts[status] ?? 0;
  }
  counts.missing_lifecycle =
    sourceCounts.missing_lifecycle
    ?? sourceCounts.missing
    ?? sourceCounts.missingLifecycle
    ?? counts.missing_lifecycle;

  return STATUS_ORDER.map((status) => ({
    status,
    label: memoryLifecycleStatusLabel(status),
    value: counts[status],
  }));
}

export function memoryLifecycleActions(lifecycle?: MemoryItemLifecycle | null) {
  const status = memoryLifecycleDisplayStatus(lifecycle);
  return {
    showRestore: status !== "active",
    showQuarantine: status !== "quarantined",
    showReject: status !== "rejected",
  };
}
