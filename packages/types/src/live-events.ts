export type PublicSeminarSourceType = "document" | "thread" | "space";

export interface PublicSeminarCard {
  id: string;
  sourceType: PublicSeminarSourceType;
  label: string;
  title: string;
  description: string | null;
  href: string;
  discussionHref: string | null;
  featuredAt: string;
  publishedAt: string | null;
  interestCount: number;
  viewerInterested?: boolean;
  space: {
    title: string;
    href: string;
  } | null;
}

export interface PublicSeminarsResponse {
  source: "discover_feed_featured";
  cards: PublicSeminarCard[];
  generatedAt: string;
}

export interface PublicSeminarsErrorResponse {
  error: string;
  code: "live_events_unavailable" | "seminar_not_found" | "seminar_interest_unavailable";
}

export interface PublicSeminarInterestResponse {
  card: PublicSeminarCard;
}
