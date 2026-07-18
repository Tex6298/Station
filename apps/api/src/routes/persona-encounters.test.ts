import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import {
  DisabledOperationalCacheProvider,
  operationalCacheKey,
  resetOperationalCacheProviderForTests,
  setOperationalCacheProviderForTests,
  type OperationalCacheProvider,
} from "../services/operational-cache.service";
import { estimateConversationTokens } from "../services/token-credits.service";
import { personaEncountersRouter, recordCrossOwnerRuntimeAttemptAudit } from "./persona-encounters";

process.env.NODE_ENV = "test";

type Row = Record<string, any>;

const nativeFetch = globalThis.fetch;

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_OWNER_ID = "22222222-2222-4222-8222-222222222222";
const THIRD_OWNER_ID = "77777777-7777-4777-8777-777777777777";
const INITIATOR_ID = "33333333-3333-4333-8333-333333333333";
const RESPONDER_ID = "44444444-4444-4444-8444-444444444444";
const OTHER_PERSONA_ID = "55555555-5555-4555-8555-555555555555";
const THIRD_PERSONA_ID = "88888888-8888-4888-8888-888888888888";
const PERSONA_ENCOUNTER_NVIDIA_PRIVATE_CONTEXT_FLAG =
  "PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT";

class InMemorySupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      {
        id: OWNER_ID,
        email: "owner@example.test",
        tier: "private",
        is_admin: false,
        ai_mode: "platform",
        byok_openai_key: null,
        byok_anthropic_key: null,
        byok_deepseek_key: null,
      },
      {
        id: OTHER_OWNER_ID,
        email: "other@example.test",
        tier: "private",
        is_admin: false,
        ai_mode: "platform",
        byok_openai_key: null,
        byok_anthropic_key: null,
        byok_deepseek_key: null,
      },
      {
        id: THIRD_OWNER_ID,
        email: "third@example.test",
        tier: "private",
        is_admin: false,
        ai_mode: "platform",
        byok_openai_key: null,
        byok_anthropic_key: null,
        byok_deepseek_key: null,
      },
    ],
    personas: [
      {
        id: INITIATOR_ID,
        owner_user_id: OWNER_ID,
        name: "Blue Lantern",
        short_description: "A careful guide.",
        long_description: "Owner-only private persona notes for a quiet guide.",
        visibility: "private",
        provider: "platform",
        awakening_prompt: "Notice the room before speaking.",
        style_notes: "Gentle, exact, brief.",
      },
      {
        id: RESPONDER_ID,
        owner_user_id: OWNER_ID,
        name: "Copper Scribe",
        short_description: "A grounded responder.",
        long_description: "Owner-only private persona notes for the response voice.",
        visibility: "private",
        provider: "platform",
        awakening_prompt: "Answer once and stay inside the setup.",
        style_notes: "Plainspoken and warm.",
      },
      {
        id: OTHER_PERSONA_ID,
        owner_user_id: OTHER_OWNER_ID,
        name: "Other Owner Persona",
        short_description: "Not owned by the caller.",
        long_description: "Cross-owner private material.",
        visibility: "private",
        provider: "platform",
        awakening_prompt: "Do not expose me.",
        style_notes: "Unavailable.",
      },
      {
        id: THIRD_PERSONA_ID,
        owner_user_id: THIRD_OWNER_ID,
        name: "Third Owner Persona",
        short_description: "Not a participant.",
        long_description: "Another owner-only persona.",
        visibility: "private",
        provider: "platform",
        awakening_prompt: "Stay outside the ledger.",
        style_notes: "Unavailable.",
      },
    ],
    topup_purchases: [],
    token_usage: [],
    token_transactions: [],
    persona_encounter_private_sessions: [],
    persona_encounter_public_exhibits: [],
    persona_encounter_cross_owner_consents: [],
    persona_encounter_cross_owner_consent_audit_events: [],
    persona_encounter_cross_owner_runtime_attempts: [],
    persona_encounter_cross_owner_public_exhibits: [],
    persona_encounter_cross_owner_generated_artifacts: [],
    persona_encounter_cross_owner_generated_revisions: [],
    persona_encounter_cross_owner_generated_revision_approvals: [],
    persona_encounter_cross_owner_generated_publications: [],
    persona_encounter_cross_owner_generated_publication_audits: [],
    conversations: [],
    conversation_messages: [],
    archived_chat_transcripts: [],
    continuity_candidates: [],
    continuity_records: [],
    memory_items: [],
    canon_items: [],
    documents: [],
    threads: [],
    comments: [],
    moderation_reports: [],
    public_persona_interaction_counters: [],
    background_jobs: [],
  };

  private clock = Date.parse("2026-06-29T09:00:00.000Z");
  failNextCrossOwnerConsentAuditRpc = false;
  failNextCrossOwnerRuntimeAttemptRpc = false;
  private usersByToken = new Map([
    ["owner-token", { id: OWNER_ID, email: "owner@example.test" }],
    ["other-token", { id: OTHER_OWNER_ID, email: "other@example.test" }],
    ["third-token", { id: THIRD_OWNER_ID, email: "third@example.test" }],
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
    rpc: (name: string, args: Row) => this.rpc(name, args),
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

  private prepareRow(table: string, payload: Row) {
    const now = this.timestamp();
    const row = { ...payload };
    if (table === "persona_encounter_private_sessions" && !row.id) {
      row.id = `66666666-6666-4666-8666-${String(this.rows(table).length + 1).padStart(12, "0")}`;
    }
    if (table === "persona_encounter_cross_owner_consents" && !row.id) {
      row.id = `99999999-9999-4999-8999-${String(this.rows(table).length + 1).padStart(12, "0")}`;
    }
    if (table === "persona_encounter_cross_owner_consent_audit_events" && !row.id) {
      row.id = `aaaaaaaa-aaaa-4aaa-8aaa-${String(this.rows(table).length + 1).padStart(12, "0")}`;
    }
    if (table === "persona_encounter_cross_owner_runtime_attempts" && !row.id) {
      row.id = `bbbbbbbb-bbbb-4bbb-8bbb-${String(this.rows(table).length + 1).padStart(12, "0")}`;
    }
    if (table === "persona_encounter_cross_owner_public_exhibits" && !row.id) {
      row.id = `cccccccc-cccc-4ccc-8ccc-${String(this.rows(table).length + 1).padStart(12, "0")}`;
    }
    if (table === "persona_encounter_cross_owner_generated_artifacts" && !row.id) {
      row.id = `dddddddd-dddd-4ddd-8ddd-${String(this.rows(table).length + 1).padStart(12, "0")}`;
    }
    if (table === "persona_encounter_cross_owner_generated_revisions" && !row.id) {
      row.id = `eeeeeeee-eeee-4eee-8eee-${String(this.rows(table).length + 1).padStart(12, "0")}`;
    }
    if (table === "persona_encounter_cross_owner_generated_revision_approvals" && !row.id) {
      row.id = `ffffffff-ffff-4fff-8fff-${String(this.rows(table).length + 1).padStart(12, "0")}`;
    }
    if (table === "persona_encounter_cross_owner_generated_publications" && !row.id) {
      row.id = `12121212-1212-4121-8121-${String(this.rows(table).length + 1).padStart(12, "0")}`;
    }
    if (table === "persona_encounter_cross_owner_generated_publication_audits" && !row.id) {
      row.id = `34343434-3434-4343-8343-${String(this.rows(table).length + 1).padStart(12, "0")}`;
    }
    row.id ??= `${table}-${this.rows(table).length + 1}`;

    if (table === "token_usage") {
      row.period_start ??= "2026-06-01";
      row.tokens_used ??= 0;
      row.tokens_limit ??= this.tokenLimitForUser(row.user_id);
      row.topup_tokens ??= 0;
      row.updated_at ??= now;
    }

    if (table === "token_transactions") {
      row.period_start ??= "2026-06-01";
      row.transaction_type ??= "llm_call";
      row.model_used ??= null;
      row.chat_id ??= null;
      row.input_tokens ??= 0;
      row.output_tokens ??= 0;
      row.tokens_delta ??= row.input_tokens + row.output_tokens;
      row.created_at ??= now;
    }

    if (table === "persona_encounter_private_sessions") {
      row.provenance_schema ??= "station.persona_encounter.private_session.v1";
      row.source_retrieval_used ??= false;
      row.shareable ??= false;
      row.public_visibility ??= "private";
      row.owner_title ??= null;
      row.owner_summary ??= null;
      row.owner_tags ??= [];
      row.publication_candidate ??= false;
      row.curation_schema ??= "station.persona_encounter.private_session_curation.v1";
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "persona_encounter_public_exhibits") {
      row.slug ??= `public-exhibit-${String(this.rows(table).length + 1).padStart(8, "0")}`;
      row.status ??= "published";
      row.provenance_schema ??= "station.persona_encounter.public_exhibit.v1";
      row.reported_count ??= 0;
      row.published_at ??= now;
      row.retracted_at ??= null;
      row.removed_at ??= null;
      row.removed_by ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "persona_encounter_cross_owner_consents") {
      row.status ??= "pending";
      row.requested_scopes ??= ["run_cross_owner_encounter"];
      row.requested_scope_version ??= 1;
      row.requester_approved_at ??= null;
      row.counterparty_approved_at ??= null;
      row.rejected_at ??= null;
      row.rejected_by ??= null;
      row.cancelled_at ??= null;
      row.cancelled_by ??= null;
      row.revoked_at ??= null;
      row.revoked_by ??= null;
      row.expired_at ??= null;
      row.superseded_at ??= null;
      row.blocked_by_deletion_at ??= null;
      row.moderation_locked_at ??= null;
      row.reason_code ??= null;
      row.provenance_schema ??= "station.persona_encounter.cross_owner_consent.v1";
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "persona_encounter_cross_owner_consent_audit_events") {
      row.requested_scopes ??= ["run_cross_owner_encounter"];
      row.reason_code ??= null;
      row.created_at ??= now;
    }

    if (table === "persona_encounter_cross_owner_runtime_attempts") {
      row.provenance_schema ??= "station.persona_encounter.cross_owner_runtime_attempt.v1";
      row.created_at ??= now;
      row.completed_at ??= null;
    }

    if (table === "persona_encounter_cross_owner_public_exhibits") {
      row.slug ??= `cross-owner-exhibit-${String(this.rows(table).length + 1).padStart(8, "0")}`;
      row.public_tags ??= [];
      row.status ??= "proposed";
      row.contract_version ??= 1;
      row.provenance_schema ??= "station.persona_encounter.cross_owner_public_exhibit.v1";
      row.requester_metadata_approved_at ??= null;
      row.counterparty_metadata_approved_at ??= null;
      row.reported_count ??= 0;
      row.published_at ??= null;
      row.retracted_at ??= null;
      row.removed_at ??= null;
      row.removed_by ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "persona_encounter_cross_owner_generated_artifacts") {
      row.artifact_slug ??= `generated-artifact-${String(this.rows(table).length + 1).padStart(8, "0")}`;
      row.private_excerpt ??= null;
      row.lifecycle_status ??= "active";
      row.contract_version ??= 1;
      row.provenance_schema ??= "station.persona_encounter.cross_owner_private_generated_artifact.v1";
      row.retracted_at ??= null;
      row.revoked_at ??= null;
      row.deleted_at ??= null;
      row.moderation_blocked_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "persona_encounter_cross_owner_generated_revisions") {
      row.revision_slug ??= `generated-revision-${String(this.rows(table).length + 1).padStart(8, "0")}`;
      row.final_excerpt ??= null;
      row.consent_requested_scopes ??= ["save_private_cross_owner_artifact"];
      row.status ??= "proposed";
      row.contract_version ??= 1;
      row.approval_contract_version ??= 1;
      row.provenance_schema ??= "station.persona_encounter.cross_owner_generated_revision.v1";
      row.proposed_at ??= now;
      row.approved_at ??= null;
      row.retracted_at ??= null;
      row.revoked_at ??= null;
      row.deleted_at ??= null;
      row.moderation_blocked_at ??= null;
      row.invalidated_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "persona_encounter_cross_owner_generated_revision_approvals") {
      row.approval_contract_version ??= 1;
      row.approved_at ??= now;
    }

    if (table === "persona_encounter_cross_owner_generated_publications") {
      row.public_slug ??= `generated-publication-${String(this.rows(table).length + 1).padStart(8, "0")}`;
      row.public_excerpt ??= null;
      row.status ??= "published";
      row.private_artifact_contract_version ??= 1;
      row.revision_contract_version ??= 1;
      row.approval_contract_version ??= 1;
      row.publication_contract_version ??= 1;
      row.provenance_schema ??= "station.persona_encounter.cross_owner_generated_publication.v1";
      row.reported_count ??= 0;
      row.published_at ??= now;
      row.retracted_at ??= null;
      row.revoked_at ??= null;
      row.source_invalidated_at ??= null;
      row.removed_at ??= null;
      row.removed_by ??= null;
      row.restored_at ??= null;
      row.restored_by ??= null;
      row.deleted_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "persona_encounter_cross_owner_generated_publication_audits") {
      row.actor_user_id ??= null;
      row.publication_contract_version ??= 1;
      row.created_at ??= now;
    }

    return row;
  }

  private rpc(name: string, args: Row) {
    if (name === "ensure_current_token_usage") {
      return Promise.resolve({ data: clone(this.ensureTokenUsage(args.p_user_id)), error: null });
    }

    if (name === "record_token_usage") {
      const usage = this.ensureTokenUsage(args.p_user_id);
      const inputTokens = Math.max(0, Number(args.p_input_tokens ?? 0));
      const outputTokens = Math.max(0, Number(args.p_output_tokens ?? 0));
      usage.tokens_used += inputTokens + outputTokens;
      usage.updated_at = this.timestamp();
      this.insertRow("token_transactions", {
        user_id: args.p_user_id,
        period_start: usage.period_start,
        transaction_type: "llm_call",
        model_used: args.p_model,
        chat_id: args.p_chat_id ?? null,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        tokens_delta: inputTokens + outputTokens,
      });
      return Promise.resolve({ data: clone(usage), error: null });
    }

    if (name === "create_persona_encounter_cross_owner_consent") {
      return Promise.resolve(this.createCrossOwnerConsentRpc(args));
    }

    if (name === "transition_persona_encounter_cross_owner_consent") {
      return Promise.resolve(this.transitionCrossOwnerConsentRpc(args));
    }

    if (name === "record_persona_encounter_cross_owner_runtime_attempt") {
      return Promise.resolve(this.recordCrossOwnerRuntimeAttemptRpc(args));
    }

    return Promise.resolve({ data: null, error: { message: `Unknown RPC ${name}` } });
  }

  private createCrossOwnerConsentRpc(args: Row) {
    if (this.failNextCrossOwnerConsentAuditRpc) {
      this.failNextCrossOwnerConsentAuditRpc = false;
      return { data: null, error: { message: "audit insert failed" } };
    }

    const now = this.timestamp();
    const consent = this.insertRow("persona_encounter_cross_owner_consents", {
      requester_owner_user_id: args.p_requester_owner_user_id,
      requester_persona_id: args.p_requester_persona_id,
      requester_persona_name_snapshot: args.p_requester_persona_name_snapshot,
      counterparty_owner_user_id: args.p_counterparty_owner_user_id,
      counterparty_persona_id: args.p_counterparty_persona_id,
      counterparty_persona_name_snapshot: args.p_counterparty_persona_name_snapshot,
      status: "pending",
      requested_scopes: args.p_requested_scopes ?? ["run_cross_owner_encounter"],
      requested_scope_version: 1,
      requester_approved_at: now,
      provenance_schema: "station.persona_encounter.cross_owner_consent.v1",
    });

    this.insertRow("persona_encounter_cross_owner_consent_audit_events", {
      consent_id: consent.id,
      actor_user_id: args.p_actor_user_id,
      actor_role: "requester",
      event_type: "invitation_created",
      previous_status: null,
      next_status: "pending",
      requested_scopes: consent.requested_scopes,
    });
    this.insertRow("persona_encounter_cross_owner_consent_audit_events", {
      consent_id: consent.id,
      actor_user_id: args.p_actor_user_id,
      actor_role: "requester",
      event_type: "requester_approved",
      previous_status: "pending",
      next_status: "pending",
      requested_scopes: consent.requested_scopes,
    });

    return { data: clone(consent), error: null };
  }

  private transitionCrossOwnerConsentRpc(args: Row) {
    if (this.failNextCrossOwnerConsentAuditRpc) {
      this.failNextCrossOwnerConsentAuditRpc = false;
      return { data: null, error: { message: "audit insert failed" } };
    }

    const consent = this.rows("persona_encounter_cross_owner_consents").find((row) =>
      row.id === args.p_consent_id && row.status === args.p_expected_status
    );
    if (!consent) return { data: null, error: { message: "transition target not found" } };

    const now = this.timestamp();
    consent.status = args.p_next_status;
    consent.updated_at = now;
    if (args.p_next_status === "approved") consent.counterparty_approved_at = now;
    if (args.p_next_status === "rejected") {
      consent.rejected_at = now;
      consent.rejected_by = args.p_actor_user_id;
      consent.reason_code = args.p_reason_code ?? null;
    }
    if (args.p_next_status === "cancelled") {
      consent.cancelled_at = now;
      consent.cancelled_by = args.p_actor_user_id;
      consent.reason_code = args.p_reason_code ?? null;
    }
    if (args.p_next_status === "revoked") {
      consent.revoked_at = now;
      consent.revoked_by = args.p_actor_user_id;
      consent.reason_code = args.p_reason_code ?? null;
    }

    this.insertRow("persona_encounter_cross_owner_consent_audit_events", {
      consent_id: consent.id,
      actor_user_id: args.p_actor_user_id,
      actor_role: args.p_actor_role,
      event_type: args.p_event_type,
      previous_status: args.p_expected_status,
      next_status: args.p_next_status,
      requested_scopes: consent.requested_scopes,
      reason_code: args.p_reason_code ?? null,
    });

    return { data: clone(consent), error: null };
  }

  private recordCrossOwnerRuntimeAttemptRpc(args: Row) {
    if (this.failNextCrossOwnerRuntimeAttemptRpc) {
      this.failNextCrossOwnerRuntimeAttemptRpc = false;
      return { data: null, error: { message: "runtime attempt audit insert failed" } };
    }

    const consent = this.rows("persona_encounter_cross_owner_consents").find((row) => row.id === args.p_consent_id);
    if (!consent) {
      return { data: null, error: { message: "cross-owner consent not found for runtime attempt audit" } };
    }
    if (args.p_consent_status !== consent.status) {
      return { data: null, error: { message: "runtime attempt consent status does not match current consent" } };
    }
    if (args.p_requested_scope_version !== consent.requested_scope_version) {
      return { data: null, error: { message: "runtime attempt scope version does not match current consent" } };
    }

    const providerLifecycle = new Set(["provider_succeeded", "provider_failed", "provider_empty"]);
    if (providerLifecycle.has(String(args.p_lifecycle_status))) {
      if (
        args.p_readiness_code !== "ready" ||
        consent.status !== "approved" ||
        args.p_requested_scope !== "run_cross_owner_encounter" ||
        !Array.isArray(consent.requested_scopes) ||
        !consent.requested_scopes.includes(args.p_requested_scope)
      ) {
        return { data: null, error: { message: "provider lifecycle runtime attempts require approved ready runtime consent" } };
      }
    }

    const attempt = this.insertRow("persona_encounter_cross_owner_runtime_attempts", {
      consent_id: args.p_consent_id,
      actor_role: args.p_actor_role,
      initiator_role: args.p_initiator_role,
      responder_role: args.p_responder_role,
      consent_status: args.p_consent_status,
      requested_scope_version: args.p_requested_scope_version,
      requested_scope: args.p_requested_scope,
      readiness_code: args.p_readiness_code,
      lifecycle_status: args.p_lifecycle_status,
      completed_at: args.p_completed_at ?? null,
    });

    return { data: clone(attempt), error: null };
  }

  private ensureTokenUsage(userId: string) {
    let usage = this.rows("token_usage").find((row) =>
      row.user_id === userId && row.period_start === "2026-06-01"
    );
    if (!usage) {
      usage = this.insertRow("token_usage", {
        user_id: userId,
        period_start: "2026-06-01",
        tokens_limit: this.tokenLimitForUser(userId),
      });
    }
    return usage;
  }

  private tokenLimitForUser(userId: string) {
    const tier = this.rows("profiles").find((profile) => profile.id === userId)?.tier ?? "visitor";
    if (tier === "creator") return 7_500_000;
    if (tier === "canon" || tier === "institutional" || tier === "developer") return 20_000_000;
    if (tier === "private" || tier === "basic") return 750_000;
    return 0;
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private isFilters: Array<[string, unknown]> = [];
  private inFilters: Array<[string, unknown[]]> = [];
  private orderSpecs: Array<{ field: string; ascending: boolean }> = [];
  private orPredicates: Array<(row: Row) => boolean> = [];
  private limitCount: number | null = null;
  private selectOptions: { count?: string; head?: boolean } = {};
  private mutation:
    | { type: "insert"; payload: Row | Row[] }
    | { type: "update"; payload: Row }
    | { type: "delete" }
    | null = null;

  constructor(private db: InMemorySupabase, private table: string) {}

  select(_columns?: string, options: { count?: string; head?: boolean } = {}) {
    this.selectOptions = options;
    return this;
  }

  insert(payload: Row | Row[]) {
    this.mutation = { type: "insert", payload };
    return this;
  }

  update(payload: Row) {
    this.mutation = { type: "update", payload };
    return this;
  }

  delete() {
    this.mutation = { type: "delete" };
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push([field, value]);
    return this;
  }

  is(field: string, value: unknown) {
    this.isFilters.push([field, value]);
    return this;
  }

  in(field: string, values: unknown[]) {
    this.inFilters.push([field, values]);
    return this;
  }

  or(expression: string) {
    const cursor = expression.match(
      /^published_at\.lt\.([^,]+),and\(published_at\.eq\.([^,]+),slug\.lt\.([^)]+)\)$/,
    );
    if (cursor) {
      const [, beforePublishedAt, samePublishedAt, beforeSlug] = cursor;
      this.orPredicates.push((row) =>
        row.published_at < beforePublishedAt ||
        (row.published_at === samePublishedAt && row.slug < beforeSlug)
      );
    }
    return this;
  }

  order(field: string, options: { ascending?: boolean } = {}) {
    this.orderSpecs.push({ field, ascending: options.ascending ?? true });
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    return this.execute("single");
  }

  maybeSingle() {
    return this.execute("maybeSingle");
  }

  then(onfulfilled: any, onrejected: any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private matchingRows() {
    let rows = [...this.db.rows(this.table)];
    for (const [field, value] of this.filters) {
      rows = rows.filter((row) => row[field] === value);
    }
    for (const [field, value] of this.isFilters) {
      rows = rows.filter((row) => row[field] === value);
    }
    for (const [field, values] of this.inFilters) {
      rows = rows.filter((row) => values.includes(row[field]));
    }
    for (const predicate of this.orPredicates) {
      rows = rows.filter(predicate);
    }
    if (this.orderSpecs.length > 0) {
      rows.sort((a, b) => {
        for (const { field, ascending } of this.orderSpecs) {
          if (a[field] === b[field]) continue;
          if (a[field] == null) return 1;
          if (b[field] == null) return -1;
          return (a[field] > b[field] ? 1 : -1) * (ascending ? 1 : -1);
        }
        return 0;
      });
    }
    if (this.limitCount !== null) rows = rows.slice(0, this.limitCount);
    return rows;
  }

  private async execute(mode?: "single" | "maybeSingle") {
    if (this.mutation?.type === "insert") {
      const payloads = Array.isArray(this.mutation.payload) ? this.mutation.payload : [this.mutation.payload];
      const inserted = payloads.map((payload) => this.db.insertRow(this.table, payload));
      const data = clone(inserted);
      if (mode === "single") {
        return data.length === 1
          ? { data: data[0], error: null }
          : { data: null, error: { message: `Expected one inserted ${this.table} row.` } };
      }
      if (mode === "maybeSingle") {
        return data.length > 0
          ? { data: data[0], error: null }
          : { data: null, error: null };
      }
      return { data, error: null };
    }

    if (this.mutation?.type === "update") {
      const matches = this.matchingRows();
      const ids = new Set(matches.map((row) => row.id));
      const updated: Row[] = [];
      for (const row of this.db.rows(this.table)) {
        if (!ids.has(row.id)) continue;
        Object.assign(row, this.mutation.payload);
        row.updated_at = this.db.timestamp();
        updated.push(row);
      }
      const data = clone(updated);
      if (mode === "single") {
        return data.length === 1
          ? { data: data[0], error: null }
          : { data: null, error: { message: `Expected one updated ${this.table} row.` } };
      }
      if (mode === "maybeSingle") {
        return data.length > 0
          ? { data: data[0], error: null }
          : { data: null, error: null };
      }
      return { data, error: null };
    }

    if (this.mutation?.type === "delete") {
      const rows = this.db.rows(this.table);
      const matches = this.matchingRows().map((row) => row.id);
      this.db.tables[this.table] = rows.filter((row) => !matches.includes(row.id));
      return { data: null, error: null };
    }

    const rows = this.matchingRows();
    const count = this.selectOptions.count ? rows.length : null;
    if (this.selectOptions.head) {
      return { data: null, error: null, count };
    }

    const data = clone(rows);
    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null, count }
        : { data: null, error: { message: `Expected one ${this.table} row.` }, count };
    }
    if (mode === "maybeSingle") {
      return data.length > 0
        ? { data: data[0], error: null, count }
        : { data: null, error: null, count };
    }
    return { data, error: null, count };
  }
}

class TestRateLimitProvider implements OperationalCacheProvider {
  readonly enabled = true;
  readonly kind = "test" as const;
  counts = new Map<string, number>();
  keys: string[] = [];

  async getJson<T>(): Promise<T | null> {
    return null;
  }

  async setJson() {
    return undefined;
  }

  async increment(key: string) {
    this.keys.push(key);
    const next = (this.counts.get(key) ?? 0) + 1;
    this.counts.set(key, next);
    return next;
  }

  async deleteKeys() {
    return 0;
  }
}

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/persona-encounters", personaEncountersRouter);
  return app;
}

async function requestJson<TBody = any>(
  app: Express,
  method: string,
  path: string,
  options: { token?: string; body?: unknown } = {},
) {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const headers: Record<string, string> = {};
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    if (options.token) headers.Authorization = `Bearer ${options.token}`;

    const response = await nativeFetch(`http://127.0.0.1:${address.port}${path}`, {
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

function installProviderFetch(input: { status?: number; content?: string; model?: string } = {}) {
  const calls: Array<{ url: string; body: Row }> = [];
  globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
    calls.push({
      url: String(url),
      body: JSON.parse(String(init?.body ?? "{}")) as Row,
    });
    const status = input.status ?? 200;
    if (status >= 400) {
      return new Response("provider says no", { status });
    }
    return new Response(JSON.stringify({
      model: input.model ?? "deepseek-chat",
      choices: [{ message: { content: input.content ?? "Copper Scribe answers once." } }],
    }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  return calls;
}

function configureProviderEnv() {
  process.env.DEEPSEEK_API_KEY = "test-deepseek-key";
  process.env.DEEPSEEK_BASE_URL = "https://deepseek.test";
  process.env.DEEPSEEK_MODEL = "deepseek-chat";
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.NVIDIA_AI_API_KEY;
  delete process.env.NVIDIA_MODEL_BASE_URL;
  delete process.env.NVIDIA_MODEL;
  delete process.env[PERSONA_ENCOUNTER_NVIDIA_PRIVATE_CONTEXT_FLAG];
}

function clearProviderEnv() {
  delete process.env.DEEPSEEK_API_KEY;
  delete process.env.DEEPSEEK_BASE_URL;
  delete process.env.DEEPSEEK_MODEL;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.NVIDIA_AI_API_KEY;
  delete process.env.NVIDIA_MODEL_BASE_URL;
  delete process.env.NVIDIA_MODEL;
  delete process.env[PERSONA_ENCOUNTER_NVIDIA_PRIVATE_CONTEXT_FLAG];
}

function configureNvidiaOnlyEnv(flagValue?: string) {
  clearProviderEnv();
  process.env.NVIDIA_AI_API_KEY = "test-nvidia-key";
  process.env.NVIDIA_MODEL_BASE_URL = "https://nvidia.test/v1";
  process.env.NVIDIA_MODEL = "openai/gpt-oss-120b";
  if (flagValue !== undefined) {
    process.env[PERSONA_ENCOUNTER_NVIDIA_PRIVATE_CONTEXT_FLAG] = flagValue;
  }
}

function previewBody(overrides: Partial<{
  initiatorPersonaId: string;
  responderPersonaId: string;
  setup: string;
  maxOutputTokens: number;
}> = {}) {
  return {
    initiatorPersonaId: INITIATOR_ID,
    responderPersonaId: RESPONDER_ID,
    setup: "The owner places both personas in a quiet library and asks for one reply.",
    ...overrides,
  };
}

function readinessPath(overrides: Partial<{
  initiatorPersonaId: string;
  responderPersonaId: string;
}> = {}) {
  const params = new URLSearchParams({
    initiatorPersonaId: overrides.initiatorPersonaId ?? INITIATOR_ID,
    responderPersonaId: overrides.responderPersonaId ?? RESPONDER_ID,
  });
  return `/persona-encounters/preview/readiness?${params.toString()}`;
}

function privateSessionBody(overrides: Partial<{
  initiatorPersonaId: string;
  responderPersonaId: string;
  setup: string;
  maxOutputTokens: number;
}> = {}) {
  return previewBody(overrides);
}

function crossOwnerConsentBody(overrides: Partial<{
  requesterPersonaId: string;
  counterpartyPersonaId: string;
  requestedScopes: string[];
}> = {}) {
  return {
    requesterPersonaId: INITIATOR_ID,
    counterpartyPersonaId: OTHER_PERSONA_ID,
    requestedScopes: ["run_cross_owner_encounter"],
    ...overrides,
  };
}

function crossOwnerConsentByPublicSlugBody(overrides: Partial<{
  requesterPersonaId: string;
  counterpartyPublicSlug: string;
  requestedScopes: string[];
}> = {}) {
  return {
    requesterPersonaId: INITIATOR_ID,
    counterpartyPublicSlug: "other-owner-persona",
    requestedScopes: ["run_cross_owner_encounter"],
    ...overrides,
  };
}

function crossOwnerRuntimeContractPath(
  consentId: string,
  overrides: Partial<{
    initiatorPersonaId: string;
    responderPersonaId: string;
  }> = {},
) {
  const params = new URLSearchParams({
    initiatorPersonaId: overrides.initiatorPersonaId ?? INITIATOR_ID,
    responderPersonaId: overrides.responderPersonaId ?? OTHER_PERSONA_ID,
  });
  return `/persona-encounters/cross-owner-consents/${consentId}/runtime-context-contract?${params.toString()}`;
}

function crossOwnerRuntimeAttemptsPath(consentId: string) {
  return `/persona-encounters/cross-owner-consents/${consentId}/runtime-attempts`;
}

function crossOwnerDisposablePreviewPath(consentId: string) {
  return `/persona-encounters/cross-owner-consents/${consentId}/disposable-preview`;
}

function crossOwnerPublicExhibitPath(slug: string) {
  return `/persona-encounters/cross-owner-public-exhibits/${slug}`;
}

function crossOwnerConsentPublicExhibitPath(consentId: string) {
  return `/persona-encounters/cross-owner-consents/${consentId}/public-exhibit`;
}

function crossOwnerConsentGeneratedArtifactsPath(consentId: string) {
  return `/persona-encounters/cross-owner-consents/${consentId}/generated-artifacts`;
}

function crossOwnerGeneratedArtifactPath(artifactSlug: string) {
  return `/persona-encounters/cross-owner-generated-artifacts/${artifactSlug}`;
}

function crossOwnerGeneratedArtifactRevisionsPath(artifactSlug: string) {
  return `${crossOwnerGeneratedArtifactPath(artifactSlug)}/revisions`;
}

function crossOwnerGeneratedArtifactRetractPath(artifactSlug: string) {
  return `${crossOwnerGeneratedArtifactPath(artifactSlug)}/retract`;
}

function crossOwnerGeneratedRevisionApprovePath(revisionSlug: string) {
  return `/persona-encounters/cross-owner-generated-revisions/${revisionSlug}/approve`;
}

function crossOwnerGeneratedRevisionPublicationPath(revisionSlug: string) {
  return `/persona-encounters/cross-owner-generated-revisions/${revisionSlug}/publication`;
}

function crossOwnerGeneratedPublicationPath(slug: string) {
  return `/persona-encounters/cross-owner-generated-publications/${slug}`;
}

function crossOwnerGeneratedPublicationRetractPath(slug: string) {
  return `${crossOwnerGeneratedPublicationPath(slug)}/retract`;
}

function crossOwnerDisposablePreviewBody(overrides: Partial<{
  setup: string;
  maxOutputTokens: number;
}> = {}) {
  return {
    setup: "The initiating owner asks for one private cross-owner reply in a quiet library.",
    ...overrides,
  };
}

function crossOwnerPublicExhibitBody(overrides: Partial<{
  title: string;
  summary: string;
  tags: string[];
  contractVersion: number;
}> = {}) {
  return {
    confirmCrossOwnerPublicMetadata: true,
    title: "Cross-owner public metadata",
    summary: "A jointly approved public context note.",
    tags: ["cross-owner", "metadata"],
    contractVersion: 1,
    ...overrides,
  };
}

function crossOwnerGeneratedArtifactBody(overrides: Partial<{
  title: string;
  body: string;
  excerpt: string | null;
}> = {}) {
  return {
    confirmPrivateGeneratedArtifact: true,
    title: "Private generated cross-owner artifact",
    body: "Generated private source text for the two participants only.",
    excerpt: "Participant-only generated excerpt.",
    ...overrides,
  };
}

function crossOwnerGeneratedRevisionBody(overrides: Partial<{
  title: string;
  body: string;
  excerpt: string | null;
}> = {}) {
  return {
    confirmExactPublicTextProposal: true,
    title: "Exact future generated text",
    body: "Exact generated text proposed privately for bilateral approval.",
    excerpt: "Exact proposed excerpt.",
    ...overrides,
  };
}

function crossOwnerGeneratedRevisionApprovalBody(revisionDigest: string) {
  return {
    confirmExactTextApproval: true,
    revisionDigest,
  };
}

function crossOwnerGeneratedPublicationBody(revisionDigest: string) {
  return {
    confirmPublicGeneratedMaterialPublication: true,
    revisionDigest,
  };
}

async function createGeneratedRevisionFixture(
  app: Express,
  options: {
    requestedScopes?: string[];
    artifact?: Partial<{ title: string; body: string; excerpt: string | null }>;
    revision?: Partial<{ title: string; body: string; excerpt: string | null }>;
    approveRequester?: boolean;
    approveCounterparty?: boolean;
  } = {},
) {
  const created = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents", {
    token: "owner-token",
    body: crossOwnerConsentBody({
      requestedScopes: options.requestedScopes ?? [
        "save_private_cross_owner_artifact",
        "publish_exact_generated_revision",
      ],
    }),
  });
  assert.equal(created.status, 201);

  const approved = await requestJson(
    app,
    "PATCH",
    `/persona-encounters/cross-owner-consents/${created.body.consent.id}/approve`,
    { token: "other-token", body: {} },
  );
  assert.equal(approved.status, 200);

  const artifact = await requestJson(app, "POST", crossOwnerConsentGeneratedArtifactsPath(created.body.consent.id), {
    token: "owner-token",
    body: crossOwnerGeneratedArtifactBody(options.artifact),
  });
  assert.equal(artifact.status, 201);

  const revision = await requestJson(
    app,
    "POST",
    crossOwnerGeneratedArtifactRevisionsPath(artifact.body.artifact.artifactSlug),
    {
      token: "owner-token",
      body: crossOwnerGeneratedRevisionBody(options.revision),
    },
  );
  assert.equal(revision.status, 201);

  let requesterApproval: any = null;
  let counterpartyApproval: any = null;
  let latestRevision = revision.body.revision;

  if (options.approveRequester ?? true) {
    requesterApproval = await requestJson(
      app,
      "PATCH",
      crossOwnerGeneratedRevisionApprovePath(revision.body.revision.revisionSlug),
      {
        token: "owner-token",
        body: crossOwnerGeneratedRevisionApprovalBody(revision.body.revision.textDigest),
      },
    );
    assert.equal(requesterApproval.status, 200);
    latestRevision = requesterApproval.body.revision;
  }

  if (options.approveCounterparty ?? true) {
    counterpartyApproval = await requestJson(
      app,
      "PATCH",
      crossOwnerGeneratedRevisionApprovePath(revision.body.revision.revisionSlug),
      {
        token: "other-token",
        body: crossOwnerGeneratedRevisionApprovalBody(revision.body.revision.textDigest),
      },
    );
    assert.equal(counterpartyApproval.status, 200);
    latestRevision = counterpartyApproval.body.revision;
  }

  return {
    consent: created.body.consent,
    approvedConsent: approved.body.consent,
    artifact: artifact.body.artifact,
    revision: latestRevision,
    requesterApproval,
    counterpartyApproval,
  };
}

function seedCrossOwnerConsent(db: InMemorySupabase, overrides: Row = {}) {
  return db.insertRow("persona_encounter_cross_owner_consents", {
    requester_owner_user_id: OWNER_ID,
    requester_persona_id: INITIATOR_ID,
    requester_persona_name_snapshot: "Blue Lantern",
    counterparty_owner_user_id: OTHER_OWNER_ID,
    counterparty_persona_id: OTHER_PERSONA_ID,
    counterparty_persona_name_snapshot: "Other Owner Persona",
    status: "approved",
    requested_scopes: ["run_cross_owner_encounter"],
    requester_approved_at: "2026-06-29T09:00:00.000Z",
    counterparty_approved_at: "2026-06-29T09:00:01.000Z",
    ...overrides,
  });
}

function seedCrossOwnerGeneratedArtifact(db: InMemorySupabase, consent: Row, overrides: Row = {}) {
  return db.insertRow("persona_encounter_cross_owner_generated_artifacts", {
    consent_id: consent.id,
    requester_owner_user_id: consent.requester_owner_user_id,
    requester_persona_id: consent.requester_persona_id,
    requester_persona_name_snapshot: consent.requester_persona_name_snapshot,
    counterparty_owner_user_id: consent.counterparty_owner_user_id,
    counterparty_persona_id: consent.counterparty_persona_id,
    counterparty_persona_name_snapshot: consent.counterparty_persona_name_snapshot,
    artifact_slug: "generated-artifact-12345678",
    private_title: "Seeded generated artifact",
    private_body: "Seeded participant-only generated body text.",
    private_excerpt: "Seeded excerpt.",
    generated_content_digest: "a".repeat(64),
    lifecycle_status: "active",
    contract_version: 1,
    provenance_schema: "station.persona_encounter.cross_owner_private_generated_artifact.v1",
    created_by: consent.requester_owner_user_id,
    updated_by: consent.requester_owner_user_id,
    ...overrides,
  });
}

function seedCrossOwnerPublicExhibit(db: InMemorySupabase, consent: Row, overrides: Row = {}) {
  return db.insertRow("persona_encounter_cross_owner_public_exhibits", {
    consent_id: consent.id,
    requester_owner_user_id: consent.requester_owner_user_id,
    requester_persona_id: consent.requester_persona_id,
    requester_persona_name_snapshot: consent.requester_persona_name_snapshot,
    counterparty_owner_user_id: consent.counterparty_owner_user_id,
    counterparty_persona_id: consent.counterparty_persona_id,
    counterparty_persona_name_snapshot: consent.counterparty_persona_name_snapshot,
    slug: "cross-owner-exhibit-12345678",
    public_title: "Cross-owner public metadata",
    public_summary: "A jointly approved public context note.",
    public_tags: ["cross-owner", "metadata"],
    status: "published",
    contract_version: 1,
    provenance_schema: "station.persona_encounter.cross_owner_public_exhibit.v1",
    requester_metadata_approved_at: "2026-06-29T09:00:02.000Z",
    counterparty_metadata_approved_at: "2026-06-29T09:00:03.000Z",
    published_at: "2026-07-11T12:00:00.000Z",
    created_by: consent.requester_owner_user_id,
    updated_by: consent.counterparty_owner_user_id,
    ...overrides,
  });
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

async function withHarness<T>(
  fn: (input: { db: InMemorySupabase; app: Express; providerCalls: Array<{ url: string; body: Row }> }) => Promise<T>,
  options: { providerStatus?: number; providerContent?: string; providerModel?: string; rateLimitProvider?: OperationalCacheProvider } = {},
) {
  const db = new InMemorySupabase();
  configureProviderEnv();
  const providerCalls = installProviderFetch({
    status: options.providerStatus,
    content: options.providerContent,
    model: options.providerModel,
  });
  setSupabaseAdminForTests(db.client as any);
  setOperationalCacheProviderForTests(options.rateLimitProvider ?? new TestRateLimitProvider());

  try {
    return await fn({ db, app: createApp(), providerCalls });
  } finally {
    setSupabaseAdminForTests(null);
    resetOperationalCacheProviderForTests();
    clearProviderEnv();
    globalThis.fetch = nativeFetch;
  }
}

function assertNoDurableEncounterWrites(db: InMemorySupabase) {
  for (const table of [
    "conversations",
    "conversation_messages",
    "persona_encounter_private_sessions",
    "persona_encounter_public_exhibits",
    "persona_encounter_cross_owner_consents",
    "persona_encounter_cross_owner_consent_audit_events",
    "persona_encounter_cross_owner_runtime_attempts",
    "persona_encounter_cross_owner_public_exhibits",
    "persona_encounter_cross_owner_generated_artifacts",
    "persona_encounter_cross_owner_generated_revisions",
    "persona_encounter_cross_owner_generated_revision_approvals",
    "persona_encounter_cross_owner_generated_publications",
    "persona_encounter_cross_owner_generated_publication_audits",
    "archived_chat_transcripts",
    "continuity_candidates",
    "continuity_records",
    "memory_items",
    "canon_items",
    "documents",
    "threads",
    "comments",
    "moderation_reports",
    "public_persona_interaction_counters",
    "background_jobs",
  ]) {
    assert.equal(db.rows(table).length, 0, `${table} should not be written`);
  }
}

function assertNoDurableEncounterWritesExceptPrivateSessions(db: InMemorySupabase) {
  for (const table of [
    "conversations",
    "conversation_messages",
    "persona_encounter_public_exhibits",
    "persona_encounter_cross_owner_consents",
    "persona_encounter_cross_owner_consent_audit_events",
    "persona_encounter_cross_owner_runtime_attempts",
    "persona_encounter_cross_owner_public_exhibits",
    "persona_encounter_cross_owner_generated_artifacts",
    "persona_encounter_cross_owner_generated_revisions",
    "persona_encounter_cross_owner_generated_revision_approvals",
    "persona_encounter_cross_owner_generated_publications",
    "persona_encounter_cross_owner_generated_publication_audits",
    "archived_chat_transcripts",
    "continuity_candidates",
    "continuity_records",
    "memory_items",
    "canon_items",
    "documents",
    "threads",
    "comments",
    "moderation_reports",
    "public_persona_interaction_counters",
    "background_jobs",
  ]) {
    assert.equal(db.rows(table).length, 0, `${table} should not be written`);
  }
}

function assertNoForbiddenCrossOwnerConsentSideEffects(db: InMemorySupabase) {
  for (const table of [
    "conversations",
    "conversation_messages",
    "persona_encounter_private_sessions",
    "persona_encounter_public_exhibits",
    "persona_encounter_cross_owner_public_exhibits",
    "persona_encounter_cross_owner_runtime_attempts",
    "persona_encounter_cross_owner_generated_artifacts",
    "persona_encounter_cross_owner_generated_revisions",
    "persona_encounter_cross_owner_generated_revision_approvals",
    "persona_encounter_cross_owner_generated_publications",
    "persona_encounter_cross_owner_generated_publication_audits",
    "archived_chat_transcripts",
    "continuity_candidates",
    "continuity_records",
    "memory_items",
    "canon_items",
    "documents",
    "threads",
    "comments",
    "moderation_reports",
    "public_persona_interaction_counters",
    "background_jobs",
    "token_usage",
    "token_transactions",
  ]) {
    assert.equal(db.rows(table).length, 0, `${table} should not be written`);
  }
}

function assertNoForbiddenCrossOwnerRuntimeAttemptSideEffects(db: InMemorySupabase) {
  for (const table of [
    "conversations",
    "conversation_messages",
    "persona_encounter_private_sessions",
    "persona_encounter_public_exhibits",
    "persona_encounter_cross_owner_public_exhibits",
    "persona_encounter_cross_owner_generated_artifacts",
    "persona_encounter_cross_owner_generated_revisions",
    "persona_encounter_cross_owner_generated_revision_approvals",
    "persona_encounter_cross_owner_generated_publications",
    "persona_encounter_cross_owner_generated_publication_audits",
    "archived_chat_transcripts",
    "continuity_candidates",
    "continuity_records",
    "memory_items",
    "canon_items",
    "documents",
    "threads",
    "comments",
    "moderation_reports",
    "public_persona_interaction_counters",
    "background_jobs",
    "token_usage",
    "token_transactions",
  ]) {
    assert.equal(db.rows(table).length, 0, `${table} should not be written`);
  }
}

function assertNoForbiddenCrossOwnerPreviewSideEffects(db: InMemorySupabase) {
  for (const table of [
    "conversations",
    "conversation_messages",
    "persona_encounter_private_sessions",
    "persona_encounter_public_exhibits",
    "persona_encounter_cross_owner_public_exhibits",
    "persona_encounter_cross_owner_generated_artifacts",
    "persona_encounter_cross_owner_generated_revisions",
    "persona_encounter_cross_owner_generated_revision_approvals",
    "persona_encounter_cross_owner_generated_publications",
    "persona_encounter_cross_owner_generated_publication_audits",
    "archived_chat_transcripts",
    "continuity_candidates",
    "continuity_records",
    "memory_items",
    "canon_items",
    "documents",
    "threads",
    "comments",
    "moderation_reports",
    "public_persona_interaction_counters",
    "background_jobs",
  ]) {
    assert.equal(db.rows(table).length, 0, `${table} should not be written`);
  }
}

test("private encounter curation migration extends the owner-only table without weakening RLS", () => {
  const sql = readFileSync(
    "infra/supabase/migrations/075_persona_encounter_private_session_curation.sql",
    "utf8",
  );

  assert.match(sql, /alter table public\.persona_encounter_private_sessions/);
  assert.match(sql, /owner_title text/);
  assert.match(sql, /owner_summary text/);
  assert.match(sql, /owner_tags text\[\] not null default '\{\}'::text\[\]/);
  assert.match(sql, /publication_candidate boolean not null default false/);
  assert.match(sql, /station\.persona_encounter\.private_session_curation\.v1/);
  assert.match(sql, /where tag is null\s+or char_length\(btrim\(tag\)\) not between 1 and 40/);
  assert.equal(/disable row level security/i.test(sql), false);
  assert.equal(/drop policy/i.test(sql), false);
  assert.equal(/drop constraint/i.test(sql), false);
  assert.match(sql, /not a public exhibit, share link, moderation state, or cross-owner consent|Does not create publication/);
});

test("public encounter exhibit migration creates dedicated table RLS and moderation target", () => {
  const sql = readFileSync(
    "infra/supabase/migrations/076_persona_encounter_public_exhibits.sql",
    "utf8",
  );

  assert.match(sql, /create table if not exists public\.persona_encounter_public_exhibits/);
  assert.match(sql, /private_session_id uuid not null references public\.persona_encounter_private_sessions/);
  assert.match(sql, /slug text not null unique/);
  assert.match(sql, /status in \('published', 'retracted', 'removed'\)/);
  assert.match(sql, /where tag is null\s+or char_length\(btrim\(tag\)\) not between 1 and 40/);
  assert.match(sql, /initiator\.id = session\.initiator_persona_id\s+and initiator\.owner_user_id = new\.owner_user_id/);
  assert.match(sql, /responder\.id = session\.responder_persona_id\s+and responder\.owner_user_id = new\.owner_user_id/);
  assert.match(sql, /persona_encounter_public_exhibits_select_published/);
  assert.match(sql, /persona_encounter_public_exhibits_update_owner/);
  assert.match(sql, /station\.persona_encounter\.public_exhibit\.v1/);
  assert.match(sql, /persona_encounter_public_exhibit/);
  assert.match(sql, /No transcript, setup body, generated reply, private curation/);
});

test("cross-owner consent migration creates participant ledger RLS and append-only audit", () => {
  const sql = readFileSync(
    "infra/supabase/migrations/077_persona_encounter_cross_owner_consents.sql",
    "utf8",
  );

  assert.match(sql, /create table if not exists public\.persona_encounter_cross_owner_consents/);
  assert.match(sql, /create table if not exists public\.persona_encounter_cross_owner_consent_audit_events/);
  assert.match(sql, /requester_owner_user_id uuid not null references public\.profiles/);
  assert.match(sql, /counterparty_owner_user_id uuid not null references public\.profiles/);
  assert.match(sql, /requester_persona_id uuid not null references public\.personas/);
  assert.match(sql, /counterparty_persona_id uuid not null references public\.personas/);
  assert.match(sql, /requester_owner_user_id <> counterparty_owner_user_id/);
  assert.match(sql, /status in \(\s+'pending',\s+'approved',\s+'rejected',\s+'cancelled',\s+'revoked',\s+'expired',\s+'superseded',\s+'blocked_by_deletion',\s+'moderation_locked'\s+\)/);
  assert.match(sql, /run_cross_owner_encounter/);
  assert.match(sql, /publish_transcript/);
  assert.match(sql, /validate_persona_encounter_cross_owner_consent_participants/);
  assert.match(sql, /alter table public\.persona_encounter_cross_owner_consents enable row level security/);
  assert.match(sql, /alter table public\.persona_encounter_cross_owner_consent_audit_events enable row level security/);
  assert.match(sql, /persona_encounter_cross_owner_consents_select_participants/);
  assert.match(sql, /persona_encounter_cross_owner_consents_insert_requester/);
  assert.match(sql, /persona_encounter_cross_owner_consent_audit_select_participants/);
  assert.match(sql, /create or replace function public\.create_persona_encounter_cross_owner_consent/);
  assert.match(sql, /create or replace function public\.transition_persona_encounter_cross_owner_consent/);
  assert.match(sql, /security invoker/);
  assert.match(sql, /insert into public\.persona_encounter_cross_owner_consent_audit_events/);
  assert.equal(/create policy "persona_encounter_cross_owner_consents_update_participants"/.test(sql), false);
  assert.match(sql, /No direct participant update\/delete policy is created here/);
  assert.equal(/create policy "persona_encounter_cross_owner_consent_audit_insert_participants"/.test(sql), false);
  assert.match(sql, /No direct participant audit insert policy is created/);
  assert.match(sql, /prevent_persona_encounter_cross_owner_consent_audit_mutation/);
  assert.match(sql, /before update on public\.persona_encounter_cross_owner_consent_audit_events/);
  assert.match(sql, /before delete on public\.persona_encounter_cross_owner_consent_audit_events/);
  assert.equal(/select_published/i.test(sql), false);
  assert.equal(/disable row level security/i.test(sql), false);
  assert.match(sql, /it does not run encounters, save artifacts, publish metadata/);
});

test("cross-owner generated scope validator migration repairs the exact eight-scope contract", () => {
  const migration = readFileSync(
    "infra/supabase/migrations/087_persona_encounter_cross_owner_scope_validator.sql",
    "utf8",
  );
  const historicalMigration = readFileSync(
    "infra/supabase/migrations/077_persona_encounter_cross_owner_consents.sql",
    "utf8",
  );
  const apiSource = readFileSync("apps/api/src/routes/persona-encounters.ts", "utf8");
  const databaseTypesSource = readFileSync("packages/db/src/types.ts", "utf8");

  const capture = (source: string, pattern: RegExp, label: string) => {
    const match = source.match(pattern);
    assert.ok(match?.[1], `${label} should be present`);
    return match[1];
  };
  const quotedLabels = (source: string) =>
    [...source.matchAll(/["']([a-z][a-z0-9_]*)["']/g)].map((match) => match[1]);

  const validatorBody = capture(
    migration,
    /create or replace function public\.persona_encounter_cross_owner_consent_scopes_valid\(scopes text\[\]\)[\s\S]*?as \$validator\$([\s\S]*?)\$validator\$;/,
    "migration 087 validator body",
  );
  const apiScopeBlock = capture(
    apiSource,
    /const CROSS_OWNER_CONSENT_REQUESTED_SCOPES = \[([\s\S]*?)\] as const;/,
    "API cross-owner scope constant",
  );
  const databaseTypeBlock = capture(
    databaseTypesSource,
    /export type PersonaEncounterCrossOwnerConsentRequestedScope =([\s\S]*?);/,
    "database cross-owner scope type",
  );
  const historicalValidatorBody = capture(
    historicalMigration,
    /create or replace function public\.persona_encounter_cross_owner_consent_scopes_valid\(scopes text\[\]\)[\s\S]*?as \$\$([\s\S]*?)\$\$;/,
    "historical migration 077 validator body",
  );

  const expectedScopes = [
    "run_cross_owner_encounter",
    "save_private_cross_owner_artifact",
    "share_participant_metadata_between_owners",
    "publish_metadata_only_public_exhibit",
    "publish_exact_generated_revision",
    "publish_generated_words_excerpt",
    "publish_transcript",
    "publish_generated_summary",
  ];
  const migrationScopes = quotedLabels(validatorBody);

  assert.deepEqual(migrationScopes, expectedScopes);
  assert.deepEqual(quotedLabels(apiScopeBlock), expectedScopes);
  assert.deepEqual(quotedLabels(databaseTypeBlock), expectedScopes);
  assert.match(validatorBody, /scopes is not null/);
  assert.match(validatorBody, /cardinality\(scopes\) between 1 and 8/);
  assert.match(validatorBody, /scope is null\s+or scope not in/);

  const allowedScopes = new Set(migrationScopes);
  const validatesLikeMigration087 = (scopes: unknown): boolean =>
    Array.isArray(scopes)
    && scopes.length >= 1
    && scopes.length <= 8
    && scopes.every((scope) => typeof scope === "string" && allowedScopes.has(scope));

  assert.equal(validatesLikeMigration087(null), false);
  assert.equal(validatesLikeMigration087([]), false);
  assert.equal(validatesLikeMigration087([null]), false);
  assert.equal(validatesLikeMigration087(["unknown_scope"]), false);
  assert.equal(validatesLikeMigration087(Array(9).fill("run_cross_owner_encounter")), false);
  assert.equal(validatesLikeMigration087(["run_cross_owner_encounter", "unknown_scope"]), false);
  assert.equal(validatesLikeMigration087(["publish_exact_generated_revision"]), true);
  assert.equal(validatesLikeMigration087([
    "save_private_cross_owner_artifact",
    "publish_exact_generated_revision",
  ]), true);
  assert.equal(validatesLikeMigration087([
    "save_private_cross_owner_artifact",
    "save_private_cross_owner_artifact",
  ]), true);
  assert.equal(validatesLikeMigration087(["unknown_scope", "unknown_scope"]), false);

  assert.match(migration, /begin;[\s\S]*pg_advisory_xact_lock\([\s\S]*hashtextextended\('station\.pr530\.cross_owner_generated_scope_validator\.087', 0\)/);
  assert.match(migration, /do \$pr530a_preflight\$[\s\S]*create or replace function public\.persona_encounter_cross_owner_consent_scopes_valid/);
  assert.match(migration, /pg_catalog\.to_regprocedure/);
  assert.match(migration, /pg_catalog\.to_regclass/);
  assert.match(migration, /pg_catalog\.pg_depend/);
  assert.match(migration, /persona_encounter_cross_owner_consents_scopes_check/);
  assert.match(migration, /persona_encounter_cross_owner_consent_audit_scopes_check/);
  assert.match(migration, /constraint_row\.convalidated/);
  assert.match(migration, /language sql\s+immutable/);
  assert.match(migration, /from public\.persona_encounter_cross_owner_consents consent[\s\S]*is not true/);
  assert.match(migration, /from public\.persona_encounter_cross_owner_consent_audit_events audit_event[\s\S]*is not true/);
  assert.match(migration, /notify pgrst, 'reload schema';\s+commit;\s*$/);
  assert.equal((migration.match(/create or replace function/gi) ?? []).length, 1);
  assert.doesNotMatch(migration, /\b(?:create|alter|drop)\s+table\b/i);
  assert.doesNotMatch(migration, /\bdrop\s+function\b|\b(?:add|drop)\s+constraint\b/i);
  assert.doesNotMatch(migration, /\b(?:discover|forum|persona[_ -]?chat|search|feed)\b/i);

  assert.match(historicalValidatorBody, /cardinality\(scopes\) between 1 and 7/);
  assert.doesNotMatch(historicalValidatorBody, /publish_exact_generated_revision/);
});

test("append-only cleanup migration preserves direct guards and permits parent cascades", () => {
  const migration = readFileSync(
    "infra/supabase/migrations/088_persona_encounter_append_only_parent_cascade_cleanup.sql",
    "utf8",
  );

  const body = (label: string) => {
    const match = migration.match(new RegExp(`as \\$${label}\\$([\\s\\S]*?)\\$${label}\\$;`));
    assert.ok(match?.[1], `${label} body should be present`);
    return match[1];
  };

  const consentAudit = body("consent_audit_guard");
  const runtimeAttempt = body("runtime_attempt_guard");
  const generatedApproval = body("generated_approval_guard");
  const publicationAudit = body("publication_audit_guard");

  for (const guard of [consentAudit, runtimeAttempt, generatedApproval, publicationAudit]) {
    assert.match(guard, /if tg_op = 'DELETE'/);
    assert.match(guard, /not exists/);
    assert.match(guard, /return old/);
    assert.match(guard, /raise exception '[^']+ append-only'/);
  }

  assert.match(consentAudit, /from public\.persona_encounter_cross_owner_consents/);
  assert.match(runtimeAttempt, /from public\.persona_encounter_cross_owner_consents/);
  for (const parent of [
    "persona_encounter_cross_owner_generated_revisions",
    "persona_encounter_cross_owner_generated_artifacts",
    "persona_encounter_cross_owner_consents",
    "profiles",
  ]) {
    assert.match(generatedApproval, new RegExp(`from public\\.${parent}`));
  }
  for (const parent of [
    "persona_encounter_cross_owner_generated_publications",
    "persona_encounter_cross_owner_consents",
    "persona_encounter_cross_owner_generated_artifacts",
    "persona_encounter_cross_owner_generated_revisions",
  ]) {
    assert.match(publicationAudit, new RegExp(`from public\\.${parent}`));
  }

  assert.match(migration, /hashtextextended\('station\.pr532a\.append_only_parent_cascade_cleanup\.088', 0\)/);
  assert.match(migration, /do \$pr532a_preflight\$[\s\S]*confdeltype = 'c'/);
  assert.equal((migration.match(/create or replace function/gi) ?? []).length, 4);
  assert.equal((migration.match(/security definer/gi) ?? []).length, 4);
  assert.equal((migration.match(/set search_path = pg_catalog, public/gi) ?? []).length, 4);
  assert.equal((migration.match(/set row_security = off/gi) ?? []).length, 4);
  assert.match(migration, /delete_guard_count <> 4 or update_guard_count <> 4/);
  assert.doesNotMatch(migration, /\bdelete\s+from\b|\bupdate\s+public\b/i);
  assert.doesNotMatch(migration, /\b(?:create|alter|drop)\s+table\b/i);
  assert.doesNotMatch(migration, /\bdrop\s+(?:function|trigger|policy)\b/i);
  assert.doesNotMatch(migration, /disable row level security/i);
  assert.match(migration, /notify pgrst, 'reload schema';\s+commit;\s*$/);
});

test("cross-owner runtime attempt migration creates participant-readable append-only metadata audit", () => {
  const sql = readFileSync(
    "infra/supabase/migrations/078_persona_encounter_cross_owner_runtime_attempts.sql",
    "utf8",
  );

  assert.match(sql, /create table if not exists public\.persona_encounter_cross_owner_runtime_attempts/);
  assert.match(sql, /consent_id uuid not null references public\.persona_encounter_cross_owner_consents\(id\) on delete cascade/);
  assert.match(sql, /actor_role text not null/);
  assert.match(sql, /initiator_role text not null/);
  assert.match(sql, /responder_role text not null/);
  assert.match(sql, /consent_status text not null/);
  assert.match(sql, /requested_scope_version integer not null/);
  assert.match(sql, /requested_scope text not null/);
  assert.match(sql, /readiness_code text not null/);
  assert.match(sql, /lifecycle_status text not null/);
  assert.match(sql, /station\.persona_encounter\.cross_owner_runtime_attempt\.v1/);
  assert.match(sql, /actor_role in \('requester', 'counterparty'\)/);
  assert.match(sql, /initiator_role <> responder_role/);
  assert.match(sql, /readiness_code ~ '\^\[a-z0-9_\]\{1,80\}\$'/);
  assert.match(sql, /blocked_before_provider/);
  assert.match(sql, /provider_succeeded/);
  assert.match(sql, /provider_failed/);
  assert.match(sql, /provider_empty/);
  assert.match(sql, /quota_exceeded/);
  assert.match(sql, /rate_limited/);
  assert.match(sql, /provider_unavailable/);
  assert.match(sql, /alter table public\.persona_encounter_cross_owner_runtime_attempts enable row level security/);
  assert.match(sql, /persona_encounter_cross_owner_runtime_attempts_select_participants/);
  assert.match(sql, /auth\.uid\(\) = consent\.requester_owner_user_id/);
  assert.match(sql, /auth\.uid\(\) = consent\.counterparty_owner_user_id/);
  assert.equal(/select_published/i.test(sql), false);
  assert.equal(/create policy "persona_encounter_cross_owner_runtime_attempts_insert_participants"/.test(sql), false);
  assert.equal(/create policy "persona_encounter_cross_owner_runtime_attempts_update_participants"/.test(sql), false);
  assert.equal(/create policy "persona_encounter_cross_owner_runtime_attempts_delete_participants"/.test(sql), false);
  assert.match(sql, /No direct participant insert policy is created/);
  assert.match(sql, /No direct participant update\/delete policies are created/);
  assert.match(sql, /create or replace function public\.record_persona_encounter_cross_owner_runtime_attempt/);
  assert.match(sql, /security invoker/);
  assert.match(sql, /cross-owner consent not found for runtime attempt audit/);
  assert.match(sql, /runtime attempt consent status does not match current consent/);
  assert.match(sql, /runtime attempt scope version does not match current consent/);
  assert.match(sql, /provider lifecycle runtime attempts require approved ready runtime consent/);
  assert.match(sql, /insert into public\.persona_encounter_cross_owner_runtime_attempts/);
  assert.match(sql, /prevent_persona_encounter_cross_owner_runtime_attempt_mutation/);
  assert.match(sql, /drop trigger if exists pe_co_rt_attempts_no_update/);
  assert.match(sql, /create trigger pe_co_rt_attempts_no_update/);
  assert.match(sql, /before update on public\.persona_encounter_cross_owner_runtime_attempts/);
  assert.match(sql, /drop trigger if exists pe_co_rt_attempts_no_delete/);
  assert.match(sql, /create trigger pe_co_rt_attempts_no_delete/);
  assert.match(sql, /before delete on public\.persona_encounter_cross_owner_runtime_attempts/);
  assert.equal("pe_co_rt_attempts_no_update".length < 63, true);
  assert.equal("pe_co_rt_attempts_no_delete".length < 63, true);
  assert.notEqual("pe_co_rt_attempts_no_update", "pe_co_rt_attempts_no_delete");
  assert.equal(/trg_persona_encounter_cross_owner_runtime_attempts_append_only_update/.test(sql), false);
  assert.equal(/trg_persona_encounter_cross_owner_runtime_attempts_append_only_delete/.test(sql), false);
  assert.equal(/disable row level security/i.test(sql), false);
  assert.match(sql, /No prompts, generated output, provider payloads, provider keys/);
  assert.match(sql, /does not call providers, assemble prompts, record tokens, create private sessions/);
});

test("cross-owner runtime attempt trigger repair uses short distinct append-only trigger names", () => {
  const sql = readFileSync(
    "infra/supabase/migrations/079_persona_encounter_runtime_attempt_trigger_repair.sql",
    "utf8",
  );

  const triggerNames = [...sql.matchAll(/create trigger ([a-z0-9_]+)/g)].map((match) => match[1]);
  assert.deepEqual(triggerNames, ["pe_co_rt_attempts_no_update", "pe_co_rt_attempts_no_delete"]);
  assert.equal(new Set(triggerNames).size, 2);
  for (const triggerName of triggerNames) {
    assert.equal(triggerName.length < 63, true, `${triggerName} should stay below PostgreSQL identifier limit`);
  }

  assert.match(sql, /drop trigger if exists trg_persona_encounter_cross_owner_runtime_attempts_append_only_update/);
  assert.match(sql, /drop trigger if exists trg_persona_encounter_cross_owner_runtime_attempts_append_only_delete/);
  assert.match(sql, /drop trigger if exists trg_persona_encounter_cross_owner_runtime_attempts_append_only_/);
  assert.match(sql, /drop trigger if exists pe_co_rt_attempts_no_update/);
  assert.match(sql, /drop trigger if exists pe_co_rt_attempts_no_delete/);
  assert.match(sql, /create trigger pe_co_rt_attempts_no_update\s+before update on public\.persona_encounter_cross_owner_runtime_attempts/);
  assert.match(sql, /create trigger pe_co_rt_attempts_no_delete\s+before delete on public\.persona_encounter_cross_owner_runtime_attempts/);
  assert.match(sql, /execute function public\.prevent_persona_encounter_cross_owner_runtime_attempt_mutation\(\)/);
  assert.match(sql, /Short non-colliding PR513C trigger name/);
  assert.equal(/disable row level security/i.test(sql), false);
  assert.equal(/provider_succeeded|generated output|token_usage|private_session|public_exhibit|moderation_reports/.test(sql), false);
});

test("cross-owner public exhibit migration creates metadata-only bilateral approval table", () => {
  const sql = readFileSync(
    "infra/supabase/migrations/080_persona_encounter_cross_owner_public_exhibits.sql",
    "utf8",
  );

  assert.match(sql, /create table if not exists public\.persona_encounter_cross_owner_public_exhibits/);
  assert.match(sql, /consent_id uuid not null references public\.persona_encounter_cross_owner_consents\(id\) on delete cascade/);
  assert.match(sql, /requester_owner_user_id uuid not null references public\.profiles/);
  assert.match(sql, /counterparty_owner_user_id uuid not null references public\.profiles/);
  assert.match(sql, /status in \('proposed', 'published', 'retracted', 'removed'\)/);
  assert.match(sql, /contract_version integer not null default 1/);
  assert.match(sql, /requester_metadata_approved_at/);
  assert.match(sql, /counterparty_metadata_approved_at/);
  assert.match(sql, /publish_metadata_only_public_exhibit/);
  assert.match(sql, /validate_persona_encounter_cross_owner_public_exhibit/);
  assert.match(sql, /v_retraction_only boolean not null default false/);
  assert.match(sql, /old\.status in \('proposed', 'published'\)\s+and new\.status = 'retracted'/);
  assert.match(sql, /new\.public_title is not distinct from old\.public_title/);
  assert.match(sql, /if not v_retraction_only\s+and \(/);
  assert.match(sql, /retract_cross_owner_public_exhibits_on_consent_inactive/);
  assert.match(sql, /pe_co_public_exhibits_select_published/);
  assert.match(sql, /pe_co_public_exhibits_select_participants/);
  assert.equal(/create policy "pe_co_public_exhibits_insert_participants"/.test(sql), false);
  assert.equal(/create policy "pe_co_public_exhibits_update_participants"/.test(sql), false);
  assert.equal(/create policy "pe_co_public_exhibits_delete_participants"/.test(sql), false);
  assert.match(sql, /No direct participant insert\/update\/delete policy is created/);
  assert.match(sql, /persona_encounter_cross_owner_public_exhibit/);
  assert.match(sql, /No generated words, preview output, transcripts, excerpts, summaries/);
  assert.equal(/disable row level security/i.test(sql), false);
});

test("cross-owner private generated artifact migration creates participant-only exact approval ledger", () => {
  const sql = readFileSync(
    "infra/supabase/migrations/081_persona_encounter_cross_owner_generated_artifacts.sql",
    "utf8",
  );

  assert.match(sql, /create table if not exists public\.persona_encounter_cross_owner_generated_artifacts/);
  assert.match(sql, /create table if not exists public\.persona_encounter_cross_owner_generated_revisions/);
  assert.match(sql, /create table if not exists public\.persona_encounter_cross_owner_generated_revision_approvals/);
  assert.match(sql, /consent_id uuid not null references public\.persona_encounter_cross_owner_consents\(id\) on delete cascade/);
  assert.match(sql, /artifact_slug text not null unique/);
  assert.match(sql, /revision_slug text not null unique/);
  assert.match(sql, /generated_content_digest text not null/);
  assert.match(sql, /text_digest text not null/);
  assert.match(sql, /source_artifact_digest text not null/);
  assert.match(sql, /status in \('proposed', 'approved', 'retracted', 'revoked', 'deleted', 'moderation_blocked', 'invalidated'\)/);
  assert.match(sql, /lifecycle_status in \('active', 'retracted', 'revoked', 'deleted', 'moderation_blocked'\)/);
  assert.match(sql, /save_private_cross_owner_artifact/);
  assert.match(sql, /prevent_persona_encounter_cross_owner_generated_approval_mutation/);
  assert.match(sql, /pe_co_generated_approvals_no_update/);
  assert.match(sql, /pe_co_generated_approvals_no_delete/);
  assert.match(sql, /revoke_cross_owner_generated_artifacts_on_consent_inactive/);
  assert.match(sql, /requires current private artifact consent scope/);
  assert.match(sql, /if v_consent\.status <> 'approved' then[\s\S]*if TG_OP = 'INSERT' then/);
  assert.match(sql, /new\.lifecycle_status = 'active'[\s\S]*new\.private_body is distinct from old\.private_body[\s\S]*new\.generated_content_digest is distinct from old\.generated_content_digest/);
  assert.match(sql, /inactive cross-owner generated artifact consent only permits lifecycle closure/);
  assert.match(sql, /pe_co_generated_artifacts_select_participants/);
  assert.match(sql, /pe_co_generated_revisions_select_participants/);
  assert.match(sql, /pe_co_generated_approvals_select_participants/);
  assert.match(sql, /create policy "pe_co_generated_artifacts_select_participants"[\s\S]*lifecycle_status = 'active'/);
  assert.match(sql, /create policy "pe_co_generated_revisions_select_participants"[\s\S]*status in \('proposed', 'approved'\)[\s\S]*artifact\.lifecycle_status = 'active'/);
  assert.match(sql, /create policy "pe_co_generated_approvals_select_participants"[\s\S]*revision\.status in \('proposed', 'approved'\)[\s\S]*artifact\.lifecycle_status = 'active'/);
  assert.equal(/select_published/i.test(sql), false);
  assert.equal(/create policy "pe_co_generated_artifacts_insert_participants"/.test(sql), false);
  assert.equal(/create policy "pe_co_generated_revisions_insert_participants"/.test(sql), false);
  assert.equal(/create policy "pe_co_generated_approvals_insert_participants"/.test(sql), false);
  assert.match(sql, /No direct participant insert\/update\/delete policy is created/);
  assert.match(sql, /No public select policy, public generated-material route, PR516 automatic reuse/);
  assert.match(sql, /not a public publication surface/);
  assert.equal(/disable row level security/i.test(sql), false);
});

test("cross-owner generated publication migration creates detail-only public contract and audit", () => {
  const sql = readFileSync(
    "infra/supabase/migrations/082_persona_encounter_cross_owner_generated_publications.sql",
    "utf8",
  );

  assert.match(sql, /create table if not exists public\.persona_encounter_cross_owner_generated_publications/);
  assert.match(sql, /create table if not exists public\.persona_encounter_cross_owner_generated_publication_audits/);
  assert.deepEqual(
    sql.match(/\b[a-z][a-z0-9_]{63,}\b/g) ?? [],
    [],
    "migration 082 identifiers must fit PostgreSQL's 63-byte identifier limit",
  );
  assert.match(sql, /public_body text not null/);
  assert.match(sql, /public_excerpt text/);
  assert.match(sql, /revision_digest text not null/);
  assert.match(sql, /source_artifact_digest text not null/);
  assert.match(sql, /status in \('published', 'retracted', 'revoked', 'source_invalidated', 'removed', 'deleted'\)/);
  assert.match(sql, /publish_exact_generated_revision/);
  assert.match(sql, /station\.persona_encounter\.cross_owner_generated_publication\.v1/);
  assert.match(sql, /blocked_public_read/);
  assert.match(sql, /pe_co_generated_publications_select_public/);
  assert.match(sql, /pe_co_generated_publication_audit_select_participants/);
  assert.match(sql, /revoke_generated_publications_on_consent_inactive/);
  assert.match(sql, /invalidate_generated_publications_on_source_artifact/);
  assert.match(sql, /invalidate_generated_publications_on_revision/);
  assert.match(sql, /No list, Discover, Space, forum, writing, homepage, public persona linkback/);
  assert.equal(/create policy "pe_co_generated_publications_select_participants"/.test(sql), false);
  assert.equal(/create policy "pe_co_generated_publications_insert_participants"/.test(sql), false);
  assert.equal(/create policy "pe_co_generated_publications_update_participants"/.test(sql), false);
  assert.equal(/create policy "pe_co_generated_publications_delete_participants"/.test(sql), false);
  assert.equal(/disable row level security/i.test(sql), false);
});

test("cross-owner consent invitations require auth ownership different owners and bounded payloads", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const anonymous = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents", {
      body: crossOwnerConsentBody(),
    });
    assert.equal(anonymous.status, 401);

    const extraKeys = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents", {
      token: "owner-token",
      body: {
        ...crossOwnerConsentBody(),
        ownerUserId: OWNER_ID,
        providerPayload: "nope",
      },
    });
    assert.equal(extraKeys.status, 400);

    const notOwned = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents", {
      token: "owner-token",
      body: crossOwnerConsentBody({
        requesterPersonaId: OTHER_PERSONA_ID,
        counterpartyPersonaId: THIRD_PERSONA_ID,
      }),
    });
    assert.equal(notOwned.status, 403);
    assert.equal(notOwned.body.code, "persona_encounter_cross_owner_requester_persona_not_owned");

    const sameOwner = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents", {
      token: "owner-token",
      body: crossOwnerConsentBody({ counterpartyPersonaId: RESPONDER_ID }),
    });
    assert.equal(sameOwner.status, 400);
    assert.equal(sameOwner.body.code, "persona_encounter_cross_owner_required");

    const created = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents", {
      token: "owner-token",
      body: crossOwnerConsentBody({
        requestedScopes: [
          "run_cross_owner_encounter",
          "publish_metadata_only_public_exhibit",
        ],
      }),
    });

    assert.equal(created.status, 201);
    assert.equal(created.body.consent.status, "pending");
    assert.equal(created.body.consent.participantRole, "requester");
    assert.equal(created.body.consent.participants.requester.personaName, "Blue Lantern");
    assert.equal(created.body.consent.participants.counterparty.personaName, "Other Owner Persona");
    assert.deepEqual(
      created.body.consent.requestedScopes.map((scope: Row) => [scope.scope, scope.executable]),
      [
        ["run_cross_owner_encounter", false],
        ["publish_metadata_only_public_exhibit", false],
      ],
    );
    assert.equal(created.body.consent.ledger.executable, false);
    assert.equal(created.body.consent.ledger.permitsRuntime, false);
    assert.equal(created.body.consent.ledger.permitsPublicExhibit, false);
    assert.equal(created.body.consent.provenance.participantOwnerOnly, true);
    assert.equal(created.body.consent.audit.length, 2);
    assert.deepEqual(
      created.body.consent.audit.map((event: Row) => event.eventType),
      ["invitation_created", "requester_approved"],
    );

    assert.equal(db.rows("persona_encounter_cross_owner_consents").length, 1);
    assert.equal(db.rows("persona_encounter_cross_owner_consent_audit_events").length, 2);
    assert.equal(db.rows("persona_encounter_cross_owner_consents")[0].requester_approved_at !== null, true);
    assert.deepEqual(db.rows("persona_encounter_cross_owner_consents")[0].requested_scopes, [
      "run_cross_owner_encounter",
      "publish_metadata_only_public_exhibit",
    ]);
    assert.equal(providerCalls.length, 0);
    assertNoForbiddenCrossOwnerConsentSideEffects(db);

    const responseJson = JSON.stringify(created.body);
    for (const forbidden of [
      OWNER_ID,
      OTHER_OWNER_ID,
      INITIATOR_ID,
      OTHER_PERSONA_ID,
      "owner_user_id",
      "requester_owner_user_id",
      "counterparty_owner_user_id",
      "requester_persona_id",
      "counterparty_persona_id",
      "owner_setup",
      "responder_reply",
      "awakening_prompt",
      "style_notes",
      "providerPayload",
      "bearer",
    ]) {
      assert.equal(responseJson.includes(forbidden), false, `${forbidden} leaked in consent readback`);
    }
  });
});

test("cross-owner consent public target contract resolves and creates without raw counterparty ids", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const otherProfile = db.rows("profiles").find((profile) => profile.id === OTHER_OWNER_ID)!;
    otherProfile.tier = "creator";
    const otherPersona = db.rows("personas").find((persona) => persona.id === OTHER_PERSONA_ID)!;
    otherPersona.visibility = "public";
    otherPersona.public_slug = "other-owner-persona";
    otherPersona.avatar_url = "https://example.com/avatar.png";

    const target = await requestJson(app, "GET", "/persona-encounters/cross-owner-consent-targets/other-owner-persona", {
      token: "owner-token",
    });
    assert.equal(target.status, 200);
    assert.deepEqual(target.body.target, {
      personaName: "Other Owner Persona",
      shortDescription: "Not owned by the caller.",
      avatarUrl: "https://example.com/avatar.png",
      publicSlug: "other-owner-persona",
      routeHref: "/personas/other-owner-persona",
      eligibility: {
        eligible: true,
        code: "eligible",
        message: "Public counterparty persona can be invited.",
      },
      provenance: {
        label: "Public counterparty persona selection target",
        publicOnly: true,
        participantSafe: true,
        rawPersonaIdExposed: false,
        rawOwnerIdExposed: false,
        note: "Selection readback uses public persona fields only. Private profile fields, owner ids, persona ids, provider payloads, token facts, prompts, SQL details, and generated words are not exposed.",
      },
    });

    const created = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents/from-public-persona", {
      token: "owner-token",
      body: crossOwnerConsentByPublicSlugBody({
        requestedScopes: [
          "run_cross_owner_encounter",
          "publish_metadata_only_public_exhibit",
        ],
      }),
    });

    assert.equal(created.status, 201);
    assert.equal(created.body.consent.status, "pending");
    assert.equal(created.body.consent.participants.requester.personaName, "Blue Lantern");
    assert.equal(created.body.consent.participants.counterparty.personaName, "Other Owner Persona");
    assert.equal(created.body.target.publicSlug, "other-owner-persona");
    assert.equal(created.body.target.routeHref, "/personas/other-owner-persona");
    assert.deepEqual(
      db.rows("persona_encounter_cross_owner_consents")[0].requested_scopes,
      ["run_cross_owner_encounter", "publish_metadata_only_public_exhibit"],
    );
    assert.equal(db.rows("persona_encounter_cross_owner_consent_audit_events").length, 2);
    assert.equal(providerCalls.length, 0);
    assertNoForbiddenCrossOwnerConsentSideEffects(db);

    const responseJson = JSON.stringify(created.body);
    for (const forbidden of [
      OWNER_ID,
      OTHER_OWNER_ID,
      INITIATOR_ID,
      OTHER_PERSONA_ID,
      "owner_user_id",
      "counterpartyPersonaId",
      "counterparty_persona_id",
      "requester_owner_user_id",
      "Owner-only private persona notes",
      "Cross-owner private material",
      "awakening_prompt",
      "style_notes",
      "providerPayload",
      "token_usage",
      "Bearer ",
      "sql",
    ]) {
      assert.equal(responseJson.includes(forbidden), false, `${forbidden} leaked in public target create response`);
    }
  });
});

test("cross-owner consent public target contract rejects unsafe unavailable and forged targets", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const anonymous = await requestJson(app, "GET", "/persona-encounters/cross-owner-consent-targets/other-owner-persona");
    assert.equal(anonymous.status, 401);

    const uuidSlug = await requestJson(
      app,
      "GET",
      "/persona-encounters/cross-owner-consent-targets/550e8400-e29b-41d4-a716-446655440000",
      { token: "owner-token" },
    );
    assert.equal(uuidSlug.status, 400);
    assert.equal(uuidSlug.body.code, "persona_encounter_cross_owner_target_invalid_slug");

    const rawIds = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents/from-public-persona", {
      token: "owner-token",
      body: {
        ...crossOwnerConsentByPublicSlugBody(),
        counterpartyPersonaId: OTHER_PERSONA_ID,
        ownerUserId: OTHER_OWNER_ID,
        providerPayload: "nope",
      },
    });
    assert.equal(rawIds.status, 400);

    const privateTarget = await requestJson(app, "GET", "/persona-encounters/cross-owner-consent-targets/other-owner-persona", {
      token: "owner-token",
    });
    assert.equal(privateTarget.status, 404);
    assert.equal(privateTarget.body.code, "persona_encounter_cross_owner_target_unavailable");

    const otherProfile = db.rows("profiles").find((profile) => profile.id === OTHER_OWNER_ID)!;
    otherProfile.tier = "private";
    const otherPersona = db.rows("personas").find((persona) => persona.id === OTHER_PERSONA_ID)!;
    otherPersona.visibility = "public";
    otherPersona.public_slug = "other-owner-persona";

    const ineligibleTarget = await requestJson(app, "GET", "/persona-encounters/cross-owner-consent-targets/other-owner-persona", {
      token: "owner-token",
    });
    assert.equal(ineligibleTarget.status, 404);

    otherProfile.tier = "creator";
    const missingRequester = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents/from-public-persona", {
      token: "owner-token",
      body: crossOwnerConsentByPublicSlugBody({ requesterPersonaId: OTHER_PERSONA_ID }),
    });
    assert.equal(missingRequester.status, 403);
    assert.equal(missingRequester.body.code, "persona_encounter_cross_owner_requester_persona_not_owned");

    const staleSlug = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents/from-public-persona", {
      token: "owner-token",
      body: crossOwnerConsentByPublicSlugBody({ counterpartyPublicSlug: "stale-public-persona" }),
    });
    assert.equal(staleSlug.status, 404);
    assert.equal(staleSlug.body.code, "persona_encounter_cross_owner_target_unavailable");

    const ownerProfile = db.rows("profiles").find((profile) => profile.id === OWNER_ID)!;
    ownerProfile.tier = "creator";
    const sameOwnerPersona = db.rows("personas").find((persona) => persona.id === RESPONDER_ID)!;
    sameOwnerPersona.visibility = "public";
    sameOwnerPersona.public_slug = "same-owner-persona";

    const sameOwnerTarget = await requestJson(app, "GET", "/persona-encounters/cross-owner-consent-targets/same-owner-persona", {
      token: "owner-token",
    });
    assert.equal(sameOwnerTarget.status, 409);
    assert.equal(sameOwnerTarget.body.code, "persona_encounter_cross_owner_target_same_owner");

    const sameOwnerCreate = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents/from-public-persona", {
      token: "owner-token",
      body: crossOwnerConsentByPublicSlugBody({ counterpartyPublicSlug: "same-owner-persona" }),
    });
    assert.equal(sameOwnerCreate.status, 400);
    assert.equal(sameOwnerCreate.body.code, "persona_encounter_cross_owner_required");

    assert.equal(db.rows("persona_encounter_cross_owner_consents").length, 0);
    assert.equal(db.rows("persona_encounter_cross_owner_consent_audit_events").length, 0);
    assert.equal(providerCalls.length, 0);
    assertNoForbiddenCrossOwnerConsentSideEffects(db);
  });
});

test("cross-owner consent create and transitions fail closed when audit insertion fails", async () => {
  await withHarness(async ({ db, app }) => {
    db.failNextCrossOwnerConsentAuditRpc = true;
    const failedCreate = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents", {
      token: "owner-token",
      body: crossOwnerConsentBody(),
    });
    assert.equal(failedCreate.status, 500);
    assert.equal(failedCreate.body.code, "persona_encounter_cross_owner_consent_save_failed");
    assert.equal(db.rows("persona_encounter_cross_owner_consents").length, 0);
    assert.equal(db.rows("persona_encounter_cross_owner_consent_audit_events").length, 0);

    const created = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents", {
      token: "owner-token",
      body: crossOwnerConsentBody(),
    });
    assert.equal(created.status, 201);
    const consentId = created.body.consent.id;
    assert.equal(db.rows("persona_encounter_cross_owner_consents")[0].status, "pending");
    assert.equal(db.rows("persona_encounter_cross_owner_consent_audit_events").length, 2);

    db.failNextCrossOwnerConsentAuditRpc = true;
    const failedApprove = await requestJson(
      app,
      "PATCH",
      `/persona-encounters/cross-owner-consents/${consentId}/approve`,
      { token: "other-token", body: {} },
    );
    assert.equal(failedApprove.status, 500);
    assert.equal(failedApprove.body.code, "persona_encounter_cross_owner_consent_update_failed");
    assert.equal(db.rows("persona_encounter_cross_owner_consents")[0].status, "pending");
    assert.equal(db.rows("persona_encounter_cross_owner_consents")[0].counterparty_approved_at, null);
    assert.equal(db.rows("persona_encounter_cross_owner_consent_audit_events").length, 2);
  });
});

test("cross-owner consent participants can read approve reject cancel and revoke without nonparticipant inference", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const created = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents", {
      token: "owner-token",
      body: crossOwnerConsentBody(),
    });
    assert.equal(created.status, 201);
    const consentId = created.body.consent.id;

    const thirdList = await requestJson(app, "GET", "/persona-encounters/cross-owner-consents", {
      token: "third-token",
    });
    assert.equal(thirdList.status, 200);
    assert.deepEqual(thirdList.body.consents, []);

    const thirdDetail = await requestJson(app, "GET", `/persona-encounters/cross-owner-consents/${consentId}`, {
      token: "third-token",
    });
    assert.equal(thirdDetail.status, 404);

    const otherList = await requestJson(app, "GET", "/persona-encounters/cross-owner-consents", {
      token: "other-token",
    });
    assert.equal(otherList.status, 200);
    assert.equal(otherList.body.consents.length, 1);
    assert.equal(otherList.body.consents[0].participantRole, "counterparty");
    assert.equal(JSON.stringify(otherList.body).includes(OTHER_OWNER_ID), false);

    const requesterApprove = await requestJson(
      app,
      "PATCH",
      `/persona-encounters/cross-owner-consents/${consentId}/approve`,
      { token: "owner-token", body: {} },
    );
    assert.equal(requesterApprove.status, 403);

    const approved = await requestJson(
      app,
      "PATCH",
      `/persona-encounters/cross-owner-consents/${consentId}/approve`,
      { token: "other-token", body: {} },
    );
    assert.equal(approved.status, 200);
    assert.equal(approved.body.consent.status, "approved");
    assert.equal(approved.body.consent.ledger.consentRecordActive, true);
    assert.equal(approved.body.consent.ledger.executable, false);
    assert.equal(approved.body.consent.audit.at(-1).eventType, "counterparty_approved");

    const rejectApproved = await requestJson(
      app,
      "PATCH",
      `/persona-encounters/cross-owner-consents/${consentId}/reject`,
      { token: "other-token", body: { reasonCode: "not_aligned" } },
    );
    assert.equal(rejectApproved.status, 409);
    assert.equal(rejectApproved.body.executable, false);

    const thirdRevoke = await requestJson(
      app,
      "PATCH",
      `/persona-encounters/cross-owner-consents/${consentId}/revoke`,
      { token: "third-token", body: { reasonCode: "owner_request" } },
    );
    assert.equal(thirdRevoke.status, 404);

    const revoked = await requestJson(
      app,
      "PATCH",
      `/persona-encounters/cross-owner-consents/${consentId}/revoke`,
      { token: "owner-token", body: { reasonCode: "owner_request" } },
    );
    assert.equal(revoked.status, 200);
    assert.equal(revoked.body.consent.status, "revoked");
    assert.equal(revoked.body.consent.ledger.consentRecordActive, false);
    assert.equal(revoked.body.consent.ledger.executable, false);
    assert.equal(revoked.body.consent.audit.at(-1).eventType, "participant_revoked");
    assert.equal(revoked.body.consent.audit.at(-1).actorRole, "requester");
    assert.equal(db.rows("persona_encounter_cross_owner_consent_audit_events").length, 4);
    assert.equal(providerCalls.length, 0);
    assertNoForbiddenCrossOwnerConsentSideEffects(db);

    const rejectedSeed = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents", {
      token: "owner-token",
      body: crossOwnerConsentBody(),
    });
    const rejected = await requestJson(
      app,
      "PATCH",
      `/persona-encounters/cross-owner-consents/${rejectedSeed.body.consent.id}/reject`,
      { token: "other-token", body: { reasonCode: "not_aligned" } },
    );
    assert.equal(rejected.status, 200);
    assert.equal(rejected.body.consent.status, "rejected");
    assert.equal(rejected.body.consent.reasonCode, "not_aligned");
    assert.equal(rejected.body.consent.audit.at(-1).eventType, "counterparty_rejected");

    const cancelledSeed = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents", {
      token: "owner-token",
      body: crossOwnerConsentBody(),
    });
    const cancelled = await requestJson(
      app,
      "PATCH",
      `/persona-encounters/cross-owner-consents/${cancelledSeed.body.consent.id}/cancel`,
      { token: "owner-token", body: { reasonCode: "owner_request" } },
    );
    assert.equal(cancelled.status, 200);
    assert.equal(cancelled.body.consent.status, "cancelled");
    assert.equal(cancelled.body.consent.audit.at(-1).eventType, "requester_cancelled");
  });
});

test("cross-owner consent inactive states cannot be approved or consumed as executable", async () => {
  await withHarness(async ({ db, app }) => {
    const inactiveStatuses = [
      "rejected",
      "cancelled",
      "revoked",
      "expired",
      "superseded",
      "blocked_by_deletion",
      "moderation_locked",
    ];

    for (const status of inactiveStatuses) {
      const row = db.insertRow("persona_encounter_cross_owner_consents", {
        requester_owner_user_id: OWNER_ID,
        requester_persona_id: INITIATOR_ID,
        requester_persona_name_snapshot: "Blue Lantern",
        counterparty_owner_user_id: OTHER_OWNER_ID,
        counterparty_persona_id: OTHER_PERSONA_ID,
        counterparty_persona_name_snapshot: "Other Owner Persona",
        status,
      });

      const approve = await requestJson(
        app,
        "PATCH",
        `/persona-encounters/cross-owner-consents/${row.id}/approve`,
        { token: "other-token", body: {} },
      );
      assert.equal(approve.status, 409);
      assert.equal(approve.body.code, "persona_encounter_cross_owner_consent_inactive");
      assert.equal(approve.body.executable, false);

      const detail = await requestJson(app, "GET", `/persona-encounters/cross-owner-consents/${row.id}`, {
        token: "owner-token",
      });
      assert.equal(detail.status, 200);
      assert.equal(detail.body.consent.status, status);
      assert.equal(detail.body.consent.ledger.consentRecordActive, false);
      assert.equal(detail.body.consent.ledger.executable, false);
      assert.equal(detail.body.consent.ledger.permitsRuntime, false);
      assert.equal(detail.body.consent.ledger.permitsPrivateArtifact, false);
      assert.equal(detail.body.consent.ledger.permitsPublicExhibit, false);
      assert.equal(detail.body.consent.ledger.permitsGeneratedWords, false);
      assert.equal(detail.body.consent.ledger.permitsTranscript, false);
      assert.equal(detail.body.consent.ledger.permitsSummary, false);
      assert.equal(detail.body.consent.ledger.permitsPublicSurfacing, false);
    }
  });
});

test("cross-owner consent requested scopes are bounded and default to non-executable", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const invalid = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents", {
      token: "owner-token",
      body: crossOwnerConsentBody({
        requestedScopes: ["run_cross_owner_encounter", "publish_raw_secret_transcript"],
      }),
    });
    assert.equal(invalid.status, 400);
    assert.equal(db.rows("persona_encounter_cross_owner_consents").length, 0);

    const created = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents", {
      token: "owner-token",
      body: {
        requesterPersonaId: INITIATOR_ID,
        counterpartyPersonaId: OTHER_PERSONA_ID,
      },
    });
    assert.equal(created.status, 201);
    assert.deepEqual(created.body.consent.requestedScopes.map((scope: Row) => scope.scope), [
      "run_cross_owner_encounter",
    ]);
    assert.equal(created.body.consent.requestedScopes[0].executable, false);
    assert.equal(created.body.consent.ledger.executable, false);
    assert.equal(providerCalls.length, 0);
    assertNoForbiddenCrossOwnerConsentSideEffects(db);
  });
});

test("cross-owner runtime context contract returns approved readback without executing runtime", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const created = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents", {
      token: "owner-token",
      body: crossOwnerConsentBody(),
    });
    assert.equal(created.status, 201);

    const approved = await requestJson(
      app,
      "PATCH",
      `/persona-encounters/cross-owner-consents/${created.body.consent.id}/approve`,
      { token: "other-token", body: {} },
    );
    assert.equal(approved.status, 200);

    const beforeCounts = {
      consents: db.rows("persona_encounter_cross_owner_consents").length,
      audit: db.rows("persona_encounter_cross_owner_consent_audit_events").length,
    };
    const contract = await requestJson(
      app,
      "GET",
      crossOwnerRuntimeContractPath(created.body.consent.id),
      { token: "owner-token" },
    );

    assert.equal(contract.status, 200);
    assert.equal(contract.body.contract.schema, "station.persona_encounter.cross_owner_runtime_context_contract.v1");
    assert.equal(contract.body.contract.eligible, true);
    assert.equal(contract.body.contract.readiness.code, "ready");
    assert.equal(contract.body.contract.actor.role, "requester");
    assert.equal(contract.body.contract.requestedPair.matchesConsentPair, true);
    assert.equal(contract.body.contract.requestedPair.actorOwnsInitiator, true);
    assert.equal(contract.body.contract.requestedPair.responderIsOtherParticipant, true);
    assert.equal(contract.body.contract.requestedPair.initiator.personaName, "Blue Lantern");
    assert.equal(contract.body.contract.requestedPair.responder.personaName, "Other Owner Persona");
    assert.equal(contract.body.contract.requirements.consentStatus, "approved");
    assert.equal(contract.body.contract.requirements.requestedScopePresent, true);
    assert.equal(contract.body.contract.requirements.requestedScopeVersion, 1);
    assert.equal(contract.body.contract.requirements.genericLedgerExecutable, false);
    assert.equal(contract.body.consent.ledger.executable, false);
    assert.equal(contract.body.consent.requestedScopes[0].executable, false);
    assert.equal(contract.body.contract.execution.providerCalled, false);
    assert.equal(contract.body.contract.execution.promptAssembled, false);
    assert.equal(contract.body.contract.execution.generatedWordsReturned, false);
    assert.equal(contract.body.contract.execution.tokenAccountingRecorded, false);
    assert.equal(contract.body.contract.execution.privateSessionCreated, false);
    assert.equal(contract.body.contract.execution.publicExhibitCreated, false);
    assert.equal(contract.body.contract.execution.reportCreated, false);
    assert.equal(contract.body.contract.execution.storageWritten, false);
    assert.equal(contract.body.contract.execution.publicSurfaceCreated, false);
    assert.deepEqual(
      contract.body.contract.deniedContextClasses.map((row: Row) => row.contextClass),
      [
        "long_description",
        "awakening_prompt",
        "style_notes",
        "private_memory",
        "canon",
        "archive",
        "continuity",
        "transcripts",
        "source_bodies",
        "provider_payloads",
        "provider_config",
        "raw_owner_ids",
        "raw_persona_ids",
        "traces",
        "storage_paths",
        "generated_words",
      ],
    );
    assert.equal(contract.body.contract.futureRuntimeAttemptAudit.writtenInPr512A, false);
    assert.equal(contract.body.contract.futureRuntimeAttemptAudit.implementedInPr513A, true);
    assert.deepEqual(contract.body.contract.futureRuntimeAttemptAudit.allowedMetadataOnlyFields, [
      "consentId",
      "actorRole",
      "initiatorRole",
      "responderRole",
      "consentStatus",
      "requestedScopeVersion",
      "requestedScope",
      "readinessCode",
      "lifecycleStatus",
      "createdAt",
      "completedAt",
    ]);

    assert.equal(db.rows("persona_encounter_cross_owner_consents").length, beforeCounts.consents);
    assert.equal(db.rows("persona_encounter_cross_owner_consent_audit_events").length, beforeCounts.audit);
    assert.equal(providerCalls.length, 0);
    assertNoForbiddenCrossOwnerConsentSideEffects(db);

    const responseJson = JSON.stringify(contract.body);
    for (const forbidden of [
      OWNER_ID,
      OTHER_OWNER_ID,
      INITIATOR_ID,
      OTHER_PERSONA_ID,
      "owner_user_id",
      "requester_owner_user_id",
      "counterparty_owner_user_id",
      "requester_persona_id",
      "counterparty_persona_id",
      "Owner-only private persona notes",
      "Notice the room before speaking",
      "Style notes",
      "Copper Scribe answers once",
      "provider says no",
      "test-deepseek-key",
      "Bearer ",
    ]) {
      assert.equal(responseJson.includes(forbidden), false, `${forbidden} leaked in runtime contract readback`);
    }

    const counterpartyContract = await requestJson(
      app,
      "GET",
      crossOwnerRuntimeContractPath(created.body.consent.id, {
        initiatorPersonaId: OTHER_PERSONA_ID,
        responderPersonaId: INITIATOR_ID,
      }),
      { token: "other-token" },
    );
    assert.equal(counterpartyContract.status, 200);
    assert.equal(counterpartyContract.body.contract.eligible, true);
    assert.equal(counterpartyContract.body.contract.actor.role, "counterparty");
    assert.equal(counterpartyContract.body.contract.requestedPair.actorOwnsInitiator, true);
  });
});

test("cross-owner runtime attempt audit helper records bounded metadata and participant readback only", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const consent = seedCrossOwnerConsent(db);
    const beforeProvider = await recordCrossOwnerRuntimeAttemptAudit(db.client as any, {
      consentId: consent.id,
      actorRole: "requester",
      initiatorRole: "requester",
      responderRole: "counterparty",
      consentStatus: "approved",
      requestedScopeVersion: 1,
      requestedScope: "run_cross_owner_encounter",
      readinessCode: "wrong_role",
      lifecycleStatus: "blocked_before_provider",
    });
    assert.equal(beforeProvider.ok, true);

    const afterProviderCompletedAt = "2026-06-29T09:10:00.000Z";
    const afterProvider = await recordCrossOwnerRuntimeAttemptAudit(db.client as any, {
      consentId: consent.id,
      actorRole: "requester",
      initiatorRole: "requester",
      responderRole: "counterparty",
      consentStatus: "approved",
      requestedScopeVersion: 1,
      requestedScope: "run_cross_owner_encounter",
      readinessCode: "ready",
      lifecycleStatus: "provider_failed",
      completedAt: afterProviderCompletedAt,
    });
    assert.equal(afterProvider.ok, true);

    const attemptRows = db.rows("persona_encounter_cross_owner_runtime_attempts");
    assert.equal(attemptRows.length, 2);
    assert.equal(attemptRows[0].consent_id, consent.id);
    assert.equal(attemptRows[0].lifecycle_status, "blocked_before_provider");
    assert.equal(attemptRows[1].lifecycle_status, "provider_failed");
    assert.equal(attemptRows[1].completed_at, afterProviderCompletedAt);
    assert.equal(providerCalls.length, 0);
    assertNoForbiddenCrossOwnerRuntimeAttemptSideEffects(db);

    const signedOut = await requestJson(app, "GET", crossOwnerRuntimeAttemptsPath(consent.id));
    assert.equal(signedOut.status, 401);

    const ownerReadback = await requestJson(app, "GET", crossOwnerRuntimeAttemptsPath(consent.id), {
      token: "owner-token",
    });
    assert.equal(ownerReadback.status, 200);
    assert.equal(ownerReadback.body.consent.participantRole, "requester");
    assert.equal(ownerReadback.body.consent.ledger.executable, false);
    assert.equal(ownerReadback.body.consent.ledger.permitsRuntime, false);
    assert.equal(ownerReadback.body.attempts.length, 2);
    assert.equal(ownerReadback.body.attempts[0].lifecycleStatus, "provider_failed");
    assert.equal(ownerReadback.body.attempts[0].readinessCode, "ready");
    assert.equal(ownerReadback.body.attempts[0].requestedScope.executable, false);
    assert.equal(ownerReadback.body.attempts[0].timestamps.completedAt, afterProviderCompletedAt);
    assert.equal(ownerReadback.body.attempts[0].provenance.metadataOnly, true);
    assert.equal(ownerReadback.body.attempts[1].lifecycleStatus, "blocked_before_provider");

    const counterpartyReadback = await requestJson(app, "GET", crossOwnerRuntimeAttemptsPath(consent.id), {
      token: "other-token",
    });
    assert.equal(counterpartyReadback.status, 200);
    assert.equal(counterpartyReadback.body.consent.participantRole, "counterparty");
    assert.equal(counterpartyReadback.body.attempts.length, 2);

    const nonparticipantReadback = await requestJson(app, "GET", crossOwnerRuntimeAttemptsPath(consent.id), {
      token: "third-token",
    });
    assert.equal(nonparticipantReadback.status, 404);

    const genericConsent = await requestJson(app, "GET", `/persona-encounters/cross-owner-consents/${consent.id}`, {
      token: "owner-token",
    });
    assert.equal(genericConsent.status, 200);
    assert.equal(genericConsent.body.consent.ledger.executable, false);
    assert.equal(genericConsent.body.consent.requestedScopes[0].executable, false);

    const responseJson = JSON.stringify(ownerReadback.body);
    for (const forbidden of [
      OWNER_ID,
      OTHER_OWNER_ID,
      THIRD_OWNER_ID,
      INITIATOR_ID,
      OTHER_PERSONA_ID,
      THIRD_PERSONA_ID,
      "owner_user_id",
      "requester_owner_user_id",
      "counterparty_owner_user_id",
      "requester_persona_id",
      "counterparty_persona_id",
      "Blue Lantern",
      "Other Owner Persona",
      "Owner-only private persona notes",
      "Cross-owner private material",
      "awakening_prompt",
      "style_notes",
      "providerPayload",
      "provider says no",
      "Copper Scribe answers once",
      "test-deepseek-key",
      "Bearer ",
      "owner@example.test",
    ]) {
      assert.equal(responseJson.includes(forbidden), false, `${forbidden} leaked in runtime attempt readback`);
    }
  });
});

test("cross-owner runtime attempt audit helper fails closed when audit insertion fails", async () => {
  await withHarness(async ({ db, providerCalls }) => {
    const consent = seedCrossOwnerConsent(db);
    db.failNextCrossOwnerRuntimeAttemptRpc = true;

    const failed = await recordCrossOwnerRuntimeAttemptAudit(db.client as any, {
      consentId: consent.id,
      actorRole: "requester",
      initiatorRole: "requester",
      responderRole: "counterparty",
      consentStatus: "approved",
      requestedScopeVersion: 1,
      requestedScope: "run_cross_owner_encounter",
      readinessCode: "ready",
      lifecycleStatus: "blocked_before_provider",
    });

    assert.equal(failed.ok, false);
    assert.equal(db.rows("persona_encounter_cross_owner_runtime_attempts").length, 0);
    assert.equal(providerCalls.length, 0);
    assertNoForbiddenCrossOwnerRuntimeAttemptSideEffects(db);

    const invalidReadiness = await recordCrossOwnerRuntimeAttemptAudit(db.client as any, {
      consentId: consent.id,
      actorRole: "requester",
      initiatorRole: "requester",
      responderRole: "counterparty",
      consentStatus: "approved",
      requestedScopeVersion: 1,
      requestedScope: "run_cross_owner_encounter",
      readinessCode: "ready;drop",
      lifecycleStatus: "blocked_before_provider",
    });
    assert.equal(invalidReadiness.ok, false);
    assert.equal(db.rows("persona_encounter_cross_owner_runtime_attempts").length, 0);

    const mismatchedStatus = await recordCrossOwnerRuntimeAttemptAudit(db.client as any, {
      consentId: consent.id,
      actorRole: "requester",
      initiatorRole: "requester",
      responderRole: "counterparty",
      consentStatus: "pending",
      requestedScopeVersion: 1,
      requestedScope: "run_cross_owner_encounter",
      readinessCode: "ready",
      lifecycleStatus: "blocked_before_provider",
    });
    assert.equal(mismatchedStatus.ok, false);
    assert.equal(db.rows("persona_encounter_cross_owner_runtime_attempts").length, 0);

    const mismatchedVersion = await recordCrossOwnerRuntimeAttemptAudit(db.client as any, {
      consentId: consent.id,
      actorRole: "requester",
      initiatorRole: "requester",
      responderRole: "counterparty",
      consentStatus: "approved",
      requestedScopeVersion: 2,
      requestedScope: "run_cross_owner_encounter",
      readinessCode: "ready",
      lifecycleStatus: "blocked_before_provider",
    });
    assert.equal(mismatchedVersion.ok, false);
    assert.equal(db.rows("persona_encounter_cross_owner_runtime_attempts").length, 0);

    const providerAttemptWithoutReadyConsent = await recordCrossOwnerRuntimeAttemptAudit(db.client as any, {
      consentId: consent.id,
      actorRole: "requester",
      initiatorRole: "requester",
      responderRole: "counterparty",
      consentStatus: "approved",
      requestedScopeVersion: 1,
      requestedScope: "run_cross_owner_encounter",
      readinessCode: "wrong_role",
      lifecycleStatus: "provider_succeeded",
    });
    assert.equal(providerAttemptWithoutReadyConsent.ok, false);
    assert.equal(db.rows("persona_encounter_cross_owner_runtime_attempts").length, 0);
  });
});

test("cross-owner runtime context contract fails closed for status scope version pair role and nonparticipants", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    for (const status of ["pending", "rejected", "cancelled", "revoked"]) {
      const row = seedCrossOwnerConsent(db, { status });
      const response = await requestJson(app, "GET", crossOwnerRuntimeContractPath(row.id), {
        token: "owner-token",
      });
      assert.equal(response.status, 200);
      assert.equal(response.body.contract.eligible, false);
      assert.equal(response.body.contract.readiness.code, status);
      assert.equal(response.body.contract.readiness.ineligibleState, status);
      assert.equal(response.body.contract.execution.providerCalled, false);
      assert.equal(response.body.consent.ledger.executable, false);
    }

    const wrongScope = seedCrossOwnerConsent(db, {
      requested_scopes: ["publish_transcript"],
    });
    const wrongScopeResponse = await requestJson(app, "GET", crossOwnerRuntimeContractPath(wrongScope.id), {
      token: "owner-token",
    });
    assert.equal(wrongScopeResponse.status, 200);
    assert.equal(wrongScopeResponse.body.contract.eligible, false);
    assert.equal(wrongScopeResponse.body.contract.readiness.code, "wrong_scope");
    assert.equal(wrongScopeResponse.body.contract.requirements.requestedScopePresent, false);

    const wrongVersion = seedCrossOwnerConsent(db, {
      requested_scope_version: 2,
    });
    const wrongVersionResponse = await requestJson(app, "GET", crossOwnerRuntimeContractPath(wrongVersion.id), {
      token: "owner-token",
    });
    assert.equal(wrongVersionResponse.status, 200);
    assert.equal(wrongVersionResponse.body.contract.eligible, false);
    assert.equal(wrongVersionResponse.body.contract.readiness.code, "wrong_version");
    assert.equal(wrongVersionResponse.body.contract.requirements.requestedScopeVersion, 2);

    const wrongPair = seedCrossOwnerConsent(db);
    const wrongPairResponse = await requestJson(
      app,
      "GET",
      crossOwnerRuntimeContractPath(wrongPair.id, { responderPersonaId: RESPONDER_ID }),
      { token: "owner-token" },
    );
    assert.equal(wrongPairResponse.status, 200);
    assert.equal(wrongPairResponse.body.contract.eligible, false);
    assert.equal(wrongPairResponse.body.contract.readiness.code, "wrong_pair");
    assert.equal(wrongPairResponse.body.contract.requestedPair.matchesConsentPair, false);

    const wrongRole = seedCrossOwnerConsent(db);
    const wrongRoleResponse = await requestJson(
      app,
      "GET",
      crossOwnerRuntimeContractPath(wrongRole.id, {
        initiatorPersonaId: OTHER_PERSONA_ID,
        responderPersonaId: INITIATOR_ID,
      }),
      { token: "owner-token" },
    );
    assert.equal(wrongRoleResponse.status, 200);
    assert.equal(wrongRoleResponse.body.contract.eligible, false);
    assert.equal(wrongRoleResponse.body.contract.readiness.code, "wrong_role");
    assert.equal(wrongRoleResponse.body.contract.requestedPair.actorOwnsInitiator, false);

    const nonparticipant = seedCrossOwnerConsent(db);
    const nonparticipantResponse = await requestJson(
      app,
      "GET",
      crossOwnerRuntimeContractPath(nonparticipant.id),
      { token: "third-token" },
    );
    assert.equal(nonparticipantResponse.status, 404);

    const malformedQuery = await requestJson(
      app,
      "GET",
      `/persona-encounters/cross-owner-consents/${nonparticipant.id}/runtime-context-contract?initiatorPersonaId=${INITIATOR_ID}`,
      { token: "owner-token" },
    );
    assert.equal(malformedQuery.status, 400);

    assert.equal(providerCalls.length, 0);
    assertNoForbiddenCrossOwnerConsentSideEffects(db);
  });
});

test("cross-owner disposable preview returns one private generated reply with actor-only token accounting", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const consent = seedCrossOwnerConsent(db);
    const counterpartyProfile = db.rows("profiles").find((profile) => profile.id === OTHER_OWNER_ID)!;
    counterpartyProfile.ai_mode = "byok";
    counterpartyProfile.byok_deepseek_key = "counterparty-secret-key";
    const responderPersona = db.rows("personas").find((persona) => persona.id === OTHER_PERSONA_ID)!;
    responderPersona.provider = "openai";

    const response = await requestJson(app, "POST", crossOwnerDisposablePreviewPath(consent.id), {
      token: "owner-token",
      body: crossOwnerDisposablePreviewBody({ maxOutputTokens: 120 }),
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.preview.reply.role, "responder");
    assert.equal(response.body.preview.reply.content, "Copper Scribe answers once.");
    assert.equal(response.body.preview.reply.generated, true);
    assert.equal(response.body.preview.reply.private, true);
    assert.equal(response.body.preview.reply.disposable, true);
    assert.equal(response.body.preview.reply.canonical, false);
    assert.equal(response.body.preview.reply.public, false);
    assert.equal(response.body.preview.reply.saved, false);
    assert.equal(response.body.preview.reply.transcript, false);
    assert.equal(response.body.preview.reply.summary, false);
    assert.equal(response.body.preview.reply.excerpt, false);
    assert.equal(response.body.preview.reply.shareable, false);
    assert.equal(response.body.preview.reply.sourceRetrieval, false);
    assert.equal(response.body.provenance.schema, "station.persona_encounter.cross_owner_disposable_preview.v1");
    assert.equal(response.body.provenance.consent.executable, false);
    assert.equal(response.body.provenance.consent.participantRole, "requester");
    assert.equal(response.body.provenance.readiness.code, "ready");
    assert.equal(response.body.provenance.persistence.saved, false);
    assert.equal(response.body.provenance.persistence.privateSessionCreated, false);
    assert.equal(response.body.provenance.persistence.publicExhibitCreated, false);
    assert.equal(response.body.provenance.persistence.sourceRetrieval, false);
    assert.equal(response.body.provenance.counterparty.generatedReplyVisibleHere, false);
    assert.equal(response.body.provenance.counterparty.label, "Counterparty does not see this generated reply here");
    assert.equal(response.body.provenance.audit.recorded, true);
    assert.equal(response.body.provenance.audit.label, "Runtime attempt audit recorded");

    assert.equal(providerCalls.length, 1);
    assert.equal(providerCalls[0].url, "https://deepseek.test/chat/completions");
    assert.equal(providerCalls[0].body.max_tokens, 120);
    const providerPayload = JSON.stringify(providerCalls[0].body);
    assert.equal(providerPayload.includes("Blue Lantern"), true);
    assert.equal(providerPayload.includes("Other Owner Persona"), true);
    assert.equal(providerPayload.includes("quiet library"), true);
    for (const forbidden of [
      OWNER_ID,
      OTHER_OWNER_ID,
      INITIATOR_ID,
      OTHER_PERSONA_ID,
      "owner_user_id",
      "requester_owner_user_id",
      "counterparty_owner_user_id",
      "requester_persona_id",
      "counterparty_persona_id",
      "Owner-only private persona notes",
      "Cross-owner private material",
      "Notice the room before speaking",
      "Do not expose me",
      "awakening_prompt",
      "style_notes",
      "providerPayload",
      "counterparty-secret-key",
      "test-deepseek-key",
      "Bearer ",
    ]) {
      assert.equal(providerPayload.includes(forbidden), false, `${forbidden} leaked to provider prompt`);
    }

    assert.equal(db.rows("persona_encounter_cross_owner_runtime_attempts").length, 2);
    assert.deepEqual(
      db.rows("persona_encounter_cross_owner_runtime_attempts").map((row) => row.lifecycle_status),
      ["blocked_before_provider", "provider_succeeded"],
    );
    assert.equal(db.rows("token_usage").length, 1);
    assert.equal(db.rows("token_usage")[0].user_id, OWNER_ID);
    assert.equal(db.rows("token_transactions").length, 1);
    assert.equal(db.rows("token_transactions")[0].user_id, OWNER_ID);
    assert.equal(db.rows("token_transactions")[0].chat_id, null);
    assert.equal(db.rows("token_transactions").some((row) => row.user_id === OTHER_OWNER_ID), false);
    assertNoForbiddenCrossOwnerPreviewSideEffects(db);

    const responseJson = JSON.stringify(response.body);
    for (const forbidden of [
      OWNER_ID,
      OTHER_OWNER_ID,
      INITIATOR_ID,
      OTHER_PERSONA_ID,
      "Owner-only private persona notes",
      "Cross-owner private material",
      "counterparty-secret-key",
      "test-deepseek-key",
      "Bearer ",
    ]) {
      assert.equal(responseJson.includes(forbidden), false, `${forbidden} leaked in cross-owner preview response`);
    }
  });
});

test("cross-owner disposable preview infers the counterparty actor pair without body persona ids", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const consent = seedCrossOwnerConsent(db);

    const response = await requestJson(app, "POST", crossOwnerDisposablePreviewPath(consent.id), {
      token: "other-token",
      body: crossOwnerDisposablePreviewBody({
        setup: "The counterparty asks for one private reply from the original requester.",
      }),
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.provenance.consent.participantRole, "counterparty");
    assert.equal(response.body.provenance.personas.initiatorName, "Other Owner Persona");
    assert.equal(response.body.provenance.personas.responderName, "Blue Lantern");
    assert.equal(response.body.provenance.readiness.code, "ready");
    assert.equal(response.body.provenance.audit.recorded, true);

    assert.equal(providerCalls.length, 1);
    const providerPayload = JSON.stringify(providerCalls[0].body);
    assert.equal(providerPayload.includes("Other Owner Persona"), true);
    assert.equal(providerPayload.includes("Blue Lantern"), true);
    assert.equal(providerPayload.includes("original requester"), true);
    for (const forbidden of [
      OWNER_ID,
      OTHER_OWNER_ID,
      INITIATOR_ID,
      OTHER_PERSONA_ID,
      "owner_user_id",
      "requester_persona_id",
      "counterparty_persona_id",
      "Owner-only private persona notes",
      "Cross-owner private material",
    ]) {
      assert.equal(providerPayload.includes(forbidden), false, `${forbidden} leaked to provider prompt`);
    }

    assert.equal(db.rows("token_usage").length, 1);
    assert.equal(db.rows("token_usage")[0].user_id, OTHER_OWNER_ID);
    assert.equal(db.rows("token_transactions").length, 1);
    assert.equal(db.rows("token_transactions")[0].user_id, OTHER_OWNER_ID);
    assert.equal(db.rows("token_transactions").some((row) => row.user_id === OWNER_ID), false);
    assertNoForbiddenCrossOwnerPreviewSideEffects(db);

    const responseJson = JSON.stringify(response.body);
    for (const forbidden of [OWNER_ID, OTHER_OWNER_ID, INITIATOR_ID, OTHER_PERSONA_ID]) {
      assert.equal(responseJson.includes(forbidden), false, `${forbidden} leaked in cross-owner preview response`);
    }
  });
});

test("cross-owner disposable preview fails closed for auth participation and context contract blockers", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const consent = seedCrossOwnerConsent(db);

    const signedOut = await requestJson(app, "POST", crossOwnerDisposablePreviewPath(consent.id), {
      body: crossOwnerDisposablePreviewBody(),
    });
    assert.equal(signedOut.status, 401);

    const nonparticipant = await requestJson(app, "POST", crossOwnerDisposablePreviewPath(consent.id), {
      token: "third-token",
      body: crossOwnerDisposablePreviewBody(),
    });
    assert.equal(nonparticipant.status, 404);

    const explicitPersonaIds = await requestJson(app, "POST", crossOwnerDisposablePreviewPath(consent.id), {
      token: "owner-token",
      body: {
        ...crossOwnerDisposablePreviewBody(),
        initiatorPersonaId: OTHER_PERSONA_ID,
        responderPersonaId: INITIATOR_ID,
      },
    });
    assert.equal(explicitPersonaIds.status, 400);

    const stalePersonaId = await requestJson(app, "POST", crossOwnerDisposablePreviewPath(consent.id), {
      token: "owner-token",
      body: {
        ...crossOwnerDisposablePreviewBody(),
        responderPersonaId: RESPONDER_ID,
      },
    });
    assert.equal(stalePersonaId.status, 400);
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("persona_encounter_cross_owner_runtime_attempts").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);

    for (const status of ["pending", "rejected", "cancelled", "revoked"]) {
      const row = seedCrossOwnerConsent(db, { status });
      const response = await requestJson(app, "POST", crossOwnerDisposablePreviewPath(row.id), {
        token: "owner-token",
        body: crossOwnerDisposablePreviewBody(),
      });
      assert.equal(response.status, 409);
      assert.equal(response.body.readiness.code, status);
    }

    const wrongScope = seedCrossOwnerConsent(db, { requested_scopes: ["publish_transcript"] });
    const wrongScopeResponse = await requestJson(app, "POST", crossOwnerDisposablePreviewPath(wrongScope.id), {
      token: "owner-token",
      body: crossOwnerDisposablePreviewBody(),
    });
    assert.equal(wrongScopeResponse.status, 409);
    assert.equal(wrongScopeResponse.body.readiness.code, "wrong_scope");

    const wrongVersion = seedCrossOwnerConsent(db, { requested_scope_version: 2 });
    const wrongVersionResponse = await requestJson(app, "POST", crossOwnerDisposablePreviewPath(wrongVersion.id), {
      token: "owner-token",
      body: crossOwnerDisposablePreviewBody(),
    });
    assert.equal(wrongVersionResponse.status, 409);
    assert.equal(wrongVersionResponse.body.readiness.code, "wrong_version");

    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoForbiddenCrossOwnerPreviewSideEffects(db);
  });
});

test("cross-owner disposable preview audit failure stops before provider call or token write", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const consent = seedCrossOwnerConsent(db);
    db.failNextCrossOwnerRuntimeAttemptRpc = true;

    const response = await requestJson(app, "POST", crossOwnerDisposablePreviewPath(consent.id), {
      token: "owner-token",
      body: crossOwnerDisposablePreviewBody(),
    });

    assert.equal(response.status, 500);
    assert.equal(response.body.code, "persona_encounter_cross_owner_runtime_attempt_audit_failed");
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("persona_encounter_cross_owner_runtime_attempts").length, 0);
    assert.equal(db.rows("token_usage").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoForbiddenCrossOwnerPreviewSideEffects(db);
  });
});

test("cross-owner disposable preview records bounded blocked and provider failure outcomes", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const consent = seedCrossOwnerConsent(db);
    clearProviderEnv();

    const response = await requestJson(app, "POST", crossOwnerDisposablePreviewPath(consent.id), {
      token: "owner-token",
      body: crossOwnerDisposablePreviewBody(),
    });

    assert.equal(response.status, 503);
    assert.equal(response.body.code, "persona_encounter_provider_unavailable");
    assert.equal(providerCalls.length, 0);
    assert.deepEqual(
      db.rows("persona_encounter_cross_owner_runtime_attempts").map((row) => row.lifecycle_status),
      ["blocked_before_provider", "provider_unavailable"],
    );
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoForbiddenCrossOwnerPreviewSideEffects(db);
  });

  await withHarness(async ({ db, app, providerCalls }) => {
    const consent = seedCrossOwnerConsent(db);
    db.insertRow("token_usage", {
      user_id: OWNER_ID,
      period_start: "2026-06-01",
      tokens_used: 750_000,
      tokens_limit: 750_000,
      topup_tokens: 0,
    });

    const response = await requestJson(app, "POST", crossOwnerDisposablePreviewPath(consent.id), {
      token: "owner-token",
      body: crossOwnerDisposablePreviewBody(),
    });

    assert.equal(response.status, 402);
    assert.equal(providerCalls.length, 0);
    assert.deepEqual(
      db.rows("persona_encounter_cross_owner_runtime_attempts").map((row) => row.lifecycle_status),
      ["blocked_before_provider", "quota_exceeded"],
    );
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoForbiddenCrossOwnerPreviewSideEffects(db);
  });

  const rateLimitProvider = new TestRateLimitProvider();
  rateLimitProvider.counts.set(operationalCacheKey({
    purpose: "rate_limit",
    scope: {
      ownerUserId: OWNER_ID,
      personaId: OTHER_PERSONA_ID,
      resourceId: `${INITIATOR_ID}:${OTHER_PERSONA_ID}`,
      operation: "persona_encounter_preview_minute",
    },
    parts: ["persona-encounter-preview"],
    envName: "test",
  }), 2);
  await withHarness(async ({ db, app, providerCalls }) => {
    const consent = seedCrossOwnerConsent(db);

    const response = await requestJson(app, "POST", crossOwnerDisposablePreviewPath(consent.id), {
      token: "owner-token",
      body: crossOwnerDisposablePreviewBody(),
    });

    assert.equal(response.status, 429);
    assert.equal(providerCalls.length, 0);
    assert.deepEqual(
      db.rows("persona_encounter_cross_owner_runtime_attempts").map((row) => row.lifecycle_status),
      ["blocked_before_provider", "rate_limited"],
    );
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoForbiddenCrossOwnerPreviewSideEffects(db);
  }, { rateLimitProvider });

  await withHarness(async ({ db, app, providerCalls }) => {
    const consent = seedCrossOwnerConsent(db);

    const response = await requestJson(app, "POST", crossOwnerDisposablePreviewPath(consent.id), {
      token: "owner-token",
      body: crossOwnerDisposablePreviewBody(),
    });

    assert.equal(response.status, 502);
    assert.equal(response.body.code, "persona_encounter_provider_failed");
    assert.equal(providerCalls.length, 1);
    assert.deepEqual(
      db.rows("persona_encounter_cross_owner_runtime_attempts").map((row) => row.lifecycle_status),
      ["blocked_before_provider", "provider_failed"],
    );
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoForbiddenCrossOwnerPreviewSideEffects(db);
  }, { providerStatus: 500 });

  await withHarness(async ({ db, app, providerCalls }) => {
    const consent = seedCrossOwnerConsent(db);

    const response = await requestJson(app, "POST", crossOwnerDisposablePreviewPath(consent.id), {
      token: "owner-token",
      body: crossOwnerDisposablePreviewBody(),
    });

    assert.equal(response.status, 502);
    assert.equal(response.body.code, "persona_encounter_provider_empty_reply");
    assert.equal(providerCalls.length, 1);
    assert.deepEqual(
      db.rows("persona_encounter_cross_owner_runtime_attempts").map((row) => row.lifecycle_status),
      ["blocked_before_provider", "provider_empty"],
    );
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoForbiddenCrossOwnerPreviewSideEffects(db);
  }, { providerContent: "   " });
});

test("cross-owner metadata public exhibit requires exact bilateral approval and stays detail-only", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const created = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents", {
      token: "owner-token",
      body: crossOwnerConsentBody({
        requestedScopes: ["run_cross_owner_encounter", "publish_metadata_only_public_exhibit"],
      }),
    });
    assert.equal(created.status, 201);

    const approved = await requestJson(
      app,
      "PATCH",
      `/persona-encounters/cross-owner-consents/${created.body.consent.id}/approve`,
      { token: "other-token", body: {} },
    );
    assert.equal(approved.status, 200);

    const propose = await requestJson(app, "POST", crossOwnerConsentPublicExhibitPath(created.body.consent.id), {
      token: "owner-token",
      body: crossOwnerPublicExhibitBody(),
    });
    assert.equal(propose.status, 201);
    assert.equal(propose.body.exhibit.status, "proposed");
    assert.equal(propose.body.exhibit.publication.public, false);
    assert.equal(propose.body.exhibit.publication.routeListed, false);
    assert.equal(propose.body.exhibit.publication.indexed, false);
    assert.equal(propose.body.exhibit.participants.requester.metadataApproved, true);
    assert.equal(propose.body.exhibit.participants.counterparty.metadataApproved, false);
    assert.match(propose.body.exhibit.slug, /^cross-owner-public-metadata-[a-z0-9]{8}$/);

    const hiddenBeforeCounterparty = await requestJson(app, "GET", crossOwnerPublicExhibitPath(propose.body.exhibit.slug));
    assert.equal(hiddenBeforeCounterparty.status, 404);
    const sameOwnerList = await requestJson(app, "GET", "/persona-encounters/public-exhibits");
    assert.equal(sameOwnerList.status, 200);
    assert.deepEqual(sameOwnerList.body.exhibits, []);

    const duplicateProposal = await requestJson(app, "POST", crossOwnerConsentPublicExhibitPath(created.body.consent.id), {
      token: "owner-token",
      body: crossOwnerPublicExhibitBody({ title: "New title cannot replace exact metadata" }),
    });
    assert.equal(duplicateProposal.status, 409);
    assert.equal(duplicateProposal.body.code, "persona_encounter_cross_owner_public_exhibit_exists");

    const sameActorApproval = await requestJson(app, "PATCH", `${crossOwnerPublicExhibitPath(propose.body.exhibit.slug)}/approve`, {
      token: "owner-token",
      body: crossOwnerPublicExhibitBody(),
    });
    assert.equal(sameActorApproval.status, 409);
    assert.equal(sameActorApproval.body.code, "persona_encounter_cross_owner_public_exhibit_counterparty_metadata_required");

    const mismatchedApproval = await requestJson(app, "PATCH", `${crossOwnerPublicExhibitPath(propose.body.exhibit.slug)}/approve`, {
      token: "other-token",
      body: crossOwnerPublicExhibitBody({ summary: "Changed metadata must not publish." }),
    });
    assert.equal(mismatchedApproval.status, 409);
    assert.equal(mismatchedApproval.body.code, "persona_encounter_cross_owner_public_exhibit_metadata_mismatch");
    assert.equal(db.rows("persona_encounter_cross_owner_public_exhibits")[0].status, "proposed");

    const counterpartyApproval = await requestJson(app, "PATCH", `${crossOwnerPublicExhibitPath(propose.body.exhibit.slug)}/approve`, {
      token: "other-token",
      body: crossOwnerPublicExhibitBody(),
    });
    assert.equal(counterpartyApproval.status, 200);
    assert.equal(counterpartyApproval.body.exhibit.status, "published");
    assert.equal(counterpartyApproval.body.exhibit.publication.public, true);
    assert.equal(counterpartyApproval.body.exhibit.publication.routeListed, true);
    assert.equal(counterpartyApproval.body.exhibit.publication.discoverable, true);
    assert.equal(counterpartyApproval.body.exhibit.publication.indexed, false);

    const publicRead = await requestJson(app, "GET", crossOwnerPublicExhibitPath(propose.body.exhibit.slug));
    assert.equal(publicRead.status, 200);
    assert.equal(publicRead.body.exhibit.title, "Cross-owner public metadata");
    assert.equal(publicRead.body.exhibit.summary, "A jointly approved public context note.");
    assert.deepEqual(publicRead.body.exhibit.tags, ["cross-owner", "metadata"]);
    assert.equal(publicRead.body.exhibit.status, "published");
    assert.equal(publicRead.body.exhibit.provenance.crossOwner, true);
    assert.equal(publicRead.body.exhibit.provenance.generatedWordsPublished, false);
    assert.equal(publicRead.body.exhibit.provenance.transcriptPublished, false);
    assert.equal(publicRead.body.exhibit.provenance.routeListed, true);
    assert.equal(publicRead.body.exhibit.provenance.discoverable, true);
    assert.equal(publicRead.body.exhibit.provenance.indexed, false);
    assert.equal(publicRead.body.exhibit.report.path, `${crossOwnerPublicExhibitPath(propose.body.exhibit.slug)}/report`);
    assert.deepEqual(publicRead.body.exhibit.participants, {
      label: "Cross-owner consent display snapshots",
      requesterName: "Blue Lantern",
      counterpartyName: "Other Owner Persona",
    });

    const signedOutReport = await requestJson(app, "POST", `${crossOwnerPublicExhibitPath(propose.body.exhibit.slug)}/report`, {
      body: { reason: "unsafe_public_metadata" },
    });
    assert.equal(signedOutReport.status, 401);

    const report = await requestJson(app, "POST", `${crossOwnerPublicExhibitPath(propose.body.exhibit.slug)}/report`, {
      token: "third-token",
      body: {
        reason: "unsafe_public_metadata",
        notes: "Cross-owner public metadata needs review.",
      },
    });
    assert.equal(report.status, 201);
    assert.deepEqual(report.body, {
      report: { status: "open" },
      duplicate: false,
    });
    assert.equal(db.rows("moderation_reports").length, 1);
    assert.equal(db.rows("moderation_reports")[0].target_type, "persona_encounter_cross_owner_public_exhibit");
    assert.equal(db.rows("moderation_reports")[0].target_id, db.rows("persona_encounter_cross_owner_public_exhibits")[0].id);
    assert.equal(db.rows("moderation_reports")[0].target_id.includes(propose.body.exhibit.slug), false);
    assert.equal(db.rows("persona_encounter_cross_owner_public_exhibits")[0].reported_count, 1);

    const duplicateReport = await requestJson(app, "POST", `${crossOwnerPublicExhibitPath(propose.body.exhibit.slug)}/report`, {
      token: "third-token",
      body: { reason: "unsafe_public_metadata" },
    });
    assert.equal(duplicateReport.status, 200);
    assert.equal(duplicateReport.body.duplicate, true);
    assert.equal(db.rows("moderation_reports").length, 1);

    const listAfterPublish = await requestJson(app, "GET", "/persona-encounters/public-exhibits");
    assert.equal(listAfterPublish.status, 200);
    assert.deepEqual(listAfterPublish.body.exhibits, []);

    const publicJson = JSON.stringify(publicRead.body);
    for (const forbidden of [
      created.body.consent.id,
      OWNER_ID,
      OTHER_OWNER_ID,
      INITIATOR_ID,
      OTHER_PERSONA_ID,
      "consent_id",
      "owner_user_id",
      "requester_owner_user_id",
      "counterparty_owner_user_id",
      "requester_persona_id",
      "counterparty_persona_id",
      "Owner-only private persona notes",
      "Cross-owner private material",
      "One private cross-owner reply",
      "Copper Scribe answers once.",
      "provider_payload",
      "token_usage",
      "Bearer ",
      "test-deepseek-key",
    ]) {
      assert.equal(publicJson.includes(forbidden), false, `${forbidden} leaked in cross-owner public exhibit`);
    }

    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);
    assert.equal(db.rows("persona_encounter_public_exhibits").length, 0);
    assert.equal(db.rows("persona_encounter_cross_owner_runtime_attempts").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
  });
});

test("cross-owner metadata public exhibit fails closed for scope body participant and revocation drift", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const wrongScope = seedCrossOwnerConsent(db, { requested_scopes: ["run_cross_owner_encounter"] });
    const wrongScopeResponse = await requestJson(app, "POST", crossOwnerConsentPublicExhibitPath(wrongScope.id), {
      token: "owner-token",
      body: crossOwnerPublicExhibitBody(),
    });
    assert.equal(wrongScopeResponse.status, 409);
    assert.equal(wrongScopeResponse.body.code, "persona_encounter_cross_owner_public_exhibit_wrong_scope");

    const pending = seedCrossOwnerConsent(db, {
      status: "pending",
      requested_scopes: ["publish_metadata_only_public_exhibit"],
      counterparty_approved_at: null,
    });
    const pendingResponse = await requestJson(app, "POST", crossOwnerConsentPublicExhibitPath(pending.id), {
      token: "owner-token",
      body: crossOwnerPublicExhibitBody(),
    });
    assert.equal(pendingResponse.status, 409);
    assert.equal(pendingResponse.body.code, "persona_encounter_cross_owner_public_exhibit_consent_inactive");

    const approved = seedCrossOwnerConsent(db, {
      requested_scopes: ["publish_metadata_only_public_exhibit"],
    });
    const nonparticipant = await requestJson(app, "POST", crossOwnerConsentPublicExhibitPath(approved.id), {
      token: "third-token",
      body: crossOwnerPublicExhibitBody(),
    });
    assert.equal(nonparticipant.status, 404);

    const invalidBodies: unknown[] = [
      { title: "Missing confirmation", summary: "Metadata." },
      { confirmCrossOwnerPublicMetadata: false, title: "Title", summary: "Metadata." },
      { confirmCrossOwnerPublicMetadata: true, title: "", summary: "Metadata." },
      { confirmCrossOwnerPublicMetadata: true, title: "Title", summary: "Metadata.", tags: ["x".repeat(41)] },
      { confirmCrossOwnerPublicMetadata: true, title: "Title", summary: "Metadata.", generatedWords: "Nope." },
      { confirmCrossOwnerPublicMetadata: true, title: "Title", summary: "Metadata.", consentId: approved.id },
      { confirmCrossOwnerPublicMetadata: true, title: "Title", summary: "Metadata.", ownerUserId: OWNER_ID },
      { confirmCrossOwnerPublicMetadata: true, title: "Title", summary: "Metadata.", transcript: "No transcript." },
    ];
    for (const body of invalidBodies) {
      const response = await requestJson(app, "POST", crossOwnerConsentPublicExhibitPath(approved.id), {
        token: "owner-token",
        body,
      });
      assert.equal(response.status, 400, `body should fail: ${JSON.stringify(body)}`);
    }

    const propose = await requestJson(app, "POST", crossOwnerConsentPublicExhibitPath(approved.id), {
      token: "owner-token",
      body: crossOwnerPublicExhibitBody({ title: "Revocable metadata" }),
    });
    assert.equal(propose.status, 201);
    const publish = await requestJson(app, "PATCH", `${crossOwnerPublicExhibitPath(propose.body.exhibit.slug)}/approve`, {
      token: "other-token",
      body: crossOwnerPublicExhibitBody({ title: "Revocable metadata" }),
    });
    assert.equal(publish.status, 200);
    assert.equal(publish.body.exhibit.status, "published");

    const publicBeforeRevoke = await requestJson(app, "GET", crossOwnerPublicExhibitPath(propose.body.exhibit.slug));
    assert.equal(publicBeforeRevoke.status, 200);

    const revoke = await requestJson(app, "PATCH", `/persona-encounters/cross-owner-consents/${approved.id}/revoke`, {
      token: "other-token",
      body: { reasonCode: "owner_request" },
    });
    assert.equal(revoke.status, 200);
    assert.equal(revoke.body.consent.status, "revoked");
    assert.equal(db.rows("persona_encounter_cross_owner_public_exhibits")[0].status, "retracted");

    const hiddenAfterRevoke = await requestJson(app, "GET", crossOwnerPublicExhibitPath(propose.body.exhibit.slug));
    assert.equal(hiddenAfterRevoke.status, 404);
    const reportAfterRevoke = await requestJson(app, "POST", `${crossOwnerPublicExhibitPath(propose.body.exhibit.slug)}/report`, {
      token: "third-token",
      body: { reason: "unsafe_public_metadata" },
    });
    assert.equal(reportAfterRevoke.status, 404);

    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("moderation_reports").length, 0);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);
    assert.equal(db.rows("persona_encounter_public_exhibits").length, 0);
    assert.equal(db.rows("persona_encounter_cross_owner_runtime_attempts").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
  });
});

test("cross-owner private generated artifacts require participant readback and exact bilateral approval", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const created = await requestJson(app, "POST", "/persona-encounters/cross-owner-consents", {
      token: "owner-token",
      body: crossOwnerConsentBody({
        requestedScopes: ["save_private_cross_owner_artifact"],
      }),
    });
    assert.equal(created.status, 201);

    const approved = await requestJson(
      app,
      "PATCH",
      `/persona-encounters/cross-owner-consents/${created.body.consent.id}/approve`,
      { token: "other-token", body: {} },
    );
    assert.equal(approved.status, 200);

    const artifact = await requestJson(app, "POST", crossOwnerConsentGeneratedArtifactsPath(created.body.consent.id), {
      token: "owner-token",
      body: crossOwnerGeneratedArtifactBody({
        body: "Generated private source words for PR522 only.",
      }),
    });
    assert.equal(artifact.status, 201);
    assert.match(artifact.body.artifact.artifactSlug, /^private-generated-cross-owner-artifact-[a-z0-9]{8}$/);
    assert.equal(artifact.body.artifact.lifecycleStatus, "active");
    assert.equal(artifact.body.artifact.body, "Generated private source words for PR522 only.");
    assert.equal(artifact.body.artifact.publication.public, false);
    assert.equal(artifact.body.artifact.publication.generatedWordsPublished, false);
    assert.equal(artifact.body.artifact.provenance.pr516AutoReuse, false);
    assert.match(artifact.body.artifact.contentDigest, /^[a-f0-9]{64}$/);

    const artifactSlug = artifact.body.artifact.artifactSlug;
    const signedOut = await requestJson(app, "GET", crossOwnerGeneratedArtifactPath(artifactSlug));
    assert.equal(signedOut.status, 401);

    const nonparticipant = await requestJson(app, "GET", crossOwnerGeneratedArtifactPath(artifactSlug), {
      token: "third-token",
    });
    assert.equal(nonparticipant.status, 404);

    const counterpartyRead = await requestJson(app, "GET", crossOwnerGeneratedArtifactPath(artifactSlug), {
      token: "other-token",
    });
    assert.equal(counterpartyRead.status, 200);
    assert.equal(counterpartyRead.body.artifact.body, "Generated private source words for PR522 only.");
    assert.equal(counterpartyRead.body.artifact.participantRole, "counterparty");

    const list = await requestJson(app, "GET", crossOwnerConsentGeneratedArtifactsPath(created.body.consent.id), {
      token: "owner-token",
    });
    assert.equal(list.status, 200);
    assert.equal(list.body.artifacts.length, 1);
    assert.equal(list.body.artifacts[0].body, "Generated private source words for PR522 only.");

    const publicExhibitRead = await requestJson(app, "GET", crossOwnerPublicExhibitPath(artifactSlug));
    assert.equal(publicExhibitRead.status, 404);

    const revision = await requestJson(app, "POST", crossOwnerGeneratedArtifactRevisionsPath(artifactSlug), {
      token: "owner-token",
      body: crossOwnerGeneratedRevisionBody(),
    });
    assert.equal(revision.status, 201);
    assert.equal(revision.body.revision.status, "proposed");
    assert.match(revision.body.revision.textDigest, /^[a-f0-9]{64}$/);
    assert.equal(revision.body.revision.body, "Exact generated text proposed privately for bilateral approval.");
    assert.equal(revision.body.revision.approvals.requesterApproved, false);
    assert.equal(revision.body.revision.approvals.counterpartyApproved, false);
    assert.equal(revision.body.revision.publication.public, false);
    assert.equal(revision.body.revision.publication.generatedWordsPublished, false);

    const requesterApproval = await requestJson(
      app,
      "PATCH",
      crossOwnerGeneratedRevisionApprovePath(revision.body.revision.revisionSlug),
      {
        token: "owner-token",
        body: crossOwnerGeneratedRevisionApprovalBody(revision.body.revision.textDigest),
      },
    );
    assert.equal(requesterApproval.status, 200);
    assert.equal(requesterApproval.body.revision.status, "proposed");
    assert.equal(requesterApproval.body.revision.approvals.requesterApproved, true);
    assert.equal(requesterApproval.body.revision.approvals.counterpartyApproved, false);
    assert.equal(requesterApproval.body.revision.publication.public, false);

    const duplicateApproval = await requestJson(
      app,
      "PATCH",
      crossOwnerGeneratedRevisionApprovePath(revision.body.revision.revisionSlug),
      {
        token: "owner-token",
        body: crossOwnerGeneratedRevisionApprovalBody(revision.body.revision.textDigest),
      },
    );
    assert.equal(duplicateApproval.status, 409);
    assert.equal(duplicateApproval.body.code, "persona_encounter_cross_owner_generated_revision_counterparty_required");

    const counterpartyApproval = await requestJson(
      app,
      "PATCH",
      crossOwnerGeneratedRevisionApprovePath(revision.body.revision.revisionSlug),
      {
        token: "other-token",
        body: crossOwnerGeneratedRevisionApprovalBody(revision.body.revision.textDigest),
      },
    );
    assert.equal(counterpartyApproval.status, 200);
    assert.equal(counterpartyApproval.body.revision.status, "approved");
    assert.equal(counterpartyApproval.body.revision.approvals.bothParticipantsApproved, true);
    assert.equal(counterpartyApproval.body.revision.publication.public, false);
    assert.equal(counterpartyApproval.body.revision.publication.generatedWordsPublished, false);

    const edited = await requestJson(app, "POST", crossOwnerGeneratedArtifactRevisionsPath(artifactSlug), {
      token: "other-token",
      body: crossOwnerGeneratedRevisionBody({
        body: "Edited exact generated text resets both approvals.",
      }),
    });
    assert.equal(edited.status, 201);
    assert.equal(edited.body.revision.approvals.requesterApproved, false);
    assert.equal(edited.body.revision.approvals.counterpartyApproved, false);
    assert.equal(db.rows("persona_encounter_cross_owner_generated_revisions")[0].status, "invalidated");

    const staleDigestApproval = await requestJson(
      app,
      "PATCH",
      crossOwnerGeneratedRevisionApprovePath(edited.body.revision.revisionSlug),
      {
        token: "owner-token",
        body: crossOwnerGeneratedRevisionApprovalBody(revision.body.revision.textDigest),
      },
    );
    assert.equal(staleDigestApproval.status, 409);
    assert.equal(staleDigestApproval.body.code, "persona_encounter_cross_owner_generated_revision_digest_mismatch");

    const privateJson = JSON.stringify(counterpartyApproval.body);
    for (const forbidden of [
      created.body.consent.id,
      OWNER_ID,
      OTHER_OWNER_ID,
      INITIATOR_ID,
      OTHER_PERSONA_ID,
      "owner_user_id",
      "requester_owner_user_id",
      "counterparty_owner_user_id",
      "requester_persona_id",
      "counterparty_persona_id",
      "approver_owner_user_id",
      "provider_payload",
      "token_usage",
      "Bearer ",
      "test-deepseek-key",
    ]) {
      assert.equal(privateJson.includes(forbidden), false, `${forbidden} leaked in generated artifact readback`);
    }

    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);
    assert.equal(db.rows("persona_encounter_public_exhibits").length, 0);
    assert.equal(db.rows("persona_encounter_cross_owner_public_exhibits").length, 0);
    assert.equal(db.rows("persona_encounter_cross_owner_runtime_attempts").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
  });
});

test("cross-owner generated publications copy exact approved revisions to a detail-only public route", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const fixture = await createGeneratedRevisionFixture(app, {
      artifact: {
        body: "Private generated source words must stay participant-only.",
      },
      revision: {
        title: "Exact PR524A public title",
        body: "Exact PR524A generated body copied only after bilateral approval.",
        excerpt: "Exact PR524A excerpt.",
      },
    });

    const publish = await requestJson(app, "POST", crossOwnerGeneratedRevisionPublicationPath(fixture.revision.revisionSlug), {
      token: "owner-token",
      body: crossOwnerGeneratedPublicationBody(fixture.revision.textDigest),
    });
    assert.equal(publish.status, 201);
    assert.match(publish.body.publication.slug, /^exact-pr524a-public-title-[a-z0-9]{8}$/);
    assert.equal(publish.body.publication.routeHref, `/encounters/cross-owner/generated/${publish.body.publication.slug}`);
    assert.equal(publish.body.publication.title, "Exact PR524A public title");
    assert.equal(publish.body.publication.body, "Exact PR524A generated body copied only after bilateral approval.");
    assert.equal(publish.body.publication.excerpt, "Exact PR524A excerpt.");
    assert.equal(publish.body.publication.status, "published");
    assert.equal(publish.body.publication.contractVersion, 1);
    assert.equal(publish.body.publication.revisionDigestLabel, fixture.revision.textDigest.slice(0, 12));
    assert.equal(publish.body.publication.source.exactApprovedRevision, true);
    assert.equal(publish.body.publication.source.copiedServerSide, true);
    assert.equal(publish.body.publication.provenance.public, true);
    assert.equal(publish.body.publication.provenance.detailOnly, true);
    assert.equal(publish.body.publication.provenance.routeListed, false);
    assert.equal(publish.body.publication.provenance.indexed, false);
    assert.equal(publish.body.publication.provenance.discoverable, false);
    assert.equal(
      publish.body.publication.report.path,
      `/persona-encounters/cross-owner-generated-publications/${publish.body.publication.slug}/report`,
    );

    const publicationRow = db.rows("persona_encounter_cross_owner_generated_publications")[0];
    assert.equal(publicationRow.public_slug, publish.body.publication.slug);
    assert.equal(publicationRow.public_body, "Exact PR524A generated body copied only after bilateral approval.");
    assert.equal(publicationRow.revision_digest, fixture.revision.textDigest);
    assert.equal(publicationRow.status, "published");
    assert.equal(db.rows("persona_encounter_cross_owner_generated_publication_audits")[0].event_type, "published");

    const publicRead = await requestJson(app, "GET", crossOwnerGeneratedPublicationPath(publish.body.publication.slug));
    assert.equal(publicRead.status, 200);
    assert.equal(publicRead.body.publication.body, "Exact PR524A generated body copied only after bilateral approval.");
    assert.equal(publicRead.body.publication.participants.requester.personaName, "Blue Lantern");
    assert.equal(publicRead.body.publication.participants.counterparty.personaName, "Other Owner Persona");

    const publicList = await requestJson(app, "GET", "/persona-encounters/cross-owner-public-exhibits");
    assert.equal(publicList.status, 200);
    assert.equal(JSON.stringify(publicList.body).includes("Exact PR524A generated body"), false);

    const publicJson = JSON.stringify(publicRead.body);
    for (const forbidden of [
      fixture.consent.id,
      publicationRow.id,
      publicationRow.artifact_id,
      publicationRow.revision_id,
      OWNER_ID,
      OTHER_OWNER_ID,
      INITIATOR_ID,
      OTHER_PERSONA_ID,
      fixture.revision.textDigest,
      publicationRow.source_artifact_digest,
      "requester_owner_user_id",
      "counterparty_owner_user_id",
      "requester_persona_id",
      "counterparty_persona_id",
      "\"revisionDigest\":",
      "\"sourceArtifactDigest\":",
      "\"reportedCount\":",
      "\"consentStatus\":",
      "\"artifactLifecycleStatus\":",
      "\"revisionStatus\":",
      "Private generated source words",
      "private_body",
      "final_body",
      "provider_payload",
      "Bearer ",
      "test-deepseek-key",
    ]) {
      assert.equal(publicJson.includes(forbidden), false, `${forbidden} leaked in generated publication detail`);
    }

    const signedOutReport = await requestJson(app, "POST", `${crossOwnerGeneratedPublicationPath(publish.body.publication.slug)}/report`, {
      body: { reason: "unsafe_public_generated_material" },
    });
    assert.equal(signedOutReport.status, 401);

    const report = await requestJson(app, "POST", `${crossOwnerGeneratedPublicationPath(publish.body.publication.slug)}/report`, {
      token: "third-token",
      body: { reason: "unsafe_public_generated_material", notes: "Exact words look unsafe." },
    });
    assert.equal(report.status, 201);
    assert.equal(report.body.report.status, "open");
    assert.equal(report.body.duplicate, false);

    const duplicateReport = await requestJson(app, "POST", `${crossOwnerGeneratedPublicationPath(publish.body.publication.slug)}/report`, {
      token: "third-token",
      body: { reason: "unsafe_public_generated_material", notes: "Duplicate note should not matter." },
    });
    assert.equal(duplicateReport.status, 200);
    assert.equal(duplicateReport.body.duplicate, true);

    const moderationReport = db.rows("moderation_reports")[0];
    assert.equal(moderationReport.reporter_id, THIRD_OWNER_ID);
    assert.equal(moderationReport.target_type, "persona_encounter_cross_owner_generated_publication");
    assert.equal(moderationReport.target_id, publicationRow.id);
    assert.equal(moderationReport.status, "open");
    assert.equal(db.rows("persona_encounter_cross_owner_generated_publications")[0].reported_count, 1);

    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);
    assert.equal(db.rows("persona_encounter_public_exhibits").length, 0);
    assert.equal(db.rows("persona_encounter_cross_owner_runtime_attempts").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
  });
});

test("cross-owner generated publications fail closed for scope digest source and participant drift", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const wrongScope = await createGeneratedRevisionFixture(app, {
      requestedScopes: ["save_private_cross_owner_artifact"],
    });
    const wrongScopePublish = await requestJson(
      app,
      "POST",
      crossOwnerGeneratedRevisionPublicationPath(wrongScope.revision.revisionSlug),
      {
        token: "owner-token",
        body: crossOwnerGeneratedPublicationBody(wrongScope.revision.textDigest),
      },
    );
    assert.equal(wrongScopePublish.status, 409);
    assert.equal(wrongScopePublish.body.code, "persona_encounter_cross_owner_generated_publication_wrong_scope");

    const oneSided = await createGeneratedRevisionFixture(app, { approveCounterparty: false });
    const oneSidedPublish = await requestJson(
      app,
      "POST",
      crossOwnerGeneratedRevisionPublicationPath(oneSided.revision.revisionSlug),
      {
        token: "owner-token",
        body: crossOwnerGeneratedPublicationBody(oneSided.revision.textDigest),
      },
    );
    assert.equal(oneSidedPublish.status, 409);
    assert.equal(oneSidedPublish.body.code, "persona_encounter_cross_owner_generated_publication_revision_unapproved");

    const fixture = await createGeneratedRevisionFixture(app);
    const staleDigestPublish = await requestJson(
      app,
      "POST",
      crossOwnerGeneratedRevisionPublicationPath(fixture.revision.revisionSlug),
      {
        token: "owner-token",
        body: crossOwnerGeneratedPublicationBody("f".repeat(64)),
      },
    );
    assert.equal(staleDigestPublish.status, 409);
    assert.equal(staleDigestPublish.body.code, "persona_encounter_cross_owner_generated_publication_digest_mismatch");

    const publish = await requestJson(app, "POST", crossOwnerGeneratedRevisionPublicationPath(fixture.revision.revisionSlug), {
      token: "owner-token",
      body: crossOwnerGeneratedPublicationBody(fixture.revision.textDigest),
    });
    assert.equal(publish.status, 201);

    const duplicatePublish = await requestJson(app, "POST", crossOwnerGeneratedRevisionPublicationPath(fixture.revision.revisionSlug), {
      token: "other-token",
      body: crossOwnerGeneratedPublicationBody(fixture.revision.textDigest),
    });
    assert.equal(duplicatePublish.status, 409);
    assert.equal(duplicatePublish.body.code, "persona_encounter_cross_owner_generated_publication_exists");

    const publicBeforeDrift = await requestJson(app, "GET", crossOwnerGeneratedPublicationPath(publish.body.publication.slug));
    assert.equal(publicBeforeDrift.status, 200);

    db.tables.personas = db.rows("personas").filter((row) => row.id !== OTHER_PERSONA_ID);
    const publicAfterParticipantDeletion = await requestJson(app, "GET", crossOwnerGeneratedPublicationPath(publish.body.publication.slug));
    assert.equal(publicAfterParticipantDeletion.status, 404);
    assert.ok(
      db.rows("persona_encounter_cross_owner_generated_publication_audits")
        .some((event) => event.event_type === "blocked_public_read" && event.actor_role === "public"),
    );

    const reportAfterParticipantDeletion = await requestJson(app, "POST", `${crossOwnerGeneratedPublicationPath(publish.body.publication.slug)}/report`, {
      token: "third-token",
      body: { reason: "unsafe_public_generated_material" },
    });
    assert.equal(reportAfterParticipantDeletion.status, 404);

    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);
    assert.equal(db.rows("persona_encounter_public_exhibits").length, 0);
    assert.equal(db.rows("persona_encounter_cross_owner_runtime_attempts").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
  });
});

test("cross-owner generated publication participant controls hide and delete public body text", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const fixture = await createGeneratedRevisionFixture(app);
    const publish = await requestJson(app, "POST", crossOwnerGeneratedRevisionPublicationPath(fixture.revision.revisionSlug), {
      token: "owner-token",
      body: crossOwnerGeneratedPublicationBody(fixture.revision.textDigest),
    });
    assert.equal(publish.status, 201);

    const signedOutRetract = await requestJson(app, "PATCH", crossOwnerGeneratedPublicationRetractPath(publish.body.publication.slug));
    assert.equal(signedOutRetract.status, 401);

    const nonparticipantRetract = await requestJson(app, "PATCH", crossOwnerGeneratedPublicationRetractPath(publish.body.publication.slug), {
      token: "third-token",
    });
    assert.equal(nonparticipantRetract.status, 404);

    const retract = await requestJson(app, "PATCH", crossOwnerGeneratedPublicationRetractPath(publish.body.publication.slug), {
      token: "owner-token",
    });
    assert.equal(retract.status, 200);
    assert.equal(retract.body.publication.status, "retracted");
    assert.equal(retract.body.publication.title, null);
    assert.equal(retract.body.publication.body, null);
    assert.equal(retract.body.publication.provenance.public, false);
    assert.equal(retract.body.publication.provenance.generatedBodyPublished, false);

    const publicAfterRetract = await requestJson(app, "GET", crossOwnerGeneratedPublicationPath(publish.body.publication.slug));
    assert.equal(publicAfterRetract.status, 404);

    const deleteResponse = await requestJson(app, "DELETE", crossOwnerGeneratedPublicationPath(publish.body.publication.slug), {
      token: "other-token",
    });
    assert.equal(deleteResponse.status, 200);
    assert.equal(deleteResponse.body.deleted, true);
    assert.equal(deleteResponse.body.publication.status, "deleted");
    assert.equal(deleteResponse.body.publication.body, null);
    assert.equal(deleteResponse.body.publication.timestamps.deletedAt !== null, true);

    const publicAfterDelete = await requestJson(app, "GET", crossOwnerGeneratedPublicationPath(publish.body.publication.slug));
    assert.equal(publicAfterDelete.status, 404);

    assert.deepEqual(
      db.rows("persona_encounter_cross_owner_generated_publication_audits")
        .map((event) => event.event_type)
        .filter((eventType) => ["published", "retracted", "blocked_public_read", "deleted"].includes(eventType)),
      ["published", "retracted", "blocked_public_read", "deleted", "blocked_public_read"],
    );

    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);
    assert.equal(db.rows("persona_encounter_public_exhibits").length, 0);
    assert.equal(db.rows("persona_encounter_cross_owner_runtime_attempts").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
  });
});

test("cross-owner private generated artifacts fail closed for scope lifecycle and public surfaces", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const wrongScope = seedCrossOwnerConsent(db, { requested_scopes: ["run_cross_owner_encounter"] });
    const wrongScopeResponse = await requestJson(app, "POST", crossOwnerConsentGeneratedArtifactsPath(wrongScope.id), {
      token: "owner-token",
      body: crossOwnerGeneratedArtifactBody(),
    });
    assert.equal(wrongScopeResponse.status, 409);
    assert.equal(wrongScopeResponse.body.code, "persona_encounter_cross_owner_generated_artifact_wrong_scope");

    const wrongVersion = seedCrossOwnerConsent(db, {
      requested_scopes: ["save_private_cross_owner_artifact"],
      requested_scope_version: 2,
    });
    const wrongVersionResponse = await requestJson(app, "POST", crossOwnerConsentGeneratedArtifactsPath(wrongVersion.id), {
      token: "owner-token",
      body: crossOwnerGeneratedArtifactBody(),
    });
    assert.equal(wrongVersionResponse.status, 409);
    assert.equal(wrongVersionResponse.body.code, "persona_encounter_cross_owner_generated_artifact_wrong_version");

    const pending = seedCrossOwnerConsent(db, {
      status: "pending",
      requested_scopes: ["save_private_cross_owner_artifact"],
      counterparty_approved_at: null,
    });
    const pendingResponse = await requestJson(app, "POST", crossOwnerConsentGeneratedArtifactsPath(pending.id), {
      token: "owner-token",
      body: crossOwnerGeneratedArtifactBody(),
    });
    assert.equal(pendingResponse.status, 409);
    assert.equal(pendingResponse.body.code, "persona_encounter_cross_owner_generated_artifact_consent_inactive");

    const approved = seedCrossOwnerConsent(db, {
      requested_scopes: ["save_private_cross_owner_artifact"],
    });
    const nonparticipant = await requestJson(app, "POST", crossOwnerConsentGeneratedArtifactsPath(approved.id), {
      token: "third-token",
      body: crossOwnerGeneratedArtifactBody(),
    });
    assert.equal(nonparticipant.status, 404);

    for (const body of [
      { title: "Missing confirmation", body: "Nope." },
      { confirmPrivateGeneratedArtifact: false, title: "Title", body: "Nope." },
      { confirmPrivateGeneratedArtifact: true, title: "", body: "Nope." },
      { confirmPrivateGeneratedArtifact: true, title: "Title", body: "" },
      { confirmPrivateGeneratedArtifact: true, title: "Title", body: "Nope.", sourcePreviewId: "pr516" },
      { confirmPrivateGeneratedArtifact: true, title: "Title", body: "Nope.", ownerUserId: OWNER_ID },
      { confirmPrivateGeneratedArtifact: true, title: "Title", body: "Nope.", providerPayload: "secret" },
    ]) {
      const response = await requestJson(app, "POST", crossOwnerConsentGeneratedArtifactsPath(approved.id), {
        token: "owner-token",
        body,
      });
      assert.equal(response.status, 400, `body should fail: ${JSON.stringify(body)}`);
    }

    const staleArtifact = seedCrossOwnerGeneratedArtifact(db, approved, {
      artifact_slug: "stale-generated-12345678",
      requester_persona_name_snapshot: "Old Name",
    });
    const staleRead = await requestJson(app, "GET", crossOwnerGeneratedArtifactPath(staleArtifact.artifact_slug), {
      token: "owner-token",
    });
    assert.equal(staleRead.status, 404);

    const blockedArtifact = seedCrossOwnerGeneratedArtifact(db, approved, {
      artifact_slug: "blocked-generated-12345678",
      lifecycle_status: "moderation_blocked",
      moderation_blocked_at: "2026-07-11T12:00:00.000Z",
    });
    const blockedRead = await requestJson(app, "GET", crossOwnerGeneratedArtifactPath(blockedArtifact.artifact_slug), {
      token: "owner-token",
    });
    assert.equal(blockedRead.status, 200);
    assert.equal(blockedRead.body.artifact.lifecycleStatus, "moderation_blocked");
    assert.equal(blockedRead.body.artifact.body, null);
    const blockedRevision = await requestJson(app, "POST", crossOwnerGeneratedArtifactRevisionsPath(blockedArtifact.artifact_slug), {
      token: "owner-token",
      body: crossOwnerGeneratedRevisionBody(),
    });
    assert.equal(blockedRevision.status, 409);
    assert.equal(blockedRevision.body.code, "persona_encounter_cross_owner_generated_artifact_inactive");

    const driftedConsent = seedCrossOwnerConsent(db, {
      id: "99999999-9999-4999-8999-000000000150",
      status: "revoked",
      requested_scopes: ["save_private_cross_owner_artifact"],
      revoked_at: "2026-07-11T13:00:00.000Z",
      revoked_by: OTHER_OWNER_ID,
    });
    const driftedArtifact = seedCrossOwnerGeneratedArtifact(db, driftedConsent, {
      artifact_slug: "revoked-drift-generated-12345678",
      private_body: "Generated private source text must hide after consent drift.",
      lifecycle_status: "active",
    });
    db.insertRow("persona_encounter_cross_owner_generated_revisions", {
      artifact_id: driftedArtifact.id,
      consent_id: driftedConsent.id,
      revision_slug: "revoked-drift-revision-12345678",
      final_title: "Drifted exact text",
      final_body: "Exact generated text must hide after consent drift.",
      final_excerpt: "Exact generated text must hide.",
      text_digest: "b".repeat(64),
      source_artifact_digest: driftedArtifact.generated_content_digest,
      requester_persona_name_snapshot: driftedArtifact.requester_persona_name_snapshot,
      counterparty_persona_name_snapshot: driftedArtifact.counterparty_persona_name_snapshot,
      consent_requested_scope_version: driftedConsent.requested_scope_version,
      consent_requested_scopes: driftedConsent.requested_scopes,
      status: "proposed",
      contract_version: 1,
      approval_contract_version: 1,
      provenance_schema: "station.persona_encounter.cross_owner_generated_revision.v1",
      proposed_at: "2026-07-11T13:01:00.000Z",
      created_by: OWNER_ID,
      updated_by: OWNER_ID,
    });
    const driftedRead = await requestJson(app, "GET", crossOwnerGeneratedArtifactPath(driftedArtifact.artifact_slug), {
      token: "owner-token",
    });
    assert.equal(driftedRead.status, 200);
    assert.equal(driftedRead.body.artifact.body, null);
    assert.equal(driftedRead.body.artifact.consent.activeApproval, false);
    assert.equal(driftedRead.body.artifact.revisions[0].body, null);

    const created = await requestJson(app, "POST", crossOwnerConsentGeneratedArtifactsPath(approved.id), {
      token: "owner-token",
      body: crossOwnerGeneratedArtifactBody({ title: "Revoked generated artifact" }),
    });
    assert.equal(created.status, 201);
    const revision = await requestJson(app, "POST", crossOwnerGeneratedArtifactRevisionsPath(created.body.artifact.artifactSlug), {
      token: "owner-token",
      body: crossOwnerGeneratedRevisionBody({ title: "Revoked generated revision" }),
    });
    assert.equal(revision.status, 201);

    const revoke = await requestJson(app, "PATCH", `/persona-encounters/cross-owner-consents/${approved.id}/revoke`, {
      token: "other-token",
      body: { reasonCode: "owner_request" },
    });
    assert.equal(revoke.status, 200);
    assert.equal(revoke.body.consent.status, "revoked");
    const revokedArtifact = db.rows("persona_encounter_cross_owner_generated_artifacts")
      .find((row) => row.artifact_slug === created.body.artifact.artifactSlug);
    assert.equal(revokedArtifact.lifecycle_status, "revoked");
    const revokedRevision = db.rows("persona_encounter_cross_owner_generated_revisions")
      .find((row) => row.revision_slug === revision.body.revision.revisionSlug);
    assert.equal(revokedRevision.status, "revoked");

    const revokedRead = await requestJson(app, "GET", crossOwnerGeneratedArtifactPath(created.body.artifact.artifactSlug), {
      token: "owner-token",
    });
    assert.equal(revokedRead.status, 200);
    assert.equal(revokedRead.body.artifact.body, null);

    const publicList = await requestJson(app, "GET", "/persona-encounters/cross-owner-public-exhibits");
    assert.equal(publicList.status, 200);
    assert.equal(JSON.stringify(publicList.body).includes("Generated private source text"), false);
    assert.equal(JSON.stringify(publicList.body).includes("Exact generated text"), false);

    const deleteConsent = seedCrossOwnerConsent(db, {
      requested_scopes: ["save_private_cross_owner_artifact"],
      id: "99999999-9999-4999-8999-000000000200",
    });
    const deleteArtifact = await requestJson(app, "POST", crossOwnerConsentGeneratedArtifactsPath(deleteConsent.id), {
      token: "owner-token",
      body: crossOwnerGeneratedArtifactBody({ title: "Deleted generated artifact" }),
    });
    assert.equal(deleteArtifact.status, 201);
    const deleteResponse = await requestJson(
      app,
      "DELETE",
      crossOwnerGeneratedArtifactPath(deleteArtifact.body.artifact.artifactSlug),
      { token: "other-token" },
    );
    assert.equal(deleteResponse.status, 200);
    assert.equal(deleteResponse.body.deleted, true);
    assert.equal(deleteResponse.body.artifact.lifecycleStatus, "deleted");
    assert.equal(deleteResponse.body.artifact.body, null);

    const publicJson = JSON.stringify(publicList.body);
    for (const forbidden of [
      "private_body",
      "final_body",
      "generated_content_digest",
      "source_artifact_digest",
      "Generated private source words",
      "Exact generated text proposed privately",
      "provider_payload",
      "Bearer ",
      OWNER_ID,
      OTHER_OWNER_ID,
      INITIATOR_ID,
      OTHER_PERSONA_ID,
    ]) {
      assert.equal(publicJson.includes(forbidden), false, `${forbidden} leaked to public generated surface`);
    }

    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);
    assert.equal(db.rows("persona_encounter_public_exhibits").length, 0);
    assert.equal(db.rows("persona_encounter_cross_owner_public_exhibits").length, 0);
    assert.equal(db.rows("persona_encounter_cross_owner_runtime_attempts").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
  });
});

test("cross-owner public exhibit list is bounded metadata-only and consent backed", async () => {
  await withHarness(async ({ db, app }) => {
    const validA = seedCrossOwnerConsent(db, {
      requested_scopes: ["publish_metadata_only_public_exhibit"],
    });
    const validB = seedCrossOwnerConsent(db, {
      requested_scopes: ["publish_metadata_only_public_exhibit"],
    });
    const validC = seedCrossOwnerConsent(db, {
      requested_scopes: ["publish_metadata_only_public_exhibit"],
    });

    seedCrossOwnerPublicExhibit(db, validA, {
      slug: "shared-alpha-12345678",
      public_title: "Shared alpha",
      public_summary: "Alpha public metadata.",
      public_tags: ["alpha", "metadata"],
      published_at: "2026-07-11T12:00:00.000Z",
    });
    seedCrossOwnerPublicExhibit(db, validB, {
      slug: "shared-zulu-12345678",
      public_title: "Shared zulu",
      public_summary: "Zulu public metadata.",
      public_tags: ["zulu"],
      published_at: "2026-07-11T12:00:00.000Z",
    });
    seedCrossOwnerPublicExhibit(db, validC, {
      slug: "older-exhibit-12345678",
      public_title: "Older exhibit",
      public_summary: "Older public metadata.",
      public_tags: [],
      published_at: "2026-07-10T12:00:00.000Z",
    });

    const hiddenFixtures: Array<[string, Row, Row]> = [
      [
        "pending-row-12345678",
        { requested_scopes: ["publish_metadata_only_public_exhibit"] },
        { status: "proposed", public_title: "Pending row should not list" },
      ],
      [
        "wrong-scope-12345678",
        { requested_scopes: ["run_cross_owner_encounter"] },
        { public_title: "Wrong scope row should not list" },
      ],
      [
        "wrong-version-12345678",
        { requested_scopes: ["publish_metadata_only_public_exhibit"], requested_scope_version: 2 },
        { public_title: "Wrong consent version row should not list" },
      ],
      [
        "one-sided-approval-12345678",
        { requested_scopes: ["publish_metadata_only_public_exhibit"] },
        {
          public_title: "One sided approval row should not list",
          counterparty_metadata_approved_at: null,
        },
      ],
      [
        "mismatched-metadata-12345678",
        { requested_scopes: ["publish_metadata_only_public_exhibit"] },
        {
          public_title: "Mismatched metadata row should not list",
          requester_persona_name_snapshot: "Forged requester",
        },
      ],
      [
        "revoked-consent-12345678",
        { requested_scopes: ["publish_metadata_only_public_exhibit"], status: "revoked" },
        { public_title: "Revoked consent row should not list" },
      ],
      [
        "removed-exhibit-12345678",
        { requested_scopes: ["publish_metadata_only_public_exhibit"] },
        {
          public_title: "Removed row should not list",
          removed_at: "2026-07-11T12:30:00.000Z",
          removed_by: "moderator",
        },
      ],
      [
        "retracted-exhibit-12345678",
        { requested_scopes: ["publish_metadata_only_public_exhibit"] },
        {
          public_title: "Retracted row should not list",
          retracted_at: "2026-07-11T12:30:00.000Z",
        },
      ],
      [
        "wrong-schema-12345678",
        { requested_scopes: ["publish_metadata_only_public_exhibit"] },
        {
          public_title: "Wrong schema row should not list",
          provenance_schema: "station.persona_encounter.public_exhibit.v1",
        },
      ],
      [
        "wrong-contract-12345678",
        { requested_scopes: ["publish_metadata_only_public_exhibit"] },
        {
          public_title: "Wrong contract row should not list",
          contract_version: 2,
        },
      ],
    ];

    for (const [slug, consentOverrides, exhibitOverrides] of hiddenFixtures) {
      const consent = seedCrossOwnerConsent(db, consentOverrides);
      seedCrossOwnerPublicExhibit(db, consent, {
        slug,
        published_at: "2026-07-11T13:00:00.000Z",
        ...exhibitOverrides,
      });
    }

    const missingConsent = seedCrossOwnerConsent(db, {
      requested_scopes: ["publish_metadata_only_public_exhibit"],
    });
    seedCrossOwnerPublicExhibit(db, missingConsent, {
      consent_id: "99999999-9999-4999-8999-999999999999",
      slug: "missing-consent-12345678",
      public_title: "Missing consent row should not list",
      published_at: "2026-07-11T13:00:00.000Z",
    });
    seedCrossOwnerPublicExhibit(db, validA, {
      slug: "bad_slug",
      public_title: "Malformed slug row should not list",
      published_at: "2026-07-11T13:00:00.000Z",
    });

    const firstPage = await requestJson(app, "GET", "/persona-encounters/cross-owner-public-exhibits?limit=2");
    assert.equal(firstPage.status, 200);
    assert.equal(firstPage.body.pagination.limit, 2);
    assert.deepEqual(firstPage.body.exhibits.map((exhibit: Row) => exhibit.slug), [
      "shared-zulu-12345678",
      "shared-alpha-12345678",
    ]);
    assert.ok(firstPage.body.pagination.nextCursor);

    const first = firstPage.body.exhibits[0];
    assert.deepEqual(Object.keys(first).sort(), [
      "contractVersion",
      "participants",
      "provenance",
      "publishedAt",
      "report",
      "routeHref",
      "slug",
      "status",
      "summary",
      "tags",
      "title",
    ].sort());
    assert.deepEqual(Object.keys(first.participants).sort(), [
      "counterpartyName",
      "label",
      "requesterName",
    ].sort());
    assert.deepEqual(Object.keys(first.provenance).sort(), [
      "bilateralApproval",
      "crossOwner",
      "discoverable",
      "indexed",
      "label",
      "metadataOnly",
      "ownerCurated",
      "public",
      "routeListed",
    ].sort());
    assert.deepEqual(Object.keys(first.report).sort(), ["path", "requiresSignIn"].sort());
    assert.equal(first.routeHref, "/encounters/cross-owner#shared-zulu-12345678");
    assert.equal(first.report.path, "/persona-encounters/cross-owner-public-exhibits/shared-zulu-12345678/report");
    assert.equal(first.contractVersion, 1);
    assert.equal(first.status, "published");
    assert.equal(first.provenance.routeListed, true);
    assert.equal(first.provenance.indexed, false);
    assert.equal(first.provenance.discoverable, true);
    assert.equal(first.provenance.metadataOnly, true);

    const secondPage = await requestJson(
      app,
      "GET",
      `/persona-encounters/cross-owner-public-exhibits?limit=2&cursor=${encodeURIComponent(firstPage.body.pagination.nextCursor)}`,
    );
    assert.equal(secondPage.status, 200);
    assert.deepEqual(secondPage.body.exhibits.map((exhibit: Row) => exhibit.slug), ["older-exhibit-12345678"]);
    assert.equal(secondPage.body.pagination.nextCursor, null);

    const capped = await requestJson(app, "GET", "/persona-encounters/cross-owner-public-exhibits?limit=999");
    assert.equal(capped.status, 200);
    assert.equal(capped.body.pagination.limit, 24);
    assert.equal(capped.body.exhibits.length, 3);

    const invalidCursor = await requestJson(
      app,
      "GET",
      "/persona-encounters/cross-owner-public-exhibits?cursor=not-a-cursor",
    );
    assert.equal(invalidCursor.status, 400);
    assert.equal(invalidCursor.body.code, "persona_encounter_cross_owner_public_exhibit_cursor_invalid");

    const sameOwnerList = await requestJson(app, "GET", "/persona-encounters/public-exhibits");
    assert.equal(sameOwnerList.status, 200);
    assert.deepEqual(sameOwnerList.body.exhibits, []);

    const detail = await requestJson(app, "GET", crossOwnerPublicExhibitPath("shared-zulu-12345678"));
    assert.equal(detail.status, 200);
    const mismatchDetail = await requestJson(app, "GET", crossOwnerPublicExhibitPath("mismatched-metadata-12345678"));
    assert.equal(mismatchDetail.status, 404);

    const json = JSON.stringify(firstPage.body) + JSON.stringify(secondPage.body) + JSON.stringify(capped.body);
    for (const forbidden of [
      OWNER_ID,
      OTHER_OWNER_ID,
      THIRD_OWNER_ID,
      INITIATOR_ID,
      OTHER_PERSONA_ID,
      THIRD_PERSONA_ID,
      validA.id,
      validB.id,
      validC.id,
      "consent_id",
      "owner_user_id",
      "requester_owner_user_id",
      "counterparty_owner_user_id",
      "requester_persona_id",
      "counterparty_persona_id",
      "reportedCount",
      "reported_count",
      "removed_at",
      "removed_by",
      "created_by",
      "updated_by",
      "Pending row should not list",
      "Wrong scope row should not list",
      "Wrong consent version row should not list",
      "One sided approval row should not list",
      "Mismatched metadata row should not list",
      "Forged requester",
      "Revoked consent row should not list",
      "Removed row should not list",
      "Retracted row should not list",
      "Wrong schema row should not list",
      "Wrong contract row should not list",
      "Missing consent row should not list",
      "Malformed slug row should not list",
      "provider_payload",
      "token fact",
      "Bearer ",
      "test-deepseek-key",
    ]) {
      assert.equal(json.includes(forbidden), false, `${forbidden} leaked in cross-owner public list`);
    }
  });
});

test("owner preview generates one disposable same-owner responder reply without durable encounter rows", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const response = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody({ maxOutputTokens: 120 }),
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.preview.reply.role, "responder");
    assert.equal(response.body.preview.reply.content, "Copper Scribe answers once.");
    assert.equal(response.body.provenance.setup.label, "Owner-authored setup");
    assert.equal(response.body.provenance.setup.stored, false);
    assert.equal(response.body.provenance.personas.label, "Selected same-owner personas");
    assert.equal(response.body.provenance.personas.initiatorName, "Blue Lantern");
    assert.equal(response.body.provenance.personas.responderName, "Copper Scribe");
    assert.equal(response.body.provenance.reply.label, "Model-generated responder reply");
    assert.deepEqual(response.body.provenance.persistence, {
      saved: false,
      transcriptStored: false,
      shareable: false,
      sourceRetrieval: false,
      sourceBuckets: [],
      note: "Disposable preview only; no Memory, Archive, Canon, Continuity, Integrity, or transcript sources were retrieved.",
    });

    assert.equal(providerCalls.length, 1);
    assert.equal(providerCalls[0].url, "https://deepseek.test/chat/completions");
    assert.equal(providerCalls[0].body.max_tokens, 120);
    assert.equal(providerCalls[0].body.messages.some((message: Row) =>
      message.role === "system" &&
      String(message.content).includes("Do not continue the conversation")
    ), true);
    assert.equal(providerCalls[0].body.messages.some((message: Row) =>
      message.role === "user" &&
      String(message.content).includes("Owner-authored setup")
    ), true);

    const transaction = db.rows("token_transactions")[0];
    const providerSystemMessage = providerCalls[0].body.messages.find((message: Row) => message.role === "system");
    const providerUserMessage = providerCalls[0].body.messages.find((message: Row) => message.role === "user");
    const expectedInputTokens = estimateConversationTokens({
      systemPrompt: providerSystemMessage.content,
      userMessage: providerUserMessage.content,
    });
    assert.equal(db.rows("token_transactions").length, 1);
    assert.equal(transaction.user_id, OWNER_ID);
    assert.equal(transaction.chat_id, null);
    assert.equal(transaction.model_used, "deepseek-chat");
    assert.equal(transaction.input_tokens, expectedInputTokens);
    assert.equal(transaction.output_tokens > 0, true);

    assertNoDurableEncounterWrites(db);
    const responseJson = JSON.stringify(response.body);
    assert.equal(responseJson.includes(OWNER_ID), false);
    assert.equal(responseJson.includes(INITIATOR_ID), false);
    assert.equal(responseJson.includes(RESPONDER_ID), false);
    assert.equal(responseJson.includes("owner_user_id"), false);
    assert.equal(responseJson.includes("private persona notes"), false);
  });
});

test("provider readiness reports ready when an accepted private-context route is configured", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const response = await requestJson(app, "GET", readinessPath(), {
      token: "owner-token",
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      ready: true,
      message: "Encounter preview provider is ready.",
    });
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("token_usage").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  });
});

test("provider readiness blocks cross-owner responder before provider resolution", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const response = await requestJson(app, "GET", readinessPath({ responderPersonaId: OTHER_PERSONA_ID }), {
      token: "owner-token",
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.ready, false);
    assert.equal(response.body.code, "persona_encounter_persona_not_owned");
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("token_usage").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  });
});

test("nvidia-only private context stays paused before generation", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    for (const flagValue of [undefined, "", "false", "TRUE", " true "]) {
      configureNvidiaOnlyEnv(flagValue);

      const readiness = await requestJson(app, "GET", readinessPath(), {
        token: "owner-token",
      });

      assert.equal(readiness.status, 200);
      assert.equal(readiness.body.ready, false);
      assert.equal(readiness.body.code, "persona_encounter_provider_unavailable");
      assert.equal(readiness.body.classification, "provider_data_policy");
      assert.equal(
        readiness.body.message,
        "Encounter preview is paused because provider setup is unavailable.",
      );

      const generation = await requestJson(app, "POST", "/persona-encounters/preview", {
        token: "owner-token",
        body: previewBody(),
      });

      assert.equal(generation.status, 503);
      assert.equal(generation.body.code, "persona_encounter_provider_unavailable");
      assert.equal(generation.body.classification, "provider_data_policy");
      const responseJson = JSON.stringify({ readiness: readiness.body, generation: generation.body });
      assert.equal(responseJson.includes("test-nvidia-key"), false);
      assert.equal(responseJson.includes("nvidia.test"), false);
      assert.equal(responseJson.includes("openai/gpt-oss-120b"), false);
    }
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("token_usage").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  });
});

test("nvidia-only private context can be explicitly opted in for owner readiness", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    configureNvidiaOnlyEnv("true");

    const response = await requestJson(app, "GET", readinessPath(), {
      token: "owner-token",
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      ready: true,
      message: "Encounter preview provider is ready.",
    });
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("token_usage").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
    const responseJson = JSON.stringify(response.body);
    assert.equal(responseJson.includes("test-nvidia-key"), false);
    assert.equal(responseJson.includes("nvidia.test"), false);
    assert.equal(responseJson.includes("openai/gpt-oss-120b"), false);
  });
});

test("nvidia-only opt-in generates one disposable same-owner reply without durable rows", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    configureNvidiaOnlyEnv("true");

    const response = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody({ maxOutputTokens: 140 }),
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.preview.reply.role, "responder");
    assert.equal(response.body.preview.reply.content, "Copper Scribe answers once.");
    assert.equal(providerCalls.length, 1);
    assert.equal(providerCalls[0].url, "https://nvidia.test/v1/chat/completions");
    assert.equal(providerCalls[0].body.model, "openai/gpt-oss-120b");
    assert.equal(providerCalls[0].body.max_tokens, 512);

    const transaction = db.rows("token_transactions")[0];
    assert.equal(db.rows("token_transactions").length, 1);
    assert.equal(transaction.user_id, OWNER_ID);
    assert.equal(transaction.chat_id, null);
    assert.equal(transaction.model_used, "openai/gpt-oss-120b");
    assertNoDurableEncounterWrites(db);

    const responseJson = JSON.stringify(response.body);
    assert.equal(responseJson.includes("test-nvidia-key"), false);
    assert.equal(responseJson.includes("nvidia.test"), false);
    assert.equal(responseJson.includes("openai/gpt-oss-120b"), false);
    assert.equal(responseJson.includes("owner_user_id"), false);
    assert.equal(responseJson.includes("private persona notes"), false);
  }, {
    providerModel: "openai/gpt-oss-120b",
  });
});

test("nvidia-only opt-in still blocks cross-owner responder before provider resolution", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    configureNvidiaOnlyEnv("true");

    const response = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody({ responderPersonaId: OTHER_PERSONA_ID }),
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.code, "persona_encounter_persona_not_owned");
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("token_usage").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  });
});

test("owner BYOK route remains accepted without the nvidia encounter opt-in", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    clearProviderEnv();
    process.env.NVIDIA_AI_API_KEY = "test-nvidia-key";
    const profile = db.rows("profiles").find((row) => row.id === OWNER_ID)!;
    profile.ai_mode = "byok";
    profile.byok_openai_key = "test-openai-key";
    const responder = db.rows("personas").find((row) => row.id === RESPONDER_ID)!;
    responder.provider = "openai";

    const readiness = await requestJson(app, "GET", readinessPath(), {
      token: "owner-token",
    });

    assert.deepEqual(readiness.body, {
      ready: true,
      message: "Encounter preview provider is ready.",
    });

    const generation = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody(),
    });

    assert.equal(generation.status, 200);
    assert.equal(providerCalls.length, 1);
    assert.equal(providerCalls[0].url, "https://api.openai.com/v1/chat/completions");
    assert.equal(providerCalls[0].body.model, "gpt-4o-mini");
    assert.equal(db.rows("token_transactions").length, 1);
    assertNoDurableEncounterWrites(db);
  }, {
    providerModel: "gpt-4o-mini",
  });
});

test("cross-owner responder fails before provider call", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const response = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody({ responderPersonaId: OTHER_PERSONA_ID }),
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.code, "persona_encounter_persona_not_owned");
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  });
});

test("missing provider config fails closed before quota, rate limit, or provider call", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    clearProviderEnv();
    const response = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody(),
    });

    assert.equal(response.status, 503);
    assert.equal(response.body.code, "persona_encounter_provider_unavailable");
    assert.equal(response.body.classification, "provider_config");
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("token_usage").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  });
});

test("quota exhaustion fails closed before provider call", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    db.insertRow("token_usage", {
      user_id: OWNER_ID,
      period_start: "2026-06-01",
      tokens_used: 750_000,
      tokens_limit: 750_000,
      topup_tokens: 0,
    });

    const response = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody(),
    });

    assert.equal(response.status, 402);
    assert.equal(response.body.code, "persona_encounter_quota_exceeded");
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  });
});

test("disabled encounter rate-limit cache fails closed before provider call", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const response = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody(),
    });

    assert.equal(response.status, 503);
    assert.equal(response.body.code, "persona_encounter_rate_limit_unavailable");
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  }, {
    rateLimitProvider: new DisabledOperationalCacheProvider("missing_config"),
  });
});

test("provider failure is bounded and is not retried", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const response = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody(),
    });

    assert.equal(response.status, 502);
    assert.equal(response.body.code, "persona_encounter_provider_failed");
    assert.equal(providerCalls.length, 1);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  }, {
    providerStatus: 429,
  });
});

test("empty provider reply fails bounded without recording successful token usage", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const response = await requestJson(app, "POST", "/persona-encounters/preview", {
      token: "owner-token",
      body: previewBody(),
    });

    assert.equal(response.status, 502);
    assert.equal(response.body.code, "persona_encounter_provider_empty_reply");
    assert.equal(providerCalls.length, 1);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);

    const responseJson = JSON.stringify(response.body);
    assert.equal(responseJson.includes("test-deepseek-key"), false);
    assert.equal(responseJson.includes("deepseek.test"), false);
    assert.equal(responseJson.includes("owner_user_id"), false);
    assert.equal(responseJson.includes("private persona notes"), false);
  }, {
    providerContent: "  \n\t  ",
  });
});

test("private encounter session routes require authentication", async () => {
  await withHarness(async ({ app, providerCalls }) => {
    const sessionId = "66666666-6666-4666-8666-666666666666";
    const create = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      body: privateSessionBody(),
    });
    const list = await requestJson(app, "GET", "/persona-encounters/private-sessions");
    const detail = await requestJson(app, "GET", `/persona-encounters/private-sessions/${sessionId}`);
    const curation = await requestJson(app, "PATCH", `/persona-encounters/private-sessions/${sessionId}/curation`, {
      body: { title: "Private title" },
    });
    const deletion = await requestJson(app, "DELETE", `/persona-encounters/private-sessions/${sessionId}`);

    assert.equal(create.status, 401);
    assert.equal(list.status, 401);
    assert.equal(detail.status, 401);
    assert.equal(curation.status, 401);
    assert.equal(deletion.status, 401);
    assert.equal(providerCalls.length, 0);
  });
});

test("owner can create list detail and delete a private encounter session without leaking raw ids", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const create = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: privateSessionBody({ maxOutputTokens: 120 }),
    });

    assert.equal(create.status, 201);
    assert.equal(create.body.session.setup.label, "Owner-authored setup");
    assert.equal(create.body.session.setup.stored, true);
    assert.equal(create.body.session.setup.content, "The owner places both personas in a quiet library and asks for one reply.");
    assert.equal(create.body.session.personas.label, "Selected same-owner personas");
    assert.equal(create.body.session.personas.initiatorName, "Blue Lantern");
    assert.equal(create.body.session.personas.responderName, "Copper Scribe");
    assert.equal(create.body.session.reply.label, "Model-generated responder reply");
    assert.equal(create.body.session.reply.role, "responder");
    assert.equal(create.body.session.reply.content, "Copper Scribe answers once.");
    assert.deepEqual(create.body.session.provenance.artifact, {
      label: "Private owner-only artifact",
      private: true,
      ownerOnly: true,
      serverCreated: true,
    });
    assert.deepEqual(create.body.session.provenance.persistence, {
      saved: true,
      transcriptStored: false,
      shareable: false,
      public: false,
      sourceRetrieval: false,
      sourceBuckets: [],
      note: "Private saved encounter artifact; no Memory, Archive, Canon, Continuity, Integrity, or transcript sources were retrieved.",
    });

    assert.equal(providerCalls.length, 1);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 1);
    assert.equal(db.rows("token_transactions").length, 1);
    assert.equal(db.rows("token_transactions")[0].chat_id, null);
    assertNoDurableEncounterWritesExceptPrivateSessions(db);

    const stored = db.rows("persona_encounter_private_sessions")[0];
    assert.equal(stored.owner_user_id, OWNER_ID);
    assert.equal(stored.initiator_persona_id, INITIATOR_ID);
    assert.equal(stored.responder_persona_id, RESPONDER_ID);
    assert.equal(stored.owner_setup, "The owner places both personas in a quiet library and asks for one reply.");
    assert.equal(stored.responder_reply, "Copper Scribe answers once.");
    assert.equal(stored.provenance_schema, "station.persona_encounter.private_session.v1");
    assert.equal(stored.source_retrieval_used, false);
    assert.equal(stored.shareable, false);
    assert.equal(stored.public_visibility, "private");
    assert.equal(stored.owner_title, null);
    assert.equal(stored.owner_summary, null);
    assert.deepEqual(stored.owner_tags, []);
    assert.equal(stored.publication_candidate, false);
    assert.equal(stored.curation_schema, "station.persona_encounter.private_session_curation.v1");
    assert.deepEqual(create.body.session.curation, {
      label: "Owner-authored private curation",
      title: null,
      summary: null,
      tags: [],
      publicationCandidate: false,
      schema: "station.persona_encounter.private_session_curation.v1",
      note: "Private planning metadata only; not a public exhibit, share link, moderation state, or cross-owner consent.",
    });

    const createJson = JSON.stringify(create.body);
    for (const hidden of [
      OWNER_ID,
      INITIATOR_ID,
      RESPONDER_ID,
      "owner_user_id",
      "initiator_persona_id",
      "responder_persona_id",
      "test-deepseek-key",
      "deepseek.test",
      "deepseek-chat",
      "private persona notes",
    ]) {
      assert.equal(createJson.includes(hidden), false, `${hidden} leaked in create readback`);
    }

    const list = await requestJson(app, "GET", "/persona-encounters/private-sessions", {
      token: "owner-token",
    });
    assert.equal(list.status, 200);
    assert.equal(list.body.sessions.length, 1);
    assert.equal(list.body.sessions[0].id, create.body.session.id);
    assert.equal(list.body.sessions[0].reply.content, "Copper Scribe answers once.");

    const detail = await requestJson(app, "GET", `/persona-encounters/private-sessions/${create.body.session.id}`, {
      token: "owner-token",
    });
    assert.equal(detail.status, 200);
    assert.equal(detail.body.session.id, create.body.session.id);
    assert.equal(detail.body.session.setup.content, create.body.session.setup.content);

    const crossOwnerDetail = await requestJson(app, "GET", `/persona-encounters/private-sessions/${create.body.session.id}`, {
      token: "other-token",
    });
    assert.equal(crossOwnerDetail.status, 404);

    const crossOwnerDelete = await requestJson(app, "DELETE", `/persona-encounters/private-sessions/${create.body.session.id}`, {
      token: "other-token",
    });
    assert.equal(crossOwnerDelete.status, 404);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 1);

    const deletion = await requestJson(app, "DELETE", `/persona-encounters/private-sessions/${create.body.session.id}`, {
      token: "owner-token",
    });
    assert.equal(deletion.status, 200);
    assert.deepEqual(deletion.body, {
      deleted: true,
      session: {
        id: create.body.session.id,
      },
    });
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);

    const afterDelete = await requestJson(app, "GET", `/persona-encounters/private-sessions/${create.body.session.id}`, {
      token: "owner-token",
    });
    assert.equal(afterDelete.status, 404);
  });
});

test("owner can add edit and clear bounded private curation metadata only on own sessions", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const create = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: privateSessionBody({ maxOutputTokens: 120 }),
    });
    assert.equal(create.status, 201);
    assert.equal(providerCalls.length, 1);
    assert.equal(db.rows("token_transactions").length, 1);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 1);

    const sessionId = create.body.session.id;
    const update = await requestJson(app, "PATCH", `/persona-encounters/private-sessions/${sessionId}/curation`, {
      token: "owner-token",
      body: {
        title: "  Library draft  ",
        summary: "  Save this for later shape work.  ",
        tags: ["  quiet ", "candidate"],
        publicationCandidate: true,
      },
    });

    assert.equal(update.status, 200);
    assert.equal(update.body.session.id, sessionId);
    assert.deepEqual(update.body.session.curation, {
      label: "Owner-authored private curation",
      title: "Library draft",
      summary: "Save this for later shape work.",
      tags: ["quiet", "candidate"],
      publicationCandidate: true,
      schema: "station.persona_encounter.private_session_curation.v1",
      note: "Private planning metadata only; not a public exhibit, share link, moderation state, or cross-owner consent.",
    });

    const stored = db.rows("persona_encounter_private_sessions")[0];
    assert.equal(stored.owner_title, "Library draft");
    assert.equal(stored.owner_summary, "Save this for later shape work.");
    assert.deepEqual(stored.owner_tags, ["quiet", "candidate"]);
    assert.equal(stored.publication_candidate, true);
    assert.equal(stored.curation_schema, "station.persona_encounter.private_session_curation.v1");

    const list = await requestJson(app, "GET", "/persona-encounters/private-sessions", {
      token: "owner-token",
    });
    assert.equal(list.status, 200);
    assert.deepEqual(list.body.sessions[0].curation.tags, ["quiet", "candidate"]);
    assert.equal(list.body.sessions[0].curation.publicationCandidate, true);

    const detail = await requestJson(app, "GET", `/persona-encounters/private-sessions/${sessionId}`, {
      token: "owner-token",
    });
    assert.equal(detail.status, 200);
    assert.equal(detail.body.session.curation.title, "Library draft");

    const crossOwner = await requestJson(app, "PATCH", `/persona-encounters/private-sessions/${sessionId}/curation`, {
      token: "other-token",
      body: { title: "Cross owner edit" },
    });
    assert.equal(crossOwner.status, 404);
    assert.equal(db.rows("persona_encounter_private_sessions")[0].owner_title, "Library draft");

    const clear = await requestJson(app, "PATCH", `/persona-encounters/private-sessions/${sessionId}/curation`, {
      token: "owner-token",
      body: {
        title: null,
        summary: "",
        tags: [],
        publicationCandidate: false,
      },
    });
    assert.equal(clear.status, 200);
    assert.deepEqual(clear.body.session.curation, {
      label: "Owner-authored private curation",
      title: null,
      summary: null,
      tags: [],
      publicationCandidate: false,
      schema: "station.persona_encounter.private_session_curation.v1",
      note: "Private planning metadata only; not a public exhibit, share link, moderation state, or cross-owner consent.",
    });

    const clearJson = JSON.stringify(clear.body);
    for (const hidden of [
      OWNER_ID,
      INITIATOR_ID,
      RESPONDER_ID,
      "owner_user_id",
      "initiator_persona_id",
      "responder_persona_id",
      "deepseek.test",
      "test-deepseek-key",
      "private persona notes",
    ]) {
      assert.equal(clearJson.includes(hidden), false, `${hidden} leaked in curation readback`);
    }

    assert.equal(providerCalls.length, 1);
    assert.equal(db.rows("token_transactions").length, 1);
    assertNoDurableEncounterWritesExceptPrivateSessions(db);

    const deletion = await requestJson(app, "DELETE", `/persona-encounters/private-sessions/${sessionId}`, {
      token: "owner-token",
    });
    assert.equal(deletion.status, 200);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);

    const afterDelete = await requestJson(app, "GET", `/persona-encounters/private-sessions/${sessionId}`, {
      token: "owner-token",
    });
    assert.equal(afterDelete.status, 404);
  });
});

test("private curation metadata rejects malformed bodies before writes", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const create = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: privateSessionBody({ maxOutputTokens: 120 }),
    });
    assert.equal(create.status, 201);
    const sessionId = create.body.session.id;

    const cases: unknown[] = [
      {},
      { title: "x".repeat(121) },
      { summary: "x".repeat(801) },
      { tags: ["ok", "x".repeat(41)] },
      { tags: Array.from({ length: 13 }, (_, index) => `tag-${index}`) },
      { tags: "not-an-array" },
      { tags: [""] },
      { publicationCandidate: "yes" },
      { title: "Allowed", shareable: true },
      { responderReply: "Client-certified reply must stay rejected." },
    ];

    for (const body of cases) {
      const response = await requestJson(app, "PATCH", `/persona-encounters/private-sessions/${sessionId}/curation`, {
        token: "owner-token",
        body,
      });
      assert.equal(response.status, 400, `body should fail: ${JSON.stringify(body)}`);
    }

    const stored = db.rows("persona_encounter_private_sessions")[0];
    assert.equal(stored.owner_title, null);
    assert.equal(stored.owner_summary, null);
    assert.deepEqual(stored.owner_tags, []);
    assert.equal(stored.publication_candidate, false);
    assert.equal(stored.shareable, false);
    assert.equal(stored.public_visibility, "private");
    assert.equal(providerCalls.length, 1);
    assert.equal(db.rows("token_transactions").length, 1);
    assertNoDurableEncounterWritesExceptPrivateSessions(db);
  });
});

test("owner can publish report and retract metadata-only public encounter exhibits", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const create = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: privateSessionBody({ maxOutputTokens: 120 }),
    });
    assert.equal(create.status, 201);
    const sessionId = create.body.session.id;

    const curation = await requestJson(app, "PATCH", `/persona-encounters/private-sessions/${sessionId}/curation`, {
      token: "owner-token",
      body: {
        title: "Private title must not publish",
        summary: "Private curation note must stay private.",
        tags: ["private-tag"],
        publicationCandidate: true,
      },
    });
    assert.equal(curation.status, 200);

    const publish = await requestJson(app, "POST", `/persona-encounters/private-sessions/${sessionId}/public-exhibit`, {
      token: "owner-token",
      body: {
        confirmPublicExhibit: true,
        title: "Public metadata title",
        summary: "Owner-authored public context only.",
        tags: ["public", "metadata"],
      },
    });

    assert.equal(publish.status, 201);
    assert.equal(publish.body.exhibit.status, "published");
    assert.match(publish.body.exhibit.slug, /^public-metadata-title-[a-z0-9]{8}$/);
    assert.equal(publish.body.exhibit.routeHref, `/encounters/${publish.body.exhibit.slug}`);
    assert.equal(publish.body.session.publicExhibit.slug, publish.body.exhibit.slug);
    assert.deepEqual(publish.body.exhibit.tags, ["public", "metadata"]);
    assert.equal(db.rows("persona_encounter_public_exhibits").length, 1);

    const publicRead = await requestJson(app, "GET", `/persona-encounters/public-exhibits/${publish.body.exhibit.slug}`);
    assert.equal(publicRead.status, 200);
    assert.deepEqual(publicRead.body.exhibit.personas, {
      label: "Same-owner persona display snapshots",
      initiatorName: "Blue Lantern",
      responderName: "Copper Scribe",
    });
    assert.equal(publicRead.body.exhibit.title, "Public metadata title");
    assert.equal(publicRead.body.exhibit.summary, "Owner-authored public context only.");
    assert.equal(publicRead.body.exhibit.report.path, `/persona-encounters/public-exhibits/${publish.body.exhibit.slug}/report`);

    const listBeforeRetract = await requestJson(app, "GET", "/persona-encounters/public-exhibits?limit=2");
    assert.equal(listBeforeRetract.status, 200);
    assert.deepEqual(listBeforeRetract.body.exhibits.map((exhibit: Row) => exhibit.slug), [publish.body.exhibit.slug]);
    assert.equal(listBeforeRetract.body.exhibits[0].routeHref, `/encounters/${publish.body.exhibit.slug}`);
    assert.equal(JSON.stringify(listBeforeRetract.body).includes("reportedCount"), false);
    assert.equal(JSON.stringify(listBeforeRetract.body).includes("report"), false);

    const publicJson = JSON.stringify(publicRead.body);
    for (const forbidden of [
      OWNER_ID,
      INITIATOR_ID,
      RESPONDER_ID,
      sessionId,
      "The owner places both personas in a quiet library",
      "Copper Scribe answers once.",
      "Private title must not publish",
      "Private curation note must stay private.",
      "private-tag",
      "deepseek.test",
      "test-deepseek-key",
      "private persona notes",
      "owner_user_id",
      "private_session_id",
    ]) {
      assert.equal(publicJson.includes(forbidden), false, `${forbidden} leaked in public exhibit`);
    }

    const report = await requestJson(app, "POST", `/persona-encounters/public-exhibits/${publish.body.exhibit.slug}/report`, {
      token: "other-token",
      body: {
        reason: "unsafe_public_metadata",
        notes: "The public metadata needs review.",
      },
    });
    assert.equal(report.status, 201);
    assert.deepEqual(report.body, {
      report: { status: "open" },
      duplicate: false,
    });
    const storedExhibit = db.rows("persona_encounter_public_exhibits")[0];
    assert.equal(db.rows("moderation_reports").length, 1);
    assert.equal(db.rows("moderation_reports")[0].target_type, "persona_encounter_public_exhibit");
    assert.equal(db.rows("moderation_reports")[0].target_id, storedExhibit.id);
    assert.notEqual(db.rows("moderation_reports")[0].target_id, publish.body.exhibit.slug);
    assert.equal(db.rows("persona_encounter_public_exhibits")[0].reported_count, 1);

    const duplicateReport = await requestJson(app, "POST", `/persona-encounters/public-exhibits/${publish.body.exhibit.slug}/report`, {
      token: "other-token",
      body: { reason: "unsafe_public_metadata" },
    });
    assert.equal(duplicateReport.status, 200);
    assert.equal(duplicateReport.body.duplicate, true);
    assert.equal(db.rows("moderation_reports").length, 1);

    const retract = await requestJson(app, "PATCH", `/persona-encounters/public-exhibits/${publish.body.exhibit.slug}/retract`, {
      token: "owner-token",
      body: { ignored: "extra body is ignored by retract route" },
    });
    assert.equal(retract.status, 200);
    assert.equal(retract.body.exhibit.status, "retracted");
    assert.equal(retract.body.session.id, sessionId);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 1);
    assert.equal(db.rows("persona_encounter_private_sessions")[0].shareable, false);
    assert.equal(db.rows("persona_encounter_private_sessions")[0].public_visibility, "private");

    const hiddenAfterRetract = await requestJson(app, "GET", `/persona-encounters/public-exhibits/${publish.body.exhibit.slug}`);
    assert.equal(hiddenAfterRetract.status, 404);
    const listAfterRetract = await requestJson(app, "GET", "/persona-encounters/public-exhibits");
    assert.equal(listAfterRetract.status, 200);
    assert.deepEqual(listAfterRetract.body.exhibits, []);

    assert.equal(providerCalls.length, 1);
    assert.equal(db.rows("token_transactions").length, 1);
    assert.equal(db.rows("conversations").length, 0);
    assert.equal(db.rows("conversation_messages").length, 0);
    assert.equal(db.rows("documents").length, 0);
    assert.equal(db.rows("threads").length, 0);
    assert.equal(db.rows("comments").length, 0);
    assert.equal(db.rows("background_jobs").length, 0);
  });
});

test("public exhibit publish rejects missing candidate cross-owner and forbidden bodies before writes", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    const create = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: privateSessionBody({ maxOutputTokens: 120 }),
    });
    assert.equal(create.status, 201);
    const sessionId = create.body.session.id;

    const anonymousPublish = await requestJson(app, "POST", `/persona-encounters/private-sessions/${sessionId}/public-exhibit`, {
      body: {
        confirmPublicExhibit: true,
        title: "Public title",
        summary: "Public summary.",
      },
    });
    assert.equal(anonymousPublish.status, 401);

    const nonCandidate = await requestJson(app, "POST", `/persona-encounters/private-sessions/${sessionId}/public-exhibit`, {
      token: "owner-token",
      body: {
        confirmPublicExhibit: true,
        title: "Public title",
        summary: "Public summary.",
      },
    });
    assert.equal(nonCandidate.status, 400);
    assert.equal(nonCandidate.body.code, "persona_encounter_public_exhibit_candidate_required");

    db.rows("persona_encounter_private_sessions")[0].publication_candidate = true;

    const invalidBodies: unknown[] = [
      { title: "Missing confirmation", summary: "Public summary." },
      { confirmPublicExhibit: false, title: "Public title", summary: "Public summary." },
      { confirmPublicExhibit: true, title: "", summary: "Public summary." },
      { confirmPublicExhibit: true, title: "x".repeat(141), summary: "Public summary." },
      { confirmPublicExhibit: true, title: "Public title", summary: "x".repeat(1001) },
      { confirmPublicExhibit: true, title: "Public title", summary: "Public summary.", tags: ["x".repeat(41)] },
      { confirmPublicExhibit: true, title: "Public title", summary: "Public summary.", tags: Array.from({ length: 13 }, (_, index) => `tag-${index}`) },
      { confirmPublicExhibit: true, title: "Public title", summary: "Public summary.", setup: "private setup" },
      { confirmPublicExhibit: true, title: "Public title", summary: "Public summary.", reply: "raw reply" },
      { confirmPublicExhibit: true, title: "Public title", summary: "Public summary.", excerpt: "selected words" },
      { confirmPublicExhibit: true, title: "Public title", summary: "Public summary.", ownerTitle: "private curation" },
      { confirmPublicExhibit: true, title: "Public title", summary: "Public summary.", provider: "deepseek" },
      { confirmPublicExhibit: true, title: "Public title", summary: "Public summary.", ownerUserId: OWNER_ID },
      { confirmPublicExhibit: true, title: "Public title", summary: "Public summary.", shareLink: true },
    ];

    for (const body of invalidBodies) {
      const response = await requestJson(app, "POST", `/persona-encounters/private-sessions/${sessionId}/public-exhibit`, {
        token: "owner-token",
        body,
      });
      assert.equal(response.status, 400, `body should fail: ${JSON.stringify(body)}`);
    }

    const crossOwner = await requestJson(app, "POST", `/persona-encounters/private-sessions/${sessionId}/public-exhibit`, {
      token: "other-token",
      body: {
        confirmPublicExhibit: true,
        title: "Public title",
        summary: "Public summary.",
      },
    });
    assert.equal(crossOwner.status, 404);

    db.rows("personas").find((row) => row.id === RESPONDER_ID)!.owner_user_id = OTHER_OWNER_ID;
    const noLongerSameOwner = await requestJson(app, "POST", `/persona-encounters/private-sessions/${sessionId}/public-exhibit`, {
      token: "owner-token",
      body: {
        confirmPublicExhibit: true,
        title: "Public title",
        summary: "Public summary.",
      },
    });
    assert.equal(noLongerSameOwner.status, 403);
    assert.equal(noLongerSameOwner.body.code, "persona_encounter_public_exhibit_same_owner_required");

    assert.equal(db.rows("persona_encounter_public_exhibits").length, 0);
    assert.equal(providerCalls.length, 1);
    assert.equal(db.rows("token_transactions").length, 1);
    assert.equal(db.rows("moderation_reports").length, 0);
  });
});

test("public exhibit route hides missing retracted removed and malformed slugs", async () => {
  await withHarness(async ({ db, app }) => {
    const published = db.insertRow("persona_encounter_public_exhibits", {
      owner_user_id: OWNER_ID,
      private_session_id: "66666666-6666-4666-8666-000000000001",
      slug: "published-exhibit-12345678",
      public_title: "Published exhibit",
      public_summary: "Safe public metadata.",
      public_tags: [],
      initiator_name_snapshot: "Blue Lantern",
      responder_name_snapshot: "Copper Scribe",
      status: "published",
    });
    db.insertRow("persona_encounter_public_exhibits", {
      ...published,
      id: undefined,
      slug: "retracted-exhibit-12345678",
      status: "retracted",
      retracted_at: "2026-06-29T10:00:00.000Z",
    });
    db.insertRow("persona_encounter_public_exhibits", {
      ...published,
      id: undefined,
      slug: "removed-exhibit-12345678",
      status: "removed",
      removed_at: "2026-06-29T11:00:00.000Z",
    });

    const ok = await requestJson(app, "GET", "/persona-encounters/public-exhibits/published-exhibit-12345678");
    assert.equal(ok.status, 200);
    assert.equal(ok.body.exhibit.slug, "published-exhibit-12345678");
    assert.equal(ok.body.exhibit.status, "published");

    const signedOutReport = await requestJson(app, "POST", "/persona-encounters/public-exhibits/published-exhibit-12345678/report", {
      body: { reason: "unsafe_public_metadata" },
    });
    assert.equal(signedOutReport.status, 401);

    for (const slug of [
      "retracted-exhibit-12345678",
      "removed-exhibit-12345678",
      "missing-exhibit-12345678",
      "550e8400-e29b-41d4-a716-446655440000",
    ]) {
      const response = await requestJson(app, "GET", `/persona-encounters/public-exhibits/${slug}`);
      assert.equal(response.status, 404, `${slug} should be hidden`);

      const report = await requestJson(app, "POST", `/persona-encounters/public-exhibits/${slug}/report`, {
        token: "other-token",
        body: { reason: "unsafe_public_metadata" },
      });
      assert.equal(report.status, 404, `${slug} report should be hidden`);
    }
  });
});

test("public exhibit list is bounded ordered cursorable and metadata-only", async () => {
  await withHarness(async ({ db, app }) => {
    const createSource = (id: string, ownerSetup: string, responderReply: string) => db.insertRow(
      "persona_encounter_private_sessions",
      {
        id,
        owner_user_id: OWNER_ID,
        initiator_persona_id: INITIATOR_ID,
        responder_persona_id: RESPONDER_ID,
        owner_setup: ownerSetup,
        responder_reply: responderReply,
        initiator_name_snapshot: "Blue Lantern",
        responder_name_snapshot: "Copper Scribe",
      },
    );
    const sourceA = createSource(
      "66666666-6666-4666-8666-000000000101",
      "Private setup A should not list.",
      "Generated private reply A should not list.",
    );
    const sourceB = createSource(
      "66666666-6666-4666-8666-000000000102",
      "Private setup B should not list.",
      "Generated private reply B should not list.",
    );
    const sourceC = createSource(
      "66666666-6666-4666-8666-000000000103",
      "Private setup C should not list.",
      "Generated private reply C should not list.",
    );

    const publicBase = {
      owner_user_id: OWNER_ID,
      public_summary: "Owner-authored public metadata only.",
      public_tags: ["public", "metadata"],
      initiator_name_snapshot: "Blue Lantern",
      responder_name_snapshot: "Copper Scribe",
      status: "published",
      provenance_schema: "station.persona_encounter.public_exhibit.v1",
    };

    db.insertRow("persona_encounter_public_exhibits", {
      ...publicBase,
      private_session_id: sourceA.id,
      slug: "shared-alpha-12345678",
      public_title: "Shared alpha",
      published_at: "2026-07-10T12:00:00.000Z",
      reported_count: 9,
    });
    db.insertRow("persona_encounter_public_exhibits", {
      ...publicBase,
      private_session_id: sourceB.id,
      slug: "shared-zulu-12345678",
      public_title: "Shared zulu",
      published_at: "2026-07-10T12:00:00.000Z",
    });
    db.insertRow("persona_encounter_public_exhibits", {
      ...publicBase,
      private_session_id: sourceC.id,
      slug: "older-exhibit-12345678",
      public_title: "Older exhibit",
      published_at: "2026-07-09T12:00:00.000Z",
    });
    db.insertRow("persona_encounter_public_exhibits", {
      ...publicBase,
      private_session_id: sourceC.id,
      slug: "retracted-secret-12345678",
      public_title: "Cross Owner Secret Retracted",
      public_summary: "Cross Owner Secret should not list.",
      status: "retracted",
      retracted_at: "2026-07-10T13:00:00.000Z",
      published_at: "2026-07-11T12:00:00.000Z",
    });
    db.insertRow("persona_encounter_public_exhibits", {
      ...publicBase,
      private_session_id: sourceC.id,
      slug: "removed-secret-12345678",
      public_title: "Removed secret",
      public_summary: "Removed public metadata should not list.",
      status: "removed",
      removed_at: "2026-07-10T13:00:00.000Z",
      published_at: "2026-07-11T11:00:00.000Z",
    });
    db.insertRow("persona_encounter_public_exhibits", {
      ...publicBase,
      private_session_id: "66666666-6666-4666-8666-000000000999",
      slug: "deleted-source-12345678",
      public_title: "Deleted source",
      public_summary: "Deleted source public metadata should not list.",
      published_at: "2026-07-11T10:00:00.000Z",
    });
    db.insertRow("persona_encounter_public_exhibits", {
      ...publicBase,
      private_session_id: sourceC.id,
      slug: "bad_slug",
      public_title: "Malformed slug",
      public_summary: "Malformed row should not list.",
      published_at: "2026-07-11T09:00:00.000Z",
    });
    db.insertRow("persona_encounter_public_exhibits", {
      ...publicBase,
      private_session_id: sourceC.id,
      slug: "wrong-schema-12345678",
      public_title: "Wrong schema",
      public_summary: "Wrong schema row should not list.",
      provenance_schema: "station.persona_encounter.private_session.v1",
      published_at: "2026-07-11T08:00:00.000Z",
    });

    const firstPage = await requestJson(app, "GET", "/persona-encounters/public-exhibits?limit=2");
    assert.equal(firstPage.status, 200);
    assert.equal(firstPage.body.pagination.limit, 2);
    assert.deepEqual(firstPage.body.exhibits.map((exhibit: Row) => exhibit.slug), [
      "shared-zulu-12345678",
      "shared-alpha-12345678",
    ]);
    assert.ok(firstPage.body.pagination.nextCursor);

    const secondPage = await requestJson(
      app,
      "GET",
      `/persona-encounters/public-exhibits?limit=2&cursor=${encodeURIComponent(firstPage.body.pagination.nextCursor)}`,
    );
    assert.equal(secondPage.status, 200);
    assert.deepEqual(secondPage.body.exhibits.map((exhibit: Row) => exhibit.slug), ["older-exhibit-12345678"]);
    assert.equal(secondPage.body.pagination.nextCursor, null);

    const capped = await requestJson(app, "GET", "/persona-encounters/public-exhibits?limit=999");
    assert.equal(capped.status, 200);
    assert.equal(capped.body.pagination.limit, 24);
    assert.equal(capped.body.exhibits.length, 3);

    const invalidCursor = await requestJson(app, "GET", "/persona-encounters/public-exhibits?cursor=not-a-cursor");
    assert.equal(invalidCursor.status, 400);
    assert.equal(invalidCursor.body.code, "persona_encounter_public_exhibit_cursor_invalid");

    const json = JSON.stringify(firstPage.body) + JSON.stringify(secondPage.body) + JSON.stringify(capped.body);
    for (const forbidden of [
      OWNER_ID,
      INITIATOR_ID,
      RESPONDER_ID,
      sourceA.id,
      sourceB.id,
      sourceC.id,
      "owner_user_id",
      "private_session_id",
      "initiator_persona_id",
      "responder_persona_id",
      "reportedCount",
      "reported_count",
      "removed_at",
      "removed_by",
      "report",
      "Private setup",
      "Generated private reply",
      "Cross Owner Secret",
      "Removed public metadata should not list",
      "Deleted source public metadata should not list",
      "Malformed row should not list",
      "Wrong schema row should not list",
    ]) {
      assert.equal(json.includes(forbidden), false, `${forbidden} leaked in public list`);
    }

    for (const exhibit of firstPage.body.exhibits) {
      assert.match(exhibit.routeHref, /^\/encounters\/[a-z0-9-]+-[a-z0-9]{8}$/);
      assert.equal(exhibit.status, "published");
      assert.equal(exhibit.provenance.public, true);
      assert.equal(exhibit.provenance.sameOwner, true);
    }
  });
});

test("private encounter session create rejects client-certified replies and cross-owner personas before side effects", async () => {
  const rateLimitProvider = new TestRateLimitProvider();
  await withHarness(async ({ db, app, providerCalls }) => {
    const extraKey = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: {
        ...privateSessionBody(),
        responderReply: "Client-supplied reply must not be certified.",
      },
    });
    assert.equal(extraKey.status, 400);

    const crossOwner = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: privateSessionBody({ responderPersonaId: OTHER_PERSONA_ID }),
    });
    assert.equal(crossOwner.status, 403);
    assert.equal(crossOwner.body.code, "persona_encounter_persona_not_owned");

    assert.equal(providerCalls.length, 0);
    assert.equal(rateLimitProvider.keys.length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);
    assertNoDurableEncounterWrites(db);
  }, {
    rateLimitProvider,
  });
});

test("private encounter session provider setup quota rate and empty reply failures insert no session", async () => {
  await withHarness(async ({ db, app, providerCalls }) => {
    clearProviderEnv();
    const response = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: privateSessionBody(),
    });

    assert.equal(response.status, 503);
    assert.equal(response.body.code, "persona_encounter_provider_unavailable");
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  });

  await withHarness(async ({ db, app, providerCalls }) => {
    db.insertRow("token_usage", {
      user_id: OWNER_ID,
      period_start: "2026-06-01",
      tokens_used: 750_000,
      tokens_limit: 750_000,
      topup_tokens: 0,
    });
    const response = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: privateSessionBody(),
    });

    assert.equal(response.status, 402);
    assert.equal(response.body.code, "persona_encounter_quota_exceeded");
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  });

  await withHarness(async ({ db, app, providerCalls }) => {
    const response = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: privateSessionBody(),
    });

    assert.equal(response.status, 503);
    assert.equal(response.body.code, "persona_encounter_rate_limit_unavailable");
    assert.equal(providerCalls.length, 0);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  }, {
    rateLimitProvider: new DisabledOperationalCacheProvider("missing_config"),
  });

  await withHarness(async ({ db, app, providerCalls }) => {
    const response = await requestJson(app, "POST", "/persona-encounters/private-sessions", {
      token: "owner-token",
      body: privateSessionBody(),
    });

    assert.equal(response.status, 502);
    assert.equal(response.body.code, "persona_encounter_provider_empty_reply");
    assert.equal(providerCalls.length, 1);
    assert.equal(db.rows("persona_encounter_private_sessions").length, 0);
    assert.equal(db.rows("token_transactions").length, 0);
    assertNoDurableEncounterWrites(db);
  }, {
    providerContent: "  \n  ",
  });
});
