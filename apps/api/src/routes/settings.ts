import { Router } from "express";
import { z } from "zod";
import { getSupabaseAdmin } from "../lib/supabase";
import { requireAuth } from "../middleware/require-auth";

const SUPPORTED_BYOK_PROVIDERS = ["openai", "anthropic", "deepseek"] as const;
type SupportedByokProvider = typeof SUPPORTED_BYOK_PROVIDERS[number];
type AiMode = "platform" | "byok";

const PROFILE_SELECT = "ai_mode, byok_openai_key, byok_anthropic_key, byok_deepseek_key";
const KEY_COLUMNS: Record<SupportedByokProvider, "byok_openai_key" | "byok_anthropic_key" | "byok_deepseek_key"> = {
  openai: "byok_openai_key",
  anthropic: "byok_anthropic_key",
  deepseek: "byok_deepseek_key",
};

const keyInputSchema = z.string().max(4096).transform((value) => value.trim()).refine(
  (value) => value.length >= 8,
  "Provider keys must be at least 8 characters."
);

const keyPatchSchema = z.object({
  openai: keyInputSchema.optional(),
  anthropic: keyInputSchema.optional(),
  deepseek: keyInputSchema.optional(),
}).strict();

const clearKeysSchema = z.object({
  openai: z.boolean().optional(),
  anthropic: z.boolean().optional(),
  deepseek: z.boolean().optional(),
}).strict();

const aiProviderSettingsSchema = z.object({
  aiMode: z.enum(["platform", "byok"]).optional(),
  keys: keyPatchSchema.optional(),
  clearKeys: clearKeysSchema.optional(),
}).strict().superRefine((value, ctx) => {
  const keys = value.keys ?? {};
  const clearKeys = value.clearKeys ?? {};
  if (value.aiMode === undefined && Object.keys(keys).length === 0 && !Object.values(clearKeys).some(Boolean)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one AI provider setting must be supplied.",
    });
  }

  for (const provider of SUPPORTED_BYOK_PROVIDERS) {
    if (keys[provider] !== undefined && clearKeys[provider]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["clearKeys", provider],
        message: "Set or clear a provider key, not both.",
      });
    }
  }
});

type ProfileAiSettingsRow = {
  ai_mode?: AiMode | null;
  byok_openai_key?: string | null;
  byok_anthropic_key?: string | null;
  byok_deepseek_key?: string | null;
};

export const settingsRouter = Router();

settingsRouter.use(requireAuth);

settingsRouter.get("/ai-provider", async (req, res) => {
  try {
    const settings = await loadAiProviderSettings(req.user!.id);
    return res.json({ settings });
  } catch {
    return res.status(500).json({ error: "Could not load AI provider settings." });
  }
});

settingsRouter.patch("/ai-provider", async (req, res) => {
  const parsed = aiProviderSettingsSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const updates: Record<string, string | null> = {};
  if (parsed.data.aiMode) updates.ai_mode = parsed.data.aiMode;

  for (const provider of SUPPORTED_BYOK_PROVIDERS) {
    const value = parsed.data.keys?.[provider];
    if (value !== undefined) updates[KEY_COLUMNS[provider]] = value;
    if (parsed.data.clearKeys?.[provider]) updates[KEY_COLUMNS[provider]] = null;
  }

  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("profiles")
      .update(updates)
      .eq("id", req.user!.id)
      .select(PROFILE_SELECT)
      .single();

    if (error || !data) {
      return res.status(500).json({ error: "Could not save AI provider settings." });
    }

    return res.json({ settings: serializeAiProviderSettings(data as ProfileAiSettingsRow) });
  } catch {
    return res.status(500).json({ error: "Could not save AI provider settings." });
  }
});

async function loadAiProviderSettings(userId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .single();

  if (error || !data) throw new Error("Could not load AI provider settings.");
  return serializeAiProviderSettings(data as ProfileAiSettingsRow);
}

function serializeAiProviderSettings(row: ProfileAiSettingsRow) {
  const aiMode: AiMode = row.ai_mode === "byok" ? "byok" : "platform";
  return {
    aiMode,
    supportedProviders: SUPPORTED_BYOK_PROVIDERS.map((provider) => {
      const key = row[KEY_COLUMNS[provider]];
      const lastFour = keyLastFour(key);
      return {
        provider,
        label: providerLabel(provider),
        configured: Boolean(key?.trim()),
        keyLastFour: lastFour,
      };
    }),
    policy: {
      platform: "Station platform mode uses the configured Station provider route.",
      byok: "BYOK mode uses the stored owner key for personas set to OpenAI, Anthropic, or DeepSeek.",
      gemini: "Gemini remains embeddings-only and deferred for private chat.",
      nvidia: "Private Studio and replay chat do not use the NVIDIA platform route.",
    },
  };
}

function keyLastFour(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.length < 8) return null;
  return trimmed.slice(-4);
}

function providerLabel(provider: SupportedByokProvider) {
  switch (provider) {
    case "openai":
      return "OpenAI";
    case "anthropic":
      return "Anthropic";
    case "deepseek":
      return "DeepSeek";
  }
}
