/**
 * Text embedding generation.
 * Uses OpenAI text-embedding-3-small (~$0.02 / 1M tokens).
 *
 * For platform mode: uses OPENAI_API_KEY env var (set in API).
 * For BYOK mode: uses the user's own OpenAI key.
 *
 * Falls back to a simple hash-based pseudo-embedding in dev/test
 * when no API key is available (NOT suitable for production search).
 */

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIM = 1536;

export async function generateEmbedding(
  text: string,
  apiKey?: string
): Promise<number[]> {
  const key = apiKey ?? process.env.OPENAI_API_KEY;

  if (!key) {
    // Dev fallback: deterministic pseudo-embedding (no semantic meaning)
    return deterministicPseudoEmbedding(text, EMBEDDING_DIM);
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.slice(0, 8000), // max safe input length
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Embedding generation failed: ${response.status} ${error}`);
  }

  const data = (await response.json()) as {
    data: Array<{ embedding: number[] }>;
  };

  return data.data[0].embedding;
}

/**
 * Generates embeddings for multiple texts in a single API call.
 * More efficient than calling generateEmbedding in a loop.
 */
export async function generateEmbeddings(
  texts: string[],
  apiKey?: string
): Promise<number[][]> {
  if (texts.length === 0) return [];

  const key = apiKey ?? process.env.OPENAI_API_KEY;

  if (!key) {
    return Promise.all(
      texts.map((t) => deterministicPseudoEmbedding(t, EMBEDDING_DIM))
    );
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts.map((t) => t.slice(0, 8000)),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Batch embedding failed: ${response.status} ${error}`);
  }

  const data = (await response.json()) as {
    data: Array<{ index: number; embedding: number[] }>;
  };

  // Return in original order
  return data.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
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
  // Normalise to unit length
  const magnitude = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / magnitude);
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
    if (chunk.length > 20) {
      chunks.push(chunk);
    }
    if (end >= text.length) break;
    start += chunkSize - overlap;
  }

  return chunks;
}
