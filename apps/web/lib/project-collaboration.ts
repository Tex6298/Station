import type { ProjectAccess, ProjectViewerMember } from "@station/types";

export const PROJECT_USERNAME_PATTERN = /^[A-Za-z0-9_-]{3,30}$/;

export interface ProjectAccessEnvelope {
  access: ProjectAccess;
}

export function normaliseProjectUsername(value: string) {
  return value.trim();
}

export function isValidProjectUsername(value: string) {
  return PROJECT_USERNAME_PATTERN.test(normaliseProjectUsername(value));
}

export function shouldLoadProjectOwnerResources(detail: ProjectAccessEnvelope) {
  return detail.access.role === "owner" && detail.access.readOnly === false;
}

export async function loadProjectThenOwnerResources<TDetail extends ProjectAccessEnvelope, TOwnerResources>(
  loadProject: () => Promise<TDetail>,
  loadOwnerResources: () => Promise<TOwnerResources>
) {
  const detail = await loadProject();
  if (!shouldLoadProjectOwnerResources(detail)) {
    return { detail, ownerResources: null };
  }

  return { detail, ownerResources: await loadOwnerResources() };
}

export function projectInvitationActionPath(slug: string, action: "accept" | "decline") {
  return `/projects/${encodeURIComponent(slug)}/invitation/${action}`;
}

export function projectInvitationPath(idOrSlug: string) {
  return `/projects/${encodeURIComponent(idOrSlug)}/invitations`;
}

export function projectMembersPath(idOrSlug: string) {
  return `/projects/${encodeURIComponent(idOrSlug)}/members`;
}

export function projectMemberRevokePath(idOrSlug: string) {
  return `/projects/${encodeURIComponent(idOrSlug)}/members/revoke`;
}

export function projectViewerMemberAction(member: Pick<ProjectViewerMember, "status">) {
  return member.status === "invited" ? "Cancel invitation" : "Revoke access";
}

export function projectCollaborationDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
