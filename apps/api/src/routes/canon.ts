import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/require-auth";
import { getSupabaseAdmin } from "../lib/supabase";

const createSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1).max(10000),
  sourceType: z.enum(["chat", "import", "document", "calibration", "integrity_session", "manual"]).default("manual"),
  priority: z.number().int().min(1).max(10).optional(),
});

export const canonRouter = Router();
canonRouter.use(requireAuth);

// -- List canon items for a persona --------------------------------------------
canonRouter.get("/persona/:personaId", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data, error } = await sb
    .from("canon_items")
    .select("id, persona_id, title, content, source_type, priority, created_at")
    .eq("persona_id", req.params.personaId)
    .eq("owner_user_id", userId)
    .order("priority", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ canon: data });
});

// -- Create a canon item -------------------------------------------------------
canonRouter.post("/persona/:personaId", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data: persona } = await sb
    .from("personas")
    .select("id, owner_user_id")
    .eq("id", req.params.personaId)
    .single();

  if (!persona || persona.owner_user_id !== userId) {
    return res.status(404).json({ error: "Persona not found." });
  }

  const { data, error } = await sb
    .from("canon_items")
    .insert({
      persona_id: persona.id,
      owner_user_id: userId,
      title: parsed.data.title ?? null,
      content: parsed.data.content,
      source_type: parsed.data.sourceType,
      priority: parsed.data.priority ?? 1,
    })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ canonItem: data });
});

// -- Update a canon item -------------------------------------------------------
canonRouter.patch("/:id", async (req, res) => {
  const parsed = createSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data, error } = await sb
    .from("canon_items")
    .update({
      ...(parsed.data.title !== undefined && { title: parsed.data.title }),
      ...(parsed.data.content !== undefined && { content: parsed.data.content }),
      ...(parsed.data.priority !== undefined && { priority: parsed.data.priority }),
    })
    .eq("id", req.params.id)
    .eq("owner_user_id", userId)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Canon item not found." });
  return res.json({ canonItem: data });
});

// -- Delete a canon item -------------------------------------------------------
canonRouter.delete("/:id", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { error } = await sb
    .from("canon_items")
    .delete()
    .eq("id", req.params.id)
    .eq("owner_user_id", userId);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});
