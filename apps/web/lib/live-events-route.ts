import type { PublicSeminarCard } from "@station/types";

export type SeminarRouteStatus = "loading" | "ready" | "empty" | "unavailable";

export function publicSeminarsIntroCopy() {
  return "Curated public readbacks from published work, public discussions, and public Spaces.";
}

export function publicSeminarsEmptyCopy() {
  return "No public seminar readbacks are featured yet.";
}

export function publicSeminarsUnavailableCopy() {
  return "Public seminar readbacks are temporarily unavailable.";
}

export function publicSeminarSourceLabel(sourceType: PublicSeminarCard["sourceType"]) {
  if (sourceType === "document") return "Published readback";
  if (sourceType === "thread") return "Public discussion";
  return "Public Space";
}

export function publicSeminarsStatusCopy(status: SeminarRouteStatus) {
  if (status === "loading") return "Loading public readbacks...";
  if (status === "empty") return publicSeminarsEmptyCopy();
  if (status === "unavailable") return publicSeminarsUnavailableCopy();
  return "Public readbacks ready.";
}

export function publicSeminarCardHref(card: PublicSeminarCard) {
  return isSafeSeminarHref(card.href) ? card.href : null;
}

export function publicSeminarDetailHref(card: PublicSeminarCard) {
  return /^seminar_[a-f0-9]{16}$/.test(card.id) ? `/events/seminars/${card.id}` : null;
}

export function publicSeminarDiscussionHref(card: PublicSeminarCard) {
  return isSafeSeminarHref(card.discussionHref) ? card.discussionHref : null;
}

export function publicSeminarSpaceHref(card: PublicSeminarCard) {
  const space = card.space;
  return space && isSafeSeminarHref(space.href) ? space.href : null;
}

export function publicSeminarDetailIntroCopy() {
  return "Public readback for an already published seminar card.";
}

export function publicSeminarDetailUnavailableCopy() {
  return "This public seminar readback is temporarily unavailable.";
}

export function publicSeminarDetailNotFoundCopy() {
  return "This public seminar readback is not available.";
}

export function publicSeminarDateLabel(value: string | null | undefined) {
  if (!value) return "Featured";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Featured";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function publicSeminarInterestCountLabel(count: number) {
  if (!Number.isFinite(count) || count <= 0) return "No saved interest yet.";
  if (count === 1) return "1 interested member.";
  return `${count} interested members.`;
}

export function publicSeminarInterestActionLabel(card: PublicSeminarCard) {
  return card.viewerInterested ? "Withdraw interest" : "I'm interested";
}

export function publicSeminarViewerInterestCopy(interested?: boolean) {
  return interested ? "You are interested." : "Save interest for your account.";
}

export function publicSeminarSignInPromptCopy() {
  return "Sign in to save interest for your account.";
}

export function publicSeminarInterestSafetyCopy() {
  return "Interest is an account signal with aggregate count only. It is not a ticket, booking, waitlist, reminder, payment, or attendance guarantee.";
}

function isSafeSeminarHref(value: string | null | undefined) {
  if (!value) return false;
  return value.startsWith("/space/") || value.startsWith("/forums/");
}
