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
export type DocumentType = "essay" | "codex" | "manifesto" | "field_log" | "research" | "archive_note" | "transcript";
export type DocumentProvenanceType = "user_authored" | "ai_assisted" | "archive_import" | "integrity_session" | "persona_derived";
export type DocumentSourceType = "manual" | "canon" | "integrity" | "archive_file" | "archive_import" | "persona" | "publication";
export type Provider = "platform" | "openai" | "anthropic" | "deepseek" | "gemini";
export type AiProviderByokProvider = "openai" | "anthropic" | "deepseek";
export type AiProviderByokSecretStatus = "active" | "revoked";
export type SourceType = "chat" | "import" | "document" | "calibration" | "integrity_session" | "manual";
export type ArchiveSourceType = "import_job" | "persona_file" | "archived_chat_transcript";
export type EmbeddingProvider = "openai" | "gemini";
export type EmbeddingIndexSource = "supabase_pgvector";
export type ConversationStatus = "active" | "archived";
export type ContinuityCandidateType = "memory" | "canon";
export type ContinuityCandidateStatus = "pending" | "accepted" | "rejected";
export type ContinuityRecordType = "memory" | "canon" | "integrity" | "archive_file" | "archive_import" | "archived_chat" | "candidate" | "publication" | "timeline";
export type ContinuityRecordVisibility = "private" | "community" | "public";
export type PersonaFileSourceType = "upload" | "import" | "calibration" | "generated";
export type ImportJobKind = "file" | "chat" | "archive_connector";
export type ImportJobStatus = "queued" | "processing" | "completed" | "failed";
export type CalibrationSaveTarget = "persona" | "global" | "public_mode" | "other";
export type IntegrityCluster = "identity" | "relationship" | "tone" | "continuity" | "boundaries" | "themes";
export type IntegritySessionType = "initial" | "periodic" | "migration" | "pre_publication" | "manual";
export type IntegritySessionStatus = "in_progress" | "completed" | "abandoned";
export type IntegrityTurnType = "anchor" | "follow_up" | "summary" | "confirmation";
export type IntegrityOutputType = "memory_candidate" | "canon_candidate" | "preference" | "boundary" | "theme";
export type IntegrityOutputStatus = "pending" | "accepted" | "rejected" | "edited";
export type IntegrityWrittenTo = "memory" | "canon" | "preference_profile";
export type TokenTransactionType = "llm_call" | "topup_purchase" | "monthly_reset" | "refund";
export type TopupModelTier = "haiku" | "sonnet";
export type TopupPurchaseStatus = "pending" | "completed" | "refunded";
export type SpacePageType = "home" | "about" | "personas" | "documents" | "custom";
export type ThreadStatus = "active" | "locked" | "removed";
export type ThreadVisibility = "public" | "community" | "unlisted";
export type CommunityAuthorshipKind = "user_authored" | "ai_assisted" | "persona_authored" | "imported" | "derived";
export type CommunityAuthorshipSourceType = "ai" | "persona" | "import" | "document" | "system";
export type CommunityWitnessTargetType = "thread" | "comment";
export type CommunityWitnessKind = "helpful" | "grounded" | "careful";
export type SubcommunityType = "general" | "canon" | "developer" | "salon";
export type SubcommunityVisibility = "public" | "community" | "unlisted" | "private";
export type SubcommunityStatus = "active" | "paused" | "archived";
export type CommentParentType = "thread" | "document" | "space_page";
export type CommentStatus = "active" | "removed" | "flagged";
export type ModerationTargetType =
  | "user"
  | "space"
  | "document"
  | "thread"
  | "comment"
  | "persona"
  | "persona_encounter_public_exhibit"
  | "persona_encounter_cross_owner_public_exhibit";
export type ModerationStatus = "open" | "reviewing" | "resolved" | "dismissed";
export type ModerationReviewRequestRole = "reporter" | "target_author";
export type ModerationReviewRequestStatus = "open" | "reviewing" | "upheld" | "denied" | "dismissed" | "withdrawn";
export type CommunityNotificationType = "thread_comment" | "report_status" | "review_request_status";
export type CommunityNotificationTargetType = "thread" | "comment" | "moderation_report" | "moderation_review_request";
export type PublishingApprovalState = "draft" | "grounding_check" | "human_review" | "approved" | "regenerate" | "cancelled" | "scheduled" | "published" | "archived";
export type PublishingApprovalVisibility = "public" | "community" | "unlisted";
export type DiscoverItemType = "document" | "thread" | "space" | "persona";
export type DiscoverEventType = "published" | "created" | "featured" | "updated";
export type PublicSeminarInterestSourceType = "document" | "thread" | "space";
export type PublicSeminarRecordSourceType = "document";
export type PublicSeminarRecordStatus = "draft" | "ready" | "published" | "cancelled";
export type PublicSeminarRecordVisibility = "private" | "public";
export type SocialPlatform = "bluesky" | "mastodon" | "tumblr" | "linkedin" | "wordpress" | "ghost" | "reddit";
export type SocialPostStatus = "pending" | "sent" | "failed" | "scheduled";
export type PersonaEncounterPublicExhibitStatus = "published" | "retracted" | "removed";
export type PersonaEncounterCrossOwnerPublicExhibitStatus = "proposed" | "published" | "retracted" | "removed";
export type PersonaEncounterCrossOwnerConsentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "revoked"
  | "expired"
  | "superseded"
  | "blocked_by_deletion"
  | "moderation_locked";
export type PersonaEncounterCrossOwnerConsentRequestedScope =
  | "run_cross_owner_encounter"
  | "save_private_cross_owner_artifact"
  | "share_participant_metadata_between_owners"
  | "publish_metadata_only_public_exhibit"
  | "publish_generated_words_excerpt"
  | "publish_transcript"
  | "publish_generated_summary";
export type PersonaEncounterCrossOwnerConsentReasonCode =
  | "not_aligned"
  | "owner_request"
  | "persona_deleted"
  | "account_deleted"
  | "moderation_safety"
  | "scope_changed"
  | "expired"
  | "other";
export type PersonaEncounterCrossOwnerConsentActorRole = "requester" | "counterparty" | "admin" | "system";
export type PersonaEncounterCrossOwnerRuntimeParticipantRole = "requester" | "counterparty";
export type PersonaEncounterCrossOwnerConsentAuditEventType =
  | "invitation_created"
  | "requester_approved"
  | "requester_cancelled"
  | "counterparty_approved"
  | "counterparty_rejected"
  | "participant_revoked"
  | "invitation_expired"
  | "scope_version_superseded"
  | "persona_or_account_deletion_blocked"
  | "moderation_lock_applied"
  | "moderation_lock_cleared";
export type PersonaEncounterCrossOwnerRuntimeAttemptLifecycleStatus =
  | "blocked_before_provider"
  | "provider_succeeded"
  | "provider_failed"
  | "provider_empty"
  | "quota_exceeded"
  | "rate_limited"
  | "provider_unavailable";
export type SocialConnectorProvider = "bluesky";
export type SocialConnectorPurpose = "social_connector";
export type SocialConnectorCredentialCategory = "manual_credential";
export type SocialConnectorCredentialStatus = "active" | "revoked";
export type ArchiveConnectorProvider = "reddit" | "discord";
export type ArchiveConnectorPurpose = "archive_connector";
export type ArchiveConnectorCredentialStatus = "active" | "revoked";
export type ArchiveConnectorImportIntentStatus = "pending" | "cancelled" | "activated";
export type ArchiveConnectorSourceStagingRunStatus = "staged" | "superseded" | "revoked" | "imported";
export type ArchiveConnectorSourceFamily = "reddit_subreddit_memberships" | "reddit_user_history" | "discord_guilds";
export type DeveloperSpaceVisibility = "private" | "unlisted" | "community" | "public";
export type DeveloperSpaceProviderPolicy = "public_synthetic_only" | "public_context_allowed" | "private_archive_allowed" | "owner_byok_only" | "platform_allowed";
export type DeveloperSpaceVisualisationType = "node_field" | "timeline" | "world_map" | "constellation";
export type DeveloperSpaceTopologyType = "radial" | "branching" | "lattice" | "custom";
export type DeveloperSpaceEventVisibility = "private" | "community" | "public";
export type DeveloperSpaceEventProvenance = "api" | "imported" | "user" | "system" | "ai_generated";
export type DeveloperSpaceIngestionKeyStatus = "active" | "revoked";
export type DeveloperSpaceWebhookSigningSecretStatus = "active" | "revoked";
export type DeveloperSpaceAgentFutureAction =
  | "publish_to_page"
  | "update_layout"
  | "read_logs"
  | "push_to_repo"
  | "run_job"
  | "update_observatory"
  | "request_capability"
  | "save_project_update_draft"
  | "rotate_ingestion_key"
  | "create_webhook_signing_secret";
export type DeveloperSpaceAgentConfirmationStatus = "pending" | "approved" | "cancelled" | "expired";
export type DeveloperSpaceAgentExecutionReceiptStatus = "recorded";
export type DeveloperSpaceAgentExecutionReceiptAction =
  | "request_capability"
  | "save_project_update_draft"
  | "publish_to_page"
  | "update_observatory";
export type DeveloperSpaceDocumentRole = "methodology" | "finding" | "field_log" | "note";
export type DeveloperSpaceDocumentLinkVisibility = "owner" | "public";
export type ExportPackageKind = "persona_archive" | "developer_space_archive" | "project_manifest" | "workspace_manifest" | "station_press_publication";
export type ExportPackageStatus = "requested" | "processing" | "completed" | "failed";
export type ExportPackageFormat = "json_markdown";
export type ProjectVisibility = "private" | "unlisted" | "community" | "public";
export type ProjectConnectionTier = "tier_1_showcase" | "tier_2_hosted" | "tier_3_lab";
export type ProjectMemberRole = "owner" | "admin" | "editor" | "viewer" | "billing";
export type ProjectMemberStatus = "invited" | "active" | "removed";

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
      ai_provider_byok_secrets: {
        Row: {
          id: string;
          owner_user_id: string;
          provider: AiProviderByokProvider;
          encrypted_key: Record<string, unknown>;
          key_fingerprint: string;
          key_last_four: string;
          status: AiProviderByokSecretStatus;
          created_at: string;
          updated_at: string;
          rotated_at: string | null;
          revoked_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["ai_provider_byok_secrets"]["Row"], "id" | "status" | "created_at" | "updated_at" | "rotated_at" | "revoked_at"> & {
          id?: string;
          status?: AiProviderByokSecretStatus;
          created_at?: string;
          updated_at?: string;
          rotated_at?: string | null;
          revoked_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ai_provider_byok_secrets"]["Insert"]>;
      };
      archive_connector_credentials: {
        Row: {
          id: string;
          owner_user_id: string;
          provider: ArchiveConnectorProvider;
          purpose: ArchiveConnectorPurpose;
          encrypted_credential: Record<string, unknown>;
          credential_fingerprint: string;
          external_account_fingerprint: string | null;
          account_label: string | null;
          status: ArchiveConnectorCredentialStatus;
          created_at: string;
          updated_at: string;
          rotated_at: string | null;
          revoked_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["archive_connector_credentials"]["Row"], "id" | "purpose" | "status" | "created_at" | "updated_at" | "rotated_at" | "revoked_at"> & {
          id?: string;
          purpose?: ArchiveConnectorPurpose;
          status?: ArchiveConnectorCredentialStatus;
          created_at?: string;
          updated_at?: string;
          rotated_at?: string | null;
          revoked_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["archive_connector_credentials"]["Insert"]>;
      };
      archive_connector_oauth_states: {
        Row: {
          id: string;
          owner_user_id: string;
          session_id_hash: string;
          provider: ArchiveConnectorProvider;
          purpose: ArchiveConnectorPurpose;
          nonce_hash: string;
          csrf_hash: string;
          local_redirect_path: string | null;
          expires_at: string;
          consumed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["archive_connector_oauth_states"]["Row"], "id" | "purpose" | "consumed_at" | "created_at" | "updated_at"> & {
          id?: string;
          purpose?: ArchiveConnectorPurpose;
          consumed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["archive_connector_oauth_states"]["Insert"]>;
      };
      archive_connector_import_intents: {
        Row: {
          id: string;
          owner_user_id: string;
          persona_id: string;
          provider: ArchiveConnectorProvider;
          purpose: ArchiveConnectorPurpose;
          source_family: ArchiveConnectorSourceFamily;
          source_kind: string;
          source_key: string;
          source_label: string;
          status: ArchiveConnectorImportIntentStatus;
          idempotency_fingerprint: string;
          activated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["archive_connector_import_intents"]["Row"], "id" | "purpose" | "status" | "activated_at" | "created_at" | "updated_at"> & {
          id?: string;
          purpose?: ArchiveConnectorPurpose;
          status?: ArchiveConnectorImportIntentStatus;
          activated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["archive_connector_import_intents"]["Insert"]>;
      };
      archive_connector_source_staging_runs: {
        Row: {
          id: string;
          owner_user_id: string;
          persona_id: string;
          import_intent_id: string;
          provider: "reddit";
          purpose: ArchiveConnectorPurpose;
          source_family: "reddit_user_history";
          source_kind: "saved_items";
          source_key: string;
          source_label: string;
          status: ArchiveConnectorSourceStagingRunStatus;
          page_limit: 10;
          item_count: number;
          post_count: number;
          comment_count: number;
          skipped_count: number;
          truncated: boolean;
          source_snapshot_fingerprint: string;
          encrypted_source_batch: Record<string, unknown>;
          source_read_at: string;
          expires_at: string;
          superseded_at: string | null;
          revoked_at: string | null;
          imported_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["archive_connector_source_staging_runs"]["Row"], "id" | "purpose" | "status" | "superseded_at" | "revoked_at" | "imported_at" | "created_at" | "updated_at"> & {
          id?: string;
          purpose?: ArchiveConnectorPurpose;
          status?: ArchiveConnectorSourceStagingRunStatus;
          superseded_at?: string | null;
          revoked_at?: string | null;
          imported_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["archive_connector_source_staging_runs"]["Insert"]>;
      };
      projects: {
        Row: {
          id: string;
          owner_user_id: string;
          name: string;
          slug: string;
          description: string | null;
          visibility: ProjectVisibility;
          connection_tier: ProjectConnectionTier;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["projects"]["Row"], "id" | "description" | "visibility" | "connection_tier" | "created_at" | "updated_at"> & {
          id?: string;
          description?: string | null;
          visibility?: ProjectVisibility;
          connection_tier?: ProjectConnectionTier;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: ProjectMemberRole;
          status: ProjectMemberStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["project_members"]["Row"], "id" | "role" | "status" | "created_at" | "updated_at"> & {
          id?: string;
          role?: ProjectMemberRole;
          status?: ProjectMemberStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_members"]["Insert"]>;
      };
      storage_usage: {
        Row: {
          user_id: string;
          bytes_used: number;
          bytes_limit: number;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["storage_usage"]["Row"], "bytes_used" | "updated_at"> & {
          bytes_used?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["storage_usage"]["Insert"]>;
      };
      token_usage: {
        Row: {
          id: string;
          user_id: string;
          period_start: string;
          tokens_used: number;
          tokens_limit: number;
          topup_tokens: number;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["token_usage"]["Row"], "id" | "tokens_used" | "topup_tokens" | "updated_at"> & {
          id?: string;
          tokens_used?: number;
          topup_tokens?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["token_usage"]["Insert"]>;
      };
      token_transactions: {
        Row: {
          id: string;
          user_id: string;
          period_start: string;
          transaction_type: TokenTransactionType;
          tokens_delta: number;
          model_used: string | null;
          chat_id: string | null;
          input_tokens: number | null;
          output_tokens: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["token_transactions"]["Row"], "id" | "model_used" | "chat_id" | "input_tokens" | "output_tokens" | "created_at"> & {
          id?: string;
          model_used?: string | null;
          chat_id?: string | null;
          input_tokens?: number | null;
          output_tokens?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["token_transactions"]["Insert"]>;
      };
      topup_purchases: {
        Row: {
          id: string;
          user_id: string;
          stripe_payment_id: string;
          pack_id: string;
          amount_pence: number;
          tokens_purchased: number;
          model_tier: TopupModelTier;
          period_start: string;
          expires_at: string;
          status: TopupPurchaseStatus;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["topup_purchases"]["Row"], "id" | "status" | "created_at"> & {
          id?: string;
          status?: TopupPurchaseStatus;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["topup_purchases"]["Insert"]>;
      };
      personas: {
        Row: {
          id: string;
          owner_user_id: string;
          name: string;
          short_description: string | null;
          long_description: string | null;
          avatar_url: string | null;
          public_slug: string | null;
          public_chat_enabled: boolean;
          public_anonymous_chat_enabled: boolean;
          visibility: Visibility;
          provider: Provider;
          awakening_prompt: string | null;
          style_notes: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["personas"]["Row"], "id" | "public_slug" | "public_chat_enabled" | "public_anonymous_chat_enabled" | "created_at" | "updated_at"> & {
          id?: string;
          public_slug?: string | null;
          public_chat_enabled?: boolean;
          public_anonymous_chat_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["personas"]["Insert"]>;
      };
      persona_encounter_private_sessions: {
        Row: {
          id: string;
          owner_user_id: string;
          initiator_persona_id: string;
          responder_persona_id: string;
          owner_setup: string;
          responder_reply: string;
          initiator_name_snapshot: string;
          responder_name_snapshot: string;
          provenance_schema: "station.persona_encounter.private_session.v1";
          source_retrieval_used: false;
          shareable: false;
          public_visibility: "private";
          owner_title: string | null;
          owner_summary: string | null;
          owner_tags: string[];
          publication_candidate: boolean;
          curation_schema: "station.persona_encounter.private_session_curation.v1";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["persona_encounter_private_sessions"]["Row"], "id" | "provenance_schema" | "source_retrieval_used" | "shareable" | "public_visibility" | "owner_title" | "owner_summary" | "owner_tags" | "publication_candidate" | "curation_schema" | "created_at" | "updated_at"> & {
          id?: string;
          provenance_schema?: "station.persona_encounter.private_session.v1";
          source_retrieval_used?: false;
          shareable?: false;
          public_visibility?: "private";
          owner_title?: string | null;
          owner_summary?: string | null;
          owner_tags?: string[];
          publication_candidate?: boolean;
          curation_schema?: "station.persona_encounter.private_session_curation.v1";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["persona_encounter_private_sessions"]["Insert"]>;
      };
      persona_encounter_public_exhibits: {
        Row: {
          id: string;
          owner_user_id: string;
          private_session_id: string;
          slug: string;
          public_title: string;
          public_summary: string;
          public_tags: string[];
          initiator_name_snapshot: string;
          responder_name_snapshot: string;
          status: PersonaEncounterPublicExhibitStatus;
          provenance_schema: "station.persona_encounter.public_exhibit.v1";
          reported_count: number;
          published_at: string;
          retracted_at: string | null;
          removed_at: string | null;
          removed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["persona_encounter_public_exhibits"]["Row"], "id" | "status" | "provenance_schema" | "reported_count" | "published_at" | "retracted_at" | "removed_at" | "removed_by" | "created_at" | "updated_at"> & {
          id?: string;
          status?: PersonaEncounterPublicExhibitStatus;
          provenance_schema?: "station.persona_encounter.public_exhibit.v1";
          reported_count?: number;
          published_at?: string;
          retracted_at?: string | null;
          removed_at?: string | null;
          removed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["persona_encounter_public_exhibits"]["Insert"]>;
      };
      persona_encounter_cross_owner_consents: {
        Row: {
          id: string;
          requester_owner_user_id: string;
          requester_persona_id: string;
          requester_persona_name_snapshot: string;
          counterparty_owner_user_id: string;
          counterparty_persona_id: string;
          counterparty_persona_name_snapshot: string;
          status: PersonaEncounterCrossOwnerConsentStatus;
          requested_scopes: PersonaEncounterCrossOwnerConsentRequestedScope[];
          requested_scope_version: number;
          requester_approved_at: string | null;
          counterparty_approved_at: string | null;
          rejected_at: string | null;
          rejected_by: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          revoked_at: string | null;
          revoked_by: string | null;
          expired_at: string | null;
          superseded_at: string | null;
          blocked_by_deletion_at: string | null;
          moderation_locked_at: string | null;
          reason_code: PersonaEncounterCrossOwnerConsentReasonCode | null;
          provenance_schema: "station.persona_encounter.cross_owner_consent.v1";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["persona_encounter_cross_owner_consents"]["Row"], "id" | "status" | "requested_scopes" | "requested_scope_version" | "requester_approved_at" | "counterparty_approved_at" | "rejected_at" | "rejected_by" | "cancelled_at" | "cancelled_by" | "revoked_at" | "revoked_by" | "expired_at" | "superseded_at" | "blocked_by_deletion_at" | "moderation_locked_at" | "reason_code" | "provenance_schema" | "created_at" | "updated_at"> & {
          id?: string;
          status?: PersonaEncounterCrossOwnerConsentStatus;
          requested_scopes?: PersonaEncounterCrossOwnerConsentRequestedScope[];
          requested_scope_version?: number;
          requester_approved_at?: string | null;
          counterparty_approved_at?: string | null;
          rejected_at?: string | null;
          rejected_by?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          revoked_at?: string | null;
          revoked_by?: string | null;
          expired_at?: string | null;
          superseded_at?: string | null;
          blocked_by_deletion_at?: string | null;
          moderation_locked_at?: string | null;
          reason_code?: PersonaEncounterCrossOwnerConsentReasonCode | null;
          provenance_schema?: "station.persona_encounter.cross_owner_consent.v1";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["persona_encounter_cross_owner_consents"]["Insert"]>;
      };
      persona_encounter_cross_owner_consent_audit_events: {
        Row: {
          id: string;
          consent_id: string;
          actor_user_id: string | null;
          actor_role: PersonaEncounterCrossOwnerConsentActorRole;
          event_type: PersonaEncounterCrossOwnerConsentAuditEventType;
          previous_status: PersonaEncounterCrossOwnerConsentStatus | null;
          next_status: PersonaEncounterCrossOwnerConsentStatus;
          requested_scopes: PersonaEncounterCrossOwnerConsentRequestedScope[];
          reason_code: PersonaEncounterCrossOwnerConsentReasonCode | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["persona_encounter_cross_owner_consent_audit_events"]["Row"], "id" | "requested_scopes" | "reason_code" | "created_at"> & {
          id?: string;
          requested_scopes?: PersonaEncounterCrossOwnerConsentRequestedScope[];
          reason_code?: PersonaEncounterCrossOwnerConsentReasonCode | null;
          created_at?: string;
        };
        Update: never;
      };
      persona_encounter_cross_owner_runtime_attempts: {
        Row: {
          id: string;
          consent_id: string;
          actor_role: PersonaEncounterCrossOwnerRuntimeParticipantRole;
          initiator_role: PersonaEncounterCrossOwnerRuntimeParticipantRole;
          responder_role: PersonaEncounterCrossOwnerRuntimeParticipantRole;
          consent_status: PersonaEncounterCrossOwnerConsentStatus;
          requested_scope_version: number;
          requested_scope: PersonaEncounterCrossOwnerConsentRequestedScope;
          readiness_code: string;
          lifecycle_status: PersonaEncounterCrossOwnerRuntimeAttemptLifecycleStatus;
          provenance_schema: "station.persona_encounter.cross_owner_runtime_attempt.v1";
          created_at: string;
          completed_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["persona_encounter_cross_owner_runtime_attempts"]["Row"], "id" | "provenance_schema" | "created_at" | "completed_at"> & {
          id?: string;
          provenance_schema?: "station.persona_encounter.cross_owner_runtime_attempt.v1";
          created_at?: string;
          completed_at?: string | null;
        };
        Update: never;
      };
      persona_encounter_cross_owner_public_exhibits: {
        Row: {
          id: string;
          consent_id: string;
          requester_owner_user_id: string;
          requester_persona_id: string;
          requester_persona_name_snapshot: string;
          counterparty_owner_user_id: string;
          counterparty_persona_id: string;
          counterparty_persona_name_snapshot: string;
          slug: string;
          public_title: string;
          public_summary: string;
          public_tags: string[];
          status: PersonaEncounterCrossOwnerPublicExhibitStatus;
          contract_version: 1;
          provenance_schema: "station.persona_encounter.cross_owner_public_exhibit.v1";
          requester_metadata_approved_at: string | null;
          counterparty_metadata_approved_at: string | null;
          reported_count: number;
          published_at: string | null;
          retracted_at: string | null;
          removed_at: string | null;
          removed_by: string | null;
          created_by: string;
          updated_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["persona_encounter_cross_owner_public_exhibits"]["Row"], "id" | "status" | "contract_version" | "provenance_schema" | "requester_metadata_approved_at" | "counterparty_metadata_approved_at" | "reported_count" | "published_at" | "retracted_at" | "removed_at" | "removed_by" | "created_at" | "updated_at"> & {
          id?: string;
          status?: PersonaEncounterCrossOwnerPublicExhibitStatus;
          contract_version?: 1;
          provenance_schema?: "station.persona_encounter.cross_owner_public_exhibit.v1";
          requester_metadata_approved_at?: string | null;
          counterparty_metadata_approved_at?: string | null;
          reported_count?: number;
          published_at?: string | null;
          retracted_at?: string | null;
          removed_at?: string | null;
          removed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["persona_encounter_cross_owner_public_exhibits"]["Insert"]>;
      };
      public_persona_interaction_counters: {
        Row: {
          id: string;
          owner_user_id: string;
          persona_id: string;
          bucket_date: string;
          chat_attempt_count: number;
          chat_success_count: number;
          chat_failure_count: number;
          report_created_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["public_persona_interaction_counters"]["Row"], "id" | "chat_attempt_count" | "chat_success_count" | "chat_failure_count" | "report_created_count" | "created_at" | "updated_at"> & {
          id?: string;
          chat_attempt_count?: number;
          chat_success_count?: number;
          chat_failure_count?: number;
          report_created_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["public_persona_interaction_counters"]["Insert"]>;
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
          embedding_provider: EmbeddingProvider | null;
          embedding_model: string | null;
          embedding_dimension: number | null;
          embedding_index_name: string | null;
          embedding_index_source: EmbeddingIndexSource | null;
          embedding_backfill_version: number | null;
          archive_source_type: ArchiveSourceType | null;
          archive_source_id: string | null;
          archive_source_name: string | null;
          chunk_index: number | null;
          chunk_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["memory_items"]["Row"], "id" | "created_at" | "updated_at" | "embedding_provider" | "embedding_model" | "embedding_dimension" | "embedding_index_name" | "embedding_index_source" | "embedding_backfill_version" | "archive_source_type" | "archive_source_id" | "archive_source_name" | "chunk_index" | "chunk_count"> & {
          id?: string;
          embedding_provider?: EmbeddingProvider | null;
          embedding_model?: string | null;
          embedding_dimension?: number | null;
          embedding_index_name?: string | null;
          embedding_index_source?: EmbeddingIndexSource | null;
          embedding_backfill_version?: number | null;
          archive_source_type?: ArchiveSourceType | null;
          archive_source_id?: string | null;
          archive_source_name?: string | null;
          chunk_index?: number | null;
          chunk_count?: number | null;
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
          archived_chat_transcript_id: string | null;
          persona_id: string;
          owner_user_id: string;
          candidate_type: ContinuityCandidateType;
          title: string | null;
          content: string;
          rationale: string | null;
          source_table: string | null;
          source_id: string | null;
          source_label: string | null;
          status: ContinuityCandidateStatus;
          source_message_ids: string[];
          accepted_target_type: ContinuityCandidateType | null;
          accepted_target_id: string | null;
          accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["continuity_candidates"]["Row"], "id" | "archived_chat_transcript_id" | "source_table" | "source_id" | "source_label" | "status" | "accepted_target_type" | "accepted_target_id" | "accepted_at" | "created_at" | "updated_at"> & {
          id?: string;
          archived_chat_transcript_id?: string | null;
          source_table?: string | null;
          source_id?: string | null;
          source_label?: string | null;
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
          file_id: string | null;
          archive_connector_source_staging_run_id: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["import_jobs"]["Row"], "id" | "created_at" | "updated_at" | "file_id" | "archive_connector_source_staging_run_id"> & {
          id?: string;
          file_id?: string | null;
          archive_connector_source_staging_run_id?: string | null;
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
      integrity_sessions: {
        Row: {
          id: string;
          owner_user_id: string;
          persona_id: string;
          session_type: IntegritySessionType;
          status: IntegritySessionStatus;
          clusters_covered: IntegrityCluster[];
          clusters_planned: IntegrityCluster[];
          started_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["integrity_sessions"]["Row"], "id" | "status" | "clusters_covered" | "clusters_planned" | "started_at" | "completed_at" | "created_at" | "updated_at"> & {
          id?: string;
          status?: IntegritySessionStatus;
          clusters_covered?: IntegrityCluster[];
          clusters_planned?: IntegrityCluster[];
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["integrity_sessions"]["Insert"]>;
      };
      integrity_session_turns: {
        Row: {
          id: string;
          session_id: string;
          owner_user_id: string;
          persona_id: string;
          cluster: IntegrityCluster;
          question: string;
          answer: string | null;
          turn_type: IntegrityTurnType;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["integrity_session_turns"]["Row"], "id" | "answer" | "created_at"> & {
          id?: string;
          answer?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["integrity_session_turns"]["Insert"]>;
      };
      integrity_session_outputs: {
        Row: {
          id: string;
          session_id: string;
          owner_user_id: string;
          persona_id: string;
          output_type: IntegrityOutputType;
          content: string;
          status: IntegrityOutputStatus;
          edited_content: string | null;
          written_to: IntegrityWrittenTo | null;
          written_target_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["integrity_session_outputs"]["Row"], "id" | "status" | "edited_content" | "written_to" | "written_target_id" | "created_at" | "updated_at"> & {
          id?: string;
          status?: IntegrityOutputStatus;
          edited_content?: string | null;
          written_to?: IntegrityWrittenTo | null;
          written_target_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["integrity_session_outputs"]["Insert"]>;
      };
      integrity_questions: {
        Row: {
          id: string;
          cluster: IntegrityCluster;
          question: string;
          turn_type: "anchor" | "optional_followup";
          sort_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["integrity_questions"]["Row"], "id" | "sort_order" | "active" | "created_at"> & {
          id?: string;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["integrity_questions"]["Insert"]>;
      };
      persona_preferences: {
        Row: {
          id: string;
          owner_user_id: string;
          persona_id: string;
          warmth_level: "high" | "moderate" | "neutral";
          playfulness: "high" | "moderate" | "low";
          register_preference: "mystical" | "balanced" | "grounded";
          depth_preference: "expansive" | "balanced" | "concise";
          challenge_preference: "challenge" | "balanced" | "support";
          disclaimer_sensitivity: "high" | "neutral" | "low";
          relationship_tone: string;
          recurring_topics: string[];
          tone_notes: string[];
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["persona_preferences"]["Row"], "id" | "warmth_level" | "playfulness" | "register_preference" | "depth_preference" | "challenge_preference" | "disclaimer_sensitivity" | "relationship_tone" | "recurring_topics" | "tone_notes" | "updated_at"> & {
          id?: string;
          warmth_level?: "high" | "moderate" | "neutral";
          playfulness?: "high" | "moderate" | "low";
          register_preference?: "mystical" | "balanced" | "grounded";
          depth_preference?: "expansive" | "balanced" | "concise";
          challenge_preference?: "challenge" | "balanced" | "support";
          disclaimer_sensitivity?: "high" | "neutral" | "low";
          relationship_tone?: string;
          recurring_topics?: string[];
          tone_notes?: string[];
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["persona_preferences"]["Insert"]>;
      };
      export_packages: {
        Row: {
          id: string;
          owner_user_id: string;
          persona_id: string | null;
          developer_space_id: string | null;
          project_id: string | null;
          document_id: string | null;
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
        Insert: Omit<Database["public"]["Tables"]["export_packages"]["Row"], "id" | "project_id" | "document_id" | "created_at" | "updated_at"> & {
          id?: string;
          project_id?: string | null;
          document_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["export_packages"]["Insert"]>;
      };
      developer_space_usage: {
        Row: {
          developer_space_id: string;
          owner_user_id: string;
          project_id: string | null;
          ingested_nodes_count: number;
          ingested_events_count: number;
          ingested_snapshots_count: number;
          storage_bytes: number;
          public_detail_reads_count: number;
          export_count: number;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["developer_space_usage"]["Row"], "project_id" | "ingested_nodes_count" | "ingested_events_count" | "ingested_snapshots_count" | "storage_bytes" | "public_detail_reads_count" | "export_count" | "updated_at"> & {
          project_id?: string | null;
          ingested_nodes_count?: number;
          ingested_events_count?: number;
          ingested_snapshots_count?: number;
          storage_bytes?: number;
          public_detail_reads_count?: number;
          export_count?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["developer_space_usage"]["Insert"]>;
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
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["documents"]["Row"], "id" | "version" | "created_at" | "updated_at"> & {
          id?: string;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
      };
      document_versions: {
        Row: {
          id: string;
          document_id: string;
          owner_user_id: string;
          version_number: number;
          title: string;
          slug: string;
          body: string | null;
          summary: string | null;
          document_type: DocumentType;
          status: DocumentStatus;
          visibility: DocumentVisibility;
          comments_enabled: boolean;
          space_id: string | null;
          persona_id: string | null;
          published_at: string | null;
          provenance_type: DocumentProvenanceType;
          source_type: DocumentSourceType | null;
          source_id: string | null;
          source_label: string | null;
          source_persona_id: string | null;
          discussion_thread_id: string | null;
          document_created_at: string | null;
          document_updated_at: string | null;
          captured_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["document_versions"]["Row"], "id" | "captured_at" | "created_at"> & {
          id?: string;
          captured_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["document_versions"]["Insert"]>;
      };
      threads: {
        Row: {
          id: string;
          category_id: string;
          author_user_id: string;
          linked_space_id: string | null;
          linked_persona_id: string | null;
          linked_document_id: string | null;
          authorship_kind: CommunityAuthorshipKind;
          authorship_source_type: CommunityAuthorshipSourceType | null;
          authorship_source_id: string | null;
          authorship_persona_id: string | null;
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
        Insert: Omit<Database["public"]["Tables"]["threads"]["Row"], "id" | "created_at" | "updated_at" | "authorship_kind" | "authorship_source_type" | "authorship_source_id" | "authorship_persona_id"> & {
          id?: string;
          authorship_kind?: CommunityAuthorshipKind;
          authorship_source_type?: CommunityAuthorshipSourceType | null;
          authorship_source_id?: string | null;
          authorship_persona_id?: string | null;
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
      community_subcommunities: {
        Row: {
          id: string;
          category_id: string;
          owner_user_id: string;
          slug: string;
          title: string;
          description: string | null;
          subcommunity_type: SubcommunityType;
          visibility: SubcommunityVisibility;
          status: SubcommunityStatus;
          linked_space_id: string | null;
          linked_developer_space_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["community_subcommunities"]["Row"], "id" | "description" | "visibility" | "status" | "linked_space_id" | "linked_developer_space_id" | "created_at" | "updated_at"> & {
          id?: string;
          description?: string | null;
          visibility?: SubcommunityVisibility;
          status?: SubcommunityStatus;
          linked_space_id?: string | null;
          linked_developer_space_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["community_subcommunities"]["Insert"]>;
      };
      community_subcommunity_moderators: {
        Row: {
          id: string;
          subcommunity_id: string;
          user_id: string;
          role: "moderator";
          status: "active" | "revoked";
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["community_subcommunity_moderators"]["Row"], "id" | "role" | "status" | "created_by" | "created_at" | "updated_at"> & {
          id?: string;
          role?: "moderator";
          status?: "active" | "revoked";
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["community_subcommunity_moderators"]["Insert"]>;
      };
      developer_spaces: {
        Row: {
          id: string;
          owner_user_id: string;
          project_id: string | null;
          project_name: string;
          slug: string;
          description: string | null;
          visibility: DeveloperSpaceVisibility;
          provider_policy: DeveloperSpaceProviderPolicy;
          visualisation_type: DeveloperSpaceVisualisationType;
          visualisation_config: Record<string, unknown>;
          api_key_hash: string | null;
          api_key_last_four: string | null;
          api_key_created_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["developer_spaces"]["Row"], "id" | "project_id" | "provider_policy" | "created_at" | "updated_at"> & {
          id?: string;
          project_id?: string | null;
          provider_policy?: DeveloperSpaceProviderPolicy;
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
      developer_space_webhook_signing_secrets: {
        Row: {
          id: string;
          developer_space_id: string;
          owner_user_id: string;
          encrypted_secret: Record<string, unknown>;
          secret_hash: string;
          secret_fingerprint: string;
          secret_last_four: string;
          status: DeveloperSpaceWebhookSigningSecretStatus;
          created_at: string;
          updated_at: string;
          last_used_at: string | null;
          revoked_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["developer_space_webhook_signing_secrets"]["Row"], "id" | "status" | "created_at" | "updated_at" | "last_used_at" | "revoked_at"> & {
          id?: string;
          status?: DeveloperSpaceWebhookSigningSecretStatus;
          created_at?: string;
          updated_at?: string;
          last_used_at?: string | null;
          revoked_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["developer_space_webhook_signing_secrets"]["Insert"]>;
      };
      developer_space_agent_confirmations: {
        Row: {
          id: string;
          developer_space_id: string;
          owner_user_id: string;
          action: DeveloperSpaceAgentFutureAction;
          status: DeveloperSpaceAgentConfirmationStatus;
          summary: string;
          preview_hash: string;
          sanitized_payload: Record<string, unknown>;
          requested_at: string;
          expires_at: string;
          approved_at: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["developer_space_agent_confirmations"]["Row"], "id" | "status" | "sanitized_payload" | "requested_at" | "approved_at" | "cancelled_at" | "created_at" | "updated_at"> & {
          id?: string;
          status?: DeveloperSpaceAgentConfirmationStatus;
          sanitized_payload?: Record<string, unknown>;
          requested_at?: string;
          approved_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["developer_space_agent_confirmations"]["Insert"]>;
      };
      developer_space_agent_execution_receipts: {
        Row: {
          id: string;
          developer_space_id: string;
          owner_user_id: string;
          confirmation_id: string;
          action: DeveloperSpaceAgentExecutionReceiptAction;
          status: DeveloperSpaceAgentExecutionReceiptStatus;
          summary: string;
          receipt_payload: Record<string, unknown>;
          dispatched_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["developer_space_agent_execution_receipts"]["Row"], "id" | "action" | "status" | "receipt_payload" | "dispatched_at" | "created_at" | "updated_at"> & {
          id?: string;
          action?: DeveloperSpaceAgentExecutionReceiptAction;
          status?: DeveloperSpaceAgentExecutionReceiptStatus;
          receipt_payload?: Record<string, unknown>;
          dispatched_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["developer_space_agent_execution_receipts"]["Insert"]>;
      };
      developer_space_documents: {
        Row: {
          id: string;
          developer_space_id: string;
          document_id: string;
          owner_user_id: string;
          document_role: DeveloperSpaceDocumentRole;
          link_visibility: DeveloperSpaceDocumentLinkVisibility;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["developer_space_documents"]["Row"], "id" | "document_role" | "link_visibility" | "sort_order" | "created_at" | "updated_at"> & {
          id?: string;
          document_role?: DeveloperSpaceDocumentRole;
          link_visibility?: DeveloperSpaceDocumentLinkVisibility;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["developer_space_documents"]["Insert"]>;
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
          authorship_kind: CommunityAuthorshipKind;
          authorship_source_type: CommunityAuthorshipSourceType | null;
          authorship_source_id: string | null;
          authorship_persona_id: string | null;
          body: string;
          status: CommentStatus;
          is_pinned: boolean;
          is_hidden: boolean;
          reported_count: number;
          score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["comments"]["Row"], "id" | "created_at" | "updated_at" | "authorship_kind" | "authorship_source_type" | "authorship_source_id" | "authorship_persona_id"> & {
          id?: string;
          authorship_kind?: CommunityAuthorshipKind;
          authorship_source_type?: CommunityAuthorshipSourceType | null;
          authorship_source_id?: string | null;
          authorship_persona_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["comments"]["Insert"]>;
      };
      community_thread_watches: {
        Row: {
          id: string;
          user_id: string;
          thread_id: string;
          is_muted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["community_thread_watches"]["Row"], "id" | "is_muted" | "created_at" | "updated_at"> & {
          id?: string;
          is_muted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["community_thread_watches"]["Insert"]>;
      };
      community_witnesses: {
        Row: {
          id: string;
          witness_user_id: string;
          target_type: CommunityWitnessTargetType;
          target_id: string;
          witness_kind: CommunityWitnessKind;
          revoked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["community_witnesses"]["Row"], "id" | "revoked_at" | "created_at" | "updated_at"> & {
          id?: string;
          revoked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["community_witnesses"]["Insert"]>;
      };
      community_notifications: {
        Row: {
          id: string;
          recipient_user_id: string;
          actor_user_id: string | null;
          notification_type: CommunityNotificationType;
          target_type: CommunityNotificationTargetType;
          target_id: string;
          event_key: string;
          title: string;
          summary: string | null;
          route_href: string | null;
          metadata: Record<string, unknown>;
          read_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["community_notifications"]["Row"], "id" | "actor_user_id" | "summary" | "route_href" | "metadata" | "read_at" | "created_at"> & {
          id?: string;
          actor_user_id?: string | null;
          summary?: string | null;
          route_href?: string | null;
          metadata?: Record<string, unknown>;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["community_notifications"]["Insert"]>;
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
      moderation_review_requests: {
        Row: {
          id: string;
          requester_id: string;
          requester_role: ModerationReviewRequestRole;
          target_type: "thread" | "comment";
          target_id: string;
          report_id: string | null;
          moderation_action_id: string | null;
          reason: string;
          status: ModerationReviewRequestStatus;
          resolution_summary: string | null;
          admin_notes: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["moderation_review_requests"]["Row"], "id" | "moderation_action_id" | "status" | "resolution_summary" | "admin_notes" | "reviewed_by" | "reviewed_at" | "created_at" | "updated_at"> & {
          id?: string;
          moderation_action_id?: string | null;
          status?: ModerationReviewRequestStatus;
          resolution_summary?: string | null;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["moderation_review_requests"]["Insert"]>;
      };
      publishing_approval_items: {
        Row: {
          id: string;
          owner_user_id: string;
          document_id: string;
          state: PublishingApprovalState;
          visibility: PublishingApprovalVisibility;
          scheduled_for: string | null;
          grounding_summary: string | null;
          review_note: string | null;
          requested_at: string;
          approved_at: string | null;
          published_at: string | null;
          cancelled_at: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["publishing_approval_items"]["Row"], "id" | "state" | "visibility" | "scheduled_for" | "grounding_summary" | "review_note" | "requested_at" | "approved_at" | "published_at" | "cancelled_at" | "archived_at" | "created_at" | "updated_at"> & {
          id?: string;
          state?: PublishingApprovalState;
          visibility?: PublishingApprovalVisibility;
          scheduled_for?: string | null;
          grounding_summary?: string | null;
          review_note?: string | null;
          requested_at?: string;
          approved_at?: string | null;
          published_at?: string | null;
          cancelled_at?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["publishing_approval_items"]["Insert"]>;
      };
      publishing_approval_events: {
        Row: {
          id: string;
          approval_item_id: string;
          owner_user_id: string;
          actor_user_id: string;
          document_id: string;
          event_type: string;
          from_state: PublishingApprovalState | null;
          to_state: PublishingApprovalState;
          note: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["publishing_approval_events"]["Row"], "id" | "note" | "metadata" | "created_at"> & {
          id?: string;
          note?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["publishing_approval_events"]["Insert"]>;
      };
      public_seminar_interests: {
        Row: {
          id: string;
          user_id: string;
          source_type: PublicSeminarInterestSourceType;
          source_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["public_seminar_interests"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["public_seminar_interests"]["Insert"]>;
      };
      public_seminar_records: {
        Row: {
          id: string;
          owner_user_id: string;
          source_type: PublicSeminarRecordSourceType;
          source_id: string;
          title: string;
          summary: string | null;
          status: PublicSeminarRecordStatus;
          visibility: PublicSeminarRecordVisibility;
          discussion_thread_id: string | null;
          scheduled_starts_at: string | null;
          scheduled_time_zone: string | null;
          scheduled_duration_minutes: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["public_seminar_records"]["Row"], "id" | "summary" | "status" | "visibility" | "discussion_thread_id" | "scheduled_starts_at" | "scheduled_time_zone" | "scheduled_duration_minutes" | "created_at" | "updated_at"> & {
          id?: string;
          summary?: string | null;
          status?: PublicSeminarRecordStatus;
          visibility?: PublicSeminarRecordVisibility;
          discussion_thread_id?: string | null;
          scheduled_starts_at?: string | null;
          scheduled_time_zone?: string | null;
          scheduled_duration_minutes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["public_seminar_records"]["Insert"]>;
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
      social_connector_credentials: {
        Row: {
          id: string;
          owner_user_id: string;
          provider: SocialConnectorProvider;
          purpose: SocialConnectorPurpose;
          credential_category: SocialConnectorCredentialCategory;
          encrypted_credential: Record<string, unknown>;
          credential_fingerprint: string;
          status: SocialConnectorCredentialStatus;
          created_at: string;
          updated_at: string;
          rotated_at: string | null;
          revoked_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["social_connector_credentials"]["Row"], "id" | "purpose" | "credential_category" | "status" | "created_at" | "updated_at" | "rotated_at" | "revoked_at"> & {
          id?: string;
          purpose?: SocialConnectorPurpose;
          credential_category?: SocialConnectorCredentialCategory;
          status?: SocialConnectorCredentialStatus;
          created_at?: string;
          updated_at?: string;
          rotated_at?: string | null;
          revoked_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["social_connector_credentials"]["Insert"]>;
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
      create_persona_encounter_cross_owner_consent: {
        Args: {
          p_requester_owner_user_id: string;
          p_requester_persona_id: string;
          p_requester_persona_name_snapshot: string;
          p_counterparty_owner_user_id: string;
          p_counterparty_persona_id: string;
          p_counterparty_persona_name_snapshot: string;
          p_requested_scopes: PersonaEncounterCrossOwnerConsentRequestedScope[];
          p_actor_user_id: string;
        };
        Returns: Database["public"]["Tables"]["persona_encounter_cross_owner_consents"]["Row"];
      };
      transition_persona_encounter_cross_owner_consent: {
        Args: {
          p_consent_id: string;
          p_expected_status: PersonaEncounterCrossOwnerConsentStatus;
          p_next_status: PersonaEncounterCrossOwnerConsentStatus;
          p_actor_user_id: string;
          p_actor_role: Extract<PersonaEncounterCrossOwnerConsentActorRole, "requester" | "counterparty">;
          p_event_type: PersonaEncounterCrossOwnerConsentAuditEventType;
          p_reason_code?: PersonaEncounterCrossOwnerConsentReasonCode | null;
        };
        Returns: Database["public"]["Tables"]["persona_encounter_cross_owner_consents"]["Row"];
      };
      record_persona_encounter_cross_owner_runtime_attempt: {
        Args: {
          p_consent_id: string;
          p_actor_role: PersonaEncounterCrossOwnerRuntimeParticipantRole;
          p_initiator_role: PersonaEncounterCrossOwnerRuntimeParticipantRole;
          p_responder_role: PersonaEncounterCrossOwnerRuntimeParticipantRole;
          p_consent_status: PersonaEncounterCrossOwnerConsentStatus;
          p_requested_scope_version: number;
          p_requested_scope: PersonaEncounterCrossOwnerConsentRequestedScope;
          p_readiness_code: string;
          p_lifecycle_status: PersonaEncounterCrossOwnerRuntimeAttemptLifecycleStatus;
          p_completed_at?: string | null;
        };
        Returns: Database["public"]["Tables"]["persona_encounter_cross_owner_runtime_attempts"]["Row"];
      };
      increment_thread_comment_count: {
        Args: { thread_id: string };
        Returns: void;
      };
      increment_public_persona_interaction_counters: {
        Args: {
          p_owner_user_id: string;
          p_persona_id: string;
          p_bucket_date?: string | null;
          p_chat_attempt_delta?: number;
          p_chat_success_delta?: number;
          p_chat_failure_delta?: number;
          p_report_created_delta?: number;
        };
        Returns: Database["public"]["Tables"]["public_persona_interaction_counters"]["Row"];
      };
      match_memory_items: {
        Args: {
          p_persona_id: string;
          query_embedding: number[];
          match_count?: number;
          p_embedding_provider?: EmbeddingProvider;
          p_embedding_model?: string | null;
          p_embedding_index_name?: string;
        };
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
      match_private_archive_chunks: {
        Args: {
          p_persona_id: string;
          p_owner_user_id: string;
          query_embedding: number[];
          match_count?: number;
          p_embedding_provider?: EmbeddingProvider;
          p_embedding_model?: string | null;
          p_embedding_index_name?: string;
        };
        Returns: Array<{
          id: string;
          persona_id: string;
          owner_user_id: string;
          title: string | null;
          content: string;
          summary: string | null;
          source_type: SourceType;
          relevance_weight: number;
          archive_source_type: ArchiveSourceType | null;
          archive_source_id: string | null;
          archive_source_name: string | null;
          chunk_index: number | null;
          chunk_count: number | null;
          created_at: string;
          similarity: number;
        }>;
      };
      ensure_current_token_usage: {
        Args: { p_user_id: string };
        Returns: Database["public"]["Tables"]["token_usage"]["Row"];
      };
      record_token_usage: {
        Args: {
          p_user_id: string;
          p_model: string;
          p_chat_id: string | null;
          p_input_tokens: number;
          p_output_tokens: number;
        };
        Returns: Database["public"]["Tables"]["token_usage"]["Row"];
      };
      grant_topup_purchase: {
        Args: {
          p_user_id: string;
          p_stripe_payment_id: string;
          p_pack_id: string;
          p_amount_pence: number;
          p_tokens_purchased: number;
          p_model_tier: TopupModelTier;
        };
        Returns: Database["public"]["Tables"]["token_usage"]["Row"];
      };
      run_monthly_token_reset: {
        Args: Record<string, never>;
        Returns: Record<string, unknown>;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
}
