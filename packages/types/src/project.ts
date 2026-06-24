import type {
  DeveloperSpaceDocumentLinkVisibility,
  DeveloperSpaceDocumentRole,
} from "./developer-space";
import type { DocumentRecord } from "./document";

export interface ProjectEvidenceItem {
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

export interface PublicProjectDeveloperSpaceSummary {
  projectName: string;
  slug: string;
  description?: string | null;
  visibility: "public";
  visualisationType: "node_field" | "timeline" | "world_map" | "constellation";
  href: string;
  updatedAt: string;
}

export interface PublicProjectProfile {
  name: string;
  slug: string;
  description?: string | null;
  visibility: "public";
  createdAt: string;
  updatedAt: string;
  publicDeveloperSpaceCount: number;
}

export interface PublicProjectEvidenceItem {
  title: string;
  kind: string;
  href: string;
  sourceLabel: "Public Developer Space";
  publishedAt?: string | null;
  updatedAt: string;
}

export interface PublicProjectProfileResponse {
  project: PublicProjectProfile;
  developerSpaces: PublicProjectDeveloperSpaceSummary[];
  publicEvidence: PublicProjectEvidenceItem[];
}

export interface PublicProjectSearchResult {
  name: string;
  slug: string;
  description?: string | null;
  visibility: "public";
  href: string;
  type: "project";
  label: "Public Project";
}
