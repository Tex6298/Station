import {
  publicDocumentHref,
  spaceForDocument,
  type PublishingDocument,
  type PublishingSpace,
} from "./publishing";

export interface SeminarHostReadinessCandidate {
  title: string;
  documentHref: string;
  spaceTitle: string;
  spaceHref: string;
  discussionLabel: string;
  detail: string;
}

export interface SeminarHostReadinessGap {
  id: "space" | "document" | "discussion";
  label: string;
  value: string;
  detail: string;
  tone: "ready" | "gap";
}

export interface SeminarHostReadinessReadback {
  label: string;
  summary: string;
  boundaryCopy: string;
  interactionCopy: string;
  candidates: SeminarHostReadinessCandidate[];
  gaps: SeminarHostReadinessGap[];
}

const MAX_CANDIDATES = 4;
const SAFE_ROUTE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_SHAPED_ROUTE_SLUG_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function seminarHostReadiness(
  documents: PublishingDocument[],
  spaces: PublishingSpace[],
): SeminarHostReadinessReadback {
  const publicSpaces = spaces.filter((space) => spaceIsPublic(space) && publicSpaceHref(space));
  const candidates = documents
    .map((document) => seminarCandidate(document, spaces))
    .filter((candidate): candidate is SeminarHostReadinessCandidate => Boolean(candidate))
    .slice(0, MAX_CANDIDATES);
  const linkedDiscussionCount = candidates.filter((candidate) =>
    candidate.discussionLabel === "Linked discussion metadata"
  ).length;

  return {
    label: "Seminar readiness",
    summary: candidates.length > 0
      ? `${formatCount(candidates.length, "candidate")} from public documents in public Spaces.`
      : "No seminar-ready public document candidates yet.",
    boundaryCopy: "Readback only. This panel checks public Station material and creates no new public action.",
    interactionCopy: "Audience interaction currently means existing public document discussion paths only.",
    candidates,
    gaps: [
      {
        id: "space",
        label: "Public Space",
        value: formatCount(publicSpaces.length, "public Space"),
        detail: publicSpaces.length > 0
          ? "A public Space can hold seminar-readable documents."
          : "Create or make a Space public before seminar source readback can be ready.",
        tone: publicSpaces.length > 0 ? "ready" : "gap",
      },
      {
        id: "document",
        label: "Public document",
        value: formatCount(candidates.length, "ready candidate"),
        detail: candidates.length > 0
          ? "Published public documents in public Spaces can become seminar candidates."
          : "Publish a public document into a public Space to create a candidate.",
        tone: candidates.length > 0 ? "ready" : "gap",
      },
      {
        id: "discussion",
        label: "Discussion metadata",
        value: formatCount(linkedDiscussionCount, "linked discussion"),
        detail: linkedDiscussionCount > 0
          ? "Linked discussion readiness is metadata-only in this panel."
          : "No linked discussion metadata is present on the ready candidates.",
        tone: linkedDiscussionCount > 0 ? "ready" : "gap",
      },
    ],
  };
}

function seminarCandidate(
  document: PublishingDocument,
  spaces: PublishingSpace[],
): SeminarHostReadinessCandidate | null {
  if (document.status !== "published") return null;
  if (document.visibility !== "public") return null;
  if (!document.space_id) return null;

  const space = spaceForDocument(document, spaces);
  if (!space || !spaceIsPublic(space)) return null;

  const documentHref = publicDocumentHref(document, spaces);
  const spaceHref = publicSpaceHref(space);
  if (!documentHref || !spaceHref) return null;

  return {
    title: safeSeminarReadbackText(document.title) || "Untitled public document",
    documentHref,
    spaceTitle: safeSeminarReadbackText(space.title) || "Public Space",
    spaceHref,
    discussionLabel: document.discussion_thread_id ? "Linked discussion metadata" : "No linked discussion metadata",
    detail: "Public document and public Space readback are ready.",
  };
}

function spaceIsPublic(space: PublishingSpace) {
  return space.is_public === true || space.isPublic === true;
}

function publicSpaceHref(space: PublishingSpace) {
  return safeRouteSegment(space.slug) ? `/space/${space.slug}` : null;
}

function safeRouteSegment(value: string) {
  return SAFE_ROUTE_SLUG_PATTERN.test(value) &&
    !UUID_SHAPED_ROUTE_SLUG_PATTERN.test(value);
}

function formatCount(count: number, singular: string) {
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}

function safeSeminarReadbackText(value?: string | null) {
  return (value ?? "")
    .replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .replace(/\b(?:ghp|sk|pk|rk|whsec)_[a-z0-9_=-]{8,}\b/gi, "[redacted-secret]")
    .replace(/\b(?:sk|pk|rk)-[a-z0-9][a-z0-9_-]{6,}\b/gi, "[redacted-secret]")
    .replace(/\bA(?:KIA|SIA)[A-Z0-9]{16}\b/gi, "[redacted-secret]")
    .replace(/\b(?:bearer)\s+\S+/gi, "bearer [redacted]")
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[redacted-id]")
    .replace(/\b(token|cookie|authorization|api[_\s-]?key|x-api-key|secret|password|source[_\s-]?id|owner[_\s-]?id)\b\s*[:=]\s*\S+/gi, "$1=[redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}
