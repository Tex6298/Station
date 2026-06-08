import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/require-auth";
import { getSupabaseAdmin } from "../lib/supabase";
import { addMemoryItem } from "../services/archive.service";
import { recordPersonaLifecycleEvent } from "../services/persona-lifecycle.service";

const createSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1).max(20000),
  summary: z.string().max(500).optional(),
  sourceType: z.enum(["chat", "import", "document", "calibration", "integrity_session", "manual"]).default("manual"),
  relevanceWeight: z.number().min(0.1).max(5).optional(),
});

const edgeTypeSchema = z.enum(["related_to", "supports", "contradicts", "supersedes", "extends", "references"]);

const edgeSchema = z.object({
  fromMemoryItemId: z.string().uuid(),
  toMemoryItemId: z.string().uuid(),
  edgeType: edgeTypeSchema.default("related_to"),
  confidence: z.number().min(0).max(1).default(1),
  note: z.string().max(500).optional(),
});

export const memoryRouter = Router();
memoryRouter.use(requireAuth);

// -- Memory graph for a persona ------------------------------------------------
memoryRouter.get("/persona/:personaId/graph", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data: persona } = await sb
    .from("personas")
    .select("id, owner_user_id")
    .eq("id", req.params.personaId)
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (!persona) return res.status(404).json({ error: "Persona not found." });

  const [itemsResult, edgesResult] = await Promise.all([
    sb
      .from("memory_items")
      .select("id, persona_id, title, summary, source_type, relevance_weight, created_at")
      .eq("persona_id", persona.id)
      .eq("owner_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
    (sb as any)
      .from("memory_item_edges")
      .select("*")
      .eq("persona_id", persona.id)
      .eq("owner_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  if (itemsResult.error) return res.status(500).json({ error: itemsResult.error.message });
  if (edgesResult.error) return res.status(500).json({ error: edgesResult.error.message });

  return res.json({
    graph: {
      nodes: (itemsResult.data ?? []).map((item) => ({
        id: item.id,
        personaId: item.persona_id,
        title: item.title,
        summary: item.summary,
        sourceType: item.source_type,
        relevanceWeight: item.relevance_weight,
        createdAt: item.created_at,
      })),
      edges: (edgesResult.data ?? []).map((edge: any) => ({
        id: edge.id,
        personaId: edge.persona_id,
        fromMemoryItemId: edge.from_memory_item_id,
        toMemoryItemId: edge.to_memory_item_id,
        edgeType: edge.edge_type,
        confidence: edge.confidence,
        note: edge.note,
        createdAt: edge.created_at,
      })),
    },
  });
});

memoryRouter.post("/persona/:personaId/edges", async (req, res) => {
  const parsed = edgeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data: persona } = await sb
    .from("personas")
    .select("id, owner_user_id")
    .eq("id", req.params.personaId)
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (!persona) return res.status(404).json({ error: "Persona not found." });

  const { data: items, error: itemError } = await sb
    .from("memory_items")
    .select("id")
    .eq("persona_id", persona.id)
    .eq("owner_user_id", userId)
    .in("id", [parsed.data.fromMemoryItemId, parsed.data.toMemoryItemId]);

  if (itemError) return res.status(500).json({ error: itemError.message });
  if ((items ?? []).length !== 2) {
    return res.status(404).json({ error: "Both memory items must belong to this persona." });
  }

  const { data, error } = await (sb as any)
    .from("memory_item_edges")
    .upsert({
      owner_user_id: userId,
      persona_id: persona.id,
      from_memory_item_id: parsed.data.fromMemoryItemId,
      to_memory_item_id: parsed.data.toMemoryItemId,
      edge_type: parsed.data.edgeType,
      confidence: parsed.data.confidence,
      note: parsed.data.note ?? null,
    }, { onConflict: "owner_user_id,from_memory_item_id,to_memory_item_id,edge_type" })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });

  await recordPersonaLifecycleEvent({
    personaId: persona.id,
    ownerUserId: userId,
    eventType: "memory_graph_update",
    eventLabel: "Memory graph edge recorded",
    eventData: {
      edgeType: parsed.data.edgeType,
      fromMemoryItemId: parsed.data.fromMemoryItemId,
      toMemoryItemId: parsed.data.toMemoryItemId,
    },
  }).catch(() => undefined);

  return res.status(201).json({
    edge: {
      id: data.id,
      personaId: data.persona_id,
      fromMemoryItemId: data.from_memory_item_id,
      toMemoryItemId: data.to_memory_item_id,
      edgeType: data.edge_type,
      confidence: data.confidence,
      note: data.note,
      createdAt: data.created_at,
    },
  });
});

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
