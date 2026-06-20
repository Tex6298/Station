import type {
  DeveloperSpaceDetail,
  DeveloperSpaceEvent,
  DeveloperSpaceNode,
  DeveloperSpaceSnapshot,
  DeveloperSpaceTopologyType,
} from "@station/types/developer-space";

export type ObservedRuntimeFieldVisibility = "public" | "member" | "owner" | "private" | "secret";
export type ObservedRuntimeReadAccess = DeveloperSpaceDetail["access"];

export interface ObservedRuntimeFixture {
  schema: "station.observed_runtime.fixture.v1";
  source: Record<string, unknown>;
  nodes: Record<string, unknown>[];
  events: Record<string, unknown>[];
  snapshots: Record<string, unknown>[];
  zones: Record<string, unknown>[];
  resources: Record<string, unknown>[];
  edges: Record<string, unknown>[];
  provenance: Record<string, unknown>;
}

export interface NormalizedObservedRuntimeReadback {
  source: Record<string, unknown>;
  nodes: DeveloperSpaceNode[];
  events: DeveloperSpaceEvent[];
  latestSnapshot: DeveloperSpaceSnapshot | null;
  zones: Record<string, unknown>[];
  resources: Record<string, unknown>[];
  edges: Record<string, unknown>[];
  provenance: Record<string, unknown>;
  detail: Pick<DeveloperSpaceDetail, "nodes" | "events" | "latestSnapshot" | "linkedDocuments" | "access">;
}

const SCHEMA = "station.observed_runtime.fixture.v1";
const VISIBILITIES = new Set<ObservedRuntimeFieldVisibility>(["public", "member", "owner", "private", "secret"]);
const TOPOLOGIES = new Set<DeveloperSpaceTopologyType>(["radial", "branching", "lattice", "custom"]);
const SECRET_KEY_PATTERN = /(api[-_]?key|authorization|cookie|credential|password|prompt|raw|secret|token)/i;

function assertRecord(value: unknown, context: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${context} must be an object`);
  }
  return value as Record<string, unknown>;
}

function assertArray(value: unknown, context: string): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    throw new Error(`${context} must be an array`);
  }
  return value.map((item, index) => assertRecord(item, `${context}[${index}]`));
}

function fieldClassifications(record: Record<string, unknown>, context: string) {
  const classifications = assertRecord(record.fieldClassifications, `${context}.fieldClassifications`);
  const entries = Object.entries(classifications).map(([path, visibility]) => {
    if (!path || typeof visibility !== "string" || !VISIBILITIES.has(visibility as ObservedRuntimeFieldVisibility)) {
      throw new Error(`${context}.fieldClassifications has invalid visibility for ${path || "<empty>"}`);
    }
    if (SECRET_KEY_PATTERN.test(path) && visibility !== "secret") {
      throw new Error(`${context}.${path} must be classified as secret`);
    }
    return [path, visibility as ObservedRuntimeFieldVisibility] as const;
  });
  return new Map(entries);
}

function isAllowed(visibility: ObservedRuntimeFieldVisibility, access: ObservedRuntimeReadAccess) {
  if (visibility === "secret") return false;
  if (access === "owner") return true;
  if (visibility === "owner" || visibility === "private") return false;
  return visibility === "public" || (access === "member" && visibility === "member");
}

function pickScalar(value: unknown) {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

function filterNestedValue(
  value: unknown,
  classifications: Map<string, ObservedRuntimeFieldVisibility>,
  access: ObservedRuntimeReadAccess,
  context: string,
  prefix = ""
): unknown {
  if (Array.isArray(value)) {
    return value.map((item, index) => filterNestedValue(item, classifications, access, `${context}[${index}]`, prefix));
  }
  if (!value || typeof value !== "object") {
    const visibility = classifications.get(prefix);
    if (!visibility) throw new Error(`${context}.${prefix} is missing a field classification`);
    return isAllowed(visibility, access) ? value : undefined;
  }

  const output: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (SECRET_KEY_PATTERN.test(path) && classifications.get(path) !== "secret") {
      throw new Error(`${context}.${path} must be classified as secret`);
    }
    if (pickScalar(child)) {
      const visibility = classifications.get(path);
      if (!visibility) throw new Error(`${context}.${path} is missing a field classification`);
      if (isAllowed(visibility, access)) output[key] = child;
      continue;
    }
    const filtered = filterNestedValue(child, classifications, access, context, path);
    if (filtered !== undefined) output[key] = filtered;
  }
  return output;
}

function filterRecord(record: Record<string, unknown>, access: ObservedRuntimeReadAccess, context: string) {
  const classifications = fieldClassifications(record, context);
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (key === "fieldClassifications") continue;
    const filtered = filterNestedValue(value, classifications, access, context, key);
    if (filtered !== undefined) output[key] = filtered;
  }
  return output;
}

function stringValue(record: Record<string, unknown>, key: string, fallback: string) {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function numberValue(record: Record<string, unknown>, key: string, fallback = 0) {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function optionalNumberValue(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function topologyValue(value: unknown): DeveloperSpaceTopologyType {
  return typeof value === "string" && TOPOLOGIES.has(value as DeveloperSpaceTopologyType)
    ? value as DeveloperSpaceTopologyType
    : "custom";
}

function recordValue(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function parseObservedRuntimeFixture(input: unknown): ObservedRuntimeFixture {
  const fixture = assertRecord(input, "fixture");
  if (fixture.schema !== SCHEMA) throw new Error(`fixture.schema must be ${SCHEMA}`);
  const source = assertRecord(fixture.source, "fixture.source");
  if (source.runtimeHostedBy !== "external" || source.stationRole !== "observer") {
    throw new Error("fixture.source must describe Station as an observer of an external runtime");
  }

  return {
    schema: SCHEMA,
    source,
    nodes: assertArray(fixture.nodes, "fixture.nodes"),
    events: assertArray(fixture.events, "fixture.events"),
    snapshots: assertArray(fixture.snapshots, "fixture.snapshots"),
    zones: assertArray(fixture.zones, "fixture.zones"),
    resources: assertArray(fixture.resources, "fixture.resources"),
    edges: assertArray(fixture.edges, "fixture.edges"),
    provenance: assertRecord(fixture.provenance, "fixture.provenance"),
  };
}

export function normalizeObservedRuntimeFixture(
  input: unknown,
  options: {
    access?: ObservedRuntimeReadAccess;
    developerSpaceId?: string;
    observedAt?: string;
  } = {}
): NormalizedObservedRuntimeReadback {
  const fixture = parseObservedRuntimeFixture(input);
  const access = options.access ?? "public";
  const developerSpaceId = options.developerSpaceId ?? stringValue(fixture.source, "id", "observed-runtime-fixture");
  const observedAt = options.observedAt ?? stringValue(fixture.source, "observedAt", new Date(0).toISOString());

  const source = filterRecord(fixture.source, access, "fixture.source");
  const nodes = fixture.nodes.map((node, index) => {
    const filtered = filterRecord(node, access, `fixture.nodes[${index}]`);
    return {
      id: stringValue(filtered, "id", `observed-node-${index + 1}`),
      developerSpaceId,
      externalId: stringValue(filtered, "externalId", `external-node-${index + 1}`),
      nodeName: stringValue(filtered, "name", `Observed node ${index + 1}`),
      topologyType: topologyValue(filtered.topologyType),
      fragmentCount: numberValue(filtered, "fragmentCount"),
      selfSimilarityScore: optionalNumberValue(filtered, "selfSimilarityScore"),
      dimensionality: optionalNumberValue(filtered, "dimensionality"),
      metrics: recordValue(filtered, "observations"),
      lastEventAt: stringValue(filtered, "lastEventAt", observedAt),
      createdAt: observedAt,
      updatedAt: observedAt,
    } satisfies DeveloperSpaceNode;
  });

  const events = fixture.events.map((event, index) => {
    const filtered = filterRecord(event, access, `fixture.events[${index}]`);
    return {
      id: stringValue(filtered, "id", `observed-event-${index + 1}`),
      developerSpaceId,
      nodeId: null,
      externalNodeId: typeof filtered.externalNodeId === "string" ? filtered.externalNodeId : null,
      eventType: stringValue(filtered, "type", "observed_signal"),
      eventLabel: typeof filtered.label === "string" ? filtered.label : null,
      eventData: recordValue(filtered, "data"),
      similarityScore: numberValue(filtered, "similarityScore", 0),
      sourceRefs: Array.isArray(filtered.sourceRefs) ? filtered.sourceRefs.filter((ref): ref is string => typeof ref === "string") : [],
      provenance: "imported",
      visibility: "public",
      occurredAt: stringValue(filtered, "occurredAt", observedAt),
      createdAt: observedAt,
    } satisfies DeveloperSpaceEvent;
  });

  const snapshots = fixture.snapshots.map((snapshot, index) => {
    const filtered = filterRecord(snapshot, access, `fixture.snapshots[${index}]`);
    return {
      id: stringValue(filtered, "id", `observed-snapshot-${index + 1}`),
      developerSpaceId,
      snapshotData: recordValue(filtered, "data"),
      sourceRefs: Array.isArray(filtered.sourceRefs) ? filtered.sourceRefs.filter((ref): ref is string => typeof ref === "string") : [],
      provenance: "imported",
      visibility: "public",
      occurredAt: stringValue(filtered, "occurredAt", observedAt),
      createdAt: observedAt,
    } satisfies DeveloperSpaceSnapshot;
  });

  const latestSnapshot = snapshots.sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))[0] ?? null;
  const detail = {
    nodes,
    events,
    latestSnapshot,
    linkedDocuments: [],
    access,
  } satisfies Pick<DeveloperSpaceDetail, "nodes" | "events" | "latestSnapshot" | "linkedDocuments" | "access">;

  return {
    source,
    nodes,
    events,
    latestSnapshot,
    zones: fixture.zones.map((zone, index) => filterRecord(zone, access, `fixture.zones[${index}]`)),
    resources: fixture.resources.map((resource, index) => filterRecord(resource, access, `fixture.resources[${index}]`)),
    edges: fixture.edges.map((edge, index) => filterRecord(edge, access, `fixture.edges[${index}]`)),
    provenance: filterRecord(fixture.provenance, access, "fixture.provenance"),
    detail,
  };
}
