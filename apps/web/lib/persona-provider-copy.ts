import type { PersonaProvider } from "@station/types/persona";

export interface PersonaProviderChoice {
  value: PersonaProvider;
  label: string;
  description: string;
  badge?: string;
}

export const PERSONA_PROVIDER_COPY = {
  channelSubtitle: "Select the channel Station records for this persona. Use Station unless a separate provider route is already set up.",
  setupHint: "Use Station for setup now. BYOK/provider channels need a separate setup surface and are not configured in this onboarding flow.",
} as const;

export const PERSONA_PROVIDER_CHOICES: PersonaProviderChoice[] = [
  {
    value: "platform",
    label: "Station (DeepSeek)",
    description: "Station's included platform channel for initial setup.",
    badge: "Included",
  },
  {
    value: "openai",
    label: "OpenAI",
    description: "Use only when OpenAI routing is already set up outside onboarding.",
  },
  {
    value: "anthropic",
    label: "Anthropic",
    description: "Use only when Anthropic routing is already set up outside onboarding.",
  },
  {
    value: "deepseek",
    label: "DeepSeek (BYOK)",
    description: "Use only when DeepSeek BYOK routing is already set up outside onboarding.",
  },
];
