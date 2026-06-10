import { env } from "../lib/env";

type EmbeddingKeyProfile = {
  byok_openai_key?: string | null;
};

function hasValue(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function firstValue(...values: Array<string | null | undefined>) {
  return values.find(hasValue)?.trim() ?? null;
}

export function resolveEmbeddingApiKey(profile?: EmbeddingKeyProfile | null) {
  if (env.EMBEDDINGS_PROVIDER === "gemini") {
    return firstValue(
      env.GEMINI_API_KEY,
      env.GOOGLE_API_KEY,
      process.env.GEMINI_API_KEY,
      process.env.GOOGLE_API_KEY
    );
  }

  return firstValue(profile?.byok_openai_key, env.OPENAI_API_KEY, process.env.OPENAI_API_KEY);
}
