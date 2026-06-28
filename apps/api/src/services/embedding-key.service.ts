import { env } from "../lib/env";

type EmbeddingKeyProfile = {
  byok_openai_key?: string | null;
  byokOpenaiKey?: string | null;
};

type EmbeddingProvider = "openai" | "gemini";
export type EmbeddingProfileCode = "station_free_1536" | "openai_1536";

function hasValue(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function firstValue(...values: Array<string | null | undefined>) {
  return values.find(hasValue)?.trim() ?? null;
}

export function resolveActiveEmbeddingProfileCode(): EmbeddingProfileCode {
  const explicitProfile = process.env.EMBEDDING_PROFILE_CODE?.trim().toLowerCase();
  if (explicitProfile === "openai_1536") return "openai_1536";
  if (explicitProfile === "station_free_1536") return "station_free_1536";

  const legacyProvider = process.env.EMBEDDINGS_PROVIDER?.trim().toLowerCase() ?? env.EMBEDDINGS_PROVIDER;
  if (legacyProvider === "openai") return "openai_1536";
  if (legacyProvider === "gemini") return "station_free_1536";

  return env.EMBEDDING_PROFILE_CODE;
}

export function resolveActiveEmbeddingProvider(): EmbeddingProvider {
  return resolveActiveEmbeddingProfileCode() === "openai_1536" ? "openai" : "gemini";
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

  return firstValue(profile?.byokOpenaiKey, profile?.byok_openai_key, env.OPENAI_API_KEY, process.env.OPENAI_API_KEY);
}
