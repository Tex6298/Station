import { Router } from "express";
import { z } from "zod";
import { getSupabaseAdmin } from "../lib/supabase";
import { requireAuth } from "../middleware/require-auth";
import {
  AiProviderKeyStorageError,
  SUPPORTED_AI_BYOK_PROVIDERS,
  loadAiProviderReadbacks,
  revokeAiProviderKey,
  rotateAiProviderKey,
  type LegacyAiProviderProfile,
  type SupportedAiByokProvider,
} from "../services/ai-provider-key.service";

type AiMode = "platform" | "byok";

const PROFILE_SELECT = "ai_mode, byok_openai_key, byok_anthropic_key, byok_deepseek_key";

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

  for (const provider of SUPPORTED_AI_BYOK_PROVIDERS) {
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

type NotificationPreferencesRow = {
  owner_user_id: string;
  forum_reply_notifications_enabled: boolean;
  created_at?: string;
  updated_at?: string;
};

const notificationPreferencesSchema = z.object({
  forumReplyNotificationsEnabled: z.boolean({
    required_error: "Forum reply notification preference must be true or false.",
    invalid_type_error: "Forum reply notification preference must be true or false.",
  }),
}).strict();

export const settingsRouter = Router();

settingsRouter.use(requireAuth);

settingsRouter.get("/notifications", async (req, res) => {
  try {
    const settings = await loadNotificationPreferences(req.user!.id);
    return res.json({ settings });
  } catch {
    return res.status(500).json({
      error: "Could not load notification preferences.",
      code: "notification_preferences_load_failed",
    });
  }
});

settingsRouter.patch("/notifications", async (req, res) => {
  const parsed = notificationPreferencesSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({
      error: "Forum reply notification preference must be true or false.",
      code: "invalid_forum_reply_notification_preference",
    });
  }

  try {
    const settings = await saveNotificationPreferences(
      req.user!.id,
      parsed.data.forumReplyNotificationsEnabled
    );
    return res.json({ settings });
  } catch {
    return res.status(500).json({
      error: "Could not save notification preferences.",
      code: "notification_preferences_save_failed",
    });
  }
});

settingsRouter.get("/ai-provider", async (req, res) => {
  try {
    const profile = await loadAiProviderProfile(req.user!.id);
    const settings = await loadAiProviderSettings(req.user!.id, profile);
    return res.json({ settings });
  } catch {
    return res.status(500).json({ error: "Could not load AI provider settings." });
  }
});

settingsRouter.patch("/ai-provider", async (req, res) => {
  const parsed = aiProviderSettingsSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const userId = req.user!.id;
    const profile = await loadAiProviderProfile(userId);

    for (const provider of SUPPORTED_AI_BYOK_PROVIDERS) {
      const value = parsed.data.keys?.[provider];
      if (value !== undefined) {
        await rotateAiProviderKey({
          ownerUserId: userId,
          provider,
          rawKey: value,
          legacyProfile: profile,
        });
        clearLegacyProfileValue(profile, provider);
      }

      if (parsed.data.clearKeys?.[provider]) {
        await revokeAiProviderKey({ ownerUserId: userId, provider });
        clearLegacyProfileValue(profile, provider);
      }
    }

    if (parsed.data.aiMode) {
      await updateAiMode(userId, parsed.data.aiMode);
      profile.ai_mode = parsed.data.aiMode;
    }

    const settings = await loadAiProviderSettings(userId, await loadAiProviderProfile(userId));
    return res.json({ settings });
  } catch (error) {
    if (error instanceof AiProviderKeyStorageError && error.code === "ai_provider_key_encryption_unconfigured") {
      return res.status(503).json({
        error: "AI provider key encryption is not configured.",
        code: "ai_provider_key_encryption_unconfigured",
      });
    }
    return res.status(500).json({ error: "Could not save AI provider settings." });
  }
});

async function loadAiProviderProfile(userId: string): Promise<ProfileAiSettingsRow> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .single();

  if (error || !data) throw new Error("Could not load AI provider settings.");
  return data as ProfileAiSettingsRow;
}

async function updateAiMode(userId: string, aiMode: AiMode) {
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("profiles")
    .update({ ai_mode: aiMode })
    .eq("id", userId);

  if (error) throw new Error("Could not save AI provider settings.");
}

async function loadAiProviderSettings(userId: string, profile: ProfileAiSettingsRow) {
  const aiMode: AiMode = profile.ai_mode === "byok" ? "byok" : "platform";
  const readbacks = await loadAiProviderReadbacks(userId, profile);
  return {
    aiMode,
    supportedProviders: readbacks,
    policy: {
      platform: "Station platform mode uses the configured Station provider route.",
      byok: "BYOK mode uses the stored owner key for personas set to OpenAI, Anthropic, or DeepSeek.",
      gemini: "Gemini remains embeddings-only and deferred for private chat.",
      nvidia: "Private Studio and replay chat do not use the NVIDIA platform route.",
    },
  };
}

function clearLegacyProfileValue(profile: LegacyAiProviderProfile, provider: SupportedAiByokProvider) {
  switch (provider) {
    case "openai":
      profile.byok_openai_key = null;
      return;
    case "anthropic":
      profile.byok_anthropic_key = null;
      return;
    case "deepseek":
      profile.byok_deepseek_key = null;
      return;
  }
}

async function loadNotificationPreferences(userId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_notification_preferences")
    .select("forum_reply_notifications_enabled")
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (error) throw new Error("Could not load notification preferences.");
  return serializeNotificationPreferences(data as Pick<NotificationPreferencesRow, "forum_reply_notifications_enabled"> | null);
}

async function saveNotificationPreferences(userId: string, enabled: boolean) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_notification_preferences")
    .upsert({
      owner_user_id: userId,
      forum_reply_notifications_enabled: enabled,
    }, { onConflict: "owner_user_id" })
    .select("forum_reply_notifications_enabled")
    .single();

  if (error || !data || typeof data.forum_reply_notifications_enabled !== "boolean") {
    throw new Error("Could not save notification preferences.");
  }

  return serializeNotificationPreferences(data as Pick<NotificationPreferencesRow, "forum_reply_notifications_enabled">);
}

function serializeNotificationPreferences(row: Pick<NotificationPreferencesRow, "forum_reply_notifications_enabled"> | null) {
  return {
    forumReplyNotificationsEnabled: row?.forum_reply_notifications_enabled ?? true,
  };
}
