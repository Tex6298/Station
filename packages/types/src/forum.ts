
export interface ForumCategory {
  id: string;
  slug: string;
  title: string;
  description?: string;
  sortOrder: number;
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
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface ModerationReportRecord {
  id: string;
  reporterUserId: string;
  targetType: 'user' | 'space' | 'document' | 'thread' | 'comment' | 'persona';
  targetId: string;
  reason: string;
  notes?: string | null;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
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
