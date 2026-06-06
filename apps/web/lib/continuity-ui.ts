import type { ContinuityRecord, ContinuityRecordType } from "@station/types/continuity";

export interface ContinuityDocumentLink {
  id: string;
  title: string;
  status: string;
  visibility: string;
  source_label?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
}

export interface ContinuityConversationLink {
  id: string;
  title?: string | null;
  status?: "active" | "archived";
  message_count?: number;
  updated_at?: string | null;
  created_at?: string | null;
}

export interface ContinuitySourceOption {
  key: string;
  label: string;
  table: "documents" | "conversations";
  id: string;
  recordType: ContinuityRecordType;
  sourceLabel: string;
  sourceVersion: number;
}

const TYPE_LABELS: Record<ContinuityRecordType, string> = {
  memory: "Memory",
  canon: "Canon",
  integrity: "Integrity",
  archive_file: "Archive file",
  archive_import: "Archive import",
  archived_chat: "Archived chat",
  candidate: "Candidate",
  publication: "Publication",
  timeline: "Timeline",
};

export function continuityRecordTypeLabel(type: ContinuityRecordType) {
  return TYPE_LABELS[type] ?? "Continuity";
}

export function continuityRecordText(record: ContinuityRecord) {
  return record.summary || record.body || record.title || record.source?.label || record.sourceLabel || "Continuity marker";
}

export function continuityRecordTimestamp(record: ContinuityRecord) {
  return record.occurredAt || record.createdAt;
}

export function sortContinuityRecords(records: ContinuityRecord[]) {
  return [...records].sort((a, b) => {
    const left = Date.parse(continuityRecordTimestamp(a) ?? "") || 0;
    const right = Date.parse(continuityRecordTimestamp(b) ?? "") || 0;
    return right - left;
  });
}

export function buildContinuitySourceOptions(
  documents: ContinuityDocumentLink[],
  conversations: ContinuityConversationLink[]
): ContinuitySourceOption[] {
  const documentOptions = documents.map((document) => ({
    key: `document:${document.id}`,
    label: `Document: ${document.title}`,
    table: "documents" as const,
    id: document.id,
    recordType: "publication" as const,
    sourceLabel: document.source_label || `Document / ${document.visibility} / ${document.status}`,
    sourceVersion: 1,
  }));

  const conversationOptions = conversations.map((conversation) => {
    const archived = conversation.status === "archived";
    const title = conversation.title?.trim() || "Untitled conversation";
    return {
      key: `conversation:${conversation.id}`,
      label: `Conversation: ${title}`,
      table: "conversations" as const,
      id: conversation.id,
      recordType: archived ? "archived_chat" as const : "timeline" as const,
      sourceLabel: archived
        ? `Archived conversation / ${conversation.message_count ?? 0} messages`
        : "Active conversation",
      sourceVersion: Math.max(1, conversation.message_count ?? 1),
    };
  });

  return [...documentOptions, ...conversationOptions];
}
