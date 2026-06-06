import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/require-auth";
import { requireTier } from "../middleware/require-tier";
import { getSupabaseAdmin } from "../lib/supabase";
import { canCreatePersona } from "@station/auth/permissions";
import type { AuthUser } from "@station/types";

const createSchema = z.object({
  name: z.string().min(1).max(80),
  shortDescription: z.string().max(300).optional(),
  longDescription: z.string().max(5000).optional(),
  visibility: z.enum(["private", "public"]).default("private"),
  provider: z.enum(["platform", "openai", "anthropic", "deepseek", "gemini"]).default("platform"),
  awakeningPrompt: z.string().max(4000).optional(),
  styleNotes: z.string().max(4000).optional(),
});

const updateSchema = createSchema.extend({
  skipIntegrityPreflight: z.boolean().optional(),
}).partial();

export const personasRouter = Router();
personasRouter.use(requireAuth);

function serializePersona(row: any, continuity?: any) {
  if (!row) return row;

  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    name: row.name,
    shortDescription: row.short_description,
    longDescription: row.long_description,
    visibility: row.visibility,
    provider: row.provider,
    avatarUrl: row.avatar_url,
    awakeningPrompt: row.awakening_prompt,
    styleNotes: row.style_notes,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    continuity,
  };
}

async function loadContinuitySummary(personaId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();

  const [memory, canon, files, integritySessions, calibrationSessions] = await Promise.all([
    sb
      .from("memory_items")
      .select("id, created_at", { count: "exact", head: true })
      .eq("persona_id", personaId)
      .eq("owner_user_id", ownerUserId),
    sb
      .from("canon_items")
      .select("id, created_at", { count: "exact", head: true })
      .eq("persona_id", personaId)
      .eq("owner_user_id", ownerUserId),
    sb
      .from("persona_files")
      .select("id, created_at", { count: "exact", head: true })
      .eq("persona_id", personaId)
      .eq("owner_user_id", ownerUserId),
    (sb as any)
      .from("integrity_sessions")
      .select("id, created_at", { count: "exact", head: true })
      .eq("persona_id", personaId)
      .eq("owner_user_id", ownerUserId),
    sb
      .from("calibration_sessions")
      .select("id, created_at", { count: "exact", head: true })
      .eq("persona_id", personaId)
      .eq("owner_user_id", ownerUserId),
  ]);

  return {
    memoryCount: memory.count ?? 0,
    canonCount: canon.count ?? 0,
    archiveFileCount: files.count ?? 0,
    integritySessionCount: (integritySessions.count ?? 0) + (calibrationSessions.count ?? 0),
  };
}

// -- List user's personas ------------------------------------------------------
personasRouter.get("/", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("personas")
    .select("id, name, short_description, visibility, provider, avatar_url, sort_order, created_at")
    .eq("owner_user_id", req.user!.id)
    .order("sort_order", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ personas: (data ?? []).map((row) => serializePersona(row)) });
});

// -- Get a single persona ------------------------------------------------------
personasRouter.get("/:id", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("personas")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ error: "Persona not found." });

  const isOwner = data.owner_user_id === req.user!.id;
  if (!isOwner && data.visibility === "private") {
    return res.status(403).json({ error: "Not authorised." });
  }

  const continuity = isOwner ? await loadContinuitySummary(data.id, req.user!.id) : null;
  return res.json({ persona: serializePersona(data, continuity) });
});

// -- Create a persona (requires private tier minimum) --------------------------
personasRouter.post("/", requireTier("private"), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  // Check persona count limit for this tier
  const { count } = await sb
    .from("personas")
    .select("id", { count: "exact", head: true })
    .eq("owner_user_id", userId);

  const authUser: AuthUser = { id: userId, tier: req.user!.tier, isAdmin: req.user!.isAdmin };
  if (!canCreatePersona(authUser, count ?? 0)) {
    return res.status(403).json({
      error: `You have reached the persona limit for your tier (${req.user!.tier}). Upgrade to create more.`,
    });
  }

  const { data, error } = await sb
    .from("personas")
    .insert({
      owner_user_id: userId,
      name: parsed.data.name,
      short_description: parsed.data.shortDescription ?? null,
      long_description: parsed.data.longDescription ?? null,
      visibility: parsed.data.visibility,
      provider: parsed.data.provider,
      awakening_prompt: parsed.data.awakeningPrompt ?? null,
      style_notes: parsed.data.styleNotes ?? null,
      sort_order: count ?? 0,
    })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ persona: serializePersona(data) });
});

// -- Update a persona ----------------------------------------------------------
personasRouter.patch("/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();

  const { data: existing } = await sb
    .from("personas")
    .select("id, name, owner_user_id, visibility")
    .eq("id", req.params.id)
    .single();

  if (!existing || existing.owner_user_id !== req.user!.id) {
    return res.status(404).json({ error: "Persona not found." });
  }

  if (
    parsed.data.visibility === "public" &&
    existing.visibility !== "public" &&
    !parsed.data.skipIntegrityPreflight
  ) {
    const { count } = await (sb as any)
      .from("integrity_sessions")
      .select("id", { count: "exact", head: true })
      .eq("persona_id", existing.id)
      .eq("owner_user_id", req.user!.id)
      .eq("status", "completed")
      .in("session_type", ["pre_publication", "initial", "periodic"]);

    if ((count ?? 0) === 0) {
      return res.status(409).json({
        error: `Before making ${existing.name} public, run a short Integrity Session or retry with skipIntegrityPreflight.`,
        integrityRequired: true,
        sessionType: "pre_publication",
      });
    }
  }

  const updatePayload: Record<string, unknown> = {};
  if (parsed.data.name !== undefined)             updatePayload.name = parsed.data.name;
  if (parsed.data.shortDescription !== undefined) updatePayload.short_description = parsed.data.shortDescription;
  if (parsed.data.longDescription !== undefined)  updatePayload.long_description = parsed.data.longDescription;
  if (parsed.data.visibility !== undefined)       updatePayload.visibility = parsed.data.visibility;
  if (parsed.data.provider !== undefined)         updatePayload.provider = parsed.data.provider;
  if (parsed.data.awakeningPrompt !== undefined)  updatePayload.awakening_prompt = parsed.data.awakeningPrompt;
  if (parsed.data.styleNotes !== undefined)       updatePayload.style_notes = parsed.data.styleNotes;

  const { data, error } = await sb
    .from("personas")
    .update(updatePayload)
    .eq("id", req.params.id)
    .eq("owner_user_id", req.user!.id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Persona not found." });
  return res.json({ persona: serializePersona(data) });
});

// -- Delete a persona ----------------------------------------------------------
personasRouter.delete("/:id", async (req, res) => {
  const sb = getSupabaseAdmin();

  const { error } = await sb
    .from("personas")
    .delete()
    .eq("id", req.params.id)
    .eq("owner_user_id", req.user!.id);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});
