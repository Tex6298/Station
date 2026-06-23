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
export type DeveloperSpaceObservedRuntimeFieldVisibility = "public" | "member" | "owner" | "private" | "secret";
export type DeveloperSpaceObservedRuntimeContextType = "zone" | "resource" | "edge" | "provenance";
export type DeveloperSpaceIngestionKeyStatus = "active" | "revoked";
export type DeveloperSpaceWebhookSigningSecretStatus = "active" | "revoked";
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

export interface DeveloperSpaceObservedRuntimeContext {
  id: string;
  developerSpaceId: string;
  contextType: DeveloperSpaceObservedRuntimeContextType;
  externalId?: string | null;
  sourceRef?: string | null;
  payload: Record<string, unknown>;
  provenance: DeveloperSpaceEventProvenance;
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
  supportingContext?: DeveloperSpaceObservedRuntimeContext[];
  linkedDocuments: DeveloperSpaceLinkedDocument[];
  access: "owner" | "member" | "public";
}

export type DeveloperSpaceAgentAllowedAction =
  | "read_developer_space_brief"
  | "read_observed_runtime_status"
  | "read_provider_policy_posture"
  | "read_evidence_path"
  | "read_logs"
  | "draft_project_update";

export type DeveloperSpaceAgentFutureAction =
  | "publish_to_page"
  | "update_layout"
  | "push_to_repo"
  | "run_job"
  | "update_observatory"
  | "request_capability"
  | "save_project_update_draft"
  | "rotate_ingestion_key"
  | "create_webhook_signing_secret";

export type DeveloperSpaceAgentRegisteredAction =
  | DeveloperSpaceAgentAllowedAction
  | DeveloperSpaceAgentFutureAction;

export type DeveloperSpaceAgentActionStatus =
  | "previewed"
  | "requires_future_lane"
  | "unsupported_action";

export type DeveloperSpaceAgentConfirmationStatus =
  | "pending"
  | "approved"
  | "cancelled"
  | "expired";

export type DeveloperSpaceAgentExecutionReceiptStatus = "recorded";

export type DeveloperSpaceAgentExecutionReceiptAction =
  | "request_capability"
  | "save_project_update_draft"
  | "publish_to_page"
  | "update_observatory";

export type DeveloperSpaceAgentAuditExportAction =
  | DeveloperSpaceAgentExecutionReceiptAction
  | "update_layout"
  | "run_job";

export interface DeveloperSpaceAgentActionRegistryEntry {
  action: DeveloperSpaceAgentRegisteredAction;
  label: string;
  description: string;
  mode: "read" | "draft_preview" | "future";
  requiresConfirmation: boolean;
  futureLane: boolean;
}

export interface DeveloperSpaceAgentActionFact {
  label: string;
  value: string | number | boolean | null;
}

export interface DeveloperSpaceAgentActionItem {
  title: string;
  detail?: string | null;
  status?: string | null;
  href?: string | null;
}

export interface DeveloperSpaceAgentActionSection {
  title: string;
  summary?: string | null;
  facts?: DeveloperSpaceAgentActionFact[];
  items?: DeveloperSpaceAgentActionItem[];
}

export interface DeveloperSpaceAgentActionPreview {
  action: string;
  status: DeveloperSpaceAgentActionStatus;
  summary: string;
  sections: DeveloperSpaceAgentActionSection[];
  requiresConfirmation: boolean;
  futureLane: boolean;
}

export interface DeveloperSpaceAgentConfirmationRecord {
  id: string;
  developerSpaceId: string;
  ownerUserId: string;
  action: DeveloperSpaceAgentFutureAction;
  status: DeveloperSpaceAgentConfirmationStatus;
  summary: string;
  previewHash: string;
  sanitizedPayload: Record<string, unknown>;
  requestedAt: string;
  expiresAt: string;
  approvedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeveloperSpaceAgentExecutionReceiptRecord {
  action: DeveloperSpaceAgentExecutionReceiptAction;
  status: DeveloperSpaceAgentExecutionReceiptStatus;
  summary: string;
  receiptPayload: {
    action: DeveloperSpaceAgentExecutionReceiptAction;
    outcome:
      | "capability_request_recorded"
      | "private_draft_document_saved"
      | "draft_document_published"
      | "observatory_status_note_published";
    executionAvailable: boolean;
    mutationAvailable: boolean;
    externalDispatch: false;
    nextStep: string;
    boundaries: string[];
    capabilityRequest?: {
      category: string;
      categoryLabel: string;
      summary: string;
    };
    draftDocument?: {
      title: string;
      status: "draft";
      visibility: "private";
      linkVisibility: "owner";
      role: DeveloperSpaceDocumentRole;
    };
    publishedDocument?: {
      title: string;
      status: "published";
      visibility: "public";
      linkVisibility: "public";
      role: DeveloperSpaceDocumentRole;
      publishedAt?: string | null;
    };
    statusNote?: {
      note: string;
      eventType: string;
      eventLabel: string;
      visibility: "public";
      provenance: "user";
      occurredAt?: string | null;
    };
  };
  dispatchedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeveloperSpaceAgentLayoutSuggestion {
  currentVisualMode: DeveloperSpaceVisualisationType;
  currentVisualModeLabel: string;
  suggestedVisualMode: DeveloperSpaceVisualisationType;
  suggestedVisualModeLabel: string;
  beforeSummary: string;
  afterSummary: string;
  rationale: string;
  affectedPanelLabels: string[];
  affectedWidgetLabels: string[];
  boundaries: string[];
}

export interface DeveloperSpaceAgentRunJobReadiness {
  requestedTarget: string;
  targetLabel: string;
  recognized: boolean;
  readiness: "unready";
  prerequisites: string[];
  timeoutExpectation: string;
  retryExpectation: string;
  idempotencyExpectation: string;
  boundaries: string[];
  omittedFields: string[];
}

export type DeveloperSpaceAgentAuditExportArtifactType =
  | "capability_request"
  | "private_draft_document"
  | "published_document"
  | "observatory_status_note"
  | "layout_suggestion"
  | "run_job_readiness"
  | "none";

export interface DeveloperSpaceAgentAuditExportArtifact {
  type: DeveloperSpaceAgentAuditExportArtifactType;
  label: string;
  status?: string | null;
  visibility?: string | null;
  linkVisibility?: DeveloperSpaceDocumentLinkVisibility | null;
  role?: DeveloperSpaceDocumentRole | null;
  occurredAt?: string | null;
  publishedAt?: string | null;
  layoutSuggestion?: DeveloperSpaceAgentLayoutSuggestion;
  runJobReadiness?: DeveloperSpaceAgentRunJobReadiness;
}

export interface DeveloperSpaceAgentAuditExportItem {
  action: DeveloperSpaceAgentAuditExportAction;
  confirmationStatus: DeveloperSpaceAgentConfirmationStatus;
  requestedAt: string;
  expiresAt: string;
  approvedAt?: string | null;
  cancelledAt?: string | null;
  completedAt?: string | null;
  summary: string;
  receiptStatus: DeveloperSpaceAgentExecutionReceiptStatus | "missing" | "not_executable";
  receiptSummary?: string | null;
  artifact: DeveloperSpaceAgentAuditExportArtifact;
  idempotency: {
    retrySafe: boolean;
    receiptRecorded: boolean;
    repeatUsesExistingReceipt: boolean;
  };
  executionAvailable: boolean;
  mutationAvailable: boolean;
  externalDispatch: false;
  boundaries: string[];
  omittedFields: string[];
}

export interface DeveloperSpaceAgentAuditExport {
  generatedAt: string;
  scope: "owner_developer_space";
  actions: DeveloperSpaceAgentAuditExportAction[];
  omittedFields: string[];
  retention: {
    source: "developer_space_agent_confirmations_and_receipts";
    note: string;
  };
  items: DeveloperSpaceAgentAuditExportItem[];
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

export interface DeveloperSpaceWebhookSigningSecret {
  id: string;
  developerSpaceId: string;
  ownerUserId: string;
  fingerprint: string;
  lastFour: string;
  status: DeveloperSpaceWebhookSigningSecretStatus;
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
  fieldClassifications?: Record<string, DeveloperSpaceObservedRuntimeFieldVisibility>;
  sourceRefs?: string[];
  provenance?: DeveloperSpaceEventProvenance;
}

export interface DeveloperSpaceEventPayload {
  eventType: string;
  eventLabel?: string;
  nodeId?: string;
  eventData?: Record<string, unknown>;
  fieldClassifications?: Record<string, DeveloperSpaceObservedRuntimeFieldVisibility>;
  similarityScore?: number | null;
  sourceRefs?: string[];
  provenance?: DeveloperSpaceEventProvenance;
  visibility?: DeveloperSpaceEventVisibility;
  occurredAt?: string;
}

export interface DeveloperSpaceSnapshotPayload {
  snapshotData: Record<string, unknown>;
  fieldClassifications?: Record<string, DeveloperSpaceObservedRuntimeFieldVisibility>;
  sourceRefs?: string[];
  provenance?: DeveloperSpaceEventProvenance;
  visibility?: DeveloperSpaceEventVisibility;
  occurredAt?: string;
}

export interface DeveloperSpaceObservedRuntimeContextPayload {
  contextType: DeveloperSpaceObservedRuntimeContextType;
  externalId?: string;
  sourceRef?: string;
  payload: Record<string, unknown>;
  fieldClassifications?: Record<string, DeveloperSpaceObservedRuntimeFieldVisibility>;
  provenance?: DeveloperSpaceEventProvenance;
  occurredAt?: string;
}
