import { hasTier } from "@station/auth";
import type { AuthUser, CommunityAuthorRecognitionRecord, CommunityWitnessCounts } from "@station/types";

export type AuthorRecognitionState = "checking" | "signed-out" | "below-tier" | "eligible";

export function canReadAuthorRecognition(user: AuthUser | null | undefined) {
  return hasTier(user ?? null, "private");
}

export function authorRecognitionApiPath(limit = 50) {
  const boundedLimit = Math.min(100, Math.max(1, Math.trunc(limit)));
  return `/forums/witnesses/mine?limit=${boundedLimit}`;
}

export function authorRecognitionPagePath() {
  return "/forums/witnesses";
}

export function authorRecognitionKindLabel(targetType: CommunityAuthorRecognitionRecord["targetType"]) {
  return targetType === "comment" ? "Comment" : "Thread";
}

export function authorRecognitionLabel(recognition: CommunityAuthorRecognitionRecord) {
  const label = recognition.targetContext.routeLabel ?? recognition.targetContext.title;
  if (label) return label;
  return recognition.targetType === "comment" ? "Thread comment" : "Forum thread";
}

export function authorRecognitionHref(recognition: CommunityAuthorRecognitionRecord) {
  const href = recognition.targetContext.routeHref;
  if (!recognition.targetContext.canOpenRoute || !href?.startsWith("/forums/")) return null;
  return href;
}

export function normalizeRecognitionCounts(counts: Partial<CommunityWitnessCounts> | null | undefined): CommunityWitnessCounts {
  return {
    helpful: counts?.helpful ?? 0,
    grounded: counts?.grounded ?? 0,
    careful: counts?.careful ?? 0,
  };
}

export function recognitionCountItems(counts: Partial<CommunityWitnessCounts> | null | undefined) {
  const normalized = normalizeRecognitionCounts(counts);
  return [
    { key: "helpful" as const, label: "Helpful", value: normalized.helpful },
    { key: "grounded" as const, label: "Grounded", value: normalized.grounded },
    { key: "careful" as const, label: "Careful", value: normalized.careful },
  ].filter((item) => item.value > 0);
}

export function totalRecognitionCount(counts: Partial<CommunityWitnessCounts> | null | undefined) {
  const normalized = normalizeRecognitionCounts(counts);
  return normalized.helpful + normalized.grounded + normalized.careful;
}

export function sanitizeAuthorRecognitions(rows: unknown): CommunityAuthorRecognitionRecord[] {
  if (!Array.isArray(rows)) return [];

  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const source = row as Partial<CommunityAuthorRecognitionRecord>;
    if (!(source.targetType === "thread" || source.targetType === "comment")) return [];
    if (typeof source.targetId !== "string" || source.targetId.length === 0) return [];
    const context = source.targetContext;
    if (!context || typeof context !== "object") return [];

    return [{
      targetType: source.targetType,
      targetId: source.targetId,
      witnessCounts: normalizeRecognitionCounts(source.witnessCounts),
      targetContext: {
        title: typeof context.title === "string" ? context.title : null,
        parentThreadId: typeof context.parentThreadId === "string" ? context.parentThreadId : null,
        routeHref: typeof context.routeHref === "string" ? context.routeHref : null,
        routeLabel: typeof context.routeLabel === "string" ? context.routeLabel : null,
        canOpenRoute: context.canOpenRoute === true,
        createdAt: typeof context.createdAt === "string" ? context.createdAt : null,
        updatedAt: typeof context.updatedAt === "string" ? context.updatedAt : null,
      },
    }];
  });
}

export function authorRecognitionVisibleKeys(recognition: CommunityAuthorRecognitionRecord) {
  return Object.keys(recognition).sort();
}
