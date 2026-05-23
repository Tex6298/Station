export type DeveloperSpaceVisibility = "private" | "unlisted" | "community" | "public";
export type DeveloperSpaceVisualisationType = "node_field" | "timeline" | "world_map" | "constellation";
export type DeveloperSpaceTopologyType = "radial" | "branching" | "lattice" | "custom";
export type DeveloperSpaceEventVisibility = "private" | "community" | "public";
export type DeveloperSpaceEventProvenance = "api" | "imported" | "user" | "system" | "ai_generated";

export interface DeveloperSpaceRecord {
  id: string;
  ownerUserId: string;
  projectName: string;
  slug: string;
  description?: string | null;
  visibility: DeveloperSpaceVisibility;
  visualisationType: DeveloperSpaceVisualisationType;
  visualisationConfig: Record<string, unknown>;
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

export interface DeveloperSpaceDetail {
  space: DeveloperSpaceRecord;
  nodes: DeveloperSpaceNode[];
  events: DeveloperSpaceEvent[];
  latestSnapshot?: DeveloperSpaceSnapshot | null;
  access: "owner" | "member" | "public";
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
