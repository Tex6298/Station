import type { ChatProvider } from "./base";
import { DeepseekProvider } from "./deepseek";
import { OpenAIProvider } from "./openai";
import { AnthropicProvider } from "./anthropic";

export type ProviderName = "platform" | "openai" | "anthropic" | "deepseek" | "gemini";
export type ChatProviderRuntimeRouteLabel =
  | "byok_openai"
  | "byok_anthropic"
  | "byok_deepseek"
  | "anthropic_platform"
  | "nvidia_openai_compatible"
  | "deepseek_fallback";

export type ChatProviderRuntimeRoute = {
  routeLabel: ChatProviderRuntimeRouteLabel;
  providerFamily: "openai" | "anthropic" | "deepseek";
  providerMode: "byok" | "platform";
  modelLabel: string;
  configured: boolean;
  missingConfig?: {
    code: "provider_config_missing";
    classification: "provider_config";
    error: string;
  };
  provider: ChatProvider | null;
};

const DEFAULT_NVIDIA_BASE_URL = "https://integrate.api.nvidia.com";
const DEFAULT_NVIDIA_MODEL = "openai/gpt-oss-120b";
const CHAT_COMPLETIONS_SUFFIX = "/chat/completions";

export interface ProviderConfig {
  /** Which provider the persona is configured to use */
  provider: ProviderName;
  /** Whether the user is in BYOK mode */
  aiMode: "platform" | "byok";
  /** User's stored BYOK keys (decrypted server-side) */
  byokOpenaiKey?: string | null;
  byokAnthropicKey?: string | null;
  byokDeepseekKey?: string | null;
  /** Platform-level keys from env */
  platformDeepseekKey?: string;
  platformDeepseekBaseUrl?: string;
  platformDeepseekModel?: string;
  platformNvidiaKey?: string;
  platformNvidiaBaseUrl?: string;
  platformNvidiaModel?: string;
  stationAnthropicKey?: string;
  stationAnthropicModel?: string;
}

export type PlatformProviderRouteLabel = "nvidia_openai_compatible" | "deepseek_fallback";

export function describePlatformProviderRoute(config: Pick<ProviderConfig, "platformNvidiaKey">): {
  label: PlatformProviderRouteLabel;
  nvidiaConfigured: boolean;
} {
  const nvidiaConfigured = Boolean(config.platformNvidiaKey?.trim());
  return {
    label: nvidiaConfigured ? "nvidia_openai_compatible" : "deepseek_fallback",
    nvidiaConfigured,
  };
}

export function resolveChatProviderRuntimeRoute(config: ProviderConfig): ChatProviderRuntimeRoute {
  if (config.aiMode === "byok") {
    const byokRoute = resolveConfiguredByokRoute(config);
    if (byokRoute) return byokRoute;
  }

  const stationAnthropicKey = config.stationAnthropicKey?.trim();
  const platformNvidiaKey = config.platformNvidiaKey?.trim();
  if (config.aiMode !== "byok" && !platformNvidiaKey && stationAnthropicKey) {
    const model = config.stationAnthropicModel?.trim() || "claude-haiku-4-5-20251001";
    return {
      routeLabel: "anthropic_platform",
      providerFamily: "anthropic",
      providerMode: "platform",
      modelLabel: model,
      configured: true,
      provider: new AnthropicProvider({ apiKey: stationAnthropicKey, model }),
    };
  }

  if (platformNvidiaKey) {
    const model = config.platformNvidiaModel?.trim() || DEFAULT_NVIDIA_MODEL;
    return {
      routeLabel: "nvidia_openai_compatible",
      providerFamily: "openai",
      providerMode: "platform",
      modelLabel: model,
      configured: true,
      provider: new OpenAIProvider({
        apiKey: platformNvidiaKey,
        baseUrl: normalizeOpenAiCompatibleBaseUrl(config.platformNvidiaBaseUrl),
        model,
      }),
    };
  }

  const deepseekKey = config.platformDeepseekKey?.trim();
  const deepseekModel = config.platformDeepseekModel?.trim() || "deepseek-chat";
  return {
    routeLabel: "deepseek_fallback",
    providerFamily: "deepseek",
    providerMode: "platform",
    modelLabel: deepseekModel,
    configured: Boolean(deepseekKey),
    missingConfig: deepseekKey ? undefined : {
      code: "provider_config_missing",
      classification: "provider_config",
      error: "No Station chat provider is configured for this request.",
    },
    provider: new DeepseekProvider({
      apiKey: config.platformDeepseekKey,
      baseUrl: config.platformDeepseekBaseUrl ?? "https://api.deepseek.com",
      model: deepseekModel,
    }),
  };
}

export function normalizeOpenAiCompatibleBaseUrl(baseUrl?: string): string {
  const trimmed = (baseUrl?.trim() || DEFAULT_NVIDIA_BASE_URL).replace(/\/+$/, "");
  if (trimmed.endsWith("/v1/chat/completions")) {
    return trimmed.slice(0, -CHAT_COMPLETIONS_SUFFIX.length);
  }
  if (trimmed.endsWith("/chat/completions")) {
    return trimmed.slice(0, -CHAT_COMPLETIONS_SUFFIX.length);
  }
  if (trimmed.endsWith("/v1")) {
    return trimmed;
  }
  return `${trimmed}/v1`;
}

function resolveConfiguredByokRoute(config: ProviderConfig): ChatProviderRuntimeRoute | null {
  switch (config.provider) {
    case "openai":
      if (config.byokOpenaiKey) {
        return {
          routeLabel: "byok_openai",
          providerFamily: "openai",
          providerMode: "byok",
          modelLabel: "gpt-4o-mini",
          configured: true,
          provider: new OpenAIProvider({ apiKey: config.byokOpenaiKey }),
        };
      }
      break;

    case "anthropic":
      if (config.byokAnthropicKey) {
        return {
          routeLabel: "byok_anthropic",
          providerFamily: "anthropic",
          providerMode: "byok",
          modelLabel: "claude-haiku-4-5",
          configured: true,
          provider: new AnthropicProvider({ apiKey: config.byokAnthropicKey }),
        };
      }
      break;

    case "deepseek":
      if (config.byokDeepseekKey) {
        return {
          routeLabel: "byok_deepseek",
          providerFamily: "deepseek",
          providerMode: "byok",
          modelLabel: "deepseek-chat",
          configured: true,
          provider: new DeepseekProvider({
            apiKey: config.byokDeepseekKey,
            baseUrl: "https://api.deepseek.com",
            model: "deepseek-chat",
          }),
        };
      }
      break;

    default:
      break;
  }

  return null;
}

/**
 * Returns the correct ChatProvider for a given persona + user config.
 * Falls back to the platform DeepSeek provider if BYOK keys are missing.
 */
export function resolveProvider(config: ProviderConfig): ChatProvider {
  const platformNvidiaKey = config.platformNvidiaKey?.trim();
  const platformProvider = describePlatformProviderRoute({ platformNvidiaKey }).label === "nvidia_openai_compatible"
    ? new OpenAIProvider({
        apiKey: platformNvidiaKey ?? "",
        baseUrl: normalizeOpenAiCompatibleBaseUrl(config.platformNvidiaBaseUrl),
        model: config.platformNvidiaModel?.trim() || DEFAULT_NVIDIA_MODEL,
      })
    : new DeepseekProvider({
        apiKey: config.platformDeepseekKey,
        baseUrl: config.platformDeepseekBaseUrl ?? "https://api.deepseek.com",
        model: config.platformDeepseekModel ?? "deepseek-chat",
      });

  if (config.aiMode !== "byok") {
    return platformProvider;
  }

  switch (config.provider) {
    case "openai":
      if (config.byokOpenaiKey) {
        return new OpenAIProvider({ apiKey: config.byokOpenaiKey });
      }
      break;

    case "anthropic":
      if (config.byokAnthropicKey) {
        return new AnthropicProvider({ apiKey: config.byokAnthropicKey });
      }
      break;

    case "deepseek":
      if (config.byokDeepseekKey) {
        return new DeepseekProvider({
          apiKey: config.byokDeepseekKey,
          baseUrl: "https://api.deepseek.com",
          model: "deepseek-chat",
        });
      }
      break;

    default:
      break;
  }

  // BYOK was requested but no key was found - fall back to platform
  return platformProvider;
}
