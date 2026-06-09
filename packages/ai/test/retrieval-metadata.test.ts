import assert from "node:assert/strict";
import test from "node:test";
import {
  ACTIVE_EMBEDDING_BACKFILL_VERSION,
  ACTIVE_EMBEDDING_DIMENSION,
  ACTIVE_EMBEDDING_INDEX_NAME,
  ACTIVE_EMBEDDING_INDEX_SOURCE,
  ACTIVE_EMBEDDING_MODEL,
  ACTIVE_EMBEDDING_PROVIDER,
  EmbeddingDimensionMismatchError,
  assertActiveEmbeddingVector,
  metadataForActiveEmbedding,
} from "../src/retrieval/embeddings";
import { retrievePrivateArchive } from "../src/retrieval/archive-retrieval";
import { searchMemory } from "../src/retrieval/semantic-search";

type Row = Record<string, any>;

test("active embedding metadata keeps the current 1536-vector contract explicit", () => {
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

  const memory = await searchMemory({
    supabase: db.client as any,
    ownerUserId: "owner-1",
    personaId: "persona-1",
    query: "continuity",
  });

  assert.equal(memory.length, 1);
  assert.equal(memory[0].id, "memory-1");

  const restoreFetch = mockEmbeddingFetch(new Array(ACTIVE_EMBEDDING_DIMENSION).fill(0.001));
  try {
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
    restoreFetch();
  }

  const memoryCall = db.rpcCalls.find((call) => call.functionName === "match_memory_items");
  const archiveCall = db.rpcCalls.find((call) => call.functionName === "match_private_archive_chunks");
  assert.equal(memoryCall?.args.query_embedding.length, ACTIVE_EMBEDDING_DIMENSION);
  assert.equal(archiveCall?.args.query_embedding.length, ACTIVE_EMBEDDING_DIMENSION);
});

class VectorSupabase {
  rpcCalls: Array<{ functionName: string; args: Record<string, any> }> = [];

  tables: Record<string, Row[]> = {
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

  constructor(private db: VectorSupabase, private table: string) {}

  select() {
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push([field, value]);
    return this;
  }

  single() {
    const rows = this.db.rows(this.table).filter((row) =>
      this.filters.every(([field, value]) => row[field] === value)
    );
    return Promise.resolve(
      rows.length === 1
        ? { data: { ...rows[0] }, error: null }
        : { data: null, error: { message: `Expected one ${this.table} row.` } }
    );
  }
}

function mockEmbeddingFetch(vector: number[]) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => ({
    ok: true,
    json: async () => ({ data: [{ index: 0, embedding: vector }] }),
    text: async () => "",
  })) as typeof fetch;
  return () => {
    globalThis.fetch = originalFetch;
  };
}
