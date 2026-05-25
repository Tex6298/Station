import { Router } from "express";
import { z } from "zod";
import { buildCalibrationSummary, CALIBRATION_PROMPTS } from "@station/ai/prompts/calibration";
import { requireAuth } from "../middleware/require-auth";
import { getSupabaseAdmin } from "../lib/supabase";

const startSchema = z.object({
  personaId: z.string().uuid().optional(),
  sessionTitle: z.string().max(180).optional(),
});

const messageSchema = z.object({
  content: z.string().min(1).max(12000),
});

const saveSchema = z.object({
  saveTarget: z.enum(["persona", "global", "public_mode", "other"]).default("persona"),
});

export const calibrationRouter = Router();
calibrationRouter.use(requireAuth);

function serializeSession(row: any) {
  if (!row) return row;

  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    personaId: row.persona_id,
    sessionTitle: row.session_title,
    transcript: row.transcript,
    extractedStyleNotes: row.extracted_style_notes,
    extractedPublicRules: row.extracted_public_rules,
    extractedPrivateRules: row.extracted_private_rules,
    extractedUncertaintyRules: row.extracted_uncertainty_rules,
    saveTarget: row.save_target,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function loadOwnedPersona(personaId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("personas")
    .select("id, name, owner_user_id, short_description, style_notes")
    .eq("id", personaId)
    .single();

  return data?.owner_user_id === ownerUserId ? data : null;
}

function nextPromptForTranscript(transcript: string) {
  const answered = (transcript.match(/Q:/g) || []).length;
  return CALIBRATION_PROMPTS[answered % CALIBRATION_PROMPTS.length];
}

calibrationRouter.get("/persona/:personaId", async (req, res) => {
  const userId = req.user!.id;
  const persona = await loadOwnedPersona(req.params.personaId, userId);
  if (!persona) return res.status(404).json({ error: "Persona not found." });

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("calibration_sessions")
    .select("*")
    .eq("persona_id", persona.id)
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ sessions: (data ?? []).map(serializeSession), prompts: CALIBRATION_PROMPTS });
});

calibrationRouter.get("/:id", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("calibration_sessions")
    .select("*")
    .eq("id", req.params.id)
    .eq("owner_user_id", req.user!.id)
    .single();

  if (error || !data) return res.status(404).json({ error: "Calibration session not found." });
  return res.json({ session: serializeSession(data), prompts: CALIBRATION_PROMPTS });
});

calibrationRouter.post("/start", async (req, res) => {
  const parsed = startSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const userId = req.user!.id;
  const persona = parsed.data.personaId ? await loadOwnedPersona(parsed.data.personaId, userId) : null;
  if (parsed.data.personaId && !persona) return res.status(404).json({ error: "Persona not found." });

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("calibration_sessions")
    .insert({
      owner_user_id: userId,
      persona_id: persona?.id ?? null,
      session_title: parsed.data.sessionTitle || `${persona?.name ?? "General"} integrity session`,
      transcript: "",
      extracted_style_notes: null,
      extracted_public_rules: null,
      extracted_private_rules: null,
      extracted_uncertainty_rules: null,
      save_target: "persona",
    })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({
    session: serializeSession(data),
    prompts: CALIBRATION_PROMPTS,
    nextPrompt: CALIBRATION_PROMPTS[0],
  });
});

calibrationRouter.post("/:id/message", async (req, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const { data: session, error: loadError } = await sb
    .from("calibration_sessions")
    .select("*")
    .eq("id", req.params.id)
    .eq("owner_user_id", req.user!.id)
    .single();

  if (loadError || !session) return res.status(404).json({ error: "Calibration session not found." });

  const currentPrompt = nextPromptForTranscript(session.transcript || "");
  const addition = `Q: ${currentPrompt.prompt}\nA: ${parsed.data.content}`;
  const transcript = session.transcript ? `${session.transcript}\n\n${addition}` : addition;
  const summary = buildCalibrationSummary(transcript);

  const { data, error } = await sb
    .from("calibration_sessions")
    .update({
      transcript,
      extracted_style_notes: summary.styleNotes || null,
      extracted_public_rules: summary.publicRules || null,
      extracted_private_rules: summary.privateRules || null,
      extracted_uncertainty_rules: summary.uncertaintyRules || null,
    })
    .eq("id", session.id)
    .eq("owner_user_id", req.user!.id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ session: serializeSession(data), nextPrompt: nextPromptForTranscript(transcript) });
});

calibrationRouter.post("/:id/save", async (req, res) => {
  const parsed = saveSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const { data: session, error: loadError } = await sb
    .from("calibration_sessions")
    .select("*")
    .eq("id", req.params.id)
    .eq("owner_user_id", req.user!.id)
    .single();

  if (loadError || !session) return res.status(404).json({ error: "Calibration session not found." });

  const { data, error } = await sb
    .from("calibration_sessions")
    .update({ save_target: parsed.data.saveTarget })
    .eq("id", session.id)
    .eq("owner_user_id", req.user!.id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });

  if (session.persona_id && parsed.data.saveTarget === "persona") {
    const { data: persona } = await sb
      .from("personas")
      .select("id, short_description, style_notes, owner_user_id")
      .eq("id", session.persona_id)
      .single();

    if (persona?.owner_user_id === req.user!.id) {
      const styleNotes = [persona.style_notes, session.extracted_style_notes]
        .filter(Boolean)
        .join("\n\n")
        .slice(0, 4000);
      const shortDescription = [persona.short_description, session.extracted_private_rules]
        .filter(Boolean)
        .join(" | ")
        .slice(0, 300);

      await sb
        .from("personas")
        .update({
          ...(styleNotes && { style_notes: styleNotes }),
          ...(shortDescription && { short_description: shortDescription }),
        })
        .eq("id", persona.id)
        .eq("owner_user_id", req.user!.id);
    }
  }

  return res.json({ session: serializeSession(data), saved: true });
});
