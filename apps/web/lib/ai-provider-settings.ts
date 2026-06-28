import type { AiProviderId, AiProviderReadback, AiProviderSettingsPatch, AiProviderMode } from "./api-client";

export const AI_PROVIDER_SETUP_PROVIDERS: Array<{ id: AiProviderId; label: string; placeholder: string }> = [
  { id: "openai", label: "OpenAI", placeholder: "Paste OpenAI API key" },
  { id: "anthropic", label: "Anthropic", placeholder: "Paste Anthropic API key" },
  { id: "deepseek", label: "DeepSeek", placeholder: "Paste DeepSeek API key" },
];

export const AI_PROVIDER_SETTINGS_COPY = {
  title: "AI provider",
  summary: "Use Station platform routing by default, or BYOK for personas set to OpenAI, Anthropic, or DeepSeek.",
  platform: "Platform mode uses the Station provider route configured on the API service.",
  byok: "BYOK mode uses your stored owner key for matching persona provider choices. Raw keys are never shown back in Settings.",
  gemini: "Gemini remains embeddings-only and deferred for private chat.",
  nvidia: "Private Studio and replay chat do not use the NVIDIA platform route.",
} as const;

export function configuredKeyLabel(readback?: Pick<AiProviderReadback, "configured" | "keyLastFour"> | null) {
  if (!readback?.configured) return "Not configured";
  return readback.keyLastFour ? `Configured, ending ${readback.keyLastFour}` : "Configured";
}

export function buildAiProviderSettingsPatch(input: {
  aiMode: AiProviderMode;
  keyInputs: Partial<Record<AiProviderId, string>>;
  clearKeys: Partial<Record<AiProviderId, boolean>>;
}): AiProviderSettingsPatch {
  const keys = Object.fromEntries(
    AI_PROVIDER_SETUP_PROVIDERS
      .map(({ id }) => [id, input.keyInputs[id]?.trim()] as const)
      .filter(([, value]) => Boolean(value))
  ) as Partial<Record<AiProviderId, string>>;

  const clearKeys = Object.fromEntries(
    AI_PROVIDER_SETUP_PROVIDERS
      .map(({ id }) => [id, input.clearKeys[id] === true] as const)
      .filter(([, value]) => value)
  ) as Partial<Record<AiProviderId, boolean>>;

  return {
    aiMode: input.aiMode,
    ...(Object.keys(keys).length > 0 ? { keys } : {}),
    ...(Object.keys(clearKeys).length > 0 ? { clearKeys } : {}),
  };
}
