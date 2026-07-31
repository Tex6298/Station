import type { InstitutionAccess } from "@station/types";

export const INSTITUTION_USERNAME_PATTERN = /^[A-Za-z0-9_-]{3,30}$/;

export function normaliseInstitutionUsername(value: string) {
  return value.trim();
}

export function isValidInstitutionUsername(value: string) {
  return INSTITUTION_USERNAME_PATTERN.test(normaliseInstitutionUsername(value));
}

export function institutionDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function institutionTeamPath(slug: string) {
  return `/institutions/${encodeURIComponent(slug)}/team`;
}

export function institutionInvitationPath(slug: string) {
  return `/institutions/${encodeURIComponent(slug)}/invitations`;
}

export function institutionInvitationActionPath(slug: string, action: "accept" | "decline") {
  return `/institutions/${encodeURIComponent(slug)}/invitation/${action}`;
}

export function institutionMemberRevokePath(slug: string) {
  return `/institutions/${encodeURIComponent(slug)}/members/revoke`;
}

export function institutionPublicationPath(slug: string) {
  return `/institutions/${encodeURIComponent(slug)}/publication`;
}

export function institutionProjectsPath(slug: string) {
  return `/institutions/${encodeURIComponent(slug)}/projects`;
}

export function suggestInstitutionProjectSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function institutionTeamRequestPlan(slug: string, _access: InstitutionAccess) {
  return [institutionTeamPath(slug)] as const;
}
