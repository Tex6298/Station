export interface ArchiveExportPackage {
  id: string;
  ownerUserId: string;
  personaId?: string | null;
  developerSpaceId?: string | null;
  packageKind: 'persona_archive' | 'developer_space_archive';
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

export interface DeveloperSpaceExportManifest {
  schema: 'station.developer_space.export.v1';
  generatedAt: string;
  package: {
    id: string;
    status: string;
    format: string;
  };
  privacy: Record<string, unknown>;
  space: Record<string, unknown>;
  counts: Record<string, number>;
  usage: Record<string, unknown>;
  nodes: Array<Record<string, unknown>>;
  events: Array<Record<string, unknown>>;
  snapshots: Array<Record<string, unknown>>;
  linkedPublicDocumentRefs: Array<Record<string, unknown>>;
  trust: Record<string, unknown>;
}

export interface ArchiveExportBundleFile {
  path: string;
  mediaType: string;
  bytes: number;
  sha256: string;
  content: string;
}

export interface ArchiveExportBundle {
  schema: 'station.export.bundle.v1';
  generatedAt: string;
  package: ArchiveExportPackage;
  privacy: Record<string, unknown>;
  integrity: {
    algorithm: 'sha256';
    fileCount: number;
    files: Record<string, string>;
  };
  files: ArchiveExportBundleFile[];
}
