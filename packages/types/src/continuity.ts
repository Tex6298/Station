export type ContinuityRecordType =
  | "memory"
  | "canon"
  | "integrity"
  | "archive_file"
  | "archive_import"
  | "archived_chat"
  | "candidate"
  | "publication"
  | "timeline";

export type ContinuityRecordVisibility = "private" | "community" | "public";

export interface ContinuitySourceRef {
  table: string;
  id?: string | null;
  label?: string | null;
  version: number;
}

export interface ArchivedChatTranscript {
  id: string;
  conversationId: string;
  ownerUserId?: string;
  personaId: string;
  title: string;
  transcriptMarkdown: string;
  messageCount: number;
  sourceSummary?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ContinuityCandidate {
  id: string;
  archivedChatTranscriptId: string;
  ownerUserId?: string;
  personaId: string;
  candidateType: "memory" | "canon";
  title?: string | null;
  content: string;
  rationale?: string | null;
  status: "pending" | "accepted" | "rejected";
  sourceMessageIds?: string[];
  acceptedTargetType?: "memory" | "canon" | null;
  acceptedTargetId?: string | null;
  acceptedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ContinuityRecord {
  id: string;
  ownerUserId: string;
  personaId?: string | null;
  recordType: ContinuityRecordType;
  title?: string | null;
  body?: string | null;
  summary?: string | null;
  source?: ContinuitySourceRef | null;
  sourceTable?: string | null;
  sourceId?: string | null;
  sourceLabel?: string | null;
  sourceVersion: number;
  visibility: ContinuityRecordVisibility;
  version: number;
  metadata: Record<string, unknown>;
  occurredAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContinuityTimelineItem extends ContinuityRecord {
  recordType: ContinuityRecordType;
}

export interface ContinuityVersion {
  recordId: string;
  version: number;
  sourceVersion: number;
  createdAt: string;
}

export interface PersonaContextSummary {
  personaId: string;
  memoryCount: number;
  canonCount: number;
  archiveFileCount: number;
  archivedChatCount: number;
  continuityCandidateCount: number;
  integritySessionCount: number;
  continuityRecordCount: number;
}

export interface ContinuityPublicationCandidate {
  sourceType: "memory" | "canon" | "integrity" | "archive_file" | "archive_import" | "archived_chat" | "candidate";
  sourceId: string;
  personaId: string;
  title: string;
  summary?: string | null;
}

export interface CreateContinuityRecordInput {
  recordType?: ContinuityRecordType;
  title?: string;
  body?: string;
  summary?: string;
  source?: Partial<ContinuitySourceRef> | null;
  visibility?: ContinuityRecordVisibility;
  version?: number;
  metadata?: Record<string, unknown>;
  occurredAt?: string;
}
