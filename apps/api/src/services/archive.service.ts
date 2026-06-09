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
import { env } from "../lib/env";
import { estimateStorageBytes, releaseStorageBytes, reserveStorageBytes } from "./storage.service";
import { ensureMemoryLifecycle } from "./memory-continuity.service";
import { invalidateOperationalCacheForChange } from "./operational-cache.service";

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
  try {
    return (await generateEmbeddings(texts, apiKey)).map(assertActiveEmbeddingVector);
  } catch (error) {
    if (isEmbeddingDimensionMismatch(error)) throw error;
    return texts.map(() => null);
  }
}

function embeddingApiKey() {
  return env.OPENAI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim() || null;
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
        relevance_weight: input.relevanceWeight ?? 1,
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
        relevance_weight: input.relevanceWeight ?? 1,
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
}): Promise<{ chunksCreated: number }> {
  const sb = getSupabaseAdmin();

  // Mark job as processing
  await sb
    .from("import_jobs")
    .update({ status: "processing" })
    .eq("persona_id", input.personaId)
    .eq("source_name", input.fileName)
    .eq("status", "queued");

  try {
    // Download file bytes from Supabase Storage
    const { data: fileData, error: downloadError } = await sb.storage
      .from("persona-files")
      .download(input.storagePath);

    if (downloadError || !fileData) {
      throw new Error(`Could not download file: ${downloadError?.message}`);
    }

    const rawText = await fileData.text();
    let extractedText = rawText;

    // JSON chat export - extract message content
    if (
      input.fileType === "application/json" ||
      input.fileName.endsWith(".json")
    ) {
      extractedText = extractTextFromJsonExport(rawText);
    }

    const chunksCreated = await ingestTextIntoArchive({
      personaId: input.personaId,
      ownerUserId: input.ownerUserId,
      text: extractedText,
      sourceName: input.fileName,
      sourceType: "import",
      relevanceWeight: 1.5,
      archiveSource: {
        type: "persona_file",
        id: input.fileId,
        name: input.fileName,
      },
    });

    // Mark file as processed
    await sb
      .from("persona_files")
      .update({ processed: true })
      .eq("id", input.fileId);

    // Mark import job as completed
    await sb
      .from("import_jobs")
      .update({ status: "completed" })
      .eq("persona_id", input.personaId)
      .eq("source_name", input.fileName)
      .eq("status", "processing");

    return { chunksCreated };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Processing failed";

    await sb
      .from("import_jobs")
      .update({ status: "failed", error_message: message })
      .eq("persona_id", input.personaId)
      .eq("source_name", input.fileName);

    throw err;
  }
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

/**
 * Extracts readable text from common JSON chat export formats.
 * Handles: ChatGPT exports, simple message arrays.
 */
function extractTextFromJsonExport(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    const lines: string[] = [];

    // ChatGPT export format: { mapping: { [id]: { message: { content: { parts } } } } }
    if (parsed.mapping && typeof parsed.mapping === "object") {
      for (const node of Object.values(parsed.mapping) as Array<{
        message?: { author?: { role?: string }; content?: { parts?: string[] } };
      }>) {
        const role = node.message?.author?.role ?? "unknown";
        const parts = node.message?.content?.parts ?? [];
        const text = parts.filter((p) => typeof p === "string").join(" ").trim();
        if (text) lines.push(`[${role}]: ${text}`);
      }
      return lines.join("\n");
    }

    // Simple array of { role, content } messages
    if (Array.isArray(parsed)) {
      for (const msg of parsed) {
        if (msg.role && msg.content) {
          lines.push(`[${msg.role}]: ${msg.content}`);
        } else if (typeof msg === "string") {
          lines.push(msg);
        }
      }
      return lines.join("\n");
    }

    // Fallback: stringify the whole thing
    return JSON.stringify(parsed, null, 2);
  } catch {
    return raw;
  }
}
