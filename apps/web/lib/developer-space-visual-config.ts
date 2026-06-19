import type {
  DeveloperSpacePublicFieldControls,
  DeveloperSpaceVisualisationType,
} from "@station/types/developer-space";

export type DeveloperSpaceVisualConfig = Record<string, unknown> & {
  publicFieldControls?: DeveloperSpacePublicFieldControls;
};

const DEFAULTS: Record<DeveloperSpaceVisualisationType, DeveloperSpaceVisualConfig> = {
  node_field: {
    maxNodes: 12,
    showMetrics: true,
  },
  timeline: {
    eventLimit: 8,
    nodeLimit: 8,
    showSnapshots: true,
  },
  world_map: {
    zoneField: "zone",
    maxZones: 9,
    staggerZones: true,
  },
  constellation: {
    maxNodes: 12,
    showEventCounts: true,
  },
};

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function boolValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function configKeyValue(value: unknown, fallback: string) {
  const key = stringValue(value, fallback);
  return /^[a-zA-Z0-9_.:-]{1,48}$/.test(key) ? key : fallback;
}

function publicFieldKey(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^[a-zA-Z0-9_.:-]{1,80}$/.test(trimmed)) return null;
  return trimmed;
}

function publicFieldKeyList(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const keys = value
    .map(publicFieldKey)
    .filter((key): key is string => Boolean(key));
  return [...new Set(keys)].slice(0, 32);
}

export function normaliseDeveloperSpacePublicFieldControls(input: unknown): DeveloperSpacePublicFieldControls | undefined {
  if (!input || typeof input !== "object" || Array.isArray(input)) return undefined;
  const candidate = input as Record<string, unknown>;
  const controls: DeveloperSpacePublicFieldControls = {};
  const nodeMetricKeys = publicFieldKeyList(candidate.nodeMetricKeys);
  const eventDataKeys = publicFieldKeyList(candidate.eventDataKeys);
  const snapshotDataKeys = publicFieldKeyList(candidate.snapshotDataKeys);
  if (nodeMetricKeys !== undefined) controls.nodeMetricKeys = nodeMetricKeys;
  if (eventDataKeys !== undefined) controls.eventDataKeys = eventDataKeys;
  if (snapshotDataKeys !== undefined) controls.snapshotDataKeys = snapshotDataKeys;
  return Object.keys(controls).length > 0 ? controls : undefined;
}

function withPublicFieldControls(
  base: DeveloperSpaceVisualConfig,
  config: DeveloperSpaceVisualConfig,
) {
  const publicFieldControls = normaliseDeveloperSpacePublicFieldControls(config.publicFieldControls);
  return publicFieldControls ? { ...base, publicFieldControls } : base;
}

export function defaultDeveloperSpaceVisualConfig(type: DeveloperSpaceVisualisationType) {
  return { ...DEFAULTS[type] };
}

export function normaliseDeveloperSpaceVisualConfig(
  type: DeveloperSpaceVisualisationType,
  config: DeveloperSpaceVisualConfig = {}
) {
  const defaults = defaultDeveloperSpaceVisualConfig(type);

  if (type === "node_field") {
    return withPublicFieldControls({
      maxNodes: clampNumber(config.maxNodes, Number(defaults.maxNodes), 4, 32),
      showMetrics: boolValue(config.showMetrics, Boolean(defaults.showMetrics)),
    }, config);
  }

  if (type === "timeline") {
    return withPublicFieldControls({
      eventLimit: clampNumber(config.eventLimit, Number(defaults.eventLimit), 3, 30),
      nodeLimit: clampNumber(config.nodeLimit, Number(defaults.nodeLimit), 3, 20),
      showSnapshots: boolValue(config.showSnapshots, Boolean(defaults.showSnapshots)),
    }, config);
  }

  if (type === "world_map") {
    return withPublicFieldControls({
      zoneField: configKeyValue(config.zoneField, String(defaults.zoneField)),
      maxZones: clampNumber(config.maxZones, Number(defaults.maxZones), 3, 24),
      staggerZones: boolValue(config.staggerZones, Boolean(defaults.staggerZones)),
    }, config);
  }

  return withPublicFieldControls({
    maxNodes: clampNumber(config.maxNodes, Number(defaults.maxNodes), 4, 32),
    showEventCounts: boolValue(config.showEventCounts, Boolean(defaults.showEventCounts)),
  }, config);
}
