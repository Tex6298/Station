/**
 * Text embedding generation.
 * Supports OpenAI and Gemini providers with the current 1536-dimension contract.
 */

export type EmbeddingProvider = "openai" | "gemini";
export type EmbeddingUseCase = "query" | "document";

const OPENAI_MODEL = "text-embedding-3-small";
const GEMINI_MODEL = "gemini-embedding-2";
const DEFAULT_DIMENSION = 1536;
const OPENAI_BACKFILL_VERSION = 1;
const GEMINI_BACKFILL_VERSION = 2;

export const ACTIVE_EMBEDDING_PROVIDER = resolveEmbeddingProvider();
export const ACTIVE_EMBEDDING_MODEL = resolveEmbeddingModel();
export const ACTIVE_EMBEDDING_DIMENSION = resolveEmbeddingDimension();
export const ACTIVE_EMBEDDING_INDEX_NAME = "memory_items_embedding_1536";
export const ACTIVE_EMBEDDING_INDEX_SOURCE = "supabase_pgvector";
export const ACTIVE_EMBEDDING_BACKFILL_VERSION = resolveEmbeddingBackfillVersion();

export type EmbeddingMetadata = {
  embeddingProvider: EmbeddingProvider;
  embeddingModel: string;
  embeddingDimension: number;
  embeddingIndexName: typeof ACTIVE_EMBEDDING_INDEX_NAME;
  embeddingIndexSource: typeof ACTIVE_EMBEDDING_INDEX_SOURCE;
  embeddingBackfillVersion: number;
};

export class EmbeddingDimensionMismatchError extends Error {
  constructor(readonly expectedDimension: number, readonly receivedDimension: number) {
    super(`Embedding dimension mismatch: expected ${expectedDimension}, received ${receivedDimension}.`);
    this.name = "EmbeddingDimensionMismatchError";
  }
}

export function activeEmbeddingMetadata(): EmbeddingMetadata {
  return {
    embeddingProvider: ACTIVE_EMBEDDING_PROVIDER,
    embeddingModel: ACTIVE_EMBEDDING_MODEL,
    embeddingDimension: ACTIVE_EMBEDDING_DIMENSION,
    embeddingIndexName: ACTIVE_EMBEDDING_INDEX_NAME,
    embeddingIndexSource: ACTIVE_EMBEDDING_INDEX_SOURCE,
    embeddingBackfillVersion: ACTIVE_EMBEDDING_BACKFILL_VERSION,
  };
}

export function activeEmbeddingRpcArgs() {
  const metadata = activeEmbeddingMetadata();
  if (
    metadata.embeddingProvider === "openai"
    && metadata.embeddingModel === OPENAI_MODEL
    && metadata.embeddingIndexName === "memory_items_embedding_1536"
  ) {
    return {};
  }

  return {
    p_embedding_provider: metadata.embeddingProvider,
    p_embedding_model: metadata.embeddingModel,
    p_embedding_index_name: metadata.embeddingIndexName,
  };
}

export function assertActiveEmbeddingVector(vector: number[]): number[] {
  if (vector.length !== ACTIVE_EMBEDDING_DIMENSION) {
    throw new EmbeddingDimensionMismatchError(ACTIVE_EMBEDDING_DIMENSION, vector.length);
  }
  return vector;
}

export function metadataForActiveEmbedding(vector: number[] | null | undefined): EmbeddingMetadata | null {
  if (!vector) return null;
  assertActiveEmbeddingVector(vector);
  return activeEmbeddingMetadata();
}

export function isEmbeddingDimensionMismatch(error: unknown): error is EmbeddingDimensionMismatchError {
  return error instanceof EmbeddingDimensionMismatchError;
}

export async function generateEmbedding(
  text: string,
  apiKey?: string,
  options: { useCase?: EmbeddingUseCase } = {}
): Promise<number[]> {
  const provider = ACTIVE_EMBEDDING_PROVIDER;
  const model = ACTIVE_EMBEDDING_MODEL;
  const dimension = ACTIVE_EMBEDDING_DIMENSION;
  const key = resolveEmbeddingApiKey(apiKey, provider);

  if (!key) {
    return deterministicPseudoEmbedding(text, dimension);
  }

  if (provider === "openai") {
    return generateOpenAIEmbedding(text, key, model);
  }

  return generateGeminiEmbedding(
    prepareGeminiEmbeddingInput(text, options.useCase ?? "document", model),
    key,
    model,
    dimension
  );
}

/**
 * Generates embeddings for multiple texts.
 * OpenAI gets native batch mode; Gemini currently uses per-text calls to keep API shape stable.
 */
export async function generateEmbeddings(
  texts: string[],
  apiKey?: string,
  options: { useCase?: EmbeddingUseCase } = {}
): Promise<number[][]> {
  if (texts.length === 0) return [];

  const provider = ACTIVE_EMBEDDING_PROVIDER;
  const key = resolveEmbeddingApiKey(apiKey, provider);
  if (!key) {
    return texts.map((t) => deterministicPseudoEmbedding(t, ACTIVE_EMBEDDING_DIMENSION));
  }

  if (provider === "openai") {
    return generateOpenAIEmbeddings(texts, key, ACTIVE_EMBEDDING_MODEL);
  }

  return Promise.all(
    texts.map((text) => generateGeminiEmbedding(
      prepareGeminiEmbeddingInput(text, options.useCase ?? "document", ACTIVE_EMBEDDING_MODEL),
      key,
      ACTIVE_EMBEDDING_MODEL,
      ACTIVE_EMBEDDING_DIMENSION
    ))
  );
}

/**
 * Splits a long text into overlapping chunks suitable for embedding.
 * Chunk size and overlap are in approximate characters.
 */
export function chunkText(
  text: string,
  chunkSize = 1200,
  overlap = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 20) chunks.push(chunk);
    if (end >= text.length) break;
    start += chunkSize - overlap;
  }

  return chunks;
}

async function generateOpenAIEmbedding(
  text: string,
  apiKey: string,
  model: string
): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: text.slice(0, 8000),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Embedding generation failed: ${response.status} ${error}`);
  }

  const data = (await response.json()) as { data: Array<{ embedding: number[] }> };
  return data.data[0]?.embedding ?? [];
}

async function generateOpenAIEmbeddings(
  texts: string[],
  apiKey: string,
  model: string
): Promise<number[][]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: texts.map((text) => text.slice(0, 8000)),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Batch embedding failed: ${response.status} ${error}`);
  }

  const data = (await response.json()) as {
    data: Array<{ index: number; embedding: number[] }>;
  };

  return data.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}

async function generateGeminiEmbedding(
  text: string,
  apiKey: string,
  model: string,
  outputDimension: number
): Promise<number[]> {
  const response = await fetch(buildGeminiEmbedUrl(model), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(buildGeminiEmbedRequestBody(text, model, outputDimension)),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini embedding failed: ${response.status} ${error}`);
  }

  const data = (await response.json()) as GeminiEmbeddingResponse;
  return parseGeminiEmbedding(data);
}

function buildGeminiEmbedUrl(rawModel: string) {
  const model = normalizeGeminiModel(rawModel);
  return `https://generativelanguage.googleapis.com/v1beta/${model}:embedContent`;
}

export function buildGeminiEmbedRequestBody(text: string, model: string, outputDimension: number) {
  return {
    model: normalizeGeminiModel(model),
    content: { parts: [{ text: text.slice(0, 8000) }] },
    embedContentConfig: {
      outputDimensionality: outputDimension,
    },
  };
}

function parseGeminiEmbedding(response: GeminiEmbeddingResponse): number[] {
  if (Array.isArray(response.embedding?.values)) {
    return response.embedding.values;
  }

  if (Array.isArray(response.embeddings?.[0]?.values)) {
    return response.embeddings?.[0]?.values ?? [];
  }

  if (Array.isArray(response.data?.[0]?.embedding)) {
    return response.data[0].embedding;
  }

  if (Array.isArray(response.data?.[0]?.values)) {
    return response.data[0].values;
  }

  return [];
}

function normalizeGeminiModel(model: string) {
  const trimmed = model.trim();
  return trimmed.includes("/") ? trimmed : `models/${trimmed}`;
}

function prepareGeminiEmbeddingInput(text: string, useCase: EmbeddingUseCase, model: string) {
  if (!normalizeGeminiModel(model).includes("gemini-embedding-2")) return text;
  if (useCase === "query") return `task: search result | query: ${text}`;
  return `title: none | text: ${text}`;
}

function resolveEmbeddingProvider(): EmbeddingProvider {
  const raw = process.env.EMBEDDINGS_PROVIDER?.trim().toLowerCase();
  if (raw === "gemini") return "gemini";
  return "openai";
}

function resolveEmbeddingModel() {
  if (ACTIVE_EMBEDDING_PROVIDER === "gemini") {
    return process.env.EMBEDDING_MODEL?.trim() || GEMINI_MODEL;
  }
  return process.env.EMBEDDING_MODEL?.trim() || OPENAI_MODEL;
}

function resolveEmbeddingDimension() {
  const value = Number.parseInt(process.env.EMBEDDING_DIM || `${DEFAULT_DIMENSION}`, 10);
  return Number.isInteger(value) && value > 0 ? value : DEFAULT_DIMENSION;
}

function resolveEmbeddingBackfillVersion() {
  return ACTIVE_EMBEDDING_PROVIDER === "gemini" ? GEMINI_BACKFILL_VERSION : OPENAI_BACKFILL_VERSION;
}

function resolveEmbeddingApiKey(apiKey?: string, provider: EmbeddingProvider = ACTIVE_EMBEDDING_PROVIDER) {
  if (provider === "openai") {
    return apiKey?.trim() || process.env.OPENAI_API_KEY?.trim() || null;
  }

  return apiKey?.trim()
    || process.env.GEMINI_API_KEY?.trim()
    || process.env.GOOGLE_API_KEY?.trim()
    || null;
}

/**
 * Dev-only pseudo-embedding. Deterministic but not semantically meaningful.
 * Produces a unit vector derived from character code sums.
 */
function deterministicPseudoEmbedding(text: string, dim: number): number[] {
  const vec = new Array<number>(dim).fill(0);
  for (let i = 0; i < text.length; i++) {
    vec[i % dim] += text.charCodeAt(i);
  }
  const magnitude = Math.sqrt(vec.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vec.map((value) => value / magnitude);
}

type GeminiEmbeddingResponse = {
  embedding?: {
    values?: number[];
  };
  embeddings?: Array<{
    values?: number[];
  }>;
  data?: Array<{
    values?: number[];
    embedding?: number[];
  }>;
};
