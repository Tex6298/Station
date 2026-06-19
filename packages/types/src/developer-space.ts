export type DeveloperSpaceVisibility = "private" | "unlisted" | "community" | "public";
export type DeveloperSpaceProviderPolicy =
  | "public_synthetic_only"
  | "public_context_allowed"
  | "private_archive_allowed"
  | "owner_byok_only"
  | "platform_allowed";
export type DeveloperSpaceVisualisationType = "node_field" | "timeline" | "world_map" | "constellation";
export type DeveloperSpaceTopologyType = "radial" | "branching" | "lattice" | "custom";
export type DeveloperSpaceEventVisibility = "private" | "community" | "public";
export type DeveloperSpaceEventProvenance = "api" | "imported" | "user" | "system" | "ai_generated";
export type DeveloperSpaceIngestionKeyStatus = "active" | "revoked";
export type DeveloperSpaceDocumentRole = "methodology" | "finding" | "field_log" | "note";
export type DeveloperSpaceDocumentLinkVisibility = "owner" | "public";
export type DeveloperSpaceWidgetType =
  | "visualisation"
  | "event_stream"
  | "reading_guide"
  | "project_notes"
  | "current_nodes"
  | "latest_snapshot";
export type DeveloperSpaceWidgetZone = "main" | "side";

export interface DeveloperSpaceWidgetConfig {
  id: string;
  type: DeveloperSpaceWidgetType;
  title: string;
  zone: DeveloperSpaceWidgetZone;
  position: number;
  visible: boolean;
}

export interface DeveloperSpacePublicFieldControls {
  nodeMetricKeys?: string[];
  eventDataKeys?: string[];
  snapshotDataKeys?: string[];
}

export interface DeveloperSpaceRecord {
  id: string;
  ownerUserId: string;
  projectName: string;
  slug: string;
  description?: string | null;
  projectId?: string | null;
  assignedProjectName?: string | null;
  assignedProjectSlug?: string | null;
  visibility: DeveloperSpaceVisibility;
  providerPolicy: DeveloperSpaceProviderPolicy;
  visualisationType: DeveloperSpaceVisualisationType;
  visualisationConfig: Record<string, unknown> & {
    widgets?: DeveloperSpaceWidgetConfig[];
    publicFieldControls?: DeveloperSpacePublicFieldControls;
  };
  apiKeyLastFour?: string | null;
  apiKeyCreatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeveloperSpaceNode {
  id: string;
  developerSpaceId: string;
  externalId: string;
  nodeName: string;
  topologyType: DeveloperSpaceTopologyType;
  fragmentCount: number;
  selfSimilarityScore?: number | null;
  dimensionality?: number | null;
  metrics: Record<string, unknown>;
  lastEventAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeveloperSpaceEvent {
  id: string;
  developerSpaceId: string;
  nodeId?: string | null;
  externalNodeId?: string | null;
  eventType: string;
  eventLabel?: string | null;
  eventData: Record<string, unknown>;
  similarityScore?: number | null;
  sourceRefs: string[];
  provenance: DeveloperSpaceEventProvenance;
  visibility: DeveloperSpaceEventVisibility;
  occurredAt: string;
  createdAt: string;
}

export interface DeveloperSpaceSnapshot {
  id: string;
  developerSpaceId: string;
  snapshotData: Record<string, unknown>;
  sourceRefs: string[];
  provenance: DeveloperSpaceEventProvenance;
  visibility: DeveloperSpaceEventVisibility;
  occurredAt: string;
  createdAt: string;
}

export interface DeveloperSpaceLinkedDocument {
  id: string;
  developerSpaceId: string;
  documentId: string;
  ownerUserId: string;
  role: DeveloperSpaceDocumentRole;
  linkVisibility: DeveloperSpaceDocumentLinkVisibility;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  document: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    documentType: string;
    status: string;
    visibility: string;
    publishedAt?: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface DeveloperSpaceUsageCounters {
  nodes: number;
  events: number;
  snapshots: number;
  storageBytes: number;
  publicReads: number;
  exports: number;
}

export interface DeveloperSpaceQuotaLimits extends DeveloperSpaceUsageCounters {}

export interface DeveloperSpaceUsage {
  developerSpaceId: string;
  ownerUserId: string;
  tier: string;
  counters: DeveloperSpaceUsageCounters;
  limits: DeveloperSpaceQuotaLimits;
  percentUsed: DeveloperSpaceUsageCounters;
  warningLevel: "ok" | "notice" | "warning" | "blocked";
  updatedAt?: string | null;
}

export interface DeveloperSpaceDetail {
  space: DeveloperSpaceRecord;
  nodes: DeveloperSpaceNode[];
  events: DeveloperSpaceEvent[];
  latestSnapshot?: DeveloperSpaceSnapshot | null;
  linkedDocuments: DeveloperSpaceLinkedDocument[];
  access: "owner" | "member" | "public";
}

export interface DeveloperSpaceFreshness {
  streamId: string;
  spaceUpdatedAt: string;
  latestNodeAt?: string | null;
  latestEventAt?: string | null;
  latestSnapshotAt?: string | null;
  emittedAt: string;
}

export interface DeveloperSpaceLiveUpdate {
  kind: "detail";
  detail: DeveloperSpaceDetail;
  freshness: DeveloperSpaceFreshness;
  emittedAt: string;
}

export interface DeveloperSpaceIngestionKey {
  id: string;
  developerSpaceId: string;
  ownerUserId: string;
  keyLastFour: string;
  label?: string | null;
  status: DeveloperSpaceIngestionKeyStatus;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string | null;
  revokedAt?: string | null;
}

export interface DeveloperSpaceNodeStatePayload {
  nodeName?: string;
  topologyType?: DeveloperSpaceTopologyType;
  fragmentCount?: number;
  selfSimilarityScore?: number | null;
  dimensionality?: number | null;
  metrics?: Record<string, unknown>;
  sourceRefs?: string[];
  provenance?: DeveloperSpaceEventProvenance;
}

export interface DeveloperSpaceEventPayload {
  eventType: string;
  eventLabel?: string;
  nodeId?: string;
  eventData?: Record<string, unknown>;
  similarityScore?: number | null;
  sourceRefs?: string[];
  provenance?: DeveloperSpaceEventProvenance;
  visibility?: DeveloperSpaceEventVisibility;
  occurredAt?: string;
}

export interface DeveloperSpaceSnapshotPayload {
  snapshotData: Record<string, unknown>;
  sourceRefs?: string[];
  provenance?: DeveloperSpaceEventProvenance;
  visibility?: DeveloperSpaceEventVisibility;
  occurredAt?: string;
}
