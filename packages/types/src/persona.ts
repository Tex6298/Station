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

export interface ContinuityRecord {
  id: string;
  ownerUserId: string;
  personaId?: string | null;
  recordType: ContinuityRecordType;
  title?: string | null;
  body?: string | null;
  summary?: string | null;
  sourceTable?: string | null;
  sourceId?: string | null;
  sourceLabel?: string | null;
  visibility: "private" | "community" | "public";
  version: number;
  metadata: Record<string, unknown>;
  occurredAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

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
