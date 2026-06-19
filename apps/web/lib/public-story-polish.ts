export interface SpaceStoryStatsInput {
  authoredPageCount: number;
  documentCount: number;
  personaCount: number;
  discussionCount: number;
}

export interface SpaceStoryStat {
  label: string;
  value: string;
}

export function spaceStoryStats({
  authoredPageCount,
  documentCount,
  personaCount,
  discussionCount,
}: SpaceStoryStatsInput): SpaceStoryStat[] {
  const stats: SpaceStoryStat[] = [
    { label: documentCount === 1 ? "Work" : "Works", value: String(documentCount) },
  ];

  if (discussionCount > 0) {
    stats.push({ label: discussionCount === 1 ? "Discussion" : "Discussions", value: String(discussionCount) });
  }

  if (authoredPageCount > 0) {
    stats.push({ label: authoredPageCount === 1 ? "Page" : "Pages", value: String(authoredPageCount) });
  } else if (documentCount > 0) {
    stats.push({ label: "Story", value: "Works-led" });
  } else {
    stats.push({ label: "Pages", value: "Pending" });
  }

  if (personaCount > 0) {
    stats.push({ label: personaCount === 1 ? "Persona" : "Personas", value: String(personaCount) });
  } else if (documentCount > 0) {
    stats.push({ label: "Collaborators", value: "Optional" });
  } else {
    stats.push({ label: "Personas", value: "Pending" });
  }

  return stats.slice(0, 4);
}

export function publicSpaceHomeCopy({
  longDescription,
  shortDescription,
  hasDocuments,
}: {
  longDescription: string | null;
  shortDescription: string | null;
  hasDocuments: boolean;
}) {
  if (longDescription) return longDescription;
  if (shortDescription) return shortDescription;
  if (hasDocuments) {
    return "This Space is publishing through its works right now. Authored pages can be added later when the owner wants more context around the public story.";
  }
  return "This Space is still being shaped.";
}

export function publicPersonaEmptyCopy(hasDocuments: boolean) {
  return hasDocuments
    ? "This Space is led by its published works for now. Public personas can be added later when they help explain the story."
    : "No public personas are attached to this Space yet.";
}

export function discoverDiscussionCue({
  type,
  discussionThreadId,
}: {
  type: string;
  discussionThreadId?: string | null;
}) {
  if (type !== "document" || !discussionThreadId) return null;
  return "Open document and linked discussion";
}
