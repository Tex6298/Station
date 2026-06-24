import type { ProjectEvidenceItem } from "@station/types";

const ROLE_LABELS: Record<ProjectEvidenceItem["role"], string> = {
  methodology: "Methodology",
  finding: "Finding",
  field_log: "Field log",
  note: "Note",
};

export function projectEvidenceCountLabel(count: number) {
  if (count === 0) return "No evidence";
  if (count === 1) return "1 evidence item";
  return `${count.toLocaleString("en-GB")} evidence items`;
}

export function projectEvidenceRoleLabel(role: ProjectEvidenceItem["role"]) {
  return ROLE_LABELS[role] ?? "Evidence";
}

export function projectEvidenceEmptyCopy() {
  return "No methodology, finding, field-log, or note documents are attached through this Project's Developer Spaces yet.";
}

export function projectEvidenceDate(item: ProjectEvidenceItem) {
  return item.document.publishedAt ?? item.document.updatedAt ?? item.updatedAt ?? item.linkedAt;
}

export function projectEvidenceRouteLabel(item: ProjectEvidenceItem) {
  return item.routeHref ? item.routeLabel ?? "Open" : null;
}
