import type { DocumentProvenanceType, DocumentSourceType } from "@station/db";

const COMMUNITY_AUTHORSHIP_LABELS: Record<string, string> = {
  user_authored: "User-authored",
  ai_assisted: "AI-assisted",
  persona_authored: "Persona-authored",
  imported: "Imported",
  derived: "Derived",
  unknown: "Community authorship",
};

const DOCUMENT_PROVENANCE_LABELS: Record<DocumentProvenanceType, string> = {
  user_authored: "User-authored",
  ai_assisted: "AI-assisted",
  archive_import: "Archive import",
  integrity_session: "Integrity Session",
  persona_derived: "Persona-derived",
};

type DiscussionProvenanceKind = DocumentProvenanceType | "persona_linked";

export interface DiscussionProvenanceLabel {
  kind: DiscussionProvenanceKind;
  label: string;
  document_provenance_type?: DocumentProvenanceType;
  document_source_type?: DocumentSourceType | null;
  source_persona_id?: string | null;
  linked_persona_id?: string | null;
}

export interface CommunityAuthorshipProvenanceLabel {
  kind: "user_authored" | "ai_assisted" | "persona_authored" | "imported" | "derived" | "unknown";
  label: string;
  source_type?: "ai" | "persona" | "import" | "document" | "system" | null;
  has_source?: boolean;
}

export function serializeCommunityAuthorshipProvenance(row: any): CommunityAuthorshipProvenanceLabel {
  const kind = safeCommunityAuthorshipKind(row?.authorship_kind);
  const sourceType = safeCommunityAuthorshipSourceType(row?.authorship_source_type);
  const hasSource = Boolean(sourceType || row?.authorship_source_id || row?.authorship_persona_id);
  const label = COMMUNITY_AUTHORSHIP_LABELS[kind] ?? COMMUNITY_AUTHORSHIP_LABELS.unknown;

  if (kind === "user_authored") return { kind, label };

  return {
    kind,
    label,
    ...(sourceType ? { source_type: sourceType } : {}),
    ...(hasSource ? { has_source: true } : {}),
  };
}

export function withCommunityAuthorshipProvenance<T extends Record<string, any>>(row: T): Omit<T, "authorship_kind" | "authorship_source_type" | "authorship_source_id" | "authorship_persona_id"> & { authorship_provenance: CommunityAuthorshipProvenanceLabel } {
  const payload = { ...row };
  delete payload.authorship_kind;
  delete payload.authorship_source_type;
  delete payload.authorship_source_id;
  delete payload.authorship_persona_id;
  return {
    ...payload,
    authorship_provenance: serializeCommunityAuthorshipProvenance(row),
  };
}

export function serializeThreadDiscussionProvenance(thread: any): DiscussionProvenanceLabel {
  const document = thread?.document;
  if (document?.provenance_type) {
    const kind = document.provenance_type as DocumentProvenanceType;
    return {
      kind,
      label: DOCUMENT_PROVENANCE_LABELS[kind] ?? "Document provenance",
      document_provenance_type: kind,
      document_source_type: document.source_type ?? null,
      source_persona_id: document.source_persona_id ?? null,
    };
  }

  if (thread?.linked_persona_id) {
    return {
      kind: "persona_linked",
      label: "Persona-linked",
      linked_persona_id: thread.linked_persona_id,
    };
  }

  return {
    kind: "user_authored",
    label: DOCUMENT_PROVENANCE_LABELS.user_authored,
  };
}

export function serializeCommentDiscussionProvenance(): DiscussionProvenanceLabel {
  return {
    kind: "user_authored",
    label: DOCUMENT_PROVENANCE_LABELS.user_authored,
  };
}

function safeCommunityAuthorshipKind(value: unknown): CommunityAuthorshipProvenanceLabel["kind"] {
  if (
    value === "user_authored" ||
    value === "ai_assisted" ||
    value === "persona_authored" ||
    value === "imported" ||
    value === "derived"
  ) {
    return value;
  }
  return "unknown";
}

function safeCommunityAuthorshipSourceType(
  value: unknown
): CommunityAuthorshipProvenanceLabel["source_type"] {
  if (
    value === "ai" ||
    value === "persona" ||
    value === "import" ||
    value === "document" ||
    value === "system"
  ) {
    return value;
  }
  return null;
}
