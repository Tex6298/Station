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
import { searchMemory, searchMemoryWithTrace } from "../src/retrieval/semantic-search";
import { buildPersonaChatPrompt } from "../src/prompts/persona-chat";
import { OpenAIProvider } from "../src/providers/openai";

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
    assert.equal(context.trace.retrievalMode.memory, "vector");
    assert.equal(context.trace.searched.memory, 3);
    assert.equal(context.trace.skipped.memory.other_owner_or_missing, 0);
    assert.doesNotMatch(JSON.stringify(context.trace), /Other owner memory/);
  } finally {
    embeddingFetch.restore();
  }
});

test("vector memory search backfills exact lexical anchors when vector misses them", async () => {
  const db = new VectorMissesLexicalSupabase();

  const retrieval = await searchMemoryWithTrace({
    supabase: db.client as any,
    ownerUserId: "owner-1",
    personaId: "persona-1",
    query: "accepted synthetic staging anchors invented retrieval phrases",
    limit: 3,
    queryEmbedding: new Array(ACTIVE_EMBEDDING_DIMENSION).fill(0.001),
  });

  assert.equal(retrieval.trace.mode, "vector");
  assert.equal(retrieval.trace.fallbackMode, "none");
  assert.deepEqual(
    retrieval.results.map((row) => row.id),
    ["lexical-anchor", "vector-memory"]
  );
  assert.equal(retrieval.trace.selected.some((source) => source.id === "lexical-anchor"), true);
  assert.equal(retrieval.trace.selected.some((source) => source.id === "rejected-control"), false);
  assert.equal(retrieval.trace.selected.some((source) => source.id === "other-owner-anchor"), false);
  assert.equal(retrieval.trace.selected.some((source) => source.id === "archive-source-anchor"), false);
});

test("persona runtime context promotes exact lexical memory and preserves full content", async () => {
  const db = new VectorFullSlotsMissesLexicalSupabase();
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
      userQuery: "accepted synthetic staging anchors invented retrieval phrases",
      embeddingApiKey: "test-key",
      maxMemory: 3,
      maxArchive: 1,
    });

    assert.equal(context.trace.retrievalMode.memory, "vector");
    assert.deepEqual(
      context.memory.map((source) => source.id),
      ["lexical-anchor", "vector-memory", "vector-memory-2"]
    );
    assert.match(context.memory[0].title ?? "", /Meridian Loom/);
    assert.doesNotMatch(context.memory[0].content, /Meridian Loom/);

    const promptEvidence = context.systemPrompt;
    assert.match(promptEvidence, /Meridian Loom/);
    assert.match(promptEvidence, /Helio Gate/);
    assert.match(promptEvidence, /silver compass ledger/);
    assert.match(promptEvidence, /blue lantern checksum/);
    assert.doesNotMatch(promptEvidence, /Rejected amber/);
    assert.equal(context.trace.selectedSources.some((source) => source.id === "rejected-control"), false);
    assert.equal(context.trace.selectedSources.some((source) => source.id === "other-owner-anchor"), false);
    assert.equal(context.trace.selectedSources.some((source) => source.id === "archive-source-anchor"), false);
  } finally {
    embeddingFetch.restore();
  }
});

test("private persona prompt prioritizes direct factual answers from selected context", () => {
  const prompt = buildPersonaChatPrompt({
    name: "Replay Persona",
    visibility: "private",
    memory: [
      "Synthetic staging context binds Meridian Loom to silver compass ledger and Helio Gate to blue lantern checksum.",
    ],
  });

  assert.match(prompt, /Grounded answering rule/);
  assert.match(prompt, /direct factual question/);
  assert.match(prompt, /answer from that selected context first/);
  assert.match(prompt, /Preserve a safe user-requested shape/);
  assert.match(prompt, /Do not omit directly relevant selected names/);
  assert.match(prompt, /Final grounding guard for the next answer/);
  assert.match(prompt, /before prior chat history, earlier assistant guesses, or persona flourish/);
  assert.match(prompt, /Selected-context answer focus/);
  assert.match(prompt, /Meridian Loom/);
  assert.match(prompt, /Helio Gate/);
  assert.match(prompt, /silver compass ledger/);
  assert.match(prompt, /blue lantern checksum/);
  assert.equal(
    prompt.indexOf("Final grounding guard for the next answer") >
      prompt.indexOf("Maintain a stable, consistent voice"),
    true
  );
});

test("OpenAI provider payload preserves grounding prompt and final user message", async () => {
  const prompt = buildPersonaChatPrompt({
    name: "Replay Persona",
    visibility: "private",
    memory: [
      "Synthetic staging context binds Meridian Loom to silver compass ledger and Helio Gate to blue lantern checksum.",
    ],
  });
  const providerFetch = mockProviderFetch();

  try {
    const provider = new OpenAIProvider({ apiKey: "test-key", model: "test-model", baseUrl: "https://provider.test/v1" });
    await provider.sendMessage({
      system: prompt,
      messages: [
        { role: "assistant", content: "Earlier safe assistant turn." },
        { role: "user", content: "List the two staged pairs from selected context." },
      ],
    });

    const body = providerFetch.lastBody();
    assert.equal(body.model, "test-model");
    assert.equal(body.messages[0].role, "system");
    assert.match(body.messages[0].content, /Grounded answering rule/);
    assert.match(body.messages[0].content, /Final grounding guard for the next answer/);
    assert.match(body.messages[0].content, /Selected-context answer focus/);
    assert.match(body.messages[0].content, /Meridian Loom/);
    assert.match(body.messages[0].content, /Helio Gate/);
    assert.deepEqual(body.messages.at(-1), {
      role: "user",
      content: "List the two staged pairs from selected context.",
    });
  } finally {
    providerFetch.restore();
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

test("keyword memory ranking prefers exact replay anchor over high-weight distractors", async () => {
  const db = new RankingSupabase();

  const retrieval = await searchMemoryWithTrace({
    supabase: db.client as any,
    ownerUserId: "owner-1",
    personaId: "persona-1",
    query: "blue notebook morning ritual",
    limit: 2,
  });

  assert.equal(retrieval.trace.mode, "keyword");
  assert.equal(retrieval.trace.fallbackMode, "no_embedding_key");
  assert.equal(retrieval.results[0].id, "replay-anchor");
  assert.equal(retrieval.results[1].id, "tempting-distractor");
  assert.equal(retrieval.trace.selected[0].id, "replay-anchor");
  assert.match(retrieval.trace.selected[0].reason, /Selected by query match/);
  assert.deepEqual(retrieval.trace.skipped, {
    archive_source: 0,
    rejected: 1,
    quarantined: 1,
    expired: 1,
    superseded: 1,
    other_owner_or_missing: 0,
  });
  assert.equal(retrieval.trace.selected.some((source) => source.id === "rejected-anchor"), false);
  assert.doesNotMatch(JSON.stringify(retrieval.trace), /rejected source text/);
});

test("keyword memory fallback finds exact replay anchor buried beyond the old candidate pool", async () => {
  const db = new BuriedMemorySupabase();

  const retrieval = await searchMemoryWithTrace({
    supabase: db.client as any,
    ownerUserId: "owner-1",
    personaId: "persona-1",
    query: "golden astrolabe",
    limit: 1,
  });

  assert.equal(retrieval.trace.mode, "keyword");
  assert.equal(retrieval.trace.fallbackMode, "no_embedding_key");
  assert.equal(retrieval.trace.searched > 50, true);
  assert.equal(retrieval.results.length, 1);
  assert.equal(retrieval.results[0].id, "buried-memory-anchor");
  assert.equal(retrieval.trace.selected[0].id, "buried-memory-anchor");
  assert.doesNotMatch(JSON.stringify(retrieval.trace), /buried memory private text/);
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

class VectorMissesLexicalSupabase extends VectorSupabase {
  override tables: Record<string, Row[]> = {
    memory_items: [
      {
        id: "vector-memory",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        title: "General vector memory",
        content: "A plausible vector result about continuity hygiene.",
        summary: "Vector result without the seeded replay anchors.",
        source_type: "manual",
        relevance_weight: 5,
        archive_source_type: null,
      },
      {
        id: "lexical-anchor",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        title: "Synthetic staging anchors",
        content:
          "Synthetic replay chat memory binds Meridian Loom to silver compass ledger and Helio Gate to blue lantern checksum. Both phrases are invented staging anchors for measurement.",
        summary: "Accepted synthetic staging anchors and invented retrieval phrases.",
        source_type: "manual",
        relevance_weight: 1,
        archive_source_type: null,
      },
      {
        id: "rejected-control",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        title: "Rejected amber shortcut",
        content: "Rejected amber staging shortcut should stay filtered out.",
        summary: "Rejected control.",
        source_type: "manual",
        relevance_weight: 100,
        archive_source_type: null,
      },
      {
        id: "other-owner-anchor",
        persona_id: "persona-1",
        owner_user_id: "owner-2",
        title: "Synthetic staging anchors",
        content:
          "Other owner synthetic replay chat memory binds Meridian Loom to silver compass ledger and Helio Gate to blue lantern checksum.",
        summary: "Other owner accepted synthetic staging anchors.",
        source_type: "manual",
        relevance_weight: 200,
        archive_source_type: null,
      },
      {
        id: "archive-source-anchor",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        title: "Synthetic staging anchors",
        content:
          "Archive-source synthetic replay chat memory binds Meridian Loom to silver compass ledger and Helio Gate to blue lantern checksum.",
        summary: "Archive-source accepted synthetic staging anchors.",
        source_type: "import",
        relevance_weight: 200,
        archive_source_type: "import_job",
      },
    ],
    memory_item_lifecycle: [
      lifecycleRow("vector-memory", "owner-1", "active"),
      lifecycleRow("lexical-anchor", "owner-1", "active"),
      lifecycleRow("rejected-control", "owner-1", "rejected"),
      lifecycleRow("other-owner-anchor", "owner-2", "active"),
      lifecycleRow("archive-source-anchor", "owner-1", "active"),
    ],
  };

  override client = {
    rpc: async (functionName: string, args: Record<string, any>) => {
      this.rpcCalls.push({ functionName, args });
      if (functionName === "match_memory_items") {
        assert.equal(args.query_embedding.length, ACTIVE_EMBEDDING_DIMENSION);
        return {
          data: [
            {
              id: "vector-memory",
              persona_id: "persona-1",
              title: "General vector memory",
              content: "A plausible vector result about continuity hygiene.",
              summary: "Vector result without the seeded replay anchors.",
              source_type: "manual",
              relevance_weight: 5,
              similarity: 0.98,
            },
          ],
          error: null,
        };
      }

      return { data: null, error: { message: `Unexpected RPC ${functionName}` } };
    },
    from: (table: string) => new QueryBuilder(this, table),
  };
}

class VectorFullSlotsMissesLexicalSupabase extends VectorMissesLexicalSupabase {
  override tables: Record<string, Row[]> = {
    memory_items: [
      {
        id: "vector-memory",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        title: "General vector memory",
        content: "A plausible vector result about continuity hygiene.",
        summary: "Vector result without the seeded replay anchors.",
        source_type: "manual",
        relevance_weight: 5,
        archive_source_type: null,
      },
      {
        id: "vector-memory-2",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        title: "Second general vector memory",
        content: "Another plausible vector result about archive hygiene.",
        summary: "Second vector result without the accepted replay pair.",
        source_type: "manual",
        relevance_weight: 4,
        archive_source_type: null,
      },
      {
        id: "vector-memory-3",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        title: "Third general vector memory",
        content: "A weaker vector result that should yield to exact lexical replay evidence.",
        summary: "Third vector result without the full accepted replay pair.",
        source_type: "manual",
        relevance_weight: 3,
        archive_source_type: null,
      },
      {
        id: "lexical-anchor",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        title: "Synthetic staging labels: Meridian Loom and Helio Gate",
        content:
          "Synthetic replay chat memory pairs the selected labels with silver compass ledger and blue lantern checksum. Both phrases are invented staging anchors for measurement.",
        summary: "Accepted synthetic staging anchors with paired invented retrieval phrases.",
        source_type: "manual",
        relevance_weight: 1,
        archive_source_type: null,
      },
      {
        id: "rejected-control",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        title: "Rejected amber shortcut",
        content: "Rejected amber staging shortcut should stay filtered out.",
        summary: "Rejected control.",
        source_type: "manual",
        relevance_weight: 100,
        archive_source_type: null,
      },
      {
        id: "other-owner-anchor",
        persona_id: "persona-1",
        owner_user_id: "owner-2",
        title: "Synthetic staging anchors",
        content:
          "Other owner synthetic replay chat memory binds Meridian Loom to silver compass ledger and Helio Gate to blue lantern checksum.",
        summary: "Other owner accepted synthetic staging anchors.",
        source_type: "manual",
        relevance_weight: 200,
        archive_source_type: null,
      },
      {
        id: "archive-source-anchor",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        title: "Synthetic staging anchors",
        content:
          "Archive-source synthetic replay chat memory binds Meridian Loom to silver compass ledger and Helio Gate to blue lantern checksum.",
        summary: "Archive-source accepted synthetic staging anchors.",
        source_type: "import",
        relevance_weight: 200,
        archive_source_type: "import_job",
      },
    ],
    memory_item_lifecycle: [
      lifecycleRow("vector-memory", "owner-1", "active"),
      lifecycleRow("vector-memory-2", "owner-1", "active"),
      lifecycleRow("vector-memory-3", "owner-1", "active"),
      lifecycleRow("lexical-anchor", "owner-1", "active"),
      lifecycleRow("rejected-control", "owner-1", "rejected"),
      lifecycleRow("other-owner-anchor", "owner-2", "active"),
      lifecycleRow("archive-source-anchor", "owner-1", "active"),
    ],
    canon_items: [],
    owner_memory_blocks: [],
    calibration_sessions: [],
    persona_preferences: [],
    import_jobs: [],
    persona_files: [],
    archived_chat_transcripts: [],
  };

  override client = {
    rpc: async (functionName: string, args: Record<string, any>) => {
      this.rpcCalls.push({ functionName, args });
      if (functionName === "match_memory_items") {
        assert.equal(args.query_embedding.length, ACTIVE_EMBEDDING_DIMENSION);
        return {
          data: [
            {
              id: "vector-memory",
              persona_id: "persona-1",
              title: "General vector memory",
              content: "A plausible vector result about continuity hygiene.",
              summary: "Vector result without the seeded replay anchors.",
              source_type: "manual",
              relevance_weight: 5,
              similarity: 0.98,
            },
            {
              id: "vector-memory-2",
              persona_id: "persona-1",
              title: "Second general vector memory",
              content: "Another plausible vector result about archive hygiene.",
              summary: "Second vector result without the accepted replay pair.",
              source_type: "manual",
              relevance_weight: 4,
              similarity: 0.97,
            },
            {
              id: "vector-memory-3",
              persona_id: "persona-1",
              title: "Third general vector memory",
              content: "A weaker vector result that should yield to exact lexical replay evidence.",
              summary: "Third vector result without the full accepted replay pair.",
              source_type: "manual",
              relevance_weight: 3,
              similarity: 0.96,
            },
          ],
          error: null,
        };
      }

      if (functionName === "match_private_archive_chunks") {
        return { data: [], error: null };
      }

      return { data: null, error: { message: `Unexpected RPC ${functionName}` } };
    },
    from: (table: string) => new QueryBuilder(this, table),
  };
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

  maybeSingle() {
    const rows = this.matchingRows();
    return Promise.resolve(
      rows.length > 0
        ? { data: { ...rows[0] }, error: null }
        : { data: null, error: null }
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

function lifecycleRow(memoryItemId: string, ownerUserId: string, status: string, extras: Row = {}) {
  return {
    memory_item_id: memoryItemId,
    persona_id: "persona-1",
    owner_user_id: ownerUserId,
    status,
    expires_at: null,
    superseded_by_memory_item_id: null,
    ...extras,
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

class RankingSupabase extends KeywordFallbackSupabase {
  override tables: Record<string, Row[]> = {
    memory_items: [
      {
        id: "tempting-distractor",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        title: "General notebook notes",
        content: "Morning planning mentions a blue cover and a ritual in separate bullets.",
        summary: "Broad notes with several matching words.",
        source_type: "manual",
        relevance_weight: 90,
        archive_source_type: null,
      },
      {
        id: "replay-anchor",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        title: "Blue notebook morning ritual",
        content: "Synthetic replay anchor.",
        summary: "Exact replay anchor.",
        source_type: "manual",
        relevance_weight: 1,
        archive_source_type: null,
      },
      {
        id: "rejected-anchor",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        title: "Blue notebook morning ritual rejected",
        content: "rejected source text",
        summary: "Rejected exact source.",
        source_type: "manual",
        relevance_weight: 100,
        archive_source_type: null,
      },
      {
        id: "quarantined-anchor",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        title: "Blue notebook morning ritual quarantined",
        content: "quarantined source text",
        summary: "Quarantined exact source.",
        source_type: "manual",
        relevance_weight: 100,
        archive_source_type: null,
      },
      {
        id: "expired-anchor",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        title: "Blue notebook morning ritual expired",
        content: "expired source text",
        summary: "Expired exact source.",
        source_type: "manual",
        relevance_weight: 100,
        archive_source_type: null,
      },
      {
        id: "superseded-anchor",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        title: "Blue notebook morning ritual superseded",
        content: "superseded source text",
        summary: "Superseded exact source.",
        source_type: "manual",
        relevance_weight: 100,
        archive_source_type: null,
      },
    ],
    memory_item_lifecycle: [
      lifecycleRow("tempting-distractor", "owner-1", "active"),
      lifecycleRow("replay-anchor", "owner-1", "active"),
      lifecycleRow("rejected-anchor", "owner-1", "rejected"),
      lifecycleRow("quarantined-anchor", "owner-1", "quarantined"),
      lifecycleRow("expired-anchor", "owner-1", "active", { expires_at: "2020-01-01T00:00:00.000Z" }),
      lifecycleRow("superseded-anchor", "owner-1", "superseded", { superseded_by_memory_item_id: "replay-anchor" }),
    ],
  };
}

class BuriedMemorySupabase extends KeywordFallbackSupabase {
  override tables: Record<string, Row[]> = {
    memory_items: [
      ...buriedMemoryNoise(70),
      {
        id: "buried-memory-anchor",
        persona_id: "persona-1",
        owner_user_id: "owner-1",
        title: "Golden astrolabe",
        content: "buried memory private text for the exact replay anchor",
        summary: "Exact replay anchor.",
        source_type: "manual",
        relevance_weight: 1,
        archive_source_type: null,
      },
    ],
    memory_item_lifecycle: [
      lifecycleRow("buried-memory-anchor", "owner-1", "active"),
    ],
  };
}

function buriedMemoryNoise(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `buried-memory-noise-${index}`,
    persona_id: "persona-1",
    owner_user_id: "owner-1",
    title: `High weight memory ${index}`,
    content: `Generic high-weight memory ${index} without the replay phrase.`,
    summary: "Generic memory.",
    source_type: "manual",
    relevance_weight: 100 - (index % 10),
    archive_source_type: null,
  }));
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

function mockProviderFetch() {
  const originalFetch = globalThis.fetch;
  let capturedBody: any = null;
  globalThis.fetch = (async (_url: RequestInfo | URL, init?: RequestInit) => {
    capturedBody = JSON.parse(String(init?.body ?? "{}"));
    return {
      ok: true,
      json: async () => ({
        model: capturedBody.model,
        choices: [{ message: { content: "Grounded provider response." } }],
      }),
      text: async () => "",
    };
  }) as typeof fetch;

  return {
    restore: () => {
      globalThis.fetch = originalFetch;
    },
    lastBody: () => capturedBody,
  };
}
