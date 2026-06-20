import type {
  DeveloperSpaceDetail,
  DeveloperSpaceEventPayload,
  DeveloperSpaceEvent,
  DeveloperSpaceNode,
  DeveloperSpaceNodeStatePayload,
  DeveloperSpaceObservedRuntimeContextPayload,
  DeveloperSpaceSnapshot,
  DeveloperSpaceSnapshotPayload,
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
  snapshots: DeveloperSpaceSnapshot[];
  latestSnapshot: DeveloperSpaceSnapshot | null;
  zones: Record<string, unknown>[];
  resources: Record<string, unknown>[];
  edges: Record<string, unknown>[];
  provenance: Record<string, unknown>;
  detail: Pick<DeveloperSpaceDetail, "nodes" | "events" | "latestSnapshot" | "linkedDocuments" | "access">;
}

export interface ObservedRuntimeDeveloperSpaceImportPayload {
  nodes: Array<DeveloperSpaceNodeStatePayload & { nodeId: string }>;
  events: DeveloperSpaceEventPayload[];
  snapshots: DeveloperSpaceSnapshotPayload[];
  supportingContext: DeveloperSpaceObservedRuntimeContextPayload[];
}

export interface ObservedRuntimeDeveloperSpaceBridge {
  route: "/developer-spaces/ingest/import";
  auth: {
    requiredHeader: "X-Station-Developer-Key";
    note: string;
  };
  importPayload: ObservedRuntimeDeveloperSpaceImportPayload;
  readbacks: {
    public: NormalizedObservedRuntimeReadback;
    member: NormalizedObservedRuntimeReadback;
    owner: NormalizedObservedRuntimeReadback;
  };
  unmapped: {
    zones: Record<string, unknown>[];
    resources: Record<string, unknown>[];
    edges: Record<string, unknown>[];
    provenance: Record<string, unknown>;
    reason: string;
  };
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

function payloadFieldClassifications(
  record: Record<string, unknown>,
  prefix: string,
  context: string
) {
  const classifications = fieldClassifications(record, context);
  const output: Record<string, Exclude<ObservedRuntimeFieldVisibility, "secret">> = {};
  for (const [path, visibility] of classifications) {
    const prefixWithDot = `${prefix}.`;
    if (!path.startsWith(prefixWithDot) || visibility === "secret") continue;
    output[path.slice(prefixWithDot.length)] = visibility;
  }
  return output;
}

function recordFieldClassifications(record: Record<string, unknown>, context: string) {
  const classifications = fieldClassifications(record, context);
  const output: Record<string, Exclude<ObservedRuntimeFieldVisibility, "secret">> = {};
  for (const [path, visibility] of classifications) {
    if (visibility === "secret") continue;
    output[path] = visibility;
  }
  return output;
}

function contextPayload(
  contextType: DeveloperSpaceObservedRuntimeContextPayload["contextType"],
  record: Record<string, unknown>,
  payload: Record<string, unknown>,
  context: string
): DeveloperSpaceObservedRuntimeContextPayload {
  return {
    contextType,
    externalId: typeof payload.id === "string" ? payload.id : undefined,
    sourceRef: `observed-runtime:${contextType}:${typeof payload.id === "string" ? payload.id : context}`,
    payload,
    fieldClassifications: recordFieldClassifications(record, context),
    provenance: "imported",
  };
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
    snapshots,
    latestSnapshot,
    zones: fixture.zones.map((zone, index) => filterRecord(zone, access, `fixture.zones[${index}]`)),
    resources: fixture.resources.map((resource, index) => filterRecord(resource, access, `fixture.resources[${index}]`)),
    edges: fixture.edges.map((edge, index) => filterRecord(edge, access, `fixture.edges[${index}]`)),
    provenance: filterRecord(fixture.provenance, access, "fixture.provenance"),
    detail,
  };
}

export function bridgeObservedRuntimeFixtureToDeveloperSpaceImport(
  input: unknown,
  options: {
    developerSpaceId?: string;
    observedAt?: string;
  } = {}
): ObservedRuntimeDeveloperSpaceBridge {
  const fixture = parseObservedRuntimeFixture(input);
  const publicReadback = normalizeObservedRuntimeFixture(fixture, { ...options, access: "public" });
  const memberReadback = normalizeObservedRuntimeFixture(fixture, { ...options, access: "member" });
  const ownerReadback = normalizeObservedRuntimeFixture(fixture, { ...options, access: "owner" });

  return {
    route: "/developer-spaces/ingest/import",
    auth: {
      requiredHeader: "X-Station-Developer-Key",
      note: "Dry-run payloads still use the existing Developer Space ingestion route and therefore require a valid ingestion key.",
    },
    importPayload: {
      nodes: ownerReadback.nodes.map((node, index) => ({
        nodeId: node.externalId,
        nodeName: node.nodeName,
        topologyType: node.topologyType,
        fragmentCount: node.fragmentCount,
        selfSimilarityScore: node.selfSimilarityScore,
        dimensionality: node.dimensionality,
        metrics: node.metrics,
        fieldClassifications: payloadFieldClassifications(fixture.nodes[index], "observations", `fixture.nodes[${index}]`),
        sourceRefs: [`observed-runtime:node:${node.externalId}`],
        provenance: "imported",
      })),
      events: ownerReadback.events.map((event, index) => ({
        eventType: event.eventType,
        eventLabel: event.eventLabel ?? undefined,
        nodeId: event.externalNodeId ?? undefined,
        eventData: event.eventData,
        fieldClassifications: payloadFieldClassifications(fixture.events[index], "data", `fixture.events[${index}]`),
        similarityScore: event.similarityScore,
        sourceRefs: event.sourceRefs,
        provenance: "imported",
        visibility: "public",
        occurredAt: event.occurredAt,
      })),
      snapshots: ownerReadback.snapshots.map((snapshot, index) => ({
        snapshotData: snapshot.snapshotData,
        fieldClassifications: payloadFieldClassifications(fixture.snapshots[index], "data", `fixture.snapshots[${index}]`),
        sourceRefs: snapshot.sourceRefs,
        provenance: "imported",
        visibility: "public",
        occurredAt: snapshot.occurredAt,
      })),
      supportingContext: [
        ...ownerReadback.zones.map((zone, index) =>
          contextPayload("zone", fixture.zones[index], zone, `fixture.zones[${index}]`)
        ),
        ...ownerReadback.resources.map((resource, index) =>
          contextPayload("resource", fixture.resources[index], resource, `fixture.resources[${index}]`)
        ),
        ...ownerReadback.edges.map((edge, index) =>
          contextPayload("edge", fixture.edges[index], edge, `fixture.edges[${index}]`)
        ),
        contextPayload("provenance", fixture.provenance, ownerReadback.provenance, "fixture.provenance"),
      ],
    },
    readbacks: {
      public: publicReadback,
      member: memberReadback,
      owner: ownerReadback,
    },
    unmapped: {
      zones: [],
      resources: [],
      edges: [],
      provenance: {},
      reason: "Zones, resources/economy, edges, and provenance now map to supportingContext entries through the existing Developer Space batch import route.",
    },
  };
}
