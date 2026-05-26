export interface ArchiveExportPackage {
  id: string;
  ownerUserId: string;
  personaId: string;
  packageKind: 'persona_archive';
  status: 'requested' | 'processing' | 'completed' | 'failed';
  format: 'json_markdown';
  includedSections: string[];
  contentSummary: Record<string, unknown>;
  errorMessage?: string | null;
  requestedAt: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArchiveExportManifest {
  schema: 'station.persona.export.v1';
  generatedAt: string;
  package: {
    id: string;
    status: string;
    format: string;
  };
  persona: Record<string, unknown>;
  counts: Record<string, number>;
  continuity: Record<string, unknown>;
  publishedDocumentRefs: Array<Record<string, unknown>>;
  trust: Record<string, unknown>;
}
