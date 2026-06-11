import { env } from "../lib/env";

type EmbeddingKeyProfile = {
  byok_openai_key?: string | null;
};

type EmbeddingProvider = "openai" | "gemini";

function hasValue(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function firstValue(...values: Array<string | null | undefined>) {
  return values.find(hasValue)?.trim() ?? null;
}

export function resolveActiveEmbeddingProvider(): EmbeddingProvider {
  const explicitProfile = process.env.EMBEDDING_PROFILE_CODE?.trim();
  if (explicitProfile === "openai_1536") return "openai";
  if (explicitProfile === "station_free_1536") return "gemini";

  if (env.EMBEDDINGS_PROVIDER === "openai") return "openai";
  if (env.EMBEDDINGS_PROVIDER === "gemini") return "gemini";

  return env.EMBEDDING_PROFILE_CODE === "openai_1536" ? "openai" : "gemini";
}

export function resolveEmbeddingApiKey(profile?: EmbeddingKeyProfile | null) {
  if (resolveActiveEmbeddingProvider() === "gemini") {
    return firstValue(
      env.GEMINI_API_KEY,
      env.GOOGLE_API_KEY,
      process.env.GEMINI_API_KEY,
      process.env.GOOGLE_API_KEY
    );
  }

  return firstValue(profile?.byok_openai_key, env.OPENAI_API_KEY, process.env.OPENAI_API_KEY);
}
