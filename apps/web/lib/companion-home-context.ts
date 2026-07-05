export interface CompanionHomeContextContinuity {
  memoryCount?: number | null;
  canonCount?: number | null;
  archiveFileCount?: number | null;
  archivedChatCount?: number | null;
  continuityCandidateCount?: number | null;
  continuityRecordCount?: number | null;
  integritySessionCount?: number | null;
}

export interface CompanionHomeContextInput {
  personaId: string;
  personaName?: string | null;
  longDescription?: string | null;
  awakeningPrompt?: string | null;
  styleNotes?: string | null;
  continuity?: CompanionHomeContextContinuity | null;
}

export interface CompanionHomeContextStop {
  label: "Memory" | "Inbox" | "Timeline" | "Canon" | "Archive/files" | "Profile" | "Integrity";
  href: string;
  countLabel: string;
  detail: string;
  emphasis?: boolean;
}

export interface CompanionHomeContextRail {
  title: string;
  brief: string;
  styleNotes: string | null;
  boundaryCopy: string;
  stops: CompanionHomeContextStop[];
}

const FALLBACK_BRIEF = "This persona does not have a long-form continuity brief yet.";

export function companionHomeContextRail(input: CompanionHomeContextInput): CompanionHomeContextRail {
  const base = `/studio/personas/${input.personaId}`;
  const continuity = input.continuity ?? {};
  const archiveFiles = countValue(continuity.archiveFileCount);
  const archivedChats = countValue(continuity.archivedChatCount);

  return {
    title: `${input.personaName?.trim() || "Persona"} context`,
    brief: cleanText(input.longDescription) || cleanText(input.awakeningPrompt) || FALLBACK_BRIEF,
    styleNotes: cleanText(input.styleNotes),
    boundaryCopy: "Owner-only links and aggregate counts. Runtime Context Preview remains the selected-source and prompt review surface.",
    stops: [
      {
        label: "Memory",
        href: `${base}/memory`,
        countLabel: formatCount(countValue(continuity.memoryCount), "memory item"),
        detail: "Recallable owner-reviewed context.",
      },
      {
        label: "Inbox",
        href: `${base}/memory-inbox`,
        countLabel: formatCount(countValue(continuity.continuityCandidateCount), "aggregate candidate"),
        detail: "Import-backed Memory and Canon review stop.",
        emphasis: true,
      },
      {
        label: "Timeline",
        href: `${base}/continuity`,
        countLabel: formatCount(countValue(continuity.continuityRecordCount), "continuity record"),
        detail: "Owner-only continuity markers.",
      },
      {
        label: "Canon",
        href: `${base}/canon`,
        countLabel: formatCount(countValue(continuity.canonCount), "canon item"),
        detail: "Higher-priority rules and commitments.",
      },
      {
        label: "Archive/files",
        href: `${base}/files`,
        countLabel: `${formatCount(archiveFiles, "file")} / ${formatCount(archivedChats, "archived chat")}`,
        detail: "Private source intake and preserved chats.",
      },
      {
        label: "Profile",
        href: `${base}/edit`,
        countLabel: "Owner settings",
        detail: "Identity, visibility, and public fields.",
      },
      {
        label: "Integrity",
        href: `${base}/calibration`,
        countLabel: formatCount(countValue(continuity.integritySessionCount), "integrity session"),
        detail: "Guided checks and history.",
      },
    ],
  };
}

function countValue(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.trunc(value));
}

function formatCount(count: number, singular: string) {
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}

function cleanText(value: string | null | undefined) {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized || null;
}
