import assert from "node:assert/strict";
import test from "node:test";
import {
  ACTIVE_EMBEDDING_BACKFILL_VERSION,
  ACTIVE_EMBEDDING_DIMENSION,
  ACTIVE_EMBEDDING_INDEX_NAME,
  ACTIVE_EMBEDDING_INDEX_SOURCE,
  ACTIVE_EMBEDDING_MODEL,
  ACTIVE_EMBEDDING_PROFILE_CODE,
  ACTIVE_EMBEDDING_PROVIDER,
  EmbeddingDimensionMismatchError,
  assertActiveEmbeddingVector,
  buildGeminiEmbedRequestBody,
  metadataForActiveEmbedding,
  resolveEmbeddingRuntimeConfig,
} from "../src/retrieval/embeddings";
import { retrievePrivateArchive } from "../src/retrieval/archive-retrieval";
import { assemblePersonaRuntimeContext } from "../src/retrieval/context-builder";
import { searchMemory } from "../src/retrieval/semantic-search";

type Row = Record<string, any>;

test("active embedding metadata keeps the current 1536-vector contract explicit", () => {
  assert.equal(ACTIVE_EMBEDDING_PROFILE_CODE, "station_free_1536");
  assert.equal(ACTIVE_EMBEDDING_PROVIDER, "gemini");
  assert.equal(ACTIVE_EMBEDDING_MODEL, "gemini-embedding-2");
  assert.equal(ACTIVE_EMBEDDING_BACKFILL_VERSION, 2);

  const vector = new Array(ACTIVE_EMBEDDING_DIMENSION).fill(0.001);
  assert.deepEqual(metadataForActiveEmbedding(vector), {
    embeddingProvider: ACTIVE_EMBEDDING_PROVIDER,
    embeddingModel: ACTIVE_EMBEDDING_MODEL,
    embeddingDimension: ACTIVE_EMBEDDING_DIMENSION,
    embeddingIndexName: ACTIVE_EMBEDDING_INDEX_NAME,
    embeddingIndexSource: ACTIVE_EMBEDDING_INDEX_SOURCE,
    embeddingBackfillVersion: ACTIVE_EMBEDDING_BACKFILL_VERSION,
  });

  assert.throws(
    () => assertActiveEmbeddingVector([0.1, 0.2]),
    EmbeddingDimensionMismatchError
  );
});

test("memory and private archive vector search keep the active 1536-vector RPC contract", async () => {
  const db = new VectorSupabase();
  const embeddingFetch = mockEmbeddingFetch(new Array(ACTIVE_EMBEDDING_DIMENSION).fill(0.001));

  try {
    const memory = await searchMemory({
      supabase: db.client as any,
      ownerUserId: "owner-1",
      personaId: "persona-1",
      query: "continuity",
      embeddingApiKey: "test-key",
    });

    assert.equal(memory.length, 1);
    assert.equal(memory[0].id, "memory-1");

    const archive = await retrievePrivateArchive({
      supabase: db.client as any,
      ownerUserId: "owner-1",
      personaId: "persona-1",
      query: "blue notebook",
      embeddingApiKey: "test-key",
    });

    assert.equal(archive.mode, "vector");
    assert.equal(archive.chunks.length, 1);
    assert.equal(archive.chunks[0].citation.sourceType, "import_job");
  } finally {
    embeddingFetch.restore();
  }

  const memoryCall = db.rpcCalls.find((call) => call.functionName === "match_memory_items");
  const archiveCall = db.rpcCalls.find((call) => call.functionName === "match_private_archive_chunks");
  assert.equal(memoryCall?.args.query_embedding.length, ACTIVE_EMBEDDING_DIMENSION);
  assert.equal(archiveCall?.args.query_embedding.length, ACTIVE_EMBEDDING_DIMENSION);
});

test("persona runtime context shares one query embedding across memory and archive retrieval", async () => {
  const db = new VectorSupabase();
  const embeddingFetch = mockEmbeddingFetch(new Array(ACTIVE_EMBEDDING_DIMENSION).fill(0.001));

  try {
    const context = await assemblePersonaRuntimeContext({
      supabase: db.client as any,
      ownerUserId: "owner-1",
      persona: {
        id: "persona-1",
        name: "Replay Persona",
        shortDescription: "Synthetic replay persona.",
        longDescription: "Used for replay measurement.",
        visibility: "private",
      },
      userQuery: "continuity blue notebook",
      embeddingApiKey: "test-key",
    });

    assert.equal(embeddingFetch.calls(), 1);
    assert.equal(db.rpcCalls.filter((call) => call.functionName === "match_memory_items").length, 1);
    assert.equal(db.rpcCalls.filter((call) => call.functionName === "match_private_archive_chunks").length, 1);
    assert.equal(context.counts.memory, 1);
    assert.equal(context.counts.archive, 1);
  } finally {
    embeddingFetch.restore();
  }
});

test("memory search uses keyword fallback without an embedding key", async () => {
  const db = new KeywordFallbackSupabase();

  const memory = await searchMemory({
    supabase: db.client as any,
    ownerUserId: "owner-1",
    personaId: "persona-1",
    query: "careful continuity",
  });

  assert.equal(memory.length, 1);
  assert.equal(memory[0].id, "keyword-memory-1");
  assert.equal(db.rpcCalls.length, 0);
});

test("Gemini embedding request uses REST config casing for the active dimension", () => {
  const body = buildGeminiEmbedRequestBody("search text", "gemini-embedding-2", 1536);

  assert.equal(body.model, "models/gemini-embedding-2");
  assert.deepEqual(body.content, { parts: [{ text: "search text" }] });
  assert.deepEqual(body.embedContentConfig, { outputDimensionality: 1536 });
  assert.equal(Object.hasOwn(body as Record<string, unknown>, "output_dimensionality"), false);
  assert.equal(Object.hasOwn(body as Record<string, unknown>, "config"), false);
});

test("embedding profile resolution rejects stale cross-provider overrides", () => {
  assert.deepEqual(
    resolveEmbeddingRuntimeConfig({
      EMBEDDING_PROFILE_CODE: "openai_1536",
      EMBEDDING_MODEL: "gemini-embedding-2",
      EMBEDDING_DIM: "3072",
    }),
    {
      code: "openai_1536",
      provider: "openai",
      model: "text-embedding-3-small",
      dimension: 1536,
      backfillVersion: 1,
    }
  );

  assert.deepEqual(
    resolveEmbeddingRuntimeConfig({
      EMBEDDING_PROFILE_CODE: "station_free_1536",
      EMBEDDING_MODEL: "text-embedding-3-small",
      EMBEDDING_DIM: "768",
    }),
    {
      code: "station_free_1536",
      provider: "gemini",
      model: "gemini-embedding-2",
      dimension: 1536,
      backfillVersion: 2,
    }
  );

  assert.deepEqual(
    resolveEmbeddingRuntimeConfig({
      EMBEDDINGS_PROVIDER: "openai",
    }),
    {
      code: "openai_1536",
      provider: "openai",
      model: "text-embedding-3-small",
      dimension: 1536,
      backfillVersion: 1,
    }
  );
});

class VectorSupabase {
  rpcCalls: Array<{ functionName: string; args: Record<string, any> }> = [];

  tables: Record<string, Row[]> = {
    memory_items: [
      memoryRow("memory-1", "owner-1", { archive_source_type: null }),
      memoryRow("memory-rejected", "owner-1", { archive_source_type: null }),
      memoryRow("memory-archive", "owner-1", { archive_source_type: "import_job" }),
      memoryRow("memory-other", "owner-2", { archive_source_type: null }),
    ],
    memory_item_lifecycle: [
      lifecycleRow("memory-1", "owner-1", "active"),
      lifecycleRow("memory-rejected", "owner-1", "rejected"),
      lifecycleRow("memory-archive", "owner-1", "active"),
      lifecycleRow("memory-other", "owner-2", "active"),
    ],
    canon_items: [],
    owner_memory_blocks: [],
    calibration_sessions: [],
    persona_preferences: [
      {
        id: "prefs-1",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        warmth_level: "moderate",
        playfulness: "moderate",
        register_preference: "balanced",
        depth_preference: "concise",
        challenge_preference: "balanced",
        disclaimer_sensitivity: "low",
        relationship_tone: "working",
        recurring_topics: [],
        tone_notes: [],
        updated_at: "2026-06-09T08:00:00.000Z",
      },
    ],
    import_jobs: [
      {
        id: "import-1",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        status: "completed",
        source_name: "Archive import",
        created_at: "2026-06-09T08:00:00.000Z",
        updated_at: "2026-06-09T08:00:00.000Z",
      },
    ],
  };

  client = {
    rpc: async (functionName: string, args: Record<string, any>) => {
      this.rpcCalls.push({ functionName, args });
      if (functionName === "match_memory_items") {
        assert.equal(args.query_embedding.length, ACTIVE_EMBEDDING_DIMENSION);
        return {
          data: [
            {
              id: "memory-1",
              persona_id: "persona-1",
              title: "Continuity memory",
              content: "Continuity should stay searchable.",
              summary: "Continuity",
              source_type: "manual",
              relevance_weight: 2,
              similarity: 0.98,
            },
            {
              id: "memory-rejected",
              persona_id: "persona-1",
              title: "Rejected continuity memory",
              content: "Rejected continuity should not reach runtime context.",
              summary: "Rejected continuity",
              source_type: "manual",
              relevance_weight: 20,
              similarity: 0.99,
            },
            {
              id: "memory-archive",
              persona_id: "persona-1",
              title: "Archive chunk",
              content: "Archive chunks should stay in archive retrieval, not generic memory.",
              summary: "Archive chunk",
              source_type: "import",
              relevance_weight: 20,
              similarity: 0.97,
            },
            {
              id: "memory-other",
              persona_id: "persona-1",
              title: "Other owner memory",
              content: "Other owner memory must not reach runtime context.",
              summary: "Other owner memory",
              source_type: "manual",
              relevance_weight: 20,
              similarity: 0.96,
            },
          ],
          error: null,
        };
      }

      if (functionName === "match_private_archive_chunks") {
        assert.equal(args.query_embedding.length, ACTIVE_EMBEDDING_DIMENSION);
        return {
          data: [
            {
              id: "archive-chunk-1",
              persona_id: "persona-1",
              owner_user_id: "owner-1",
              title: "Archive import chunk",
              content: "The blue notebook is preserved as private archive evidence.",
              summary: "Blue notebook",
              source_type: "import",
              relevance_weight: 3,
              archive_source_type: "import_job",
              archive_source_id: "import-1",
              archive_source_name: "Archive import",
              chunk_index: 0,
              chunk_count: 1,
              created_at: "2026-06-09T08:01:00.000Z",
              similarity: 0.96,
            },
          ],
          error: null,
        };
      }

      return { data: null, error: { message: `Unexpected RPC ${functionName}` } };
    },
    from: (table: string) => new QueryBuilder(this, table),
  };

  rows(table: string) {
    return this.tables[table] ?? [];
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private inFilters: Array<[string, unknown[]]> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;

  constructor(private db: VectorSupabase, private table: string) {}

  select() {
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

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    const rows = this.matchingRows();
    return Promise.resolve(
      rows.length === 1
        ? { data: { ...rows[0] }, error: null }
        : { data: null, error: { code: "PGRST116", message: `Expected one ${this.table} row.` } }
    );
  }

  then(onfulfilled: any, onrejected: any) {
    return Promise.resolve({ data: this.matchingRows().map((row) => ({ ...row })), error: null }).then(onfulfilled, onrejected);
  }

  private matchingRows() {
    let rows = this.db.rows(this.table).filter((row) =>
      this.filters.every(([field, value]) => row[field] === value)
    );
    rows = rows.filter((row) =>
      this.inFilters.every(([field, values]) => values.includes(row[field]))
    );

    if (this.orderSpec) {
      const { field, ascending } = this.orderSpec;
      rows = [...rows].sort((a, b) => {
        if (a[field] === b[field]) return 0;
        if (a[field] == null) return 1;
        if (b[field] == null) return -1;
        return (a[field] > b[field] ? 1 : -1) * (ascending ? 1 : -1);
      });
    }

    if (this.limitCount !== null) rows = rows.slice(0, this.limitCount);
    return rows;
  }
}

function memoryRow(id: string, ownerUserId: string, extras: Row = {}) {
  return {
    id,
    persona_id: "persona-1",
    owner_user_id: ownerUserId,
    archive_source_type: null,
    ...extras,
  };
}

function lifecycleRow(memoryItemId: string, ownerUserId: string, status: string) {
  return {
    memory_item_id: memoryItemId,
    persona_id: "persona-1",
    owner_user_id: ownerUserId,
    status,
    expires_at: null,
    superseded_by_memory_item_id: null,
  };
}

class KeywordFallbackSupabase {
  rpcCalls: Array<{ functionName: string; args: Record<string, any> }> = [];

  tables: Record<string, Row[]> = {
    memory_items: [
      {
        id: "keyword-memory-1",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        title: "Careful continuity",
        content: "Careful continuity should remain available without embedding configuration.",
        summary: "Careful continuity",
        source_type: "manual",
        relevance_weight: 5,
        archive_source_type: null,
      },
      {
        id: "archive-memory",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        title: "Archive chunk",
        content: "Archive chunk should not appear as generic memory.",
        summary: "Archive chunk",
        source_type: "import",
        relevance_weight: 10,
        archive_source_type: "import_job",
      },
    ],
    memory_item_lifecycle: [
      {
        memory_item_id: "keyword-memory-1",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        status: "active",
        expires_at: null,
        superseded_by_memory_item_id: null,
      },
    ],
  };

  client = {
    rpc: async (functionName: string, args: Record<string, any>) => {
      this.rpcCalls.push({ functionName, args });
      return { data: null, error: { message: "No vector search expected." } };
    },
    from: (table: string) => new QueryBuilder(this, table),
  };

  rows(table: string) {
    return this.tables[table] ?? [];
  }
}

function mockEmbeddingFetch(vector: number[]) {
  const originalFetch = globalThis.fetch;
  let callCount = 0;
  globalThis.fetch = (async () => ({
    ok: true,
    json: async () => {
      callCount += 1;
      return { data: [{ index: 0, embedding: vector }] };
    },
    text: async () => "",
  })) as typeof fetch;
  return {
    restore: () => {
      globalThis.fetch = originalFetch;
    },
    calls: () => callCount,
  };
}
