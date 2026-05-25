export interface DocumentRecord {
  id: string;
  authorUserId: string;
  spaceId: string;
  personaId?: string | null;
  title: string;
  slug: string;
  body: string;
  documentType: 'post' | 'constitution' | 'canon_note' | 'essay' | 'note' | 'manifesto';
  status: 'draft' | 'published' | 'archived';
  visibility: 'private' | 'unlisted' | 'community' | 'public' | 'members';
  commentsEnabled: boolean;
  provenanceType?: 'user_authored' | 'ai_assisted' | 'archive_import' | 'integrity_session' | 'persona_derived';
  sourceType?: 'manual' | 'canon' | 'integrity' | 'archive_file' | 'archive_import' | 'persona' | null;
  sourceId?: string | null;
  sourceLabel?: string | null;
  sourcePersonaId?: string | null;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
