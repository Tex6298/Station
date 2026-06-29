import type { CommunityWitnessCounts, CommunityWitnessKind } from "@station/types";

export interface CommunityWitnessReadbackRow {
  kind: CommunityWitnessKind;
  label: string;
  value: number;
  description: string;
}

export interface CommunityRecognitionTrustRow {
  label: string;
  value: string;
  body: string;
}

export function communityWitnessKindLabel(kind: CommunityWitnessKind) {
  if (kind === "helpful") return "Helpful";
  if (kind === "grounded") return "Grounded";
  return "Careful";
}

export function communityWitnessKindDescription(kind: CommunityWitnessKind) {
  if (kind === "helpful") return "Useful to the discussion.";
  if (kind === "grounded") return "Supported by context or source material.";
  return "Considered and low-drama.";
}

export function communityWitnessReadbackRows(
  counts: Partial<CommunityWitnessCounts> | null | undefined
): CommunityWitnessReadbackRow[] {
  const normalized = normalizeTrustCounts(counts);
  return COMMUNITY_TRUST_WITNESS_KINDS.map((kind) => ({
    kind,
    label: communityWitnessKindLabel(kind),
    value: normalized[kind],
    description: communityWitnessKindDescription(kind),
  }));
}

export function communityWitnessTrustSummary(
  counts: Partial<CommunityWitnessCounts> | null | undefined
) {
  const total = communityWitnessTotal(counts);
  if (total === 0) return "No aggregate witness marks yet.";
  return `${total} aggregate ${total === 1 ? "witness mark" : "witness marks"}.`;
}

export function communityViewerWitnessSummary(viewerWitnesses: CommunityWitnessKind[] | null | undefined) {
  if (!viewerWitnesses?.length) {
    return "Only your own selected marks appear after sign-in.";
  }

  const labels = viewerWitnesses.map(communityWitnessKindLabel).join(", ");
  return `Your current marks: ${labels}.`;
}

export function communityTrustBoundaryCopy() {
  return "Witness marks are contribution-level acknowledgments, not public author scores, rankings, badges, or clout.";
}

export function authorRecognitionPrivateBoundaryCopy() {
  return "Private author recognition is visible only to the signed-in author and uses aggregate witness counts only.";
}

export function authorRecognitionTrustRows(input: {
  contributionCount: number;
  witnessMarkCount: number;
}): CommunityRecognitionTrustRow[] {
  return [
    {
      label: "Contributions shown",
      value: input.contributionCount.toLocaleString(),
      body: "Only your own forum threads and comments with witness marks are listed here.",
    },
    {
      label: "Marks received",
      value: input.witnessMarkCount.toLocaleString(),
      body: "Helpful, Grounded, and Careful marks are summed as aggregate readback.",
    },
    {
      label: "Privacy boundary",
      value: "Private",
      body: "Witnesser identities, reporter details, moderation notes, hidden bodies, and raw internal rows are not shown.",
    },
  ];
}

function communityWitnessTotal(counts: Partial<CommunityWitnessCounts> | null | undefined) {
  const normalized = normalizeTrustCounts(counts);
  return normalized.helpful + normalized.grounded + normalized.careful;
}

function normalizeTrustCounts(
  counts: Partial<CommunityWitnessCounts> | null | undefined
): CommunityWitnessCounts {
  return {
    helpful: counts?.helpful ?? 0,
    grounded: counts?.grounded ?? 0,
    careful: counts?.careful ?? 0,
  };
}

const COMMUNITY_TRUST_WITNESS_KINDS: CommunityWitnessKind[] = ["helpful", "grounded", "careful"];
