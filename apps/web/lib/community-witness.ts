import { hasTier } from "@station/auth";
import type { AuthUser, CommunityWitnessCounts, CommunityWitnessKind } from "@station/types";
import { apiDelete, apiPut } from "./api-client";

export const COMMUNITY_WITNESS_KINDS: CommunityWitnessKind[] = ["helpful", "grounded", "careful"];

export type CommunityWitnessTargetType = "thread" | "comment";
export type CommunityWitnessAvailability = "signed-out" | "below-tier" | "self" | "eligible";

export interface CommunityWitnessSummary {
  witness_counts: CommunityWitnessCounts;
  viewer_witnesses?: CommunityWitnessKind[];
}

export interface WitnessableContribution {
  author_user_id?: string;
  authorUserId?: string;
  witness_counts?: Partial<CommunityWitnessCounts> | null;
  witnessCounts?: Partial<CommunityWitnessCounts> | null;
  viewer_witnesses?: CommunityWitnessKind[] | null;
  viewerWitnesses?: CommunityWitnessKind[] | null;
}

export function threadWitnessPath(threadId: string, kind: CommunityWitnessKind) {
  return `/threads/${threadId}/witness/${kind}`;
}

export function commentWitnessPath(commentId: string, kind: CommunityWitnessKind) {
  return `/comments/${commentId}/witness/${kind}`;
}

export function canUseCommunityWitness(user: AuthUser | null | undefined) {
  return hasTier(user ?? null, "private");
}

export function communityWitnessAvailability(
  user: AuthUser | null | undefined,
  target: WitnessableContribution
): CommunityWitnessAvailability {
  if (!user) return "signed-out";
  const authorUserId = target.author_user_id ?? target.authorUserId;
  if (authorUserId && user.id === authorUserId) return "self";
  if (!canUseCommunityWitness(user)) return "below-tier";
  return "eligible";
}

export function witnessAvailabilityLabel(availability: CommunityWitnessAvailability) {
  if (availability === "signed-out") return "Sign in to witness this contribution.";
  if (availability === "below-tier") return "Witnessing is available to private tier and above.";
  if (availability === "self") return "Own contribution";
  return "Witness this contribution";
}

export function normalizeWitnessCounts(
  counts: Partial<CommunityWitnessCounts> | null | undefined
): CommunityWitnessCounts {
  return {
    helpful: counts?.helpful ?? 0,
    grounded: counts?.grounded ?? 0,
    careful: counts?.careful ?? 0,
  };
}

export function getWitnessCounts(target: WitnessableContribution) {
  return normalizeWitnessCounts(target.witness_counts ?? target.witnessCounts);
}

export function getViewerWitnesses(target: WitnessableContribution): CommunityWitnessKind[] {
  return target.viewer_witnesses ?? target.viewerWitnesses ?? [];
}

export async function addThreadWitness(token: string, threadId: string, kind: CommunityWitnessKind) {
  return apiPut<{ witness: CommunityWitnessSummary }>(threadWitnessPath(threadId, kind), {}, token);
}

export async function removeThreadWitness(token: string, threadId: string, kind: CommunityWitnessKind) {
  return apiDelete<{ witness: CommunityWitnessSummary }>(threadWitnessPath(threadId, kind), token);
}

export async function addCommentWitness(token: string, commentId: string, kind: CommunityWitnessKind) {
  return apiPut<{ witness: CommunityWitnessSummary }>(commentWitnessPath(commentId, kind), {}, token);
}

export async function removeCommentWitness(token: string, commentId: string, kind: CommunityWitnessKind) {
  return apiDelete<{ witness: CommunityWitnessSummary }>(commentWitnessPath(commentId, kind), token);
}
