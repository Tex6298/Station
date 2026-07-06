export type PublicSeminarSourceType = "document" | "thread" | "space";
export type OwnerPublicSeminarRecordSourceType = "document";
export type OwnerPublicSeminarRecordStatus = "draft" | "ready" | "published" | "cancelled";
export type OwnerPublicSeminarRecordVisibility = "private" | "public";
export type OwnerPublicSeminarRecordTransitionTarget = "draft" | "ready" | "published";

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
  source: "discover_feed_featured" | "discover_feed_featured_and_durable_records";
  cards: PublicSeminarCard[];
  generatedAt: string;
}

export interface PublicSeminarDetailResponse {
  source: "public_seminar_detail";
  card: PublicSeminarCard;
  generatedAt: string;
}

export interface PublicSeminarsErrorResponse {
  error: string;
  code: "live_events_unavailable" | "seminar_not_found" | "seminar_interest_unavailable";
}

export interface PublicSeminarInterestResponse {
  card: PublicSeminarCard;
}

export interface OwnerPublicSeminarRecord {
  id: string;
  sourceType: OwnerPublicSeminarRecordSourceType;
  title: string;
  summary: string | null;
  status: OwnerPublicSeminarRecordStatus;
  visibility: OwnerPublicSeminarRecordVisibility;
  publicDocumentHref: string | null;
  publicSpace: {
    title: string;
    href: string;
  } | null;
  discussionLinked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerPublicSeminarRecordsResponse {
  records: OwnerPublicSeminarRecord[];
}

export interface OwnerPublicSeminarRecordResponse {
  record: OwnerPublicSeminarRecord;
}

export interface CreateOwnerPublicSeminarRecordRequest {
  sourceType: OwnerPublicSeminarRecordSourceType;
  sourceId: string;
}

export interface TransitionOwnerPublicSeminarRecordRequest {
  status: OwnerPublicSeminarRecordTransitionTarget;
}
