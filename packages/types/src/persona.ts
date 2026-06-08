export type PersonaProvider = "platform" | "openai" | "anthropic" | "deepseek" | "gemini";
export type PersonaVisibility = "private" | "public";

export interface PersonaSummary {
  id: string;
  name: string;
  shortDescription?: string | null;
  visibility: PersonaVisibility;
  provider: PersonaProvider;
  avatarUrl?: string | null;
  sortOrder?: number;
  createdAt?: string;
}

export interface Persona extends PersonaSummary {
  ownerUserId: string;
  longDescription?: string | null;
  awakeningPrompt?: string | null;
  styleNotes?: string | null;
  updatedAt?: string;
}

export type PersonaLayerKey = "soul" | "body" | "faculty" | "skill" | "evolution";

export interface PersonaLayerProfile {
  personaId: string;
  ownerUserId: string;
  soul: Record<string, unknown>;
  body: Record<string, unknown>;
  faculty: Record<string, unknown>;
  skill: Record<string, unknown>;
  evolution: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type PersonaLifecycleEventType =
  | "created"
  | "wake"
  | "handoff_in"
  | "handoff_out"
  | "forked"
  | "integrity_check"
  | "layer_update"
  | "memory_graph_update";

export interface PersonaLifecycleEvent {
  id: string;
  personaId: string;
  ownerUserId: string;
  eventType: PersonaLifecycleEventType;
  eventLabel?: string | null;
  eventData: Record<string, unknown>;
  createdAt: string;
}

export interface PersonaHandoff {
  id: string;
  ownerUserId: string;
  fromPersonaId?: string | null;
  toPersonaId: string;
  conversationId?: string | null;
  summary: string;
  pendingTasks: unknown[];
  emotionalContext: Record<string, unknown>;
  continuityRefs: unknown[];
  status: "ready" | "consumed" | "archived";
  createdAt: string;
  consumedAt?: string | null;
}

export interface Conversation {
  id: string;
  personaId: string;
  title?: string | null;
  mode: "private" | "public";
  status?: "active" | "archived";
  archivedAt?: string | null;
  messageCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ConversationMessage {
  id: string;
  conversationId?: string;
  role: "system" | "user" | "assistant";
  content: string;
  providerUsed?: string | null;
  createdAt: string;
}

export type {
  ArchivedChatTranscript,
  ContinuityCandidate,
  ContinuityPublicationCandidate,
  ContinuityRecord,
  ContinuityRecordType,
  ContinuityRecordVisibility,
  ContinuitySourceRef,
  ContinuityTimelineItem,
  ContinuityVersion,
  CreateContinuityRecordInput,
  PersonaContextSummary,
} from "./continuity";

export interface MemoryItem {
  id: string;
  ownerUserId?: string;
  personaId: string;
  title?: string | null;
  content: string;
  summary?: string | null;
  sourceType: "chat" | "import" | "document" | "calibration" | "integrity_session" | "manual";
  relevanceWeight?: number;
  createdAt: string;
  updatedAt?: string;
}

export type MemoryGraphEdgeType =
  | "related_to"
  | "supports"
  | "contradicts"
  | "supersedes"
  | "extends"
  | "references";

export interface MemoryGraphNode {
  id: string;
  personaId: string;
  title?: string | null;
  summary?: string | null;
  sourceType: MemoryItem["sourceType"];
  relevanceWeight?: number;
  createdAt: string;
}

export interface MemoryGraphEdge {
  id: string;
  personaId: string;
  fromMemoryItemId: string;
  toMemoryItemId: string;
  edgeType: MemoryGraphEdgeType;
  confidence: number;
  note?: string | null;
  createdAt: string;
}

export interface MemoryGraph {
  nodes: MemoryGraphNode[];
  edges: MemoryGraphEdge[];
}

export type MemoryTrustLevel = "user_stated" | "agreed_upon" | "model_suggested" | "llm_extracted";
export type MemoryLifecycleStatus = "active" | "superseded" | "rejected" | "expired" | "quarantined";
export type OwnerMemoryScope = "shared_user_profile" | "working_style" | "preference" | "boundary" | "project_context";

export interface OwnerMemoryBlock {
  id: string;
  ownerUserId: string;
  title: string;
  content: string;
  scope: OwnerMemoryScope;
  trustLevel: MemoryTrustLevel;
  status: MemoryLifecycleStatus;
  confidence: number;
  sourceRefs: unknown[];
  createdAt: string;
  updatedAt: string;
}

export interface MemoryItemLifecycle {
  memoryItemId: string;
  ownerUserId: string;
  personaId: string;
  trustLevel: MemoryTrustLevel;
  status: MemoryLifecycleStatus;
  confidence: number;
  decayRate: number;
  reinforcementCount: number;
  lastReinforcedAt?: string | null;
  expiresAt?: string | null;
  supersededByMemoryItemId?: string | null;
  evidence: unknown[];
  createdAt: string;
  updatedAt: string;
}

export interface PersonaMemoryCycleState {
  personaId: string;
  ownerUserId: string;
  lastConsolidatedAt?: string | null;
  nextThresholdPct: 50 | 75 | 95;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PersonaMemoryBriefing {
  sharedBlocks: OwnerMemoryBlock[];
  cycleState: PersonaMemoryCycleState;
  activeMemories: Array<{
    id: string;
    personaId: string;
    title?: string | null;
    summary?: string | null;
    contentPreview: string;
    sourceType: MemoryItem["sourceType"];
    relevanceWeight?: number;
    createdAt: string;
    lifecycle?: MemoryItemLifecycle | null;
  }>;
  lifecycleCounts: Record<string, number>;
  trustCounts: Record<string, number>;
  edgeCounts: Record<string, number>;
}

export interface CanonItem {
  id: string;
  ownerUserId?: string;
  personaId: string;
  title?: string | null;
  content: string;
  sourceType: "chat" | "import" | "document" | "calibration" | "integrity_session" | "manual";
  priority?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PersonaFile {
  id: string;
  ownerUserId?: string;
  personaId: string;
  fileName: string;
  fileType?: string | null;
  fileSize?: number | null;
  storagePath: string;
  sourceType: "upload" | "import" | "calibration" | "generated";
  processed?: boolean;
  createdAt: string;
}

export interface ImportJob {
  id: string;
  ownerUserId?: string;
  personaId: string;
  kind: "file" | "chat";
  status: "queued" | "processing" | "completed" | "failed";
  sourceName: string;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CalibrationSession {
  id: string;
  ownerUserId: string;
  personaId?: string | null;
  sessionTitle?: string;
  transcript: string;
  extractedStyleNotes?: string;
  extractedPublicRules?: string;
  extractedPrivateRules?: string;
  extractedUncertaintyRules?: string;
  saveTarget: "persona" | "global" | "public_mode" | "other";
  createdAt: string;
  updatedAt: string;
}

export type IntegrityCluster = "identity" | "relationship" | "tone" | "continuity" | "boundaries" | "themes";
export type IntegritySessionType = "initial" | "periodic" | "migration" | "pre_publication" | "manual";
export type IntegritySessionStatus = "in_progress" | "completed" | "abandoned";
export type IntegrityTurnType = "anchor" | "follow_up" | "summary" | "confirmation";
export type IntegrityOutputType = "memory_candidate" | "canon_candidate" | "preference" | "boundary" | "theme";
export type IntegrityOutputStatus = "pending" | "accepted" | "rejected" | "edited";
export type IntegrityWrittenTo = "memory" | "canon" | "preference_profile";

export interface IntegritySession {
  id: string;
  ownerUserId: string;
  personaId: string;
  sessionType: IntegritySessionType;
  status: IntegritySessionStatus;
  clustersCovered: IntegrityCluster[];
  clustersPlanned: IntegrityCluster[];
  startedAt: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntegritySessionTurn {
  id: string;
  sessionId: string;
  ownerUserId: string;
  personaId: string;
  cluster: IntegrityCluster;
  question: string;
  answer?: string | null;
  turnType: IntegrityTurnType;
  createdAt: string;
}

export interface IntegritySessionOutput {
  id: string;
  sessionId: string;
  ownerUserId: string;
  personaId: string;
  outputType: IntegrityOutputType;
  content: string;
  status: IntegrityOutputStatus;
  editedContent?: string | null;
  writtenTo?: IntegrityWrittenTo | null;
  writtenTargetId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PersonaPreferenceProfile {
  id: string;
  ownerUserId: string;
  personaId: string;
  warmthLevel: "high" | "moderate" | "neutral";
  playfulness: "high" | "moderate" | "low";
  registerPreference: "mystical" | "balanced" | "grounded";
  depthPreference: "expansive" | "balanced" | "concise";
  challengePreference: "challenge" | "balanced" | "support";
  disclaimerSensitivity: "high" | "neutral" | "low";
  relationshipTone: string;
  recurringTopics: string[];
  toneNotes: string[];
  updatedAt: string;
}
