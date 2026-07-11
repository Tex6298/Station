
export type DiscussionProvenanceKind =
  | 'user_authored'
  | 'ai_assisted'
  | 'archive_import'
  | 'integrity_session'
  | 'persona_derived'
  | 'persona_linked';

export interface DiscussionProvenanceLabel {
  kind: DiscussionProvenanceKind;
  label: string;
  documentProvenanceType?: Exclude<DiscussionProvenanceKind, 'persona_linked'>;
  documentSourceType?: 'manual' | 'canon' | 'integrity' | 'archive_file' | 'archive_import' | 'persona' | 'publication' | null;
  sourcePersonaId?: string | null;
  linkedPersonaId?: string | null;
}

export type CommunityAuthorshipKind =
  | 'user_authored'
  | 'ai_assisted'
  | 'persona_authored'
  | 'imported'
  | 'derived'
  | 'unknown';

export type CommunityAuthorshipSourceType = 'ai' | 'persona' | 'import' | 'document' | 'system';

export interface CommunityAuthorshipProvenanceLabel {
  kind: CommunityAuthorshipKind;
  label: string;
  source_type?: CommunityAuthorshipSourceType | null;
  has_source?: boolean;
}

export interface ForumCategory {
  id: string;
  slug: string;
  title: string;
  description?: string;
  sortOrder: number;
}

export type SubcommunityType = 'general' | 'canon' | 'developer' | 'salon';
export type SubcommunityVisibility = 'public' | 'community' | 'unlisted' | 'private';
export type SubcommunityStatus = 'active' | 'paused' | 'archived';
export type SubcommunityModeratorRole = 'moderator';
export type SubcommunityModeratorStatus = 'active' | 'revoked';

export interface CommunitySubcommunityRecord {
  id: string;
  categoryId: string;
  slug: string;
  title: string;
  description?: string | null;
  type: SubcommunityType;
  visibility: SubcommunityVisibility;
  status: SubcommunityStatus;
  linkedSpaceId?: string | null;
  linkedDeveloperSpaceId?: string | null;
  ownerUserId?: string;
  viewerCanModerate?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunitySubcommunityModeratorRecord {
  id: string;
  subcommunityId: string;
  userId: string;
  role: SubcommunityModeratorRole;
  status: SubcommunityModeratorStatus;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  profile?: {
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
  } | null;
}

export interface ThreadRecord {
  id: string;
  categoryId: string;
  authorUserId: string;
  linkedSpaceId?: string | null;
  linkedPersonaId?: string | null;
  linkedDocumentId?: string | null;
  title: string;
  body: string;
  status: 'active' | 'locked' | 'removed';
  visibility?: 'public' | 'community' | 'unlisted';
  isPinned?: boolean;
  isHidden?: boolean;
  reportedCount?: number;
  voteCount?: number;
  hotScore?: number;
  lastActivityAt?: string;
  moderationState?: 'normal' | 'needs_review' | 'hidden' | 'removed';
  viewerVote?: -1 | 0 | 1;
  witnessCounts?: CommunityWitnessCounts;
  viewerWitnesses?: CommunityWitnessKind[];
  authorshipProvenance?: CommunityAuthorshipProvenanceLabel;
  discussionProvenance?: DiscussionProvenanceLabel;
  score: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentRecord {
  id: string;
  authorUserId: string;
  parentType: 'thread' | 'document' | 'space_page';
  parentId: string;
  body: string;
  status: 'active' | 'flagged' | 'removed';
  isPinned?: boolean;
  isHidden?: boolean;
  reportedCount?: number;
  voteCount?: number;
  moderationState?: 'normal' | 'needs_review' | 'hidden' | 'removed';
  viewerVote?: -1 | 0 | 1;
  witnessCounts?: CommunityWitnessCounts;
  viewerWitnesses?: CommunityWitnessKind[];
  authorshipProvenance?: CommunityAuthorshipProvenanceLabel;
  discussionProvenance?: DiscussionProvenanceLabel;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityUserProfile {
  userId: string;
  trustLevel: 0 | 1 | 2 | 3 | 4;
  reputationScore: number;
  threadCount: number;
  commentCount: number;
  helpfulVoteCount: number;
  reportCount: number;
  mutedUntil?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityModerationActionRecord {
  id: string;
  moderatorUserId: string;
  targetType: 'thread' | 'comment' | 'user';
  targetId: string;
  actionType: 'lock' | 'unlock' | 'pin' | 'unpin' | 'hide' | 'unhide' | 'remove' | 'restore' | 'mute' | 'unmute';
  reason?: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export type CommunityModerationSafetyAction = 'hide' | 'unhide' | 'remove' | 'restore';

export type CommunityNotificationType = 'thread_comment' | 'report_status' | 'review_request_status';
export type CommunityNotificationTargetType = 'thread' | 'comment' | 'moderation_report' | 'moderation_review_request';
export type CommunityWitnessKind = 'helpful' | 'grounded' | 'careful';
export type CommunityWitnessCounts = Record<CommunityWitnessKind, number>;

export interface CommunityThreadWatchRecord {
  id: string;
  userId: string;
  threadId: string;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityWitnessRecord {
  id: string;
  witnessUserId: string;
  targetType: 'thread' | 'comment';
  targetId: string;
  witnessKind: CommunityWitnessKind;
  revokedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityAuthorRecognitionRecord {
  targetType: 'thread' | 'comment';
  targetId: string;
  witnessCounts: CommunityWitnessCounts;
  targetContext: {
    title?: string | null;
    parentThreadId?: string | null;
    routeHref?: string | null;
    routeLabel?: string | null;
    canOpenRoute: boolean;
    createdAt?: string | null;
    updatedAt?: string | null;
  };
}

export interface CommunityNotificationRecord {
  id: string;
  type: CommunityNotificationType;
  targetType: CommunityNotificationTargetType;
  targetId: string;
  title: string;
  summary?: string | null;
  routeHref?: string | null;
  metadata: Record<string, unknown>;
  readAt?: string | null;
  createdAt: string;
}

export interface ModerationReportTargetContext {
  targetType: 'user' | 'space' | 'document' | 'thread' | 'comment' | 'persona' | 'persona_encounter_public_exhibit';
  targetId: string;
  title?: string | null;
  parentType?: 'thread' | 'document' | 'space_page' | null;
  parentId?: string | null;
  status?: string | null;
  visibility?: string | null;
  moderationState?: string | null;
  isHidden?: boolean | null;
  routeHref?: string | null;
  routeLabel?: string | null;
  canOpenRoute: boolean;
  unavailableReason?: string | null;
  supportedActions: Array<'hide' | 'unhide' | 'remove' | 'restore'>;
}

export interface ModerationReportRecord {
  id: string;
  reporterUserId: string;
  targetType: 'user' | 'space' | 'document' | 'thread' | 'comment' | 'persona' | 'persona_encounter_public_exhibit';
  targetId: string;
  reason: string;
  notes?: string | null;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  targetContext?: ModerationReportTargetContext | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReporterModerationReportRecord {
  id: string;
  targetType: 'user' | 'space' | 'document' | 'thread' | 'comment' | 'persona' | 'persona_encounter_public_exhibit';
  targetId: string;
  reason: string;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DelegatedModerationReportRecord {
  id: string;
  targetType: 'thread' | 'comment';
  targetId: string;
  reason: string;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  targetContext?: ModerationReportTargetContext | null;
  createdAt: string;
  updatedAt: string;
}

export type ModerationReviewRequestRole = 'reporter' | 'target_author';
export type ModerationReviewRequestStatus = 'open' | 'reviewing' | 'upheld' | 'denied' | 'dismissed' | 'withdrawn';

export interface ParticipantModerationReviewRequestRecord {
  id: string;
  requesterRole: ModerationReviewRequestRole;
  targetType: 'thread' | 'comment';
  targetId: string;
  reportId?: string | null;
  reason: string;
  status: ModerationReviewRequestStatus;
  resolutionSummary?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminModerationReviewRequestRecord extends ParticipantModerationReviewRequestRecord {
  requesterUserId: string;
  moderationActionId?: string | null;
  adminNotes?: string | null;
  reviewedBy?: string | null;
}

export interface DiscoverFeedItem {
  id: string;
  itemType: 'space' | 'persona' | 'document' | 'thread';
  eventType: 'created' | 'published' | 'updated' | 'featured';
  itemId: string;
  title: string;
  description?: string;
  href: string;
  createdAt: string;
}
