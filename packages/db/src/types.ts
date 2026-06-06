/**
 * Supabase Database type definitions - mirrors infra/supabase/migrations.
 * Keeping this hand-authored for now. You can replace with `supabase gen types`
 * once your project is connected: `npx supabase gen types typescript --project-id <id>`
 */

export type Tier = "visitor" | "private" | "creator" | "canon" | "institutional";
export type AiMode = "platform" | "byok";
export type Visibility = "private" | "public";
export type DocumentVisibility = "private" | "unlisted" | "community" | "public" | "members";
export type DocumentStatus = "draft" | "published" | "archived";
export type DocumentType = "post" | "essay" | "manifesto" | "constitution" | "update" | "other";
export type DocumentProvenanceType = "user_authored" | "ai_assisted" | "archive_import" | "integrity_session" | "persona_derived";
export type DocumentSourceType = "manual" | "canon" | "integrity" | "archive_file" | "archive_import" | "persona";
export type Provider = "platform" | "openai" | "anthropic" | "deepseek" | "gemini";
export type SourceType = "chat" | "import" | "document" | "calibration" | "integrity_session" | "manual";
export type ConversationStatus = "active" | "archived";
export type ContinuityCandidateType = "memory" | "canon";
export type ContinuityCandidateStatus = "pending" | "accepted" | "rejected";
export type ContinuityRecordType = "memory" | "canon" | "integrity" | "archive_file" | "archive_import" | "archived_chat" | "candidate" | "publication" | "timeline";
export type ContinuityRecordVisibility = "private" | "community" | "public";
export type PersonaFileSourceType = "upload" | "import" | "calibration" | "generated";
export type ImportJobKind = "file" | "chat";
export type ImportJobStatus = "queued" | "processing" | "completed" | "failed";
export type CalibrationSaveTarget = "persona" | "global" | "public_mode" | "other";
export type SpacePageType = "home" | "about" | "personas" | "documents" | "custom";
export type ThreadStatus = "active" | "locked" | "removed";
export type ThreadVisibility = "public" | "community" | "unlisted";
export type CommentParentType = "thread" | "document" | "space_page";
export type CommentStatus = "active" | "removed" | "flagged";
export type ModerationTargetType = "user" | "space" | "document" | "thread" | "comment" | "persona";
export type ModerationStatus = "open" | "reviewing" | "resolved" | "dismissed";
export type DiscoverItemType = "document" | "thread" | "space" | "persona";
export type DiscoverEventType = "published" | "created" | "featured" | "updated";
export type SocialPlatform = "bluesky" | "mastodon" | "tumblr" | "linkedin" | "wordpress" | "ghost" | "reddit";
export type SocialPostStatus = "pending" | "sent" | "failed" | "scheduled";
export type DeveloperSpaceVisibility = "private" | "unlisted" | "community" | "public";
export type DeveloperSpaceVisualisationType = "node_field" | "timeline" | "world_map" | "constellation";
export type DeveloperSpaceTopologyType = "radial" | "branching" | "lattice" | "custom";
export type DeveloperSpaceEventVisibility = "private" | "community" | "public";
export type DeveloperSpaceEventProvenance = "api" | "imported" | "user" | "system" | "ai_generated";
export type DeveloperSpaceIngestionKeyStatus = "active" | "revoked";
export type ExportPackageKind = "persona_archive";
export type ExportPackageStatus = "requested" | "processing" | "completed" | "failed";
export type ExportPackageFormat = "json_markdown";

type SupabaseTable<Row, Insert = Row, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
};

type TablesWithRelationships<T extends Record<string, SupabaseTable<any, any, any>>> = {
  [K in keyof T]: {
    Row: T[K]["Row"];
    Insert: Partial<T[K]["Row"]>;
    Update: Partial<T[K]["Row"]>;
    Relationships: [];
  };
};

export interface Database {
  public: {
    Tables: TablesWithRelationships<{
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          tier: Tier;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          byok_openai_key: string | null;
          byok_anthropic_key: string | null;
          byok_deepseek_key: string | null;
          ai_mode: AiMode;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      personas: {
        Row: {
          id: string;
          owner_user_id: string;
          name: string;
          short_description: string | null;
          long_description: string | null;
          avatar_url: string | null;
          visibility: Visibility;
          provider: Provider;
          awakening_prompt: string | null;
          style_notes: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["personas"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["personas"]["Insert"]>;
      };
      conversations: {
        Row: {
          id: string;
          persona_id: string;
          owner_user_id: string;
          title: string | null;
          mode: "private" | "public";
          status: ConversationStatus;
          archived_at: string | null;
          message_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["conversations"]["Row"], "id" | "status" | "archived_at" | "message_count" | "created_at" | "updated_at"> & {
          id?: string;
          status?: ConversationStatus;
          archived_at?: string | null;
          message_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Insert"]>;
      };
      conversation_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          tokens_used: number | null;
          provider_used: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["conversation_messages"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversation_messages"]["Insert"]>;
      };
      memory_items: {
        Row: {
          id: string;
          persona_id: string;
          owner_user_id: string;
          title: string | null;
          content: string;
          summary: string | null;
          source_type: SourceType;
          relevance_weight: number;
          embedding: number[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["memory_items"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["memory_items"]["Insert"]>;
      };
      canon_items: {
        Row: {
          id: string;
          persona_id: string;
          owner_user_id: string;
          title: string | null;
          content: string;
          source_type: SourceType;
          priority: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["canon_items"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["canon_items"]["Insert"]>;
      };
      archived_chat_transcripts: {
        Row: {
          id: string;
          conversation_id: string;
          persona_id: string;
          owner_user_id: string;
          title: string;
          transcript_markdown: string;
          message_count: number;
          source_summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["archived_chat_transcripts"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["archived_chat_transcripts"]["Insert"]>;
      };
      continuity_candidates: {
        Row: {
          id: string;
          archived_chat_transcript_id: string;
          persona_id: string;
          owner_user_id: string;
          candidate_type: ContinuityCandidateType;
          title: string | null;
          content: string;
          rationale: string | null;
          status: ContinuityCandidateStatus;
          source_message_ids: string[];
          accepted_target_type: ContinuityCandidateType | null;
          accepted_target_id: string | null;
          accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["continuity_candidates"]["Row"], "id" | "status" | "accepted_target_type" | "accepted_target_id" | "accepted_at" | "created_at" | "updated_at"> & {
          id?: string;
          status?: ContinuityCandidateStatus;
          accepted_target_type?: ContinuityCandidateType | null;
          accepted_target_id?: string | null;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["continuity_candidates"]["Insert"]>;
      };
      continuity_records: {
        Row: {
          id: string;
          owner_user_id: string;
          persona_id: string | null;
          record_type: ContinuityRecordType;
          title: string | null;
          body: string | null;
          summary: string | null;
          source_table: string | null;
          source_id: string | null;
          source_label: string | null;
          source_version: number;
          visibility: ContinuityRecordVisibility;
          version: number;
          metadata: Record<string, unknown>;
          occurred_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["continuity_records"]["Row"], "id" | "persona_id" | "title" | "body" | "summary" | "source_table" | "source_id" | "source_label" | "source_version" | "visibility" | "version" | "metadata" | "occurred_at" | "created_at" | "updated_at"> & {
          id?: string;
          persona_id?: string | null;
          title?: string | null;
          body?: string | null;
          summary?: string | null;
          source_table?: string | null;
          source_id?: string | null;
          source_label?: string | null;
          source_version?: number;
          visibility?: ContinuityRecordVisibility;
          version?: number;
          metadata?: Record<string, unknown>;
          occurred_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["continuity_records"]["Insert"]>;
      };
      persona_files: {
        Row: {
          id: string;
          persona_id: string;
          owner_user_id: string;
          file_name: string;
          file_type: string | null;
          file_size: number | null;
          storage_path: string;
          source_type: PersonaFileSourceType;
          processed: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["persona_files"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["persona_files"]["Insert"]>;
      };
      import_jobs: {
        Row: {
          id: string;
          persona_id: string;
          owner_user_id: string;
          kind: ImportJobKind;
          status: ImportJobStatus;
          source_name: string;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["import_jobs"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["import_jobs"]["Insert"]>;
      };
      calibration_sessions: {
        Row: {
          id: string;
          owner_user_id: string;
          persona_id: string | null;
          session_title: string | null;
          transcript: string;
          extracted_style_notes: string | null;
          extracted_public_rules: string | null;
          extracted_private_rules: string | null;
          extracted_uncertainty_rules: string | null;
          save_target: CalibrationSaveTarget;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["calibration_sessions"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["calibration_sessions"]["Insert"]>;
      };
      export_packages: {
        Row: {
          id: string;
          owner_user_id: string;
          persona_id: string;
          package_kind: ExportPackageKind;
          status: ExportPackageStatus;
          format: ExportPackageFormat;
          included_sections: string[];
          manifest_json: Record<string, unknown>;
          manifest_markdown: string;
          content_summary: Record<string, unknown>;
          error_message: string | null;
          requested_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["export_packages"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["export_packages"]["Insert"]>;
      };
      spaces: {
        Row: {
          id: string;
          owner_user_id: string;
          slug: string;
          title: string;
          short_description: string | null;
          long_description: string | null;
          theme: string | null;
          custom_css: string | null;
          is_public: boolean;
          comments_default_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["spaces"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["spaces"]["Insert"]>;
      };
      space_pages: {
        Row: {
          id: string;
          space_id: string;
          slug: string;
          title: string;
          page_type: SpacePageType;
          body: string | null;
          sort_order: number;
          is_published: boolean;
          comments_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["space_pages"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["space_pages"]["Insert"]>;
      };
      documents: {
        Row: {
          id: string;
          author_user_id: string;
          space_id: string | null;
          persona_id: string | null;
          title: string;
          slug: string;
          body: string | null;
          document_type: DocumentType;
          status: DocumentStatus;
          visibility: DocumentVisibility;
          comments_enabled: boolean;
          published_at: string | null;
          provenance_type: DocumentProvenanceType;
          source_type: DocumentSourceType | null;
          source_id: string | null;
          source_label: string | null;
          source_persona_id: string | null;
          discussion_thread_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["documents"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
      };
      threads: {
        Row: {
          id: string;
          category_id: string;
          author_user_id: string;
          linked_space_id: string | null;
          linked_persona_id: string | null;
          linked_document_id: string | null;
          title: string;
          body: string;
          status: ThreadStatus;
          visibility: ThreadVisibility;
          is_pinned: boolean;
          is_hidden: boolean;
          reported_count: number;
          score: number;
          comment_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["threads"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["threads"]["Insert"]>;
      };
      forum_categories: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["forum_categories"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["forum_categories"]["Insert"]>;
      };
      developer_spaces: {
        Row: {
          id: string;
          owner_user_id: string;
          project_name: string;
          slug: string;
          description: string | null;
          visibility: DeveloperSpaceVisibility;
          visualisation_type: DeveloperSpaceVisualisationType;
          visualisation_config: Record<string, unknown>;
          api_key_hash: string | null;
          api_key_last_four: string | null;
          api_key_created_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["developer_spaces"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["developer_spaces"]["Insert"]>;
      };
      developer_space_ingestion_keys: {
        Row: {
          id: string;
          developer_space_id: string;
          owner_user_id: string;
          key_hash: string;
          key_last_four: string;
          label: string | null;
          status: DeveloperSpaceIngestionKeyStatus;
          created_at: string;
          updated_at: string;
          last_used_at: string | null;
          revoked_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["developer_space_ingestion_keys"]["Row"], "id" | "label" | "status" | "created_at" | "updated_at" | "last_used_at" | "revoked_at"> & {
          id?: string;
          label?: string | null;
          status?: DeveloperSpaceIngestionKeyStatus;
          created_at?: string;
          updated_at?: string;
          last_used_at?: string | null;
          revoked_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["developer_space_ingestion_keys"]["Insert"]>;
      };
      developer_space_nodes: {
        Row: {
          id: string;
          developer_space_id: string;
          external_id: string;
          node_name: string;
          topology_type: DeveloperSpaceTopologyType;
          fragment_count: number;
          self_similarity_score: number | null;
          dimensionality: number | null;
          metrics: Record<string, unknown>;
          last_event_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["developer_space_nodes"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["developer_space_nodes"]["Insert"]>;
      };
      developer_space_events: {
        Row: {
          id: string;
          developer_space_id: string;
          node_id: string | null;
          external_node_id: string | null;
          event_type: string;
          event_label: string | null;
          event_data: Record<string, unknown>;
          similarity_score: number | null;
          source_refs: string[];
          provenance: DeveloperSpaceEventProvenance;
          visibility: DeveloperSpaceEventVisibility;
          occurred_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["developer_space_events"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["developer_space_events"]["Insert"]>;
      };
      developer_space_snapshots: {
        Row: {
          id: string;
          developer_space_id: string;
          snapshot_data: Record<string, unknown>;
          source_refs: string[];
          provenance: DeveloperSpaceEventProvenance;
          visibility: DeveloperSpaceEventVisibility;
          occurred_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["developer_space_snapshots"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["developer_space_snapshots"]["Insert"]>;
      };
      comments: {
        Row: {
          id: string;
          author_user_id: string;
          parent_type: CommentParentType;
          parent_id: string;
          body: string;
          status: CommentStatus;
          is_pinned: boolean;
          is_hidden: boolean;
          reported_count: number;
          score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["comments"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["comments"]["Insert"]>;
      };
      moderation_reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: ModerationTargetType;
          target_id: string;
          reason: string;
          notes: string | null;
          status: ModerationStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["moderation_reports"]["Row"], "id" | "notes" | "status" | "reviewed_by" | "reviewed_at" | "created_at" | "updated_at"> & {
          id?: string;
          notes?: string | null;
          status?: ModerationStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["moderation_reports"]["Insert"]>;
      };
      discover_feed: {
        Row: {
          id: string;
          item_type: DiscoverItemType;
          event_type: DiscoverEventType;
          item_id: string;
          title: string;
          description: string | null;
          href: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["discover_feed"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["discover_feed"]["Insert"]>;
      };
      social_connections: {
        Row: {
          id: string;
          user_id: string;
          platform: SocialPlatform;
          handle: string | null;
          access_token: string | null;
          refresh_token: string | null;
          meta: Record<string, unknown>;
          connected_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["social_connections"]["Row"], "id" | "connected_at"> & {
          id?: string;
          connected_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["social_connections"]["Insert"]>;
      };
      social_posts: {
        Row: {
          id: string;
          user_id: string;
          connection_id: string;
          document_id: string | null;
          platform: string;
          title: string | null;
          content: string;
          status: SocialPostStatus;
          scheduled_for: string | null;
          sent_at: string | null;
          external_post_id: string | null;
          external_url: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["social_posts"]["Row"], "id" | "status" | "sent_at" | "external_post_id" | "external_url" | "error_message" | "created_at"> & {
          id?: string;
          status?: SocialPostStatus;
          sent_at?: string | null;
          external_post_id?: string | null;
          external_url?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["social_posts"]["Insert"]>;
      };
    }>;
    Views: {};
    Functions: {
      increment_thread_comment_count: {
        Args: { thread_id: string };
        Returns: void;
      };
      match_memory_items: {
        Args: { p_persona_id: string; query_embedding: number[]; match_count?: number };
        Returns: Array<{
          id: string;
          persona_id: string;
          title: string | null;
          content: string;
          summary: string | null;
          source_type: SourceType;
          relevance_weight: number;
          similarity: number;
        }>;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
}
