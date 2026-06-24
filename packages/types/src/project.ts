import type {
  DeveloperSpaceDocumentLinkVisibility,
  DeveloperSpaceDocumentRole,
} from "./developer-space";
import type { DocumentRecord } from "./document";

export interface ProjectEvidenceItem {
  id: string;
  developerSpace: {
    id: string;
    projectName: string;
    slug: string;
  };
  document: {
    id: string;
    title: string;
    slug: string;
    documentType: DocumentRecord["documentType"];
    status: DocumentRecord["status"];
    visibility: DocumentRecord["visibility"];
    provenanceType: NonNullable<DocumentRecord["provenanceType"]>;
    sourceLabel?: string | null;
    publishedAt?: string | null;
    createdAt: string;
    updatedAt: string;
  };
  role: DeveloperSpaceDocumentRole;
  linkVisibility: DeveloperSpaceDocumentLinkVisibility;
  sortOrder: number;
  linkedAt: string;
  updatedAt: string;
  routeHref?: string | null;
  routeLabel?: string | null;
}
