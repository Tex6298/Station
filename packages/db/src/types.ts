/**
 * Supabase Database type definitions — mirrors the schema in 001_initial_schema.sql
 * Keeping this hand-authored for now. You can replace with `supabase gen types`
 * once your project is connected: `npx supabase gen types typescript --project-id <id>`
 */

export type Tier = "visitor" | "private" | "creator" | "canon" | "institutional";
export type AiMode = "platform" | "byok";
export type Visibility = "private" | "public";
export type DocumentVisibility = "private" | "public" | "members";
export type DocumentStatus = "draft" | "published" | "archived";
export type DocumentType = "post" | "essay" | "manifesto" | "constitution" | "update" | "other";
export type Provider = "platform" | "openai" | "anthropic" | "deepseek" | "gemini";
export type DeveloperSpaceVisibility = "private" | "unlisted" | "community" | "public";
export type DeveloperSpaceVisualisationType = "node_field" | "timeline" | "world_map" | "constellation";
export type DeveloperSpaceTopologyType = "radial" | "branching" | "lattice" | "custom";
export type DeveloperSpaceEventVisibility = "private" | "community" | "public";
export type DeveloperSpaceEventProvenance = "api" | "imported" | "user" | "system" | "ai_generated";

export interface Database {
  public: {
    Tables: {
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
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["conversations"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
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
          source_type: "chat" | "import" | "document" | "calibration" | "manual";
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
          source_type: "chat" | "import" | "document" | "calibration" | "manual";
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
      persona_files: {
        Row: {
          id: string;
          persona_id: string;
          owner_user_id: string;
          file_name: string;
          file_type: string | null;
          file_size: number | null;
          storage_path: string;
          source_type: "upload" | "import" | "calibration" | "generated";
          processed: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["persona_files"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["persona_files"]["Insert"]>;
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
          title: string;
          body: string;
          status: "active" | "locked" | "removed";
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
          parent_type: "thread" | "document" | "space_page";
          parent_id: string;
          body: string;
          status: "active" | "removed" | "flagged";
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
    };
  };
}
