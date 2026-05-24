import type { ChatProvider } from "./base";
import { DeepseekProvider } from "./deepseek";
import { OpenAIProvider } from "./openai";
import { AnthropicProvider } from "./anthropic";

export type ProviderName = "platform" | "openai" | "anthropic" | "deepseek" | "gemini";

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
}

/**
 * Returns the correct ChatProvider for a given persona + user config.
 * Falls back to the platform DeepSeek provider if BYOK keys are missing.
 */
export function resolveProvider(config: ProviderConfig): ChatProvider {
  const platformProvider = new DeepseekProvider({
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
