import assert from "node:assert/strict";
import test from "node:test";
import {
  authorizeCloudflareMemoryCandidates,
  buildCloudflareMemoryMirrorPayload,
  cloudflareRetrievalConfigFromEnv,
  cloudflareRetrievalStatus,
  createCloudflareRetrievalAdapter,
} from "../src/retrieval/cloudflare-adapter";

test("Cloudflare retrieval adapter stays disabled-safe without explicit config", async () => {
  const config = cloudflareRetrievalConfigFromEnv({});
  const status = cloudflareRetrievalStatus(config);
  const adapter = createCloudflareRetrievalAdapter(config);
  const result = await adapter.searchCandidateIds({
    query: "private archive query",
    ownerUserId: "owner-a",
    personaId: "persona-a",
  });

  assert.equal(status.enabled, false);
  assert.equal(status.disabledReason, "not_enabled");
  assert.deepEqual(adapter.status(), status);
  assert.equal(result.status.enabled, false);
  assert.deepEqual(result.candidates, []);
});

test("Cloudflare mirror payloads keep IDs and minimal metadata only", () => {
  const payload = buildCloudflareMemoryMirrorPayload({
    id: "memory-a",
    owner_user_id: "owner-a",
    persona_id: "persona-a",
    source_type: "import",
    archive_source_type: "import_job",
    embedding_provider: "openai",
    embedding_model: "text-embedding-3-small",
    embedding_dimension: 1536,
    embedding_index_name: "memory_items_embedding_1536",
    embedding_backfill_version: 1,
    updated_at: "2026-06-09T09:00:00.000Z",
    title: "Private title must not mirror",
    content: "Private snippet must not mirror",
    summary: "Private summary must not mirror",
    archive_source_name: "private-source.txt",
  } as any);

  assert.deepEqual(payload, {
    id: "memory-a",
    recordType: "memory_item",
    ownerUserId: "owner-a",
    personaId: "persona-a",
    sourceType: "import",
    archiveSourceType: "import_job",
    embedding: {
      provider: "openai",
      model: "text-embedding-3-small",
      dimension: 1536,
      indexName: "memory_items_embedding_1536",
      backfillVersion: 1,
    },
    updatedAt: "2026-06-09T09:00:00.000Z",
  });

  const serialized = JSON.stringify(payload);
  assert.doesNotMatch(serialized, /Private snippet/);
  assert.doesNotMatch(serialized, /Private summary/);
  assert.doesNotMatch(serialized, /Private title/);
  assert.doesNotMatch(serialized, /private-source/);
});

test("Cloudflare candidate IDs are reauthorized through Station before private records return", async () => {
  const supabase = new MemorySupabase([
    {
      id: "memory-owner",
      owner_user_id: "owner-a",
      persona_id: "persona-a",
      title: "Owner private memory",
      content: "Canonical private content returned only after Station auth.",
      summary: "Canonical summary",
      source_type: "manual",
      relevance_weight: 1,
      archive_source_type: null,
      archive_source_id: null,
      archive_source_name: null,
      created_at: "2026-06-09T09:00:00.000Z",
      updated_at: "2026-06-09T09:00:00.000Z",
    },
    {
      id: "memory-other",
      owner_user_id: "owner-b",
      persona_id: "persona-b",
      title: "Other private memory",
      content: "Other owner's private content must not return.",
      summary: "Other summary",
      source_type: "manual",
      relevance_weight: 1,
      archive_source_type: null,
      archive_source_id: null,
      archive_source_name: null,
      created_at: "2026-06-09T09:01:00.000Z",
      updated_at: "2026-06-09T09:01:00.000Z",
    },
  ]);

  const result = await authorizeCloudflareMemoryCandidates({
    supabase,
    ownerUserId: "owner-a",
    personaId: "persona-a",
    candidates: [
      {
        id: "memory-owner",
        recordType: "memory_item",
        score: 0.9,
        metadata: { content: "Cloudflare metadata must not be trusted." },
      },
      { id: "memory-other", recordType: "memory_item", score: 0.8 },
      { id: "memory-missing", recordType: "memory_item", score: 0.7 },
    ],
  });

  assert.deepEqual(supabase.filters, [
    ["id", ["memory-owner", "memory-other", "memory-missing"]],
    ["owner_user_id", "owner-a"],
    ["persona_id", "persona-a"],
  ]);
  assert.equal(result.authorized.length, 1);
  assert.equal(result.authorized[0].record.id, "memory-owner");
  assert.match(result.authorized[0].record.content, /Canonical private content/);
  assert.doesNotMatch(JSON.stringify(result.authorized), /Cloudflare metadata must not be trusted/);
  assert.deepEqual(result.rejected, [
    { id: "memory-other", reason: "not_found_or_not_authorized" },
    { id: "memory-missing", reason: "not_found_or_not_authorized" },
  ]);
});

class MemorySupabase {
  filters: Array<[string, unknown]> = [];

  constructor(private readonly rows: Array<Record<string, unknown>>) {}

  from(table: string) {
    assert.equal(table, "memory_items");
    return new MemoryQuery(this, this.rows);
  }
}

class MemoryQuery {
  private rows: Array<Record<string, unknown>>;

  constructor(private readonly supabase: MemorySupabase, rows: Array<Record<string, unknown>>) {
    this.rows = [...rows];
  }

  select() {
    return this;
  }

  in(field: string, values: unknown[]) {
    this.supabase.filters.push([field, values]);
    this.rows = this.rows.filter((row) => values.includes(row[field]));
    return this;
  }

  eq(field: string, value: unknown) {
    this.supabase.filters.push([field, value]);
    this.rows = this.rows.filter((row) => row[field] === value);
    return this;
  }

  then(resolve: (value: { data: Array<Record<string, unknown>>; error: null }) => void) {
    resolve({ data: this.rows.map((row) => ({ ...row })), error: null });
  }
}
