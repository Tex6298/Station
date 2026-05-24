import { Router } from "express";
import { z } from "zod";
import { requireAuth, optionalAuth } from "../middleware/require-auth";
import { requireTier } from "../middleware/require-tier";
import { getSupabaseAdmin } from "../lib/supabase";
import {
  accessLevelForDeveloperSpace,
  canReadDeveloperSpace,
  extractDeveloperApiKey,
  generateDeveloperSpaceApiKey,
  hashDeveloperSpaceApiKey,
  normaliseSourceRefs,
  serializeDeveloperSpace,
  serializeDeveloperSpaceEvent,
  serializeDeveloperSpaceNode,
  serializeDeveloperSpaceSnapshot,
  slugifyProjectName,
} from "../services/developer-space.service";

const visibilitySchema = z.enum(["private", "unlisted", "community", "public"]);
const visualisationSchema = z.enum(["node_field", "timeline", "world_map", "constellation"]);
const topologySchema = z.enum(["radial", "branching", "lattice", "custom"]);
const eventVisibilitySchema = z.enum(["private", "community", "public"]);
const provenanceSchema = z.enum(["api", "imported", "user", "system", "ai_generated"]);
const sourceRefsSchema = z.array(z.string().max(500)).max(24).default([]);
const jsonObjectSchema = z.record(z.unknown());

const createSpaceSchema = z.object({
  projectName: z.string().min(1).max(120),
  slug: z.string().min(3).max(80).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).optional(),
  description: z.string().max(4000).optional(),
  visibility: visibilitySchema.default("private"),
  visualisationType: visualisationSchema.default("node_field"),
  visualisationConfig: jsonObjectSchema.default({}),
});

const updateSpaceSchema = createSpaceSchema.partial();

const nodeStateSchema = z.object({
  nodeName: z.string().min(1).max(120).optional(),
  topologyType: topologySchema.default("custom"),
  fragmentCount: z.number().int().min(0).max(10_000_000).default(0),
  selfSimilarityScore: z.number().min(0).max(1).nullable().optional(),
  dimensionality: z.number().int().min(0).max(100_000).nullable().optional(),
  metrics: jsonObjectSchema.default({}),
  sourceRefs: sourceRefsSchema,
  provenance: provenanceSchema.default("api"),
});

const eventSchema = z.object({
  eventType: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.:-]+$/),
  eventLabel: z.string().max(220).optional(),
  nodeId: z.string().min(1).max(160).optional(),
  eventData: jsonObjectSchema.default({}),
  similarityScore: z.number().min(0).max(1).nullable().optional(),
  sourceRefs: sourceRefsSchema,
  provenance: provenanceSchema.default("api"),
  visibility: eventVisibilitySchema.default("public"),
  occurredAt: z.string().datetime().optional(),
});

const snapshotSchema = z.object({
  snapshotData: jsonObjectSchema,
  sourceRefs: sourceRefsSchema,
  provenance: provenanceSchema.default("api"),
  visibility: eventVisibilitySchema.default("public"),
  occurredAt: z.string().datetime().optional(),
});

const batchImportSchema = z.object({
  nodes: z.array(nodeStateSchema.extend({ nodeId: z.string().min(1).max(160) })).max(250).default([]),
  events: z.array(eventSchema).max(500).default([]),
  snapshots: z.array(snapshotSchema).max(100).default([]),
});

export const developerSpacesRouter = Router();

async function loadSpaceForIngestion(req: any, res: any) {
  const rawKey = extractDeveloperApiKey(req.headers["x-station-developer-key"] ?? req.headers.authorization);
  if (!rawKey) {
    res.status(401).json({ error: "Missing Developer Space API key." });
    return null;
  }

  const apiKeyHash = hashDeveloperSpaceApiKey(rawKey);
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("developer_spaces")
    .select("*")
    .eq("api_key_hash", apiKeyHash)
    .single();

  if (error || !data) {
    res.status(401).json({ error: "Invalid Developer Space API key." });
    return null;
  }

  return data;
}

async function findNodeByExternalId(developerSpaceId: string, externalId?: string | null) {
  if (!externalId) return null;
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("developer_space_nodes")
    .select("*")
    .eq("developer_space_id", developerSpaceId)
    .eq("external_id", externalId)
    .maybeSingle();
  return data ?? null;
}

// -- Ingestion API: key-authenticated, no Station user session required -------
developerSpacesRouter.post("/ingest/nodes/:nodeId/state", async (req, res) => {
  const space = await loadSpaceForIngestion(req, res);
  if (!space) return;

  const parsed = nodeStateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const now = new Date().toISOString();
  const externalId = req.params.nodeId;

  const { data: node, error: nodeError } = await sb
    .from("developer_space_nodes")
    .upsert({
      developer_space_id: space.id,
      external_id: externalId,
      node_name: parsed.data.nodeName ?? externalId,
      topology_type: parsed.data.topologyType,
      fragment_count: parsed.data.fragmentCount,
      self_similarity_score: parsed.data.selfSimilarityScore ?? null,
      dimensionality: parsed.data.dimensionality ?? null,
      metrics: parsed.data.metrics,
      last_event_at: now,
    }, { onConflict: "developer_space_id,external_id" })
    .select("*")
    .single();

  if (nodeError || !node) return res.status(500).json({ error: nodeError?.message ?? "Could not upsert node." });

  await sb.from("developer_space_events").insert({
    developer_space_id: space.id,
    node_id: node.id,
    external_node_id: externalId,
    event_type: "node_state_update",
    event_label: `${node.node_name} state updated`,
    event_data: {
      fragmentCount: parsed.data.fragmentCount,
      selfSimilarityScore: parsed.data.selfSimilarityScore ?? null,
      dimensionality: parsed.data.dimensionality ?? null,
      metrics: parsed.data.metrics,
    },
    similarity_score: parsed.data.selfSimilarityScore ?? null,
    source_refs: normaliseSourceRefs(parsed.data.sourceRefs),
    provenance: parsed.data.provenance,
    visibility: "public",
    occurred_at: now,
  });

  return res.status(202).json({ node: serializeDeveloperSpaceNode(node) });
});

developerSpacesRouter.post("/ingest/events", async (req, res) => {
  const space = await loadSpaceForIngestion(req, res);
  if (!space) return;

  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const node = await findNodeByExternalId(space.id, parsed.data.nodeId);

  const { data, error } = await sb
    .from("developer_space_events")
    .insert({
      developer_space_id: space.id,
      node_id: node?.id ?? null,
      external_node_id: parsed.data.nodeId ?? null,
      event_type: parsed.data.eventType,
      event_label: parsed.data.eventLabel ?? null,
      event_data: parsed.data.eventData,
      similarity_score: parsed.data.similarityScore ?? null,
      source_refs: normaliseSourceRefs(parsed.data.sourceRefs),
      provenance: parsed.data.provenance,
      visibility: parsed.data.visibility,
      occurred_at: parsed.data.occurredAt ?? new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error || !data) return res.status(500).json({ error: error?.message ?? "Could not ingest event." });

  if (node) {
    await sb
      .from("developer_space_nodes")
      .update({ last_event_at: parsed.data.occurredAt ?? new Date().toISOString() })
      .eq("id", node.id);
  }

  return res.status(202).json({ event: serializeDeveloperSpaceEvent(data) });
});

developerSpacesRouter.post("/ingest/snapshots", async (req, res) => {
  const space = await loadSpaceForIngestion(req, res);
  if (!space) return;

  const parsed = snapshotSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("developer_space_snapshots")
    .insert({
      developer_space_id: space.id,
      snapshot_data: parsed.data.snapshotData,
      source_refs: normaliseSourceRefs(parsed.data.sourceRefs),
      provenance: parsed.data.provenance,
      visibility: parsed.data.visibility,
      occurred_at: parsed.data.occurredAt ?? new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error || !data) return res.status(500).json({ error: error?.message ?? "Could not ingest snapshot." });
  return res.status(202).json({ snapshot: serializeDeveloperSpaceSnapshot(data) });
});

developerSpacesRouter.post("/ingest/import", async (req, res) => {
  const space = await loadSpaceForIngestion(req, res);
  if (!space) return;

  const parsed = batchImportSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const now = new Date().toISOString();
  const nodes = [];

  for (const nodeInput of parsed.data.nodes) {
    const { data: node, error } = await sb
      .from("developer_space_nodes")
      .upsert({
        developer_space_id: space.id,
        external_id: nodeInput.nodeId,
        node_name: nodeInput.nodeName ?? nodeInput.nodeId,
        topology_type: nodeInput.topologyType,
        fragment_count: nodeInput.fragmentCount,
        self_similarity_score: nodeInput.selfSimilarityScore ?? null,
        dimensionality: nodeInput.dimensionality ?? null,
        metrics: nodeInput.metrics,
        last_event_at: now,
      }, { onConflict: "developer_space_id,external_id" })
      .select("*")
      .single();
    if (error) return res.status(500).json({ error: error.message });
    nodes.push(node);
  }

  const eventsPayload = [];
  for (const event of parsed.data.events) {
    const node = await findNodeByExternalId(space.id, event.nodeId);
    eventsPayload.push({
      developer_space_id: space.id,
      node_id: node?.id ?? null,
      external_node_id: event.nodeId ?? null,
      event_type: event.eventType,
      event_label: event.eventLabel ?? null,
      event_data: event.eventData,
      similarity_score: event.similarityScore ?? null,
      source_refs: normaliseSourceRefs(event.sourceRefs),
      provenance: event.provenance,
      visibility: event.visibility,
      occurred_at: event.occurredAt ?? now,
    });
  }

  const snapshotsPayload = parsed.data.snapshots.map((snapshot) => ({
    developer_space_id: space.id,
    snapshot_data: snapshot.snapshotData,
    source_refs: normaliseSourceRefs(snapshot.sourceRefs),
    provenance: snapshot.provenance,
    visibility: snapshot.visibility,
    occurred_at: snapshot.occurredAt ?? now,
  }));

  if (eventsPayload.length > 0) {
    const { error } = await sb.from("developer_space_events").insert(eventsPayload);
    if (error) return res.status(500).json({ error: error.message });
  }

  if (snapshotsPayload.length > 0) {
    const { error } = await sb.from("developer_space_snapshots").insert(snapshotsPayload);
    if (error) return res.status(500).json({ error: error.message });
  }

  return res.status(202).json({
    imported: {
      nodes: nodes.length,
      events: eventsPayload.length,
      snapshots: snapshotsPayload.length,
    },
  });
});


// -- Public gallery for Discover-style browsing -------------------------------
developerSpacesRouter.get("/public", optionalAuth, async (_req, res) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("developer_spaces")
    .select("*")
    .eq("visibility", "public")
    .order("updated_at", { ascending: false })
    .limit(24);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ spaces: (data ?? []).map((space) => serializeDeveloperSpace(space, { includeOperationalFields: false })) });
});

// -- User-facing Developer Space management -----------------------------------
developerSpacesRouter.get("/", requireAuth, async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("developer_spaces")
    .select("*")
    .eq("owner_user_id", req.user!.id)
    .order("updated_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ spaces: (data ?? []).map(serializeDeveloperSpace) });
});

developerSpacesRouter.post("/", requireAuth, requireTier("canon"), async (req, res) => {
  const parsed = createSpaceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const slug = parsed.data.slug ?? slugifyProjectName(parsed.data.projectName);

  const { data, error } = await sb
    .from("developer_spaces")
    .insert({
      owner_user_id: req.user!.id,
      project_name: parsed.data.projectName,
      slug,
      description: parsed.data.description ?? null,
      visibility: parsed.data.visibility,
      visualisation_type: parsed.data.visualisationType,
      visualisation_config: parsed.data.visualisationConfig,
    })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ space: serializeDeveloperSpace(data) });
});

developerSpacesRouter.post("/:id/api-key", requireAuth, async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data: space, error: loadError } = await sb
    .from("developer_spaces")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (loadError || !space) return res.status(404).json({ error: "Developer Space not found." });
  if (space.owner_user_id !== req.user!.id && !req.user!.isAdmin) {
    return res.status(403).json({ error: "Not authorised." });
  }

  const apiKey = generateDeveloperSpaceApiKey();
  const { data, error } = await sb
    .from("developer_spaces")
    .update({
      api_key_hash: hashDeveloperSpaceApiKey(apiKey),
      api_key_last_four: apiKey.slice(-4),
      api_key_created_at: new Date().toISOString(),
    })
    .eq("id", space.id)
    .select("*")
    .single();

  if (error || !data) return res.status(500).json({ error: error?.message ?? "Could not rotate API key." });
  return res.status(201).json({ apiKey, space: serializeDeveloperSpace(data) });
});

developerSpacesRouter.patch("/:id", requireAuth, async (req, res) => {
  const parsed = updateSpaceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const updatePayload: Record<string, unknown> = {};
  if (parsed.data.projectName !== undefined) updatePayload.project_name = parsed.data.projectName;
  if (parsed.data.slug !== undefined) updatePayload.slug = parsed.data.slug;
  if (parsed.data.description !== undefined) updatePayload.description = parsed.data.description;
  if (parsed.data.visibility !== undefined) updatePayload.visibility = parsed.data.visibility;
  if (parsed.data.visualisationType !== undefined) updatePayload.visualisation_type = parsed.data.visualisationType;
  if (parsed.data.visualisationConfig !== undefined) updatePayload.visualisation_config = parsed.data.visualisationConfig;

  const { data, error } = await sb
    .from("developer_spaces")
    .update(updatePayload)
    .eq("id", req.params.id)
    .eq("owner_user_id", req.user!.id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Developer Space not found." });
  return res.json({ space: serializeDeveloperSpace(data) });
});

// -- Public/community/owner observatory view ----------------------------------
developerSpacesRouter.get("/:slug", optionalAuth, async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data: space, error } = await sb
    .from("developer_spaces")
    .select("*")
    .eq("slug", req.params.slug)
    .single();

  if (error || !space) return res.status(404).json({ error: "Developer Space not found." });
  if (!canReadDeveloperSpace(space.visibility, space.owner_user_id, req.user)) {
    return res.status(403).json({ error: "This Developer Space is not public." });
  }

  const access = accessLevelForDeveloperSpace(space.owner_user_id, req.user);
  const eventVisibility = access === "owner"
    ? ["private", "community", "public"]
    : access === "member"
      ? ["community", "public"]
      : ["public"];

  const [nodesResult, eventsResult, snapshotsResult] = await Promise.all([
    sb
      .from("developer_space_nodes")
      .select("*")
      .eq("developer_space_id", space.id)
      .order("last_event_at", { ascending: false, nullsFirst: false })
      .limit(80),
    sb
      .from("developer_space_events")
      .select("*")
      .eq("developer_space_id", space.id)
      .in("visibility", eventVisibility)
      .order("occurred_at", { ascending: false })
      .limit(80),
    sb
      .from("developer_space_snapshots")
      .select("*")
      .eq("developer_space_id", space.id)
      .in("visibility", eventVisibility)
      .order("occurred_at", { ascending: false })
      .limit(1),
  ]);

  if (nodesResult.error) return res.status(500).json({ error: nodesResult.error.message });
  if (eventsResult.error) return res.status(500).json({ error: eventsResult.error.message });
  if (snapshotsResult.error) return res.status(500).json({ error: snapshotsResult.error.message });

  return res.json({
    space: serializeDeveloperSpace(space, { includeOperationalFields: access === "owner" }),
    nodes: (nodesResult.data ?? []).map(serializeDeveloperSpaceNode),
    events: (eventsResult.data ?? []).map(serializeDeveloperSpaceEvent),
    latestSnapshot: snapshotsResult.data?.[0] ? serializeDeveloperSpaceSnapshot(snapshotsResult.data[0]) : null,
    access,
  });
});
