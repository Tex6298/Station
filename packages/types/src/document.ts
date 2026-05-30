export interface DocumentRecord {
  id: string;
  authorUserId: string;
  spaceId?: string | null;
  personaId?: string | null;
  title: string;
  slug: string;
  body: string | null;
  documentType: 'post' | 'essay' | 'manifesto' | 'constitution' | 'update' | 'other';
  status: 'draft' | 'published' | 'archived';
  visibility: 'private' | 'unlisted' | 'community' | 'public' | 'members';
  commentsEnabled: boolean;
  provenanceType?: 'user_authored' | 'ai_assisted' | 'archive_import' | 'integrity_session' | 'persona_derived';
  sourceType?: 'manual' | 'canon' | 'integrity' | 'archive_file' | 'archive_import' | 'persona' | null;
  sourceId?: string | null;
  sourceLabel?: string | null;
  sourcePersonaId?: string | null;
  discussionThreadId?: string | null;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
