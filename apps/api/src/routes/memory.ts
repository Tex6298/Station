import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/require-auth";
import { getSupabaseAdmin } from "../lib/supabase";
import { addMemoryItem } from "../services/archive.service";
import { recordPersonaLifecycleEvent } from "../services/persona-lifecycle.service";
import {
  buildPersonaMemoryBriefing,
  createOwnerMemoryBlock,
  ensureMemoryLifecycle,
  loadMemoryLifecycleByItemIds,
  listOwnerMemoryBlocks,
  serializeMemoryLifecycle,
  serializeOwnerMemoryBlock,
  updateMemoryLifecycle,
} from "../services/memory-continuity.service";

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

const trustLevelSchema = z.enum(["user_stated", "agreed_upon", "model_suggested", "llm_extracted"]);
const lifecycleStatusSchema = z.enum(["active", "superseded", "rejected", "expired", "quarantined"]);
const ownerMemoryScopeSchema = z.enum(["shared_user_profile", "working_style", "preference", "boundary", "project_context"]);

function sanitizeArchiveSourceName(value: string | null | undefined) {
  if (!value) return null;
  const compact = value
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\?.*$/, "")
    .replace(/#.*$/, "");

  if (!compact) return null;
  if (/^https?:\/\//i.test(compact)) return "[redacted-url]";

  const basename = compact.split(/[\\/]+/).filter(Boolean).at(-1) ?? compact;
  const redacted = basename
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [redacted]")
    .replace(/\b(?:sk|pk|rk|whsec|ghp|pat)[_-][A-Za-z0-9._-]+\b/gi, "[redacted]")
    .replace(/\b(?:service[_-]?role|api[_-]?key|secret|token|password)\s*[:=]\s*\S+/gi, "[redacted]");

  return redacted.slice(0, 160);
}

const sharedMemorySchema = z.object({
  title: z.string().min(1).max(160),
  content: z.string().min(1).max(4000),
  scope: ownerMemoryScopeSchema.default("shared_user_profile"),
  trustLevel: trustLevelSchema.default("user_stated"),
  confidence: z.number().min(0).max(1).default(1),
  sourceRefs: z.array(z.unknown()).max(20).optional(),
});

const lifecyclePatchSchema = z.object({
  trustLevel: trustLevelSchema.optional(),
  status: lifecycleStatusSchema.optional(),
  confidence: z.number().min(0).max(1).optional(),
  decayRate: z.number().min(0).max(1).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  supersededByMemoryItemId: z.string().uuid().nullable().optional(),
  evidence: z.array(z.unknown()).max(30).optional(),
  reinforce: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: "At least one lifecycle field must be provided.",
});

const MEMORY_ERROR_RESPONSES = {
  sharedList: { error: "Could not load shared memory.", code: "shared_memory_list_failed" },
  sharedCreate: { error: "Could not save shared memory.", code: "shared_memory_create_failed" },
  briefing: { error: "Could not build memory briefing.", code: "memory_briefing_failed" },
  graphItems: { error: "Could not load memory graph items.", code: "memory_graph_items_failed" },
  graphEdges: { error: "Could not load memory graph edges.", code: "memory_graph_edges_failed" },
  graphEdgeItems: { error: "Could not verify memory graph items.", code: "memory_graph_edge_items_failed" },
  graphEdgeCreate: { error: "Could not create memory graph edge.", code: "memory_graph_edge_create_failed" },
  list: { error: "Could not load memory items.", code: "memory_list_failed" },
  listLifecycle: { error: "Could not load memory lifecycle.", code: "memory_list_lifecycle_failed" },
  create: { error: "Could not create memory item.", code: "memory_create_failed" },
  lifecycleEdge: { error: "Could not record memory lifecycle edge.", code: "memory_lifecycle_edge_failed" },
  lifecycleUpdate: { error: "Could not update memory lifecycle.", code: "memory_lifecycle_update_failed" },
  update: { error: "Could not update memory item.", code: "memory_update_failed" },
  delete: { error: "Could not delete memory item.", code: "memory_delete_failed" },
} as const;

export const memoryRouter = Router();
memoryRouter.use(requireAuth);

// -- Shared owner memory -------------------------------------------------------
memoryRouter.get("/shared", async (req, res) => {
  try {
    const blocks = await listOwnerMemoryBlocks(req.user!.id);
    return res.json({ blocks: blocks.map(serializeOwnerMemoryBlock) });
  } catch {
    return res.status(500).json(MEMORY_ERROR_RESPONSES.sharedList);
  }
});

memoryRouter.post("/shared", async (req, res) => {
  const parsed = sharedMemorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const block = await createOwnerMemoryBlock({
      ownerUserId: req.user!.id,
      title: parsed.data.title,
      content: parsed.data.content,
      scope: parsed.data.scope,
      trustLevel: parsed.data.trustLevel,
      confidence: parsed.data.confidence,
      sourceRefs: parsed.data.sourceRefs,
    });
    return res.status(201).json({ block: serializeOwnerMemoryBlock(block) });
  } catch {
    return res.status(500).json(MEMORY_ERROR_RESPONSES.sharedCreate);
  }
});

// -- Persona memory briefing ---------------------------------------------------
memoryRouter.get("/persona/:personaId/briefing", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data: persona } = await sb
    .from("personas")
    .select("id, owner_user_id")
    .eq("id", req.params.personaId)
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (!persona) return res.status(404).json({ error: "Persona not found." });

  try {
    const briefing = await buildPersonaMemoryBriefing(persona.id, userId);
    return res.json({ briefing });
  } catch {
    return res.status(500).json(MEMORY_ERROR_RESPONSES.briefing);
  }
});

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

  if (itemsResult.error) return res.status(500).json(MEMORY_ERROR_RESPONSES.graphItems);
  if (edgesResult.error) return res.status(500).json(MEMORY_ERROR_RESPONSES.graphEdges);

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

  if (itemError) return res.status(500).json(MEMORY_ERROR_RESPONSES.graphEdgeItems);
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

  if (error) return res.status(500).json(MEMORY_ERROR_RESPONSES.graphEdgeCreate);

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
    .select("id, persona_id, title, content, summary, source_type, relevance_weight, archive_source_type, archive_source_name, created_at")
    .eq("persona_id", req.params.personaId)
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(MEMORY_ERROR_RESPONSES.list);
  let lifecycleByMemoryId;
  try {
    lifecycleByMemoryId = await loadMemoryLifecycleByItemIds({
      memoryItemIds: (data ?? []).map((row) => row.id),
      ownerUserId: userId,
      personaId: req.params.personaId,
    });
  } catch {
    return res.status(500).json(MEMORY_ERROR_RESPONSES.listLifecycle);
  }
  return res.json({
    memory: (data ?? []).map((row: any) => {
      const archiveSourceName = sanitizeArchiveSourceName(row.archive_source_name);
      return {
        ...row,
        archive_source_name: archiveSourceName,
        archiveSourceType: row.archive_source_type ?? null,
        archiveSourceName,
        lifecycle: serializeMemoryLifecycle(lifecycleByMemoryId.get(row.id) ?? null),
      };
    }),
  });
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
    const lifecycle = await ensureMemoryLifecycle({
      memoryItemId: item.id,
      ownerUserId: userId,
      personaId: persona.id,
      sourceType: parsed.data.sourceType,
    });
    return res.status(201).json({ memoryItem: { ...item, lifecycle: serializeMemoryLifecycle(lifecycle) } });
  } catch {
    return res.status(500).json(MEMORY_ERROR_RESPONSES.create);
  }
});

// -- Update memory lifecycle ---------------------------------------------------
memoryRouter.patch("/:id/lifecycle", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;
  const parsed = lifecyclePatchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data: memory } = await sb
    .from("memory_items")
    .select("id, persona_id, owner_user_id, source_type")
    .eq("id", req.params.id)
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (!memory) return res.status(404).json({ error: "Memory item not found." });

  if (parsed.data.supersededByMemoryItemId) {
    if (parsed.data.supersededByMemoryItemId === memory.id) {
      return res.status(400).json({
        error: "Superseding memory item must be different from the superseded memory item.",
      });
    }

    const { data: superseding } = await sb
      .from("memory_items")
      .select("id")
      .eq("id", parsed.data.supersededByMemoryItemId)
      .eq("owner_user_id", userId)
      .eq("persona_id", memory.persona_id)
      .maybeSingle();

    if (!superseding) {
      return res.status(404).json({ error: "Superseding memory item must belong to the same persona." });
    }
  }

  try {
    await ensureMemoryLifecycle({
      memoryItemId: memory.id,
      ownerUserId: userId,
      personaId: memory.persona_id,
      sourceType: memory.source_type,
    });
    const lifecycle = await updateMemoryLifecycle({
      memoryItemId: memory.id,
      ownerUserId: userId,
      trustLevel: parsed.data.trustLevel,
      status: parsed.data.status,
      confidence: parsed.data.confidence,
      decayRate: parsed.data.decayRate,
      expiresAt: parsed.data.expiresAt,
      supersededByMemoryItemId: parsed.data.supersededByMemoryItemId,
      evidence: parsed.data.evidence,
      reinforce: parsed.data.reinforce,
    });

    if (parsed.data.supersededByMemoryItemId) {
      const { error: edgeError } = await (sb as any)
        .from("memory_item_edges")
        .upsert({
          owner_user_id: userId,
          persona_id: memory.persona_id,
          from_memory_item_id: memory.id,
          to_memory_item_id: parsed.data.supersededByMemoryItemId,
          edge_type: "supersedes",
          confidence: Number(lifecycle.confidence ?? parsed.data.confidence ?? 1),
          note: "Supersession recorded from owner lifecycle review.",
        }, { onConflict: "owner_user_id,from_memory_item_id,to_memory_item_id,edge_type" })
        .select("*")
        .single();

      if (edgeError) return res.status(500).json(MEMORY_ERROR_RESPONSES.lifecycleEdge);
    }

    await recordPersonaLifecycleEvent({
      personaId: memory.persona_id,
      ownerUserId: userId,
      eventType: "memory_graph_update",
      eventLabel: "Memory lifecycle updated",
      eventData: {
        memoryItemId: memory.id,
        status: parsed.data.status,
        trustLevel: parsed.data.trustLevel,
      },
    }).catch(() => undefined);

    return res.json({ lifecycle: serializeMemoryLifecycle(lifecycle) });
  } catch {
    return res.status(500).json(MEMORY_ERROR_RESPONSES.lifecycleUpdate);
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

  if (error) return res.status(500).json(MEMORY_ERROR_RESPONSES.update);
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

  if (error) return res.status(500).json(MEMORY_ERROR_RESPONSES.delete);
  return res.status(204).send();
});
