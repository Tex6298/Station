import type { DeveloperSpaceVisualisationType } from "@station/types/developer-space";

export type DeveloperSpaceVisualConfig = Record<string, unknown>;

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

export function defaultDeveloperSpaceVisualConfig(type: DeveloperSpaceVisualisationType) {
  return { ...DEFAULTS[type] };
}

export function normaliseDeveloperSpaceVisualConfig(
  type: DeveloperSpaceVisualisationType,
  config: DeveloperSpaceVisualConfig = {}
) {
  const defaults = defaultDeveloperSpaceVisualConfig(type);

  if (type === "node_field") {
    return {
      maxNodes: clampNumber(config.maxNodes, Number(defaults.maxNodes), 4, 32),
      showMetrics: boolValue(config.showMetrics, Boolean(defaults.showMetrics)),
    };
  }

  if (type === "timeline") {
    return {
      eventLimit: clampNumber(config.eventLimit, Number(defaults.eventLimit), 3, 30),
      nodeLimit: clampNumber(config.nodeLimit, Number(defaults.nodeLimit), 3, 20),
      showSnapshots: boolValue(config.showSnapshots, Boolean(defaults.showSnapshots)),
    };
  }

  if (type === "world_map") {
    return {
      zoneField: stringValue(config.zoneField, String(defaults.zoneField)),
      maxZones: clampNumber(config.maxZones, Number(defaults.maxZones), 3, 24),
      staggerZones: boolValue(config.staggerZones, Boolean(defaults.staggerZones)),
    };
  }

  return {
    maxNodes: clampNumber(config.maxNodes, Number(defaults.maxNodes), 4, 32),
    showEventCounts: boolValue(config.showEventCounts, Boolean(defaults.showEventCounts)),
  };
}
