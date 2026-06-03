import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/require-auth";
import { getSupabaseAdmin } from "../lib/supabase";
import { addMemoryItem } from "../services/archive.service";

const createSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1).max(20000),
  summary: z.string().max(500).optional(),
  sourceType: z.enum(["chat", "import", "document", "calibration", "integrity_session", "manual"]).default("manual"),
  relevanceWeight: z.number().min(0.1).max(5).optional(),
});

export const memoryRouter = Router();
memoryRouter.use(requireAuth);

// -- List memory items for a persona ------------------------------------------
memoryRouter.get("/persona/:personaId", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data, error } = await sb
    .from("memory_items")
    .select("id, persona_id, title, content, summary, source_type, relevance_weight, created_at")
    .eq("persona_id", req.params.personaId)
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ memory: data });
});

// -- Create a memory item (generates embedding automatically) ------------------
memoryRouter.post("/persona/:personaId", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const userId = req.user!.id;
  const sb = getSupabaseAdmin();

  // Verify ownership
  const { data: persona } = await sb
    .from("personas")
    .select("id, owner_user_id")
    .eq("id", req.params.personaId)
    .single();

  if (!persona || persona.owner_user_id !== userId) {
    return res.status(404).json({ error: "Persona not found." });
  }

  try {
    const item = await addMemoryItem({
      personaId: persona.id,
      ownerUserId: userId,
      title: parsed.data.title,
      content: parsed.data.content,
      summary: parsed.data.summary,
      sourceType: parsed.data.sourceType,
      relevanceWeight: parsed.data.relevanceWeight,
    });
    return res.status(201).json({ memoryItem: item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create memory item.";
    return res.status(500).json({ error: message });
  }
});

// -- Update a memory item ------------------------------------------------------
memoryRouter.patch("/:id", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;
  const parsed = createSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data, error } = await sb
    .from("memory_items")
    .update({
      ...(parsed.data.title !== undefined && { title: parsed.data.title }),
      ...(parsed.data.content !== undefined && { content: parsed.data.content }),
      ...(parsed.data.summary !== undefined && { summary: parsed.data.summary }),
      ...(parsed.data.relevanceWeight !== undefined && { relevance_weight: parsed.data.relevanceWeight }),
    })
    .eq("id", req.params.id)
    .eq("owner_user_id", userId)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Memory item not found." });
  return res.json({ memoryItem: data });
});

// -- Delete a memory item ------------------------------------------------------
memoryRouter.delete("/:id", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { error } = await sb
    .from("memory_items")
    .delete()
    .eq("id", req.params.id)
    .eq("owner_user_id", userId);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});
