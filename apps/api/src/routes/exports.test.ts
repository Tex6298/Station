import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL ??= "http://localhost";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key";

type Row = Record<string, any>;

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_ID = "22222222-2222-4222-8222-222222222222";
const PERSONA_ID = "33333333-3333-4333-8333-333333333333";
const OTHER_PERSONA_ID = "44444444-4444-4444-8444-444444444444";
const SPACE_ID = "55555555-5555-4555-8555-555555555555";
const DOC_ID = "66666666-6666-4666-8666-666666666666";
const PRIVATE_DOC_ID = "77777777-7777-4777-8777-777777777777";
const THREAD_ID = "88888888-8888-4888-8888-888888888888";
const COMMUNITY_DOC_ID = "99999999-9999-4999-8999-999999999999";
const UNLISTED_DOC_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const PRIVATE_PUBLISHED_DOC_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const DEVELOPER_SPACE_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const DEV_PUBLIC_DOC_ID = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const DEV_PRIVATE_DOC_ID = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const PROJECT_ID = "abababab-abab-4bab-8bab-abababababab";
const OTHER_PROJECT_ID = "bcbcbcbc-bcbc-4cbc-8cbc-bcbcbcbcbcbc";

class InMemorySupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      {
        id: OWNER_ID,
        email: "owner@example.test",
        username: "owner",
        display_name: "Owner",
        avatar_url: null,
        tier: "canon",
        is_admin: false,
      },
      {
        id: OTHER_ID,
        email: "other@example.test",
        username: "other",
        display_name: "Other",
        avatar_url: null,
        tier: "creator",
        is_admin: false,
      },
    ],
    personas: [
      {
        id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        name: "Harbor",
        short_description: "Continuity keeper.",
        long_description: "Private long-form continuity brief.",
        visibility: "private",
        provider: "platform",
        avatar_url: null,
        awakening_prompt: "Wake with durable context.",
        style_notes: "Careful, direct, steady.",
        sort_order: 0,
        created_at: "2026-05-26T09:00:00.000Z",
        updated_at: "2026-05-26T09:00:00.000Z",
      },
      {
        id: OTHER_PERSONA_ID,
        owner_user_id: OTHER_ID,
        name: "Other",
        short_description: null,
        long_description: null,
        visibility: "private",
        provider: "platform",
        avatar_url: null,
        awakening_prompt: null,
        style_notes: null,
        sort_order: 0,
        created_at: "2026-05-26T09:00:00.000Z",
        updated_at: "2026-05-26T09:00:00.000Z",
      },
    ],
    spaces: [
      {
        id: SPACE_ID,
        owner_user_id: OWNER_ID,
        slug: "harbor-space",
        title: "Harbor Space",
        short_description: null,
        long_description: null,
        theme: null,
        is_public: true,
        comments_default_enabled: true,
        created_at: "2026-05-26T09:00:00.000Z",
        updated_at: "2026-05-26T09:00:00.000Z",
      },
    ],
    memory_items: [
      {
        id: "memory-1",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        title: "Anchor memory",
        content: "Harbor remembers the owner values grounded continuity.",
        summary: "A stable private memory.",
        source_type: "manual",
        relevance_weight: 2,
        embedding: null,
        created_at: "2026-05-26T09:01:00.000Z",
        updated_at: "2026-05-26T09:01:00.000Z",
      },
      {
        id: "memory-other",
        persona_id: OTHER_PERSONA_ID,
        owner_user_id: OTHER_ID,
        title: "Other memory",
        content: "Other owner memory must not leak.",
        summary: null,
        source_type: "manual",
        relevance_weight: 1,
        embedding: null,
        created_at: "2026-05-26T09:01:00.000Z",
        updated_at: "2026-05-26T09:01:00.000Z",
      },
    ],
    canon_items: [
      {
        id: "canon-1",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        title: "Core rule",
        content: "Preserve continuity before novelty.",
        source_type: "manual",
        priority: 8,
        created_at: "2026-05-26T09:02:00.000Z",
        updated_at: "2026-05-26T09:02:00.000Z",
      },
    ],
    persona_files: [
      {
        id: "file-1",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        file_name: "source-notebook.md",
        file_type: "text/markdown",
        file_size: 2048,
        storage_path: "private/source-notebook.md",
        source_type: "upload",
        processed: true,
        created_at: "2026-05-26T09:03:00.000Z",
      },
    ],
    import_jobs: [
      {
        id: "import-1",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        kind: "chat",
        status: "completed",
        source_name: "old-chat-export.txt",
        error_message: null,
        created_at: "2026-05-26T09:04:00.000Z",
        updated_at: "2026-05-26T09:04:00.000Z",
      },
    ],
    archived_chat_transcripts: [
      {
        id: "transcript-1",
        conversation_id: "conversation-1",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        title: "Harbor working chat",
        transcript_markdown: "# Harbor working chat\n\nPrivate transcript text.",
        message_count: 4,
        source_summary: "user: Preserve continuity before novelty.",
        created_at: "2026-05-26T09:04:30.000Z",
        updated_at: "2026-05-26T09:04:30.000Z",
      },
      {
        id: "transcript-other",
        conversation_id: "conversation-other",
        persona_id: OTHER_PERSONA_ID,
        owner_user_id: OTHER_ID,
        title: "Other private chat",
        transcript_markdown: "# Other private chat",
        message_count: 2,
        source_summary: "Other owner transcript must not leak.",
        created_at: "2026-05-26T09:04:30.000Z",
        updated_at: "2026-05-26T09:04:30.000Z",
      },
    ],
    continuity_candidates: [
      {
        id: "candidate-1",
        archived_chat_transcript_id: "transcript-1",
        persona_id: PERSONA_ID,
        owner_user_id: OWNER_ID,
        candidate_type: "memory",
        title: "Archive boundary memory",
        content: "Harbor asks before turning private grief into public material.",
        rationale: "Generated from archived chat.",
        status: "accepted",
        source_message_ids: ["55555555-5555-4555-8555-555555555555"],
        accepted_target_type: "memory",
        accepted_target_id: "memory-1",
        accepted_at: "2026-05-26T09:04:45.000Z",
        created_at: "2026-05-26T09:04:35.000Z",
        updated_at: "2026-05-26T09:04:45.000Z",
      },
      {
        id: "candidate-other",
        archived_chat_transcript_id: "transcript-other",
        persona_id: OTHER_PERSONA_ID,
        owner_user_id: OTHER_ID,
        candidate_type: "memory",
        title: "Other candidate",
        content: "Other owner candidate must not leak.",
        rationale: null,
        status: "pending",
        source_message_ids: [],
        accepted_target_type: null,
        accepted_target_id: null,
        accepted_at: null,
        created_at: "2026-05-26T09:04:35.000Z",
        updated_at: "2026-05-26T09:04:35.000Z",
      },
    ],
    continuity_records: [
      {
        id: "record-1",
        owner_user_id: OWNER_ID,
        persona_id: PERSONA_ID,
        record_type: "publication",
        title: "Public continuity milestone",
        body: "A curated public continuity marker.",
        summary: "Publication state is part of the export.",
        source_table: "documents",
        source_id: DOC_ID,
        source_label: "Document / public / published",
        source_version: 1,
        visibility: "public",
        version: 1,
        metadata: { publicationState: "published" },
        occurred_at: "2026-05-26T09:06:30.000Z",
        created_at: "2026-05-26T09:06:30.000Z",
        updated_at: "2026-05-26T09:06:30.000Z",
      },
      {
        id: "record-other",
        owner_user_id: OTHER_ID,
        persona_id: OTHER_PERSONA_ID,
        record_type: "timeline",
        title: "Other owner record",
        body: "Other owner continuity record must not leak.",
        summary: null,
        source_table: null,
        source_id: null,
        source_label: null,
        source_version: 1,
        visibility: "private",
        version: 1,
        metadata: {},
        occurred_at: "2026-05-26T09:06:30.000Z",
        created_at: "2026-05-26T09:06:30.000Z",
        updated_at: "2026-05-26T09:06:30.000Z",
      },
    ],
    calibration_sessions: [
      {
        id: "integrity-1",
        owner_user_id: OWNER_ID,
        persona_id: PERSONA_ID,
        session_title: "Harbor integrity pass",
        transcript: "Private transcript is owner exportable.",
        extracted_style_notes: "Speak steadily.",
        extracted_public_rules: "Keep public claims bounded.",
        extracted_private_rules: "Private rules remain owner-only.",
        extracted_uncertainty_rules: "Name uncertainty.",
        save_target: "persona",
        created_at: "2026-05-26T09:05:00.000Z",
        updated_at: "2026-05-26T09:05:00.000Z",
      },
    ],
    documents: [
      {
        id: DOC_ID,
        author_user_id: OWNER_ID,
        space_id: SPACE_ID,
        persona_id: PERSONA_ID,
        title: "Published Continuity Note",
        slug: "published-continuity-note",
        body: "Public copy body is not required for export refs.",
        document_type: "essay",
        status: "published",
        visibility: "public",
        comments_enabled: true,
        published_at: "2026-05-26T09:06:00.000Z",
        provenance_type: "persona_derived",
        source_type: "canon",
        source_id: "canon-1",
        source_label: "Canon / priority 8",
        source_persona_id: PERSONA_ID,
        discussion_thread_id: THREAD_ID,
        created_at: "2026-05-26T09:06:00.000Z",
        updated_at: "2026-05-26T09:06:00.000Z",
      },
      {
        id: PRIVATE_DOC_ID,
        author_user_id: OWNER_ID,
        space_id: SPACE_ID,
        persona_id: PERSONA_ID,
        title: "Private Draft",
        slug: "private-draft",
        body: "This private draft should not appear in published refs.",
        document_type: "essay",
        status: "draft",
        visibility: "private",
        comments_enabled: true,
        published_at: null,
        provenance_type: "user_authored",
        source_type: "manual",
        source_id: null,
        source_label: "Manual document",
        source_persona_id: PERSONA_ID,
        discussion_thread_id: null,
        created_at: "2026-05-26T09:07:00.000Z",
        updated_at: "2026-05-26T09:07:00.000Z",
      },
      publishedDocument(COMMUNITY_DOC_ID, "Community Continuity Note", "community", "2026-05-26T09:06:30.000Z"),
      publishedDocument(UNLISTED_DOC_ID, "Unlisted Continuity Note", "unlisted", "2026-05-26T09:06:40.000Z"),
      publishedDocument(PRIVATE_PUBLISHED_DOC_ID, "Private Published Continuity Note", "private", "2026-05-26T09:06:50.000Z"),
      {
        id: DEV_PUBLIC_DOC_ID,
        author_user_id: OWNER_ID,
        space_id: null,
        persona_id: null,
        title: "Animus public field log",
        slug: "animus-public-field-log",
        body: "Public field log body is safe to reference.",
        document_type: "field_log",
        status: "published",
        visibility: "public",
        comments_enabled: true,
        published_at: "2026-05-26T09:11:00.000Z",
        provenance_type: "user_authored",
        source_type: "manual",
        source_id: DEVELOPER_SPACE_ID,
        source_label: "Developer Space: Animus Field",
        source_persona_id: null,
        discussion_thread_id: null,
        created_at: "2026-05-26T09:11:00.000Z",
        updated_at: "2026-05-26T09:11:00.000Z",
      },
      {
        id: DEV_PRIVATE_DOC_ID,
        author_user_id: OWNER_ID,
        space_id: null,
        persona_id: null,
        title: "Animus private method",
        slug: "animus-private-method",
        body: "Private Developer Space method must not leave public-safe export refs.",
        document_type: "essay",
        status: "draft",
        visibility: "private",
        comments_enabled: false,
        published_at: null,
        provenance_type: "user_authored",
        source_type: "manual",
        source_id: DEVELOPER_SPACE_ID,
        source_label: "Developer Space: Animus Field",
        source_persona_id: null,
        discussion_thread_id: null,
        created_at: "2026-05-26T09:11:30.000Z",
        updated_at: "2026-05-26T09:11:30.000Z",
      },
    ],
    projects: [
      {
        id: PROJECT_ID,
        owner_user_id: OWNER_ID,
        name: "Animus Project",
        slug: "animus-project",
        description: "Owner Project export fixture.",
        visibility: "private",
        connection_tier: "tier_1_showcase",
        created_at: "2026-05-26T09:00:00.000Z",
        updated_at: "2026-05-26T09:17:00.000Z",
      },
      {
        id: OTHER_PROJECT_ID,
        owner_user_id: OTHER_ID,
        name: "Other Project",
        slug: "other-project",
        description: "Other owner Project.",
        visibility: "private",
        connection_tier: "tier_1_showcase",
        created_at: "2026-05-26T09:00:00.000Z",
        updated_at: "2026-05-26T09:17:00.000Z",
      },
    ],
    document_versions: [
      {
        id: "doc-version-1",
        document_id: DOC_ID,
        owner_user_id: OWNER_ID,
        version_number: 1,
        title: "Published Continuity Note Draft",
        slug: "published-continuity-note-draft",
        body: "Prior private draft body remains owner-only.",
        summary: "Draft summary for owner export.",
        document_type: "codex",
        status: "draft",
        visibility: "private",
        comments_enabled: true,
        space_id: SPACE_ID,
        persona_id: PERSONA_ID,
        published_at: null,
        provenance_type: "persona_derived",
        source_type: "canon",
        source_id: "canon-1",
        source_label: "Canon / priority 8",
        source_persona_id: PERSONA_ID,
        discussion_thread_id: null,
        document_created_at: "2026-05-26T09:05:30.000Z",
        document_updated_at: "2026-05-26T09:05:30.000Z",
        captured_at: "2026-05-26T09:05:45.000Z",
        created_at: "2026-05-26T09:05:45.000Z",
      },
      {
        id: "doc-version-other",
        document_id: DOC_ID,
        owner_user_id: OTHER_ID,
        version_number: 1,
        title: "Other owner forged version",
        slug: "other-owner-forged-version",
        body: "Other owner version must not leak.",
        summary: null,
        document_type: "essay",
        status: "draft",
        visibility: "private",
        comments_enabled: true,
        space_id: null,
        persona_id: OTHER_PERSONA_ID,
        published_at: null,
        provenance_type: "user_authored",
        source_type: "manual",
        source_id: null,
        source_label: "Other owner",
        source_persona_id: OTHER_PERSONA_ID,
        discussion_thread_id: null,
        document_created_at: "2026-05-26T09:05:30.000Z",
        document_updated_at: "2026-05-26T09:05:30.000Z",
        captured_at: "2026-05-26T09:05:45.000Z",
        created_at: "2026-05-26T09:05:45.000Z",
      },
    ],
    developer_spaces: [
      {
        id: DEVELOPER_SPACE_ID,
        owner_user_id: OWNER_ID,
        project_id: PROJECT_ID,
        project_name: "Animus Field",
        slug: "animus-field",
        description: "Live project export fixture.",
        visibility: "public",
        visualisation_type: "world_map",
        visualisation_config: { palette: "signal" },
        api_key_hash: "must-not-export",
        api_key_last_four: "1234",
        api_key_created_at: "2026-05-26T09:12:00.000Z",
        created_at: "2026-05-26T09:12:00.000Z",
        updated_at: "2026-05-26T09:12:00.000Z",
      },
      {
        id: "other-dev-space",
        owner_user_id: OTHER_ID,
        project_id: PROJECT_ID,
        project_name: "Other Field",
        slug: "other-field",
        description: null,
        visibility: "private",
        visualisation_type: "node_field",
        visualisation_config: {},
        api_key_hash: "other-secret",
        api_key_last_four: "9999",
        api_key_created_at: null,
        created_at: "2026-05-26T09:12:00.000Z",
        updated_at: "2026-05-26T09:12:00.000Z",
      },
    ],
    developer_space_nodes: [
      {
        id: "dev-node-1",
        developer_space_id: DEVELOPER_SPACE_ID,
        external_id: "animus-alpha",
        node_name: "Animus Alpha",
        topology_type: "radial",
        fragment_count: 144,
        self_similarity_score: 0.81,
        dimensionality: 12,
        metrics: { rawSignal: "owner exportable" },
        last_event_at: "2026-05-26T09:13:00.000Z",
        created_at: "2026-05-26T09:12:30.000Z",
        updated_at: "2026-05-26T09:13:00.000Z",
      },
      {
        id: "other-dev-node",
        developer_space_id: "other-dev-space",
        external_id: "other-alpha",
        node_name: "Other Alpha",
        topology_type: "custom",
        fragment_count: 1,
        self_similarity_score: null,
        dimensionality: null,
        metrics: { mustNotLeak: true },
        last_event_at: null,
        created_at: "2026-05-26T09:12:30.000Z",
        updated_at: "2026-05-26T09:12:30.000Z",
      },
    ],
    developer_space_events: [
      {
        id: "dev-event-public",
        developer_space_id: DEVELOPER_SPACE_ID,
        node_id: "dev-node-1",
        external_node_id: "animus-alpha",
        event_type: "signal.detected",
        event_label: "Signal detected",
        event_data: { confidence: 0.92 },
        similarity_score: 0.88,
        source_refs: ["station:signal"],
        provenance: "api",
        visibility: "public",
        occurred_at: "2026-05-26T09:13:00.000Z",
        created_at: "2026-05-26T09:13:00.000Z",
      },
      {
        id: "dev-event-private",
        developer_space_id: DEVELOPER_SPACE_ID,
        node_id: null,
        external_node_id: null,
        event_type: "debug.private",
        event_label: "Private diagnostic",
        event_data: { raw: "owner-only diagnostic" },
        similarity_score: null,
        source_refs: [],
        provenance: "api",
        visibility: "private",
        occurred_at: "2026-05-26T09:13:30.000Z",
        created_at: "2026-05-26T09:13:30.000Z",
      },
      {
        id: "other-dev-event",
        developer_space_id: "other-dev-space",
        node_id: "other-dev-node",
        external_node_id: "other-alpha",
        event_type: "other.secret",
        event_label: "Other secret",
        event_data: { mustNotLeak: true },
        similarity_score: null,
        source_refs: [],
        provenance: "api",
        visibility: "private",
        occurred_at: "2026-05-26T09:13:30.000Z",
        created_at: "2026-05-26T09:13:30.000Z",
      },
    ],
    developer_space_snapshots: [
      {
        id: "dev-snapshot-1",
        developer_space_id: DEVELOPER_SPACE_ID,
        snapshot_data: { summary: "Weekly manifold snapshot" },
        source_refs: ["weekly-snapshot-18"],
        provenance: "api",
        visibility: "public",
        occurred_at: "2026-05-26T09:14:00.000Z",
        created_at: "2026-05-26T09:14:00.000Z",
      },
    ],
    developer_space_documents: [
      {
        id: "dev-link-public",
        developer_space_id: DEVELOPER_SPACE_ID,
        document_id: DEV_PUBLIC_DOC_ID,
        owner_user_id: OWNER_ID,
        document_role: "field_log",
        link_visibility: "public",
        sort_order: 1,
        created_at: "2026-05-26T09:15:00.000Z",
        updated_at: "2026-05-26T09:15:00.000Z",
      },
      {
        id: "dev-link-private",
        developer_space_id: DEVELOPER_SPACE_ID,
        document_id: DEV_PRIVATE_DOC_ID,
        owner_user_id: OWNER_ID,
        document_role: "methodology",
        link_visibility: "owner",
        sort_order: 2,
        created_at: "2026-05-26T09:15:30.000Z",
        updated_at: "2026-05-26T09:15:30.000Z",
      },
    ],
    developer_space_usage: [
      {
        developer_space_id: DEVELOPER_SPACE_ID,
        owner_user_id: OWNER_ID,
        ingested_nodes_count: 1,
        ingested_events_count: 2,
        ingested_snapshots_count: 1,
        storage_bytes: 4096,
        public_detail_reads_count: 7,
        export_count: 0,
        updated_at: "2026-05-26T09:16:00.000Z",
      },
    ],
    threads: [
      {
        id: THREAD_ID,
        category_id: "category-1",
        author_user_id: OWNER_ID,
        linked_space_id: SPACE_ID,
        linked_persona_id: PERSONA_ID,
        linked_document_id: DOC_ID,
        title: "Discuss: Published Continuity Note",
        body: "Thread body.",
        status: "active",
        visibility: "public",
        is_pinned: false,
        is_hidden: false,
        reported_count: 1,
        score: 0,
        comment_count: 4,
        created_at: "2026-05-26T09:08:00.000Z",
        updated_at: "2026-05-26T09:08:00.000Z",
      },
    ],
    comments: [
      commentRow("comment-visible", OTHER_ID, "Visible community response.", "active", false),
      commentRow("comment-hidden-other", OTHER_ID, "Hidden other-user moderation note must not leak.", "active", true),
      commentRow("comment-removed-other", OTHER_ID, "Removed other-user comment must not leak.", "removed", false),
      commentRow("comment-hidden-owner", OWNER_ID, "Owner-authored hidden note stays in owner export.", "removed", true),
    ],
    moderation_reports: [
      reportRow("report-owner-document", OWNER_ID, "document", DOC_ID, "owner document report", "Owner-owned report note.", "open"),
      reportRow("report-owner-document-duplicate", OWNER_ID, "document", DOC_ID, "owner document report", "Duplicate owner report note must collapse.", "open"),
      reportRow("report-owner-comment", OWNER_ID, "comment", "comment-visible", "owner comment report", "Visible comment report note.", "reviewed"),
      reportRow("report-owner-private-draft", OWNER_ID, "document", PRIVATE_DOC_ID, "draft report must not export", "Draft-only report note.", "open"),
      reportRow("report-other-document", OTHER_ID, "document", DOC_ID, "other reporter must not leak", "Other reporter private note.", "open"),
      reportRow("report-hidden-comment", OWNER_ID, "comment", "comment-hidden-other", "hidden comment must not export", "Hidden comment report note.", "open"),
    ],
    export_packages: [],
  };

  failSelectTables = new Set<string>();
  operationErrors = new Map<string, { code?: string; message: string; details?: string }>();

  private idCounters: Record<string, number> = {};
  private clock = Date.parse("2026-05-26T10:00:00.000Z");
  private usersByToken = new Map([
    ["owner-token", { id: OWNER_ID, email: "owner@example.test" }],
    ["other-token", { id: OTHER_ID, email: "other@example.test" }],
  ]);

  client = {
    auth: {
      getUser: async (token: string) => {
        const user = this.usersByToken.get(token) ?? null;
        return user
          ? { data: { user }, error: null }
          : { data: { user: null }, error: { message: "Invalid token" } };
      },
    },
    from: (table: string) => new QueryBuilder(this, table),
  };

  rows(table: string) {
    if (!this.tables[table]) this.tables[table] = [];
    return this.tables[table];
  }

  insertRow(table: string, payload: Row) {
    const row = this.prepareRow(table, payload);
    this.rows(table).push(row);
    return row;
  }

  timestamp() {
    const value = new Date(this.clock).toISOString();
    this.clock += 1000;
    return value;
  }

  private nextId(table: string) {
    this.idCounters[table] = (this.idCounters[table] ?? 0) + 1;
    return `${table}-${this.idCounters[table]}`;
  }

  private prepareRow(table: string, payload: Row) {
    const now = this.timestamp();
    const row = { ...payload };
    row.id ??= this.nextId(table);

    if (table === "export_packages") {
      row.package_kind ??= "persona_archive";
      row.persona_id ??= null;
      row.developer_space_id ??= null;
      row.project_id ??= null;
      row.status ??= "completed";
      row.format ??= "json_markdown";
      row.included_sections ??= [];
      row.manifest_json ??= {};
      row.manifest_markdown ??= "";
      row.content_summary ??= {};
      row.error_message ??= null;
      row.requested_at ??= now;
      row.completed_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    return row;
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private inFilters: Array<[string, unknown[]]> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
  private operation: "select" | "insert" | "update" | "delete" = "select";
  private payload: Row | Row[] | null = null;
  private countRequested = false;
  private head = false;

  constructor(private db: InMemorySupabase, private table: string) {}

  select(_columns = "*", options: { count?: string; head?: boolean } = {}) {
    this.countRequested = Boolean(options.count);
    this.head = Boolean(options.head);
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push([field, value]);
    return this;
  }

  in(field: string, values: unknown[]) {
    this.inFilters.push([field, values]);
    return this;
  }

  order(field: string, options: { ascending?: boolean } = {}) {
    this.orderSpec = { field, ascending: options.ascending ?? true };
    return this;
  }

  insert(payload: Row | Row[]) {
    this.operation = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: Row) {
    this.operation = "update";
    this.payload = payload;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  single() {
    return this.execute("single");
  }

  then(onfulfilled: any, onrejected: any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private matchingRows() {
    let rows = [...this.db.rows(this.table)];

    for (const [field, value] of this.filters) {
      rows = rows.filter((row) => row[field] === value);
    }

    for (const [field, values] of this.inFilters) {
      rows = rows.filter((row) => values.includes(row[field]));
    }

    if (this.orderSpec) {
      const { field, ascending } = this.orderSpec;
      rows.sort((a, b) => {
        if (a[field] === b[field]) return 0;
        if (a[field] == null) return 1;
        if (b[field] == null) return -1;
        return (a[field] > b[field] ? 1 : -1) * (ascending ? 1 : -1);
      });
    }

    return rows;
  }

  private async execute(mode?: "single") {
    let rows: Row[];

    const operationErrorKey = `${this.operation}:${this.table}`;
    const operationError = this.db.operationErrors.get(operationErrorKey);
    if (operationError) {
      this.db.operationErrors.delete(operationErrorKey);
      return {
        data: mode === "single" ? null : [],
        error: operationError,
        count: this.countRequested ? 0 : null,
      };
    }

    if (this.operation === "insert") {
      const payloads = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      rows = payloads.map((payload) => this.db.insertRow(this.table, payload));
    } else if (this.operation === "update") {
      rows = this.matchingRows();
      for (const row of rows) {
        Object.assign(row, this.payload);
        if ("updated_at" in row) row.updated_at = this.db.timestamp();
      }
    } else if (this.operation === "delete") {
      const rowsToDelete = new Set(this.matchingRows());
      this.db.tables[this.table] = this.db.rows(this.table).filter((row) => !rowsToDelete.has(row));
      rows = [...rowsToDelete];
    } else {
      if (this.db.failSelectTables.has(this.table)) {
        return {
          data: mode === "single" ? null : [],
          error: { message: `Injected ${this.table} select failure.` },
          count: this.countRequested ? 0 : null,
        };
      }
      rows = this.matchingRows();
    }

    const data = clone(rows);
    const count = this.countRequested ? rows.length : null;

    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null, count }
        : { data: null, error: { message: `Expected one ${this.table} row.` }, count };
    }

    return { data: this.head ? null : data, error: null, count };
  }
}

function commentRow(id: string, authorUserId: string, body: string, status: string, isHidden: boolean): Row {
  return {
    id,
    author_user_id: authorUserId,
    parent_type: "thread",
    parent_id: THREAD_ID,
    body,
    status,
    is_pinned: false,
    is_hidden: isHidden,
    reported_count: 0,
    score: 0,
    created_at: "2026-05-26T09:09:00.000Z",
    updated_at: "2026-05-26T09:09:00.000Z",
  };
}

function publishedDocument(id: string, title: string, visibility: string, publishedAt: string): Row {
  return {
    id,
    author_user_id: OWNER_ID,
    space_id: SPACE_ID,
    persona_id: PERSONA_ID,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    body: `${title} body.`,
    document_type: "essay",
    status: "published",
    visibility,
    comments_enabled: true,
    published_at: publishedAt,
    provenance_type: "persona_derived",
    source_type: "publication",
    source_id: "record-1",
    source_label: `Continuity record / ${visibility}`,
    source_persona_id: PERSONA_ID,
    discussion_thread_id: null,
    created_at: publishedAt,
    updated_at: publishedAt,
  };
}

function reportRow(
  id: string,
  reporterId: string,
  targetType: string,
  targetId: string,
  reason: string,
  notes: string,
  status: string
): Row {
  return {
    id,
    reporter_id: reporterId,
    target_type: targetType,
    target_id: targetId,
    reason,
    notes,
    status,
    reviewed_by: status === "reviewed" ? OWNER_ID : null,
    reviewed_at: status === "reviewed" ? "2026-05-26T09:10:30.000Z" : null,
    created_at: "2026-05-26T09:10:00.000Z",
    updated_at: "2026-05-26T09:10:00.000Z",
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function assertBundleIntegrity(bundle: Row, expectedPackageKind: string) {
  assert.equal(bundle.schema, "station.export.bundle.v1");
  assert.equal(bundle.package.packageKind, expectedPackageKind);
  assert.equal(bundle.package.format, "json_markdown");
  assert.equal(bundle.package.status, "completed");
  assert.equal(bundle.privacy.ownerOnly, true);
  assert.equal(bundle.integrity.algorithm, "sha256");
  assert.equal(bundle.integrity.fileCount, 3);

  const files = new Map<string, Row>(bundle.files.map((file: Row) => [file.path, file]));
  assert.deepEqual([...files.keys()].sort(), ["README.md", "manifest.json", "manifest.md"]);
  assert.deepEqual(Object.keys(bundle.integrity.files).sort(), ["README.md", "manifest.json", "manifest.md"]);

  for (const file of files.values()) {
    assert.equal(file.bytes, Buffer.byteLength(file.content, "utf8"));
    assert.equal(file.sha256, sha256(file.content));
    assert.equal(bundle.integrity.files[file.path], file.sha256);
  }

  return files;
}

async function createExportsApp() {
  const { exportsRouter } = await import("./exports.js");
  const app = express();
  app.use(express.json());
  app.use("/exports", exportsRouter);
  return app;
}

async function requestJson<TBody = any>(
  app: Express,
  method: string,
  path: string,
  options: { token?: string; body?: unknown } = {}
) {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const headers: Record<string, string> = {};
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    if (options.token) headers.Authorization = `Bearer ${options.token}`;

    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const text = await response.text();
    return {
      status: response.status,
      body: text ? JSON.parse(text) as TBody : null,
    };
  } finally {
    await close(server);
  }
}

function listen(app: Express) {
  return new Promise<Server>((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server as unknown as Server));
  });
}

function close(server: Server) {
  return new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

const exportHiddenMarker = "private-" + "export-route-marker";
const exportBearerLabel = "Bear" + "er";
const exportUrl = "https://storage.example.test/exports/" + exportHiddenMarker;
const exportToken = "export-token-" + exportHiddenMarker;
const exportStoragePath = `${OWNER_ID}/${PERSONA_ID}/exports/${exportHiddenMarker}.json`;

function hostileExportError(operation: string) {
  return {
    code: "XX999",
    message: [
      `${operation} failed in export_packages, memory_items, developer_spaces, developer_space_nodes, projects, and documents`,
      `owner_user_id=${OWNER_ID} persona_id=${PERSONA_ID} developer_space_id=${DEVELOPER_SPACE_ID} project_id=${PROJECT_ID}`,
      `export_package_id=export_packages-${exportHiddenMarker} archive_source_id=archive-${exportHiddenMarker}`,
      `storage_path=${exportStoragePath}`,
      `url=${exportUrl}`,
      `token=${exportToken}`,
      `${exportBearerLabel} abc.${exportHiddenMarker}.token`,
      `provider payload: private manifest excerpt ${exportHiddenMarker}`,
      "SQL stack trace at exportRoute (/station/private/exports.ts:1:2)",
    ].join("; "),
    details: `export details ${exportHiddenMarker}`,
  };
}

function assertSafeExportRouteError(body: unknown) {
  const text = JSON.stringify(body);
  assert.equal(text.includes(exportHiddenMarker), false);
  assert.equal(text.includes(exportUrl), false);
  assert.equal(text.includes(exportToken), false);
  assert.equal(text.includes(exportStoragePath), false);
  assert.equal(text.includes(exportBearerLabel), false);
  assert.equal(text.includes("export_packages"), false);
  assert.equal(text.includes("memory_items"), false);
  assert.equal(text.includes("developer_spaces"), false);
  assert.equal(text.includes("developer_space_nodes"), false);
  assert.equal(text.includes("projects,"), false);
  assert.equal(text.includes("documents"), false);
  assert.equal(text.includes("owner_user_id"), false);
  assert.equal(text.includes("persona_id"), false);
  assert.equal(text.includes("developer_space_id"), false);
  assert.equal(text.includes("project_id"), false);
  assert.equal(text.includes("export_package_id"), false);
  assert.equal(text.includes("archive_source_id"), false);
  assert.equal(text.includes("provider payload"), false);
  assert.equal(text.includes("private manifest excerpt"), false);
  assert.equal(text.includes("SQL stack trace"), false);
  assert.equal(text.includes("exportRoute"), false);
}

test("export route errors return stable public copy without private package details", async () => {
  async function expectRouteError(
    configure: (db: InMemorySupabase) => void,
    run: (app: Express, db: InMemorySupabase) => Promise<{ status: number; body: any }>,
    expected: { error: string; code: string },
    inspect?: (db: InMemorySupabase) => void
  ) {
    const db = new InMemorySupabase();
    configure(db);
    setSupabaseAdminForTests(db.client as any);
    const app = await createExportsApp();

    try {
      const response = await run(app, db);
      assert.equal(response.status, 500);
      assert.deepEqual(response.body, expected);
      assertSafeExportRouteError(response.body);
      inspect?.(db);
    } finally {
      setSupabaseAdminForTests(null);
    }
  }

  await expectRouteError(
    (db) => db.operationErrors.set("select:export_packages", hostileExportError("list persona exports")),
    (app) => requestJson(app, "GET", `/exports/persona/${PERSONA_ID}`, { token: "owner-token" }),
    {
      error: "Could not load export packages.",
      code: "persona_export_list_failed",
    }
  );

  await expectRouteError(
    (db) => db.operationErrors.set("select:export_packages", hostileExportError("list Developer Space exports")),
    (app) => requestJson(app, "GET", `/exports/developer-spaces/${DEVELOPER_SPACE_ID}`, {
      token: "owner-token",
    }),
    {
      error: "Could not load Developer Space export packages.",
      code: "developer_space_export_list_failed",
    }
  );

  await expectRouteError(
    (db) => db.operationErrors.set("select:export_packages", hostileExportError("list Project exports")),
    (app) => requestJson(app, "GET", "/exports/projects/animus-project", { token: "owner-token" }),
    {
      error: "Could not load Project export packages.",
      code: "project_export_list_failed",
    }
  );

  await expectRouteError(
    (db) => db.operationErrors.set("insert:export_packages", hostileExportError("create persona package")),
    (app) => requestJson(app, "POST", `/exports/persona/${PERSONA_ID}`, { token: "owner-token" }),
    {
      error: "Could not create export package.",
      code: "persona_export_create_failed",
    },
    (db) => assert.equal(db.tables.export_packages.length, 0)
  );

  await expectRouteError(
    (db) => db.operationErrors.set("select:memory_items", hostileExportError("build persona package")),
    (app) => requestJson(app, "POST", `/exports/persona/${PERSONA_ID}`, { token: "owner-token" }),
    {
      error: "Could not create export package.",
      code: "persona_export_create_failed",
    },
    (db) => {
      assert.equal(db.tables.export_packages[0].status, "failed");
      assert.match(db.tables.export_packages[0].error_message, /private-export-route-marker/);
    }
  );

  await expectRouteError(
    (db) => db.operationErrors.set("select:developer_space_nodes", hostileExportError("build Developer Space package")),
    (app) => requestJson(app, "POST", `/exports/developer-spaces/${DEVELOPER_SPACE_ID}`, {
      token: "owner-token",
    }),
    {
      error: "Could not create Developer Space export package.",
      code: "developer_space_export_create_failed",
    },
    (db) => {
      assert.equal(db.tables.export_packages[0].status, "failed");
      assert.match(db.tables.export_packages[0].error_message, /private-export-route-marker/);
    }
  );

  await expectRouteError(
    (db) => db.operationErrors.set("select:developer_spaces", hostileExportError("build Project package")),
    (app) => requestJson(app, "POST", "/exports/projects/animus-project", { token: "owner-token" }),
    {
      error: "Could not create Project manifest package.",
      code: "project_export_create_failed",
    },
    (db) => {
      assert.equal(db.tables.export_packages[0].status, "failed");
      assert.match(db.tables.export_packages[0].error_message, /private-export-route-marker/);
    }
  );
});

test("owner can export persona archive while preserving provenance and privacy boundaries", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createExportsApp();

  try {
    const anonymousCreate = await requestJson(app, "POST", `/exports/persona/${PERSONA_ID}`);
    assert.equal(anonymousCreate.status, 401);

    const anonymousList = await requestJson(app, "GET", `/exports/persona/${PERSONA_ID}`);
    assert.equal(anonymousList.status, 401);

    const blocked = await requestJson(app, "POST", `/exports/persona/${PERSONA_ID}`, {
      token: "other-token",
    });
    assert.equal(blocked.status, 404);

    const blockedList = await requestJson(app, "GET", `/exports/persona/${PERSONA_ID}`, {
      token: "other-token",
    });
    assert.equal(blockedList.status, 404);

    const created = await requestJson(app, "POST", `/exports/persona/${PERSONA_ID}`, {
      token: "owner-token",
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.exportPackage.status, "completed");
    assert.equal(created.body.manifest.schema, "station.persona.export.v1");
    assert.equal(created.body.manifest.persona.name, "Harbor");
    assert.equal(created.body.manifest.counts.memory, 1);
    assert.equal(created.body.manifest.counts.canon, 1);
    assert.equal(created.body.manifest.counts.archiveFiles, 1);
    assert.equal(created.body.manifest.counts.archiveImports, 1);
    assert.equal(created.body.manifest.counts.archivedChats, 1);
    assert.equal(created.body.manifest.counts.continuityCandidates, 1);
    assert.equal(created.body.manifest.counts.continuityRecords, 1);
    assert.equal(created.body.manifest.counts.integritySessions, 1);
    assert.equal(created.body.manifest.counts.publishedDocuments, 4);
    assert.equal(created.body.manifest.counts.documentVersions, 1);
    assert.equal(created.body.manifest.counts.moderationReports, 2);
    assert.equal(created.body.manifest.trust.provenancePreserved, true);
    assert.equal(created.body.manifest.trust.publicationStatesPreserved, true);
    assert.equal(created.body.manifest.trust.documentVersionHistoryPreserved, true);
    assert.equal(created.body.manifest.trust.continuityRecordVisibilityPreserved, true);
    assert.equal(created.body.manifest.trust.ownerReportsOnly, true);
    assert.equal(created.body.manifest.trust.sourceRowsRemainPrivate, true);

    const manifestText = JSON.stringify(created.body.manifest);
    assert.match(manifestText, /Harbor remembers the owner values grounded continuity/);
    assert.match(manifestText, /Preserve continuity before novelty/);
    assert.match(manifestText, /private\/source-notebook\.md/);
    assert.match(manifestText, /Harbor working chat/);
    assert.match(manifestText, /Archive boundary memory/);
    assert.match(manifestText, /Public continuity milestone/);
    assert.match(manifestText, /Document \/ public \/ published/);
    assert.match(manifestText, /Private transcript is owner exportable/);
    assert.doesNotMatch(manifestText, /Other owner memory must not leak/);
    assert.doesNotMatch(manifestText, /Other owner transcript must not leak/);
    assert.doesNotMatch(manifestText, /Other owner candidate must not leak/);
    assert.doesNotMatch(manifestText, /Other owner continuity record must not leak/);
    assert.doesNotMatch(manifestText, /Other owner version must not leak/);
    assert.doesNotMatch(manifestText, /Private Draft/);
    assert.doesNotMatch(manifestText, /Draft-only report note/);
    assert.doesNotMatch(manifestText, /Other reporter private note/);
    assert.doesNotMatch(manifestText, /Hidden comment report note/);
    assert.doesNotMatch(manifestText, /Duplicate owner report note must collapse/);

    const continuityRecord = created.body.manifest.continuity.continuityRecords[0];
    assert.equal(continuityRecord.visibility, "public");
    assert.equal(continuityRecord.source.table, "documents");
    assert.equal(continuityRecord.metadata.publicationState, "published");

    const publicationVisibility = created.body.manifest.publicationState.documentVisibility;
    assert.deepEqual(publicationVisibility, {
      private: 1,
      unlisted: 1,
      community: 1,
      public: 1,
    });

    const documentRef = created.body.manifest.publishedDocumentRefs.find((doc: Row) => doc.id === DOC_ID);
    assert.equal(documentRef.provenanceType, "persona_derived");
    assert.equal(documentRef.sourceType, "canon");
    assert.equal(documentRef.sourceLabel, "Canon / priority 8");
    assert.equal(documentRef.visibility, "public");
    assert.equal(documentRef.version, 1);
    assert.equal(documentRef.versions.length, 1);
    assert.equal(documentRef.versions[0].versionNumber, 1);
    assert.equal(documentRef.versions[0].title, "Published Continuity Note Draft");
    assert.equal(documentRef.versions[0].documentType, "codex");
    assert.equal(documentRef.versions[0].sourceLabel, "Canon / priority 8");
    assert.deepEqual(
      created.body.manifest.publishedDocumentRefs.map((doc: Row) => doc.visibility).sort(),
      ["community", "private", "public", "unlisted"],
    );

    const exportedComments = documentRef.discussion.comments.map((comment: Row) => comment.body);
    assert.deepEqual(exportedComments.sort(), [
      "Owner-authored hidden note stays in owner export.",
      "Visible community response.",
    ].sort());
    assert.equal(
      exportedComments.some((body: string) => body.includes("Hidden other-user")),
      false
    );
    assert.equal(
      exportedComments.some((body: string) => body.includes("Removed other-user")),
      false
    );
    const reports = created.body.manifest.moderationReportRefs;
    assert.deepEqual(reports.map((report: Row) => report.id).sort(), [
      "report-owner-comment",
      "report-owner-document",
    ].sort());
    assert.equal(reports.some((report: Row) => report.reason === "other reporter must not leak"), false);
    assert.equal(reports.some((report: Row) => report.reason === "draft report must not export"), false);
    assert.deepEqual(created.body.manifest.publicationState.moderationReportStatus, {
      reviewed: 1,
      open: 1,
    });

    const listed = await requestJson(app, "GET", `/exports/persona/${PERSONA_ID}`, {
      token: "owner-token",
    });
    assert.equal(listed.status, 200);
    assert.equal(listed.body.exports.length, 1);
    assert.equal(listed.body.exports[0].contentSummary.discussionComments, 2);
    assert.equal(listed.body.exports[0].contentSummary.documentVersions, 1);
    assert.equal(listed.body.exports[0].contentSummary.moderationReports, 2);

    const readBack = await requestJson(app, "GET", `/exports/${created.body.exportPackage.id}`, {
      token: "owner-token",
    });
    assert.equal(readBack.status, 200);
    assert.match(readBack.body.manifestMarkdown, /Station Export: Harbor/);
    assert.match(readBack.body.manifestMarkdown, /Provenance preserved: yes/);
    assert.match(readBack.body.manifestMarkdown, /Continuity Timeline Records/);
    assert.match(readBack.body.manifestMarkdown, /Publication States/);
    assert.match(readBack.body.manifestMarkdown, /Document Version History/);
    assert.match(readBack.body.manifestMarkdown, /Published Continuity Note: current v1, prior versions 1/);
    assert.match(readBack.body.manifestMarkdown, /Moderation Report References/);

    const bundleReadBack = await requestJson(app, "GET", `/exports/${created.body.exportPackage.id}/bundle`, {
      token: "owner-token",
    });
    assert.equal(bundleReadBack.status, 200);
    const anonymousReadBack = await requestJson(app, "GET", `/exports/${created.body.exportPackage.id}`);
    assert.equal(anonymousReadBack.status, 401);
    const anonymousBundleRead = await requestJson(app, "GET", `/exports/${created.body.exportPackage.id}/bundle`);
    assert.equal(anonymousBundleRead.status, 401);
    assert.equal(bundleReadBack.body.bundle.package.id, created.body.exportPackage.id);
    const personaBundleFiles = assertBundleIntegrity(bundleReadBack.body.bundle, "persona_archive");
    assert.match(personaBundleFiles.get("manifest.json")?.sha256, /^[a-f0-9]{64}$/);
    assert.match(personaBundleFiles.get("manifest.json")?.content, /"schema": "station.persona.export.v1"/);
    assert.match(personaBundleFiles.get("manifest.md")?.content, /Station Export: Harbor/);
    const personaBundleText = JSON.stringify(bundleReadBack.body.bundle);
    assert.doesNotMatch(personaBundleText, /Other owner memory must not leak/);
    assert.doesNotMatch(personaBundleText, /Other owner transcript must not leak/);

    const blockedRead = await requestJson(app, "GET", `/exports/${created.body.exportPackage.id}`, {
      token: "other-token",
    });
    assert.equal(blockedRead.status, 404);

    const blockedBundleRead = await requestJson(app, "GET", `/exports/${created.body.exportPackage.id}/bundle`, {
      token: "other-token",
    });
    assert.equal(blockedBundleRead.status, 404);

    const blockedDeveloperSpaceExport = await requestJson(app, "POST", `/exports/developer-spaces/${DEVELOPER_SPACE_ID}`, {
      token: "other-token",
    });
    assert.equal(blockedDeveloperSpaceExport.status, 404);

    const blockedDeveloperSpaceList = await requestJson(app, "GET", `/exports/developer-spaces/${DEVELOPER_SPACE_ID}`, {
      token: "other-token",
    });
    assert.equal(blockedDeveloperSpaceList.status, 404);

    const anonymousDeveloperSpaceExport = await requestJson(app, "POST", `/exports/developer-spaces/${DEVELOPER_SPACE_ID}`);
    assert.equal(anonymousDeveloperSpaceExport.status, 401);

    const anonymousDeveloperSpaceList = await requestJson(app, "GET", `/exports/developer-spaces/${DEVELOPER_SPACE_ID}`);
    assert.equal(anonymousDeveloperSpaceList.status, 401);

    const developerSpaceExport = await requestJson(app, "POST", `/exports/developer-spaces/${DEVELOPER_SPACE_ID}`, {
      token: "owner-token",
    });
    assert.equal(developerSpaceExport.status, 201);
    assert.equal(developerSpaceExport.body.exportPackage.packageKind, "developer_space_archive");
    assert.equal(developerSpaceExport.body.exportPackage.developerSpaceId, DEVELOPER_SPACE_ID);
    assert.equal(developerSpaceExport.body.exportPackage.personaId, null);
    assert.equal(developerSpaceExport.body.manifest.schema, "station.developer_space.export.v1");
    assert.equal(developerSpaceExport.body.manifest.space.projectName, "Animus Field");
    assert.equal(developerSpaceExport.body.manifest.counts.nodes, 1);
    assert.equal(developerSpaceExport.body.manifest.counts.events, 2);
    assert.equal(developerSpaceExport.body.manifest.counts.snapshots, 1);
    assert.equal(developerSpaceExport.body.manifest.counts.linkedPublicDocuments, 1);
    assert.equal(developerSpaceExport.body.manifest.usage.counters.publicReads, 7);
    assert.equal(developerSpaceExport.body.manifest.usage.limits.events, 100000);
    assert.equal(developerSpaceExport.body.manifest.trust.apiKeysExcluded, true);
    assert.equal(developerSpaceExport.body.manifest.trust.linkedDocumentsPublicSafeOnly, true);
    assert.equal(developerSpaceExport.body.manifest.events.some((event: Row) => event.eventLabel === "Private diagnostic"), true);
    assert.equal(developerSpaceExport.body.manifest.linkedPublicDocumentRefs.length, 1);
    assert.equal(developerSpaceExport.body.manifest.linkedPublicDocumentRefs[0].document.title, "Animus public field log");
    const developerManifestText = JSON.stringify(developerSpaceExport.body.manifest);
    assert.match(developerManifestText, /owner-only diagnostic/);
    assert.match(developerManifestText, /Public field log body is safe/);
    assert.doesNotMatch(developerManifestText, /must-not-export/);
    assert.doesNotMatch(developerManifestText, /Private Developer Space method/);
    assert.doesNotMatch(developerManifestText, /Other secret/);
    assert.doesNotMatch(developerManifestText, /mustNotLeak/);
    assert.equal(db.tables.developer_space_usage[0].export_count, 1);

    const listedDeveloperSpaceExports = await requestJson(app, "GET", `/exports/developer-spaces/${DEVELOPER_SPACE_ID}`, {
      token: "owner-token",
    });
    assert.equal(listedDeveloperSpaceExports.status, 200);
    assert.equal(listedDeveloperSpaceExports.body.exports.length, 1);
    assert.equal(listedDeveloperSpaceExports.body.exports[0].contentSummary.linkedPublicDocuments, 1);

    const developerSpaceReadBack = await requestJson(app, "GET", `/exports/${developerSpaceExport.body.exportPackage.id}`, {
      token: "owner-token",
    });
    assert.equal(developerSpaceReadBack.status, 200);
    assert.match(developerSpaceReadBack.body.manifestMarkdown, /Station Developer Space Export: Animus Field/);
    assert.match(developerSpaceReadBack.body.manifestMarkdown, /Linked Public Documents/);

    const developerSpaceBundle = await requestJson(app, "GET", `/exports/${developerSpaceExport.body.exportPackage.id}/bundle`, {
      token: "owner-token",
    });
    assert.equal(developerSpaceBundle.status, 200);
    const anonymousDeveloperSpaceReadBack = await requestJson(app, "GET", `/exports/${developerSpaceExport.body.exportPackage.id}`);
    assert.equal(anonymousDeveloperSpaceReadBack.status, 401);
    const anonymousDeveloperSpaceBundle = await requestJson(app, "GET", `/exports/${developerSpaceExport.body.exportPackage.id}/bundle`);
    assert.equal(anonymousDeveloperSpaceBundle.status, 401);
    const developerBundleFiles = assertBundleIntegrity(developerSpaceBundle.body.bundle, "developer_space_archive");
    assert.match(developerBundleFiles.get("manifest.json")?.content, /"schema": "station.developer_space.export.v1"/);
    assert.match(developerBundleFiles.get("manifest.md")?.content, /Station Developer Space Export: Animus Field/);
    const developerBundleText = JSON.stringify(developerSpaceBundle.body.bundle);
    assert.match(developerBundleText, /owner-only diagnostic/);
    assert.doesNotMatch(developerBundleText, /must-not-export/);
    assert.doesNotMatch(developerBundleText, /other-secret/);
    assert.doesNotMatch(developerBundleText, /Other secret/);

    const blockedDeveloperSpaceReadBack = await requestJson(app, "GET", `/exports/${developerSpaceExport.body.exportPackage.id}`, {
      token: "other-token",
    });
    assert.equal(blockedDeveloperSpaceReadBack.status, 404);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("owner can create and read Project manifest bundles from stored readback", async () => {
  const db = new InMemorySupabase();
  db.insertRow("developer_spaces", {
    id: "project-unattached-space",
    owner_user_id: OWNER_ID,
    project_id: null,
    project_name: "Unattached Project Space",
    slug: "unattached-project-space",
    description: "Must not appear in Project manifest.",
    visibility: "public",
    visualisation_type: "timeline",
    visualisation_config: {},
    created_at: "2026-05-26T09:18:00.000Z",
    updated_at: "2026-05-26T09:18:00.000Z",
  });
  db.insertRow("developer_spaces", {
    id: "project-other-project-space",
    owner_user_id: OWNER_ID,
    project_id: OTHER_PROJECT_ID,
    project_name: "Other Project Space",
    slug: "other-project-space",
    description: "Must not appear in this Project manifest.",
    visibility: "public",
    visualisation_type: "timeline",
    visualisation_config: {},
    created_at: "2026-05-26T09:18:30.000Z",
    updated_at: "2026-05-26T09:18:30.000Z",
  });
  db.insertRow("developer_space_documents", {
    id: "project-unattached-link",
    developer_space_id: "project-unattached-space",
    document_id: DEV_PUBLIC_DOC_ID,
    owner_user_id: OWNER_ID,
    document_role: "finding",
    link_visibility: "public",
    sort_order: 1,
    created_at: "2026-05-26T09:19:00.000Z",
    updated_at: "2026-05-26T09:19:00.000Z",
  });
  db.insertRow("developer_space_documents", {
    id: "project-other-project-link",
    developer_space_id: "project-other-project-space",
    document_id: DEV_PUBLIC_DOC_ID,
    owner_user_id: OWNER_ID,
    document_role: "finding",
    link_visibility: "public",
    sort_order: 1,
    created_at: "2026-05-26T09:19:30.000Z",
    updated_at: "2026-05-26T09:19:30.000Z",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = await createExportsApp();

  try {
    const anonymous = await requestJson(app, "GET", "/exports/projects/animus-project");
    assert.equal(anonymous.status, 401);

    const anonymousCreate = await requestJson(app, "POST", "/exports/projects/animus-project");
    assert.equal(anonymousCreate.status, 401);

    const blockedList = await requestJson(app, "GET", "/exports/projects/animus-project", {
      token: "other-token",
    });
    assert.equal(blockedList.status, 404);

    const blockedCreate = await requestJson(app, "POST", "/exports/projects/animus-project", {
      token: "other-token",
    });
    assert.equal(blockedCreate.status, 404);

    const created = await requestJson(app, "POST", "/exports/projects/animus-project", {
      token: "owner-token",
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.exportPackage.packageKind, "project_manifest");
    assert.equal(created.body.exportPackage.projectId, PROJECT_ID);
    assert.equal(created.body.exportPackage.personaId, null);
    assert.equal(created.body.exportPackage.developerSpaceId, null);
    assert.equal(created.body.exportPackage.ownerUserId, OWNER_ID);
    assert.deepEqual(created.body.exportPackage.includedSections, [
      "project",
      "attached_developer_spaces",
      "owner_project_evidence_refs",
      "public_project_evidence_refs",
      "trust",
    ]);

    const packageRow = db.tables.export_packages.find((row) => row.id === created.body.exportPackage.id);
    assert.equal(packageRow.project_id, PROJECT_ID);
    assert.equal(packageRow.persona_id, null);
    assert.equal(packageRow.developer_space_id, null);
    assert.equal(packageRow.package_kind, "project_manifest");
    assert.equal(packageRow.owner_user_id, OWNER_ID);

    assert.deepEqual(Object.keys(created.body.manifest).sort(), [
      "attachedDeveloperSpaces",
      "generatedAt",
      "ownerProjectEvidenceRefs",
      "package",
      "project",
      "publicProjectEvidenceRefs",
      "schema",
      "trust",
    ]);
    assert.equal(created.body.manifest.schema, "station.project.export_manifest.v1");
    assert.deepEqual(created.body.manifest.project, {
      name: "Animus Project",
      slug: "animus-project",
      description: "Owner Project export fixture.",
      visibility: "private",
      createdAt: "2026-05-26T09:00:00.000Z",
      updatedAt: "2026-05-26T09:17:00.000Z",
    });
    assert.deepEqual(
      created.body.manifest.attachedDeveloperSpaces.map((space: Row) => space.projectName),
      ["Animus Field"]
    );
    assert.deepEqual(
      created.body.manifest.ownerProjectEvidenceRefs.map((item: Row) => item.document.title).sort(),
      ["Animus private method", "Animus public field log"].sort()
    );
    assert.equal(created.body.manifest.ownerProjectEvidenceRefs[0].developerSpace.projectName, "Animus Field");
    assert.equal(created.body.manifest.ownerProjectEvidenceRefs[0].developerSpace.slug, "animus-field");
    assert.equal(created.body.manifest.ownerProjectEvidenceRefs.some((item: Row) => item.routeHref === "/developer-spaces/animus-field"), true);
    assert.equal(
      created.body.manifest.ownerProjectEvidenceRefs.some((item: Row) => item.document.sourceLabel === "Developer Space: Animus Field"),
      true
    );
    assert.deepEqual(created.body.manifest.publicProjectEvidenceRefs, [{
      title: "Animus public field log",
      kind: "field_log",
      href: "/developer-spaces/animus-field",
      sourceLabel: "Public Developer Space",
      publishedAt: "2026-05-26T09:11:00.000Z",
      updatedAt: "2026-05-26T09:11:00.000Z",
    }]);
    assert.equal(created.body.manifest.trust.ownerOnly, true);
    assert.equal(created.body.manifest.trust.documentBodiesOmitted, true);
    assert.equal(created.body.manifest.trust.publicReferencesSeparated, true);
    assert.equal(created.body.manifest.trust.linkedSourceRowsRemainPrivate, true);

    const manifestText = JSON.stringify(created.body.manifest);
    for (const forbidden of [
      PROJECT_ID,
      OTHER_PROJECT_ID,
      DEVELOPER_SPACE_ID,
      DEV_PUBLIC_DOC_ID,
      DEV_PRIVATE_DOC_ID,
      "dev-link-public",
      "dev-link-private",
      "project-unattached-link",
      "project-other-project-link",
      "Public field log body is safe to reference.",
      "Private Developer Space method must not leave public-safe export refs.",
      "source_id",
      "sourceId",
      "body",
      "nodes",
      "events",
      "snapshots",
      "usage",
      "export_count",
      "storage",
      "must-not-export",
      "owner_user_id",
      "Other Field",
      "Unattached Project Space",
      "Other Project Space",
    ]) {
      assert.equal(manifestText.includes(forbidden), false, `${forbidden} leaked into Project manifest`);
    }

    const listed = await requestJson(app, "GET", `/exports/projects/${PROJECT_ID}`, {
      token: "owner-token",
    });
    assert.equal(listed.status, 200);
    assert.equal(listed.body.exports.length, 1);
    assert.equal(listed.body.exports[0].projectId, PROJECT_ID);
    assert.equal(listed.body.exports[0].contentSummary.attachedDeveloperSpaces, 1);
    assert.equal(listed.body.exports[0].contentSummary.ownerProjectEvidenceRefs, 2);
    assert.equal(listed.body.exports[0].contentSummary.publicProjectEvidenceRefs, 1);

    const readBack = await requestJson(app, "GET", `/exports/${created.body.exportPackage.id}`, {
      token: "owner-token",
    });
    assert.equal(readBack.status, 200);
    assert.equal(readBack.body.exportPackage.projectId, PROJECT_ID);
    assert.match(readBack.body.manifestMarkdown, /Station Project Export Manifest: Animus Project/);
    assert.match(readBack.body.manifestMarkdown, /Document bodies omitted: yes/);
    assert.match(readBack.body.manifestMarkdown, /Public Project Evidence References/);

    const storedManifest = clone(packageRow.manifest_json);
    const storedMarkdown = packageRow.manifest_markdown;

    const liveProject = db.tables.projects.find((row) => row.id === PROJECT_ID);
    liveProject.name = "Mutated live Project name must not leak";
    liveProject.description = "Mutated live Project description must not leak";

    const liveDeveloperSpace = db.tables.developer_spaces.find((row) => row.id === DEVELOPER_SPACE_ID);
    liveDeveloperSpace.project_name = "Mutated live Developer Space must not leak";
    liveDeveloperSpace.description = "Mutated live Developer Space description must not leak";

    const liveLink = db.tables.developer_space_documents.find((row) => row.id === "dev-link-public");
    liveLink.document_role = "mutated-link-role-must-not-leak";
    liveLink.link_visibility = "private";

    const liveDocument = db.tables.documents.find((row) => row.id === DEV_PUBLIC_DOC_ID);
    liveDocument.title = "Mutated live document title must not leak";
    liveDocument.body = "Mutated live document body must not leak";
    liveDocument.source_id = "mutated-source-id-must-not-leak";
    liveDocument.source_label = "Mutated source label must not leak";

    db.tables.developer_space_nodes[0].node_name = "Mutated node must not leak";
    db.tables.developer_space_events[0].event_label = "Mutated event must not leak";
    db.tables.developer_space_snapshots[0].snapshot_data = { summary: "Mutated snapshot must not leak" };
    db.tables.developer_space_usage[0].storage_bytes = 999999;
    db.tables.developer_space_usage[0].public_detail_reads_count = 999999;
    db.tables.developer_space_usage[0].export_count = 999999;
    for (const table of [
      "projects",
      "developer_spaces",
      "developer_space_documents",
      "documents",
      "developer_space_nodes",
      "developer_space_events",
      "developer_space_snapshots",
      "developer_space_usage",
    ]) {
      db.failSelectTables.add(table);
    }

    const anonymousBundle = await requestJson(app, "GET", `/exports/${created.body.exportPackage.id}/bundle`);
    assert.equal(anonymousBundle.status, 401);

    const anonymousReadBack = await requestJson(app, "GET", `/exports/${created.body.exportPackage.id}`);
    assert.equal(anonymousReadBack.status, 401);

    const missingBundle = await requestJson(app, "GET", "/exports/missing-project-manifest-package/bundle", {
      token: "owner-token",
    });
    assert.equal(missingBundle.status, 404);

    const blockedReadBack = await requestJson(app, "GET", `/exports/${created.body.exportPackage.id}`, {
      token: "other-token",
    });
    assert.equal(blockedReadBack.status, 404);

    const blockedBundleReadBack = await requestJson(app, "GET", `/exports/${created.body.exportPackage.id}/bundle`, {
      token: "other-token",
    });
    assert.equal(blockedBundleReadBack.status, 404);

    const bundleReadBack = await requestJson(app, "GET", `/exports/${created.body.exportPackage.id}/bundle`, {
      token: "owner-token",
    });
    assert.equal(bundleReadBack.status, 200);
    const bundle = bundleReadBack.body.bundle;
    assert.equal(bundle.schema, "station.export.bundle.v1");
    assert.equal(bundle.package.id, created.body.exportPackage.id);
    assert.deepEqual(Object.keys(bundle.package).sort(), ["format", "id", "packageKind", "status"]);
    assert.equal(bundle.package.packageKind, "project_manifest");
    assert.equal(bundle.package.format, "json_markdown");
    assert.equal(bundle.package.status, "completed");
    assert.equal(bundle.privacy.ownerOnly, true);
    assert.equal(bundle.integrity.algorithm, "sha256");
    assert.equal(bundle.integrity.fileCount, 3);
    const projectBundleFiles = assertBundleIntegrity(bundle, "project_manifest");
    assert.deepEqual(JSON.parse(projectBundleFiles.get("manifest.json")?.content ?? "{}"), storedManifest);
    assert.equal(projectBundleFiles.get("manifest.md")?.content, storedMarkdown);
    assert.equal(
      (projectBundleFiles.get("README.md")?.content ?? "").includes(`Package: ${created.body.exportPackage.id}`),
      true
    );
    assert.match(projectBundleFiles.get("README.md")?.content ?? "", /Kind: project_manifest/);
    assert.doesNotMatch(projectBundleFiles.get("README.md")?.content ?? "", /Animus Project/);
    assert.doesNotMatch(projectBundleFiles.get("README.md")?.content ?? "", /Animus Field/);

    const bundleText = JSON.stringify(bundle);
    for (const forbidden of [
      PROJECT_ID,
      OTHER_PROJECT_ID,
      OWNER_ID,
      OTHER_ID,
      DEVELOPER_SPACE_ID,
      DEV_PUBLIC_DOC_ID,
      DEV_PRIVATE_DOC_ID,
      "dev-link-public",
      "dev-link-private",
      "ownerUserId",
      "owner_user_id",
      "projectId",
      "project_id",
      "developerSpaceId",
      "developer_space_id",
      "personaId",
      "persona_id",
      "source_id",
      "sourceId",
      "author_user_id",
      "authorUserId",
      "Mutated live Project name must not leak",
      "Mutated live Project description must not leak",
      "Mutated live Developer Space must not leak",
      "Mutated live Developer Space description must not leak",
      "mutated-link-role-must-not-leak",
      "Mutated live document title must not leak",
      "Mutated live document body must not leak",
      "mutated-source-id-must-not-leak",
      "Mutated source label must not leak",
      "Mutated node must not leak",
      "Mutated event must not leak",
      "Mutated snapshot must not leak",
      "Public field log body is safe to reference.",
      "Private Developer Space method must not leave public-safe export refs.",
      "rawSignal",
      "nodes",
      "events",
      "snapshots",
      "usage",
      "export_count",
      "storage_bytes",
      "public_detail_reads_count",
      "api_key_hash",
      "must-not-export",
      "other-secret",
      "DATABASE_URL",
      "Cloudflare",
      "Redis",
      "queue",
      "worker",
      "provider",
      "model",
      "runtime",
      "billing",
      "member",
      "admin",
      "stack trace",
      "SQL",
    ]) {
      assert.equal(bundleText.includes(forbidden), false, `${forbidden} leaked into Project bundle`);
    }
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("project manifest bundle rejects non-completed and malformed stored readbacks", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createExportsApp();

  try {
    for (const status of ["requested", "processing", "failed", "abandoned"]) {
      const row = db.insertRow("export_packages", {
        owner_user_id: OWNER_ID,
        project_id: PROJECT_ID,
        package_kind: "project_manifest",
        status,
        manifest_json: {
          schema: "station.project.export_manifest.v1",
          privateStoredDetail: `stored ${status} detail must not leak`,
        },
        manifest_markdown: `# Stored ${status} markdown must not leak`,
        error_message: `SQL stack trace for ${status} with DATABASE_URL must not leak`,
      });

      const response = await requestJson(app, "GET", `/exports/${row.id}/bundle`, {
        token: "owner-token",
      });
      assert.equal(response.status, 409);
      const responseText = JSON.stringify(response.body);
      assert.doesNotMatch(responseText, /privateStoredDetail/);
      assert.doesNotMatch(responseText, /Stored .* markdown must not leak/);
      assert.doesNotMatch(responseText, /SQL stack trace/);
      assert.doesNotMatch(responseText, /DATABASE_URL/);
    }

    for (const table of [
      "projects",
      "developer_spaces",
      "developer_space_documents",
      "documents",
      "developer_space_nodes",
      "developer_space_events",
      "developer_space_snapshots",
      "developer_space_usage",
    ]) {
      db.failSelectTables.add(table);
    }

    const malformedRows = [
      {
        label: "missing-json",
        manifestJson: null,
        manifestMarkdown: "# Stored missing-json markdown must not leak",
      },
      {
        label: "array-json",
        manifestJson: [],
        manifestMarkdown: "# Stored array-json markdown must not leak",
      },
      {
        label: "wrong-schema",
        manifestJson: { schema: "station.project.wrong.v1", detail: "wrong schema detail must not leak" },
        manifestMarkdown: "# Stored wrong-schema markdown must not leak",
      },
      {
        label: "schema-only",
        manifestJson: { schema: "station.project.export_manifest.v1", detail: "schema-only detail must not leak" },
        manifestMarkdown: "# Stored schema-only markdown must not leak",
      },
      {
        label: "missing-markdown",
        manifestJson: { schema: "station.project.export_manifest.v1", detail: "missing markdown detail must not leak" },
        manifestMarkdown: "",
      },
      {
        label: "object-markdown",
        manifestJson: { schema: "station.project.export_manifest.v1", detail: "object markdown detail must not leak" },
        manifestMarkdown: { body: "object markdown body must not leak" },
      },
    ];

    for (const scenario of malformedRows) {
      const row = db.insertRow("export_packages", {
        owner_user_id: OWNER_ID,
        project_id: PROJECT_ID,
        package_kind: "project_manifest",
        status: "completed",
        manifest_json: { schema: "station.project.export_manifest.v1" },
        manifest_markdown: "# valid placeholder",
      });
      row.manifest_json = scenario.manifestJson;
      row.manifest_markdown = scenario.manifestMarkdown;

      const response = await requestJson(app, "GET", `/exports/${row.id}/bundle`, {
        token: "owner-token",
      });
      assert.equal(response.status, 409, scenario.label);
      const responseText = JSON.stringify(response.body);
      assert.match(responseText, /stored manifest readback is complete/);
      assert.doesNotMatch(responseText, /wrong schema detail/);
      assert.doesNotMatch(responseText, /schema-only detail/);
      assert.doesNotMatch(responseText, /missing markdown detail/);
      assert.doesNotMatch(responseText, /object markdown body/);
      assert.doesNotMatch(responseText, /Stored .* markdown must not leak/);
      assert.doesNotMatch(responseText, /Animus Project/);
      assert.doesNotMatch(responseText, /Animus Field/);
    }
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("owner can create and read workspace manifest bundles from high-level inventory", async () => {
  const db = new InMemorySupabase();
  db.tables.personas[0].visibility = "public";
  db.tables.personas[0].public_slug = "harbor-guide";
  db.tables.personas[0].public_chat_enabled = true;
  db.tables.personas[0].public_anonymous_chat_enabled = false;
  setSupabaseAdminForTests(db.client as any);
  const app = await createExportsApp();

  try {
    const anonymousList = await requestJson(app, "GET", "/exports/workspace");
    assert.equal(anonymousList.status, 401);

    const anonymousCreate = await requestJson(app, "POST", "/exports/workspace");
    assert.equal(anonymousCreate.status, 401);

    const created = await requestJson(app, "POST", "/exports/workspace", {
      token: "owner-token",
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.exportPackage.packageKind, "workspace_manifest");
    assert.equal(created.body.exportPackage.status, "completed");
    assert.equal("ownerUserId" in created.body.exportPackage, false);
    assert.equal("personaId" in created.body.exportPackage, false);
    assert.equal("developerSpaceId" in created.body.exportPackage, false);
    assert.equal("projectId" in created.body.exportPackage, false);
    assert.deepEqual(created.body.exportPackage.includedSections, [
      "personas",
      "spaces",
      "developer_spaces",
      "projects",
      "public_published_document_refs",
      "export_package_class_counts",
      "trust",
      "excluded_material",
      "future_material",
    ]);

    const packageRow = db.tables.export_packages.find((row) => row.id === created.body.exportPackage.id);
    assert.equal(packageRow.owner_user_id, OWNER_ID);
    assert.equal(packageRow.package_kind, "workspace_manifest");
    assert.equal(packageRow.persona_id, null);
    assert.equal(packageRow.developer_space_id, null);
    assert.equal(packageRow.project_id, null);

    assert.deepEqual(Object.keys(created.body.manifest).sort(), [
      "counts",
      "excludedMaterial",
      "futureMaterial",
      "generatedAt",
      "package",
      "schema",
      "trust",
      "workspaceInventory",
    ]);
    assert.equal(created.body.manifest.schema, "station.workspace.export_manifest.v1");
    assert.equal(created.body.manifest.package.packageKind, "workspace_manifest");
    assert.equal(created.body.manifest.counts.personas, 1);
    assert.equal(created.body.manifest.counts.spaces, 1);
    assert.equal(created.body.manifest.counts.developerSpaces, 1);
    assert.equal(created.body.manifest.counts.projects, 1);
    assert.equal(created.body.manifest.counts.publicPublishedDocumentRefs, 1);
    assert.equal(created.body.manifest.counts.exportPackages, 1);
    assert.equal(created.body.manifest.workspaceInventory.personas[0].name, "Harbor");
    assert.equal(created.body.manifest.workspaceInventory.personas[0].publicHref, "/personas/harbor-guide");
    assert.equal(created.body.manifest.workspaceInventory.spaces[0].publicHref, "/space/harbor-space");
    assert.equal(created.body.manifest.workspaceInventory.developerSpaces[0].linkedProject.name, "Animus Project");
    assert.equal(created.body.manifest.workspaceInventory.projects[0].name, "Animus Project");
    assert.deepEqual(created.body.manifest.workspaceInventory.publicPublishedDocumentRefs, [{
      title: "Published Continuity Note",
      slug: "published-continuity-note",
      documentType: "essay",
      publishedAt: "2026-05-26T09:06:00.000Z",
      publicHref: "/space/harbor-space",
      publicSpace: {
        title: "Harbor Space",
        slug: "harbor-space",
      },
      createdAt: "2026-05-26T09:06:00.000Z",
      updatedAt: "2026-05-26T09:06:00.000Z",
    }]);
    assert.equal(created.body.manifest.workspaceInventory.exportPackageClasses[0].packageKind, "workspace_manifest");
    assert.equal(created.body.manifest.workspaceInventory.exportPackageClasses[0].statuses.completed, 1);
    assert.equal(created.body.manifest.trust.ownerOnly, true);
    assert.equal(created.body.manifest.trust.documentBodiesOmitted, true);
    assert.equal(created.body.manifest.trust.privateSourceBodiesOmitted, true);
    assert.equal(created.body.manifest.trust.originalFilesOmitted, true);
    assert.equal(created.body.manifest.trust.storagePathsAndSignedUrlsOmitted, true);
    assert.equal(created.body.manifest.trust.noPublicExportAccess, true);
    assert.equal(created.body.manifest.trust.noManagedBackupRestoreGuarantee, true);

    const manifestText = JSON.stringify(created.body.manifest);
    for (const forbidden of [
      OWNER_ID,
      OTHER_ID,
      PERSONA_ID,
      SPACE_ID,
      DOC_ID,
      DEVELOPER_SPACE_ID,
      PROJECT_ID,
      DEV_PUBLIC_DOC_ID,
      DEV_PRIVATE_DOC_ID,
      "memory-1",
      "canon-1",
      "conversation-1",
      "Harbor remembers the owner values grounded continuity",
      "Private long-form continuity brief",
      "Wake with durable context",
      "Careful, direct, steady",
      "Public copy body is not required for export refs",
      "Public field log body is safe to reference",
      "Private Developer Space method must not leave public-safe export refs",
      "Canon / priority 8",
      "source_id",
      "sourceId",
      "owner_user_id",
      "ownerUserId",
      "storage_path",
      "DATABASE_URL",
      "stack trace",
      "SQL",
    ]) {
      assert.equal(manifestText.includes(forbidden), false, `${forbidden} leaked into Workspace manifest`);
    }

    const listed = await requestJson(app, "GET", "/exports/workspace", {
      token: "owner-token",
    });
    assert.equal(listed.status, 200);
    assert.equal(listed.body.exports.length, 1);
    assert.equal(listed.body.exports[0].packageKind, "workspace_manifest");
    assert.equal(listed.body.exports[0].contentSummary.publicPublishedDocumentRefs, 1);
    assert.equal("ownerUserId" in listed.body.exports[0], false);

    const readBack = await requestJson(app, "GET", `/exports/${created.body.exportPackage.id}`, {
      token: "owner-token",
    });
    assert.equal(readBack.status, 200);
    assert.equal(readBack.body.exportPackage.packageKind, "workspace_manifest");
    assert.equal("ownerUserId" in readBack.body.exportPackage, false);
    assert.match(readBack.body.manifestMarkdown, /Station Workspace Export Manifest/);
    assert.match(readBack.body.manifestMarkdown, /Document bodies omitted: yes/);
    assert.match(readBack.body.manifestMarkdown, /Managed backup or restore guarantee: no/);
    assert.match(readBack.body.manifestMarkdown, /- Harbor/);
    assert.match(readBack.body.manifestMarkdown, /- Harbor Space/);
    assert.doesNotMatch(readBack.body.manifestMarkdown, /\(undefined\)|ownerUserId|personaId|developerSpaceId|projectId|owner_user_id/);

    const storedManifest = clone(packageRow.manifest_json);
    const storedMarkdown = packageRow.manifest_markdown;
    db.tables.personas[0].name = "Mutated persona must not leak";
    db.tables.spaces[0].title = "Mutated Space must not leak";
    db.tables.developer_spaces[0].project_name = "Mutated Developer Space must not leak";
    db.tables.projects[0].name = "Mutated Project must not leak";
    db.tables.documents[0].title = "Mutated Document must not leak";
    for (const table of ["personas", "spaces", "developer_spaces", "projects", "documents"]) {
      db.failSelectTables.add(table);
    }

    const blockedReadBack = await requestJson(app, "GET", `/exports/${created.body.exportPackage.id}`, {
      token: "other-token",
    });
    assert.equal(blockedReadBack.status, 404);

    const blockedBundle = await requestJson(app, "GET", `/exports/${created.body.exportPackage.id}/bundle`, {
      token: "other-token",
    });
    assert.equal(blockedBundle.status, 404);

    const bundleReadBack = await requestJson(app, "GET", `/exports/${created.body.exportPackage.id}/bundle`, {
      token: "owner-token",
    });
    assert.equal(bundleReadBack.status, 200);
    const bundle = bundleReadBack.body.bundle;
    const files = assertBundleIntegrity(bundle, "workspace_manifest");
    assert.deepEqual(Object.keys(bundle.package).sort(), ["format", "id", "packageKind", "status"]);
    assert.deepEqual(JSON.parse(files.get("manifest.json")?.content ?? "{}"), storedManifest);
    assert.equal(files.get("manifest.md")?.content, storedMarkdown);
    assert.match(files.get("README.md")?.content ?? "", /high-level workspace inventory only/);

    const bundleText = JSON.stringify(bundle);
    for (const forbidden of [
      OWNER_ID,
      OTHER_ID,
      PERSONA_ID,
      SPACE_ID,
      DOC_ID,
      DEVELOPER_SPACE_ID,
      PROJECT_ID,
      DEV_PUBLIC_DOC_ID,
      "ownerUserId",
      "personaId",
      "developerSpaceId",
      "projectId",
      "owner_user_id",
      "source_id",
      "storage_path",
      "Mutated persona must not leak",
      "Mutated Space must not leak",
      "Mutated Developer Space must not leak",
      "Mutated Project must not leak",
      "Mutated Document must not leak",
      "Public copy body is not required for export refs",
      "Private Developer Space method must not leave public-safe export refs",
      "DATABASE_URL",
      "stack trace",
      "SQL",
    ]) {
      assert.equal(bundleText.includes(forbidden), false, `${forbidden} leaked into Workspace bundle`);
    }
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("workspace manifest package guards duplicate, malformed, and source failure states", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createExportsApp();

  try {
    db.insertRow("export_packages", {
      owner_user_id: OWNER_ID,
      package_kind: "workspace_manifest",
      status: "processing",
    });

    const blocked = await requestJson(app, "POST", "/exports/workspace", {
      token: "owner-token",
    });
    assert.equal(blocked.status, 429);
    assert.equal(blocked.body.code, "quota_exceeded");
    assert.equal(blocked.body.resource, "export_packages");
    assert.equal(db.tables.export_packages.length, 1);

    db.tables.export_packages[0].status = "completed";
    const allowed = await requestJson(app, "POST", "/exports/workspace", {
      token: "owner-token",
    });
    assert.equal(allowed.status, 201);

    for (const scenario of [
      { label: "missing inventory", manifestJson: { schema: "station.workspace.export_manifest.v1" }, manifestMarkdown: "# stored markdown must not leak" },
      { label: "wrong schema", manifestJson: { schema: "station.workspace.wrong.v1", privateDetail: "wrong schema detail must not leak" }, manifestMarkdown: "# wrong schema markdown must not leak" },
      { label: "empty markdown", manifestJson: allowed.body.manifest, manifestMarkdown: "" },
    ]) {
      const row = db.insertRow("export_packages", {
        owner_user_id: OWNER_ID,
        package_kind: "workspace_manifest",
        status: "completed",
        manifest_json: scenario.manifestJson,
        manifest_markdown: scenario.manifestMarkdown,
      });
      const response = await requestJson(app, "GET", `/exports/${row.id}/bundle`, {
        token: "owner-token",
      });
      assert.equal(response.status, 409, scenario.label);
      const responseText = JSON.stringify(response.body);
      assert.match(responseText, /stored manifest readback is complete/);
      assert.doesNotMatch(responseText, /wrong schema detail/);
      assert.doesNotMatch(responseText, /stored markdown must not leak/);
    }
  } finally {
    setSupabaseAdminForTests(null);
  }

  const failingDb = new InMemorySupabase();
  failingDb.failSelectTables.add("personas");
  setSupabaseAdminForTests(failingDb.client as any);
  const failingApp = await createExportsApp();

  try {
    const failed = await requestJson(failingApp, "POST", "/exports/workspace", {
      token: "owner-token",
    });
    assert.equal(failed.status, 500);
    assert.deepEqual(failed.body, {
      error: "Could not create workspace manifest package.",
      code: "workspace_export_create_failed",
    });
    const row = failingDb.tables.export_packages[0];
    assert.equal(row.package_kind, "workspace_manifest");
    assert.equal(row.status, "failed");
    assert.equal(row.error_message, "Could not finish workspace manifest package.");
    assert.equal(row.persona_id, null);
    assert.equal(row.developer_space_id, null);
    assert.equal(row.project_id, null);

    const listed = await requestJson(failingApp, "GET", "/exports/workspace", {
      token: "owner-token",
    });
    assert.equal(listed.status, 200);
    assert.equal(listed.body.exports[0].status, "failed");
    assert.equal(listed.body.exports[0].errorMessage, "Could not finish workspace manifest package.");
    const listedText = JSON.stringify(listed.body);
    assert.doesNotMatch(listedText, /owner_user_id|SQL|stack|DATABASE_URL/);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("workspace manifest migration allows owner-level null-target export packages", () => {
  const migration = readFileSync("infra/supabase/migrations/070_workspace_export_manifest.sql", "utf8");

  assert.match(migration, /export_packages_kind_check/);
  assert.match(
    migration,
    /check \(package_kind in \('persona_archive', 'developer_space_archive', 'project_manifest', 'workspace_manifest'\)\)/
  );
  assert.match(migration, /package_kind = 'workspace_manifest'\s+and persona_id is null\s+and developer_space_id is null\s+and project_id is null/);
  assert.match(migration, /create index if not exists idx_export_packages_owner_workspace_manifest/);
  assert.match(migration, /create policy "export_packages_all_owner"/);
  assert.match(migration, /with check \(\s+auth\.uid\(\) = owner_user_id/);
});

test("export package concurrency guard blocks duplicate in-progress targets", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createExportsApp();

  try {
    db.insertRow("export_packages", {
      owner_user_id: OWNER_ID,
      persona_id: PERSONA_ID,
      package_kind: "persona_archive",
      status: "processing",
    });

    const blockedPersona = await requestJson(app, "POST", `/exports/persona/${PERSONA_ID}`, {
      token: "owner-token",
    });
    assert.equal(blockedPersona.status, 429);
    assert.equal(blockedPersona.body.code, "quota_exceeded");
    assert.equal(blockedPersona.body.resource, "export_packages");
    assert.equal(blockedPersona.body.limit, 1);
    assert.equal(blockedPersona.body.used, 1);
    assert.equal(db.tables.export_packages.filter((row) => row.persona_id === PERSONA_ID).length, 1);

    db.tables.export_packages = [];
    db.insertRow("export_packages", {
      owner_user_id: OWNER_ID,
      developer_space_id: DEVELOPER_SPACE_ID,
      package_kind: "developer_space_archive",
      status: "requested",
    });

    const blockedDeveloperSpace = await requestJson(app, "POST", `/exports/developer-spaces/${DEVELOPER_SPACE_ID}`, {
      token: "owner-token",
    });
    assert.equal(blockedDeveloperSpace.status, 429);
    assert.equal(blockedDeveloperSpace.body.code, "quota_exceeded");
    assert.equal(blockedDeveloperSpace.body.resource, "export_packages");
    assert.equal(db.tables.export_packages.filter((row) => row.developer_space_id === DEVELOPER_SPACE_ID).length, 1);

    db.tables.export_packages = [];
    db.insertRow("export_packages", {
      owner_user_id: OWNER_ID,
      project_id: PROJECT_ID,
      package_kind: "project_manifest",
      status: "processing",
    });

    const blockedProject = await requestJson(app, "POST", "/exports/projects/animus-project", {
      token: "owner-token",
    });
    assert.equal(blockedProject.status, 429);
    assert.equal(blockedProject.body.code, "quota_exceeded");
    assert.equal(blockedProject.body.resource, "export_packages");
    assert.equal(db.tables.export_packages.filter((row) => row.project_id === PROJECT_ID).length, 1);

    const allowedPersona = await requestJson(app, "POST", `/exports/persona/${PERSONA_ID}`, {
      token: "owner-token",
    });
    assert.equal(allowedPersona.status, 201);

    const allowedDeveloperSpace = await requestJson(app, "POST", `/exports/developer-spaces/${DEVELOPER_SPACE_ID}`, {
      token: "owner-token",
    });
    assert.equal(allowedDeveloperSpace.status, 201);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("persona export source failures leave an owner-visible failed package", async () => {
  const db = new InMemorySupabase();
  db.failSelectTables.add("memory_items");
  setSupabaseAdminForTests(db.client as any);
  const app = await createExportsApp();

  try {
    const failed = await requestJson(app, "POST", `/exports/persona/${PERSONA_ID}`, {
      token: "owner-token",
    });
    assert.equal(failed.status, 500);
    assert.deepEqual(failed.body, {
      error: "Could not create export package.",
      code: "persona_export_create_failed",
    });

    const packageRow = db.tables.export_packages[0];
    assert.equal(packageRow.owner_user_id, OWNER_ID);
    assert.equal(packageRow.persona_id, PERSONA_ID);
    assert.equal(packageRow.package_kind, "persona_archive");
    assert.equal(packageRow.status, "failed");
    assert.match(packageRow.error_message, /Injected memory_items select failure/);
    assert.equal(typeof packageRow.completed_at, "string");

    const listed = await requestJson(app, "GET", `/exports/persona/${PERSONA_ID}`, {
      token: "owner-token",
    });
    assert.equal(listed.status, 200);
    assert.equal(listed.body.exports.length, 1);
    assert.equal(listed.body.exports[0].status, "failed");
    assert.match(listed.body.exports[0].errorMessage, /Injected memory_items select failure/);

    const blocked = await requestJson(app, "GET", `/exports/${packageRow.id}`, {
      token: "other-token",
    });
    assert.equal(blocked.status, 404);

    const failedBundle = await requestJson(app, "GET", `/exports/${packageRow.id}/bundle`, {
      token: "owner-token",
    });
    assert.equal(failedBundle.status, 409);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("nested export source failures fail packages instead of completing partial manifests", async () => {
  for (const scenario of [
    { table: "comments", label: /discussion comments export source/ },
    { table: "moderation_reports", label: /moderation report export source/ },
  ]) {
    const db = new InMemorySupabase();
    db.failSelectTables.add(scenario.table);
    setSupabaseAdminForTests(db.client as any);
    const app = await createExportsApp();

    try {
      const failed = await requestJson(app, "POST", `/exports/persona/${PERSONA_ID}`, {
        token: "owner-token",
      });
      assert.equal(failed.status, 500);
      assert.deepEqual(failed.body, {
        error: "Could not create export package.",
        code: "persona_export_create_failed",
      });

      const packageRow = db.tables.export_packages[0];
      assert.equal(packageRow.status, "failed");
      assert.match(packageRow.error_message, scenario.label);
      assert.equal(packageRow.manifest_markdown, "");
      assert.deepEqual(packageRow.content_summary, {});
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});
