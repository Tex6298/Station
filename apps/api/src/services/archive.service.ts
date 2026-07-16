import { getSupabaseAdmin } from "../lib/supabase";
import {
  generateEmbedding,
  generateEmbeddings,
  chunkText,
  assertActiveEmbeddingVector,
  isEmbeddingDimensionMismatch,
  metadataForActiveEmbedding,
} from "@station/ai/retrieval/embeddings";
import type { ArchiveSourceType } from "@station/types";
import { estimateStorageBytes, releaseStorageBytes, reserveStorageBytes } from "./storage.service";
import { ensureMemoryLifecycle } from "./memory-continuity.service";
import { invalidateOperationalCacheForChange } from "./operational-cache.service";
import { sanitizeJobErrorMessage } from "./background-jobs.service";
import { resolveEmbeddingApiKey } from "./embedding-key.service";
import { parseImportFile, type ParsedImport } from "./imports/parsers";
import { assertEmbeddingArchiveWriteQuota } from "./operational-quota.service";

type ArchiveSourceRef = {
  type: ArchiveSourceType;
  id: string;
  name?: string | null;
};

function embeddingColumnsFor(vector: number[] | null) {
  const metadata = metadataForActiveEmbedding(vector);
  return {
    embedding_provider: metadata?.embeddingProvider ?? null,
    embedding_model: metadata?.embeddingModel ?? null,
    embedding_dimension: metadata?.embeddingDimension ?? null,
    embedding_index_name: metadata?.embeddingIndexName ?? null,
    embedding_index_source: metadata?.embeddingIndexSource ?? null,
    embedding_backfill_version: metadata?.embeddingBackfillVersion ?? null,
  };
}

async function generateArchiveEmbedding(text: string) {
  const apiKey = embeddingApiKey();
  if (!apiKey) return null;
  assertEmbeddingArchiveWriteQuota({ chunkCount: 1, embeddingEnabled: true });
  try {
    return assertActiveEmbeddingVector(await generateEmbedding(text, apiKey));
  } catch (error) {
    if (isEmbeddingDimensionMismatch(error)) throw error;
    return null;
  }
}

async function generateArchiveEmbeddings(texts: string[]) {
  const apiKey = embeddingApiKey();
  if (!apiKey) return texts.map(() => null);
  assertEmbeddingArchiveWriteQuota({ chunkCount: texts.length, embeddingEnabled: true });
  try {
    return (await generateEmbeddings(texts, apiKey)).map(assertActiveEmbeddingVector);
  } catch (error) {
    if (isEmbeddingDimensionMismatch(error)) throw error;
    return texts.map(() => null);
  }
}

function embeddingApiKey() {
  return resolveEmbeddingApiKey();
}

function memoryRelevanceWeight(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value) || value < 0) return 1;
  return value;
}

/**
 * Adds a single memory item to a persona's archive and generates its embedding.
 */
export async function addMemoryItem(input: {
  personaId: string;
  ownerUserId: string;
  title?: string;
  content: string;
  summary?: string;
  sourceType: "chat" | "import" | "document" | "calibration" | "integrity_session" | "manual";
  relevanceWeight?: number;
  archiveSource?: ArchiveSourceRef;
}) {
  const sb = getSupabaseAdmin();
  const reservedBytes = estimateStorageBytes(
    [input.title, input.content, input.summary].filter(Boolean).join("\n")
  );
  let reserved = false;

  await reserveStorageBytes(input.ownerUserId, reservedBytes);
  reserved = true;

  try {
    const embedding = await generateArchiveEmbedding(input.content);

    const { data, error } = await sb
      .from("memory_items")
      .insert({
        persona_id: input.personaId,
        owner_user_id: input.ownerUserId,
        title: input.title ?? null,
        content: input.content,
        summary: input.summary ?? null,
        source_type: input.sourceType,
        relevance_weight: memoryRelevanceWeight(input.relevanceWeight),
        embedding: embedding ?? null,
        ...embeddingColumnsFor(embedding),
        archive_source_type: input.archiveSource?.type ?? null,
        archive_source_id: input.archiveSource?.id ?? null,
        archive_source_name: input.archiveSource?.name ?? null,
        chunk_index: input.archiveSource ? 0 : null,
        chunk_count: input.archiveSource ? 1 : null,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    await ensureMemoryLifecycle({
      memoryItemId: data.id,
      ownerUserId: input.ownerUserId,
      personaId: input.personaId,
      sourceType: input.sourceType,
    }).catch(() => undefined);
    await invalidateOperationalCacheForChange({
      type: input.archiveSource ? "archive_import" : "memory",
      ownerUserId: input.ownerUserId,
      personaId: input.personaId,
      resourceId: data.id,
    }).catch(() => undefined);
    return data;
  } catch (error) {
    if (reserved) await releaseStorageBytes(input.ownerUserId, reservedBytes).catch(() => null);
    throw error;
  }
}

/**
 * Chunks a long text, generates an embedding per chunk,
 * and inserts all chunks as memory items in one batch.
 * Returns the number of chunks created.
 */
export async function ingestTextIntoArchive(input: {
  personaId: string;
  ownerUserId: string;
  text: string;
  sourceName: string;
  sourceType: "chat" | "import" | "document" | "calibration";
  relevanceWeight?: number;
  archiveSource?: ArchiveSourceRef;
}): Promise<number> {
  const sb = getSupabaseAdmin();
  const chunks = chunkText(input.text, 1200, 200);

  if (chunks.length === 0) return 0;

  const reservedBytes = estimateStorageBytes(input.text);
  let reserved = false;
  await reserveStorageBytes(input.ownerUserId, reservedBytes);
  reserved = true;

  try {
    const embeddings = await generateArchiveEmbeddings(chunks);

    const rows = chunks.map((chunk, i) => {
      const embedding = embeddings[i] ?? null;
      return {
        persona_id: input.personaId,
        owner_user_id: input.ownerUserId,
        title: `${input.sourceName} [chunk ${i + 1}/${chunks.length}]`,
        content: chunk,
        summary: chunk.slice(0, 200),
        source_type: input.sourceType,
        relevance_weight: memoryRelevanceWeight(input.relevanceWeight),
        embedding,
        ...embeddingColumnsFor(embedding),
        archive_source_type: input.archiveSource?.type ?? null,
        archive_source_id: input.archiveSource?.id ?? null,
        archive_source_name: input.archiveSource?.name ?? input.sourceName,
        chunk_index: input.archiveSource ? i : null,
        chunk_count: input.archiveSource ? chunks.length : null,
      };
    });

    const { data: inserted, error } = await sb
      .from("memory_items")
      .insert(rows)
      .select("id, owner_user_id, persona_id, source_type");
    if (error) throw new Error(error.message);

    await Promise.all((inserted ?? []).map((row) => ensureMemoryLifecycle({
      memoryItemId: row.id,
      ownerUserId: row.owner_user_id,
      personaId: row.persona_id,
      sourceType: row.source_type,
    }).catch(() => undefined)));

    await invalidateOperationalCacheForChange({
      type: input.archiveSource ? "archive_import" : "memory",
      ownerUserId: input.ownerUserId,
      personaId: input.personaId,
      resourceId: input.archiveSource?.id ?? null,
    }).catch(() => undefined);

    return chunks.length;
  } catch (error) {
    if (reserved) await releaseStorageBytes(input.ownerUserId, reservedBytes).catch(() => null);
    throw error;
  }
}

/**
 * Processes an uploaded file from Supabase Storage into memory chunks.
 * Currently handles: plain text, markdown, JSON chat exports.
 */
export async function processUploadedFile(input: {
  personaId: string;
  ownerUserId: string;
  fileId: string;
  fileName: string;
  fileType: string | null;
  storagePath: string;
  jobId?: string;
}): Promise<{ chunksCreated: number }> {
  const sb = getSupabaseAdmin();

  // Mark job as processing
  const processingQuery = sb
    .from("import_jobs")
    .update({ status: "processing" })
    .eq("persona_id", input.personaId)
    .eq("source_name", input.fileName)
    .eq("status", "queued");
  if (input.jobId) processingQuery.eq("id", input.jobId);
  await processingQuery;

  try {
    // Download file bytes from Supabase Storage
    const { data: fileData, error: downloadError } = await sb.storage
      .from("persona-files")
      .download(input.storagePath);

    if (downloadError || !fileData) {
      throw new Error(`Could not download file: ${downloadError?.message}`);
    }

    const rawText = await fileData.text();
    const parsedImport = parseImportFile({
      fileName: input.fileName,
      fileType: input.fileType,
      rawText,
    });
    const sourceName =
      parsedImport.format === "text" || parsedImport.format === "markdown"
        ? input.fileName
        : `${input.fileName} (${parsedImport.metadata.parser} import)`;

    const chunksCreated = await ingestTextIntoArchive({
      personaId: input.personaId,
      ownerUserId: input.ownerUserId,
      text: parsedImport.text,
      sourceName,
      sourceType: "import",
      relevanceWeight: 1.5,
      archiveSource: {
        type: "persona_file",
        id: input.fileId,
        name: sourceName,
      },
    });

    await createImportReviewCandidates({
      parsedImport,
      personaId: input.personaId,
      ownerUserId: input.ownerUserId,
      sourceId: input.fileId,
      sourceLabel: sourceName,
    });

    // Mark file as processed
    await sb
      .from("persona_files")
      .update({ processed: true })
      .eq("id", input.fileId);

    // Mark import job as completed
    const completedQuery = sb
      .from("import_jobs")
      .update({ status: "completed" })
      .eq("persona_id", input.personaId)
      .eq("source_name", input.fileName)
      .eq("status", "processing");
    if (input.jobId) completedQuery.eq("id", input.jobId);
    await completedQuery;

    return { chunksCreated };
  } catch (err) {
    const message = sanitizeJobErrorMessage(err, [input.fileName, input.storagePath]);

    const failedQuery = sb
      .from("import_jobs")
      .update({ status: "failed", error_message: message })
      .eq("persona_id", input.personaId)
      .eq("source_name", input.fileName);
    if (input.jobId) failedQuery.eq("id", input.jobId);
    await failedQuery;

    throw new Error(message);
  }
}

async function createImportReviewCandidates(input: {
  parsedImport: ParsedImport;
  personaId: string;
  ownerUserId: string;
  sourceId: string;
  sourceLabel: string;
}) {
  if (!["chatgpt", "claude", "reddit", "discord"].includes(input.parsedImport.format)) return;

  const seeds = importCandidateSeeds(input.parsedImport);
  if (seeds.length === 0) return;

  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("continuity_candidates")
    .insert(seeds.map((seed) => ({
      archived_chat_transcript_id: null,
      source_table: "persona_files",
      source_id: input.sourceId,
      source_label: input.sourceLabel,
      persona_id: input.personaId,
      owner_user_id: input.ownerUserId,
      candidate_type: seed.candidate_type,
      title: seed.title,
      content: seed.content,
      rationale: seed.rationale,
      source_message_ids: [],
    })));

  if (error) throw new Error(error.message);
}

function importCandidateSeeds(parsedImport: ParsedImport) {
  const lines = parsedImport.text
    .split("\n")
    .map((line) => sanitizeImportCandidateText(line))
    .filter(Boolean);
  if (lines.length === 0) return [];

  const sourceName = sanitizeImportCandidateText(parsedImport.metadata.sourceName || "Imported conversation");
  const messageCount = parsedImport.metadata.messageCount ?? lines.length;
  const excerpt = lines.slice(0, 4).map((line) => `- ${trimImportCandidateText(line, 180)}`).join("\n");
  const canonLine = lines.find((line) => /\b(always|never|must|should|prefer|remember|boundary|canon|principle|rule)\b/i.test(line))
    ?? lines.at(-1)
    ?? lines[0];

  return [
    {
      candidate_type: "memory" as const,
      title: `Memory candidate from ${sourceName}`,
      content: trimImportCandidateText(`Imported ${parsedImport.format} conversation with ${messageCount} turns. Review before activating:\n${excerpt}`, 1200),
      rationale: "Generated from a parsed external conversation import. Review before adding to active Memory.",
    },
    {
      candidate_type: "canon" as const,
      title: `Canon candidate from ${sourceName}`,
      content: trimImportCandidateText(canonLine, 900),
      rationale: "Generated from a parsed external conversation import line that may contain durable guidance. Review before adding to Canon.",
    },
  ];
}

function sanitizeImportCandidateText(value: string) {
  return sanitizeJobErrorMessage(value)
    .replace(/\s+/g, " ")
    .trim();
}

function trimImportCandidateText(value: string, maxLength: number) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length <= maxLength ? clean : `${clean.slice(0, maxLength - 3).trim()}...`;
}

/**
 * Saves the last assistant message from a conversation turn as a memory item.
 */
export async function saveMessageAsMemory(input: {
  conversationId: string;
  personaId: string;
  ownerUserId: string;
  content: string;
  relevanceWeight?: number;
}) {
  return addMemoryItem({
    personaId: input.personaId,
    ownerUserId: input.ownerUserId,
    title: "Saved from chat",
    content: input.content,
    summary: input.content.slice(0, 300),
    sourceType: "chat",
    relevanceWeight: input.relevanceWeight ?? 1.25,
  });
}
