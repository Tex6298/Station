import type { PersonaProvider } from "@station/types/persona";

export interface PersonaProviderChoice {
  value: PersonaProvider;
  label: string;
  description: string;
  badge?: string;
}

export const PERSONA_PROVIDER_COPY = {
  channelSubtitle: "Select the channel Station records for this persona. Platform mode lets Station choose the configured route; BYOK mode uses a matching Settings key.",
  setupHint: "Use Settings AI provider to add OpenAI, Anthropic, or DeepSeek BYOK keys before choosing those channels. Gemini chat is deferred.",
} as const;

export const PERSONA_PROVIDER_CHOICES: PersonaProviderChoice[] = [
  {
    value: "platform",
    label: "Station platform",
    description: "Station's managed platform route for initial setup.",
    badge: "Included",
  },
  {
    value: "openai",
    label: "OpenAI",
    description: "Use with OpenAI BYOK in Settings; platform mode still uses Station routing.",
  },
  {
    value: "anthropic",
    label: "Anthropic",
    description: "Use with Anthropic BYOK in Settings; platform mode still uses Station routing.",
  },
  {
    value: "deepseek",
    label: "DeepSeek (BYOK)",
    description: "Use with DeepSeek BYOK in Settings; platform mode still uses Station routing.",
  },
];
