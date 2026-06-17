export const STATION_DOCUMENT_TYPES = [
  "essay",
  "codex",
  "manifesto",
  "field_log",
  "research",
  "archive_note",
  "transcript",
] as const;

export type StationDocumentType = typeof STATION_DOCUMENT_TYPES[number];

export const LEGACY_DOCUMENT_TYPE_MAP = {
  post: "essay",
  constitution: "codex",
  update: "field_log",
  other: "archive_note",
} as const satisfies Record<string, StationDocumentType>;

export type LegacyDocumentType = keyof typeof LEGACY_DOCUMENT_TYPE_MAP;
export type DocumentType = StationDocumentType;

export const STATION_DOCUMENT_TYPE_LABELS: Record<StationDocumentType | LegacyDocumentType, string> = {
  essay: "Essay",
  codex: "Codex",
  manifesto: "Manifesto",
  field_log: "Field Log",
  research: "Research Document",
  archive_note: "Archive Note",
  transcript: "Transcript",
  post: "Essay",
  constitution: "Codex",
  update: "Field Log",
  other: "Archive Note",
};

export function normalizeDocumentType(value: string): StationDocumentType | string {
  if ((STATION_DOCUMENT_TYPES as readonly string[]).includes(value)) return value as StationDocumentType;
  return LEGACY_DOCUMENT_TYPE_MAP[value as LegacyDocumentType] ?? value;
}

export interface DocumentRecord {
  id: string;
  authorUserId: string;
  spaceId?: string | null;
  personaId?: string | null;
  title: string;
  slug: string;
  body: string | null;
  documentType: StationDocumentType;
  status: 'draft' | 'published' | 'archived';
  visibility: 'private' | 'unlisted' | 'community' | 'public' | 'members';
  commentsEnabled: boolean;
  provenanceType?: 'user_authored' | 'ai_assisted' | 'archive_import' | 'integrity_session' | 'persona_derived';
  sourceType?: 'manual' | 'canon' | 'integrity' | 'archive_file' | 'archive_import' | 'persona' | null;
  sourceId?: string | null;
  sourceLabel?: string | null;
  sourcePersonaId?: string | null;
  discussionThreadId?: string | null;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
