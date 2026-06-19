import type { DocumentProvenanceType, DocumentSourceType } from "@station/db";

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
