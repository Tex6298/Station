export type ChatErrorMetadata = {
  message: string;
  code?: string;
  classification?: string;
};

export type PrivateProviderSetupNotice = {
  title: string;
  body: string;
  href: string;
  actionLabel: string;
  supportedProviders: readonly string[];
};

export const PRIVATE_PROVIDER_SETUP_HREF = "/settings#ai-provider";
export const PRIVATE_PROVIDER_SETUP_PROVIDERS = ["OpenAI", "Anthropic", "DeepSeek"] as const;

export function chatErrorMetadata(error: unknown, fallback = "Message failed."): ChatErrorMetadata {
  const maybeObject = error && typeof error === "object" ? error as Record<string, unknown> : null;
  const message = error instanceof Error
    ? error.message
    : typeof maybeObject?.message === "string"
      ? maybeObject.message
      : fallback;

  return {
    message,
    code: typeof maybeObject?.code === "string" ? maybeObject.code : undefined,
    classification: typeof maybeObject?.classification === "string" ? maybeObject.classification : undefined,
  };
}

export function privateProviderSetupNoticeFromChatError(error: unknown): PrivateProviderSetupNotice | null {
  const metadata = chatErrorMetadata(error);
  const isMissingAcceptedProvider =
    metadata.classification === "provider_config" ||
    metadata.code === "provider_config_missing" ||
    metadata.code === "provider_policy_blocked";

  if (!isMissingAcceptedProvider) return null;

  return {
    title: "Private chat needs an accepted provider",
    body: "Add an owner provider in Settings for OpenAI, Anthropic, or DeepSeek. Gemini stays embeddings-only, and NVIDIA is not available for private Studio or replay chat.",
    href: PRIVATE_PROVIDER_SETUP_HREF,
    actionLabel: "Open AI Provider settings",
    supportedProviders: PRIVATE_PROVIDER_SETUP_PROVIDERS,
  };
}
