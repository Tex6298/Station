import type { InstitutionProjectSummary } from "./project";

export type InstitutionVerificationStatus = "unverified" | "verified" | "revoked";
export type InstitutionPublicStatus = "private" | "public";
export type InstitutionMemberStatus = "invited" | "active" | "removed";

export interface InstitutionIdentity {
  username: string;
  displayName: string | null;
}

export interface InstitutionOwnerAccess {
  role: "owner";
  readOnly: false;
  canManageTeam: true;
  canManagePublication: true;
}

export interface InstitutionMemberAccess {
  role: "member";
  readOnly: true;
  canManageTeam: false;
  canManagePublication: false;
}

export type InstitutionAccess = InstitutionOwnerAccess | InstitutionMemberAccess;

export interface InstitutionSummary {
  name: string;
  slug: string;
  summary: string | null;
  verificationStatus: InstitutionVerificationStatus;
  publicStatus: InstitutionPublicStatus;
  publicHref: string | null;
  access: InstitutionAccess;
}

export interface InstitutionInvitation {
  institution: Omit<InstitutionSummary, "access">;
  owner: InstitutionIdentity;
  role: "member";
  status: "invited";
  invitedAt: string;
  expiresAt: string;
}

export interface InstitutionTeamPrincipal extends InstitutionIdentity {
  role: "owner";
  status: "active";
}

export interface InstitutionTeamMember extends InstitutionIdentity {
  role: "member";
  status: "invited" | "active";
  invitedAt: string;
  expiresAt?: string;
  respondedAt?: string;
}

export interface InstitutionTeamResponse {
  institution: InstitutionSummary;
  owner: InstitutionTeamPrincipal;
  members: InstitutionTeamMember[];
  projects: InstitutionProjectSummary[];
}

export interface InstitutionAdminSummary {
  name: string;
  slug: string;
  summary: string | null;
  verificationStatus: InstitutionVerificationStatus;
  publicStatus: InstitutionPublicStatus;
  publicHref: string | null;
  owner: InstitutionIdentity;
  verifiedAt: string | null;
  verificationRevokedAt: string | null;
  publishedAt: string | null;
  unpublishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicInstitutionResponse {
  institution: {
    name: string;
    slug: string;
    summary: string | null;
    verified: true;
  };
}

export type InstitutionPublicationDocumentType = "article" | "research" | "report" | "note";
export type InstitutionPublicationStatus = "draft" | "published";

export interface InstitutionPublicationSummary {
  title: string;
  slug: string;
  summary: string;
  documentType: InstitutionPublicationDocumentType;
  status: InstitutionPublicationStatus;
  visibility: "private" | "public";
  version: number;
  creatorLabel: string;
  lastEditorLabel: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  publicHref: string | null;
  institution: { name: string; slug: string; href: string | null };
  project: { name: string; slug: string; href: string };
  access: { role: "institution_owner" | "institution_member"; readOnly: boolean; canPublish: boolean; canRetract: boolean };
}

export interface InstitutionPublicationDetail extends InstitutionPublicationSummary {
  body: string;
}

export interface PublicInstitutionPublicationResponse {
  publication: {
    title: string; slug: string; summary: string; body: string;
    documentType: InstitutionPublicationDocumentType; publishedAt: string;
    creatorLabel: string; lastEditorLabel: string;
    institution: { name: string; slug: string; href: string };
    project: { name: string; slug: string; href: string };
  };
}
