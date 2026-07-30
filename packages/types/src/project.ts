import type {
  DeveloperSpaceDocumentLinkVisibility,
  DeveloperSpaceDocumentRole,
} from "./developer-space";
import type { DocumentRecord } from "./document";

export type ProjectVisibility = "private" | "unlisted" | "community" | "public";
export type ProjectConnectionTier = "tier_1_showcase" | "tier_2_hosted" | "tier_3_lab";

export interface ProjectOwnerAccess {
  role: "owner";
  readOnly: false;
}

export interface ProjectViewerAccess {
  role: "viewer";
  readOnly: true;
}

export type ProjectAccess = ProjectOwnerAccess | ProjectViewerAccess;

export interface ProjectCollaboratorIdentity {
  username: string;
  displayName: string | null;
}

export interface ProjectInvitation {
  project: {
    name: string;
    slug: string;
    description: string | null;
    visibility: ProjectVisibility;
  };
  owner: ProjectCollaboratorIdentity;
  role: "viewer";
  status: "invited";
  invitedAt: string;
  expiresAt: string;
}

export interface ProjectViewerMember extends ProjectCollaboratorIdentity {
  role: "viewer";
  status: "invited" | "active";
  invitedAt: string;
  expiresAt?: string;
  respondedAt?: string;
}

export interface SharedProjectSummary {
  name: string;
  slug: string;
  description: string | null;
  visibility: ProjectVisibility;
  createdAt: string;
  updatedAt: string;
  owner: ProjectCollaboratorIdentity;
  access: ProjectViewerAccess;
  publicHref: string | null;
}

export interface SharedProjectDeveloperSpaceSummary {
  projectName: string;
  slug: string;
  description: string | null;
  visibility: ProjectVisibility;
  visualisationType: "node_field" | "timeline" | "world_map" | "constellation";
  updatedAt: string;
  publicHref: string | null;
}

export interface SharedProjectEvidenceItem {
  developerSpace: {
    projectName: string;
    slug: string;
  };
  document: {
    title: string;
    documentType: DocumentRecord["documentType"];
    updatedAt: string;
    publishedAt?: string;
  };
  role: DeveloperSpaceDocumentRole;
  publicHref: string | null;
}

export interface SharedProjectDetailResponse {
  access: ProjectViewerAccess;
  owner: ProjectCollaboratorIdentity;
  project: Omit<SharedProjectSummary, "owner" | "access">;
  developerSpaces: SharedProjectDeveloperSpaceSummary[];
  evidence: SharedProjectEvidenceItem[];
}

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
