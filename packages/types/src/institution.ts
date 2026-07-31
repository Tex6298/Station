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
