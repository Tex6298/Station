import { Router } from "express";
import { z } from "zod";
import type { Database, ProjectConnectionTier, ProjectVisibility } from "@station/db";
import { requireAuth } from "../middleware/require-auth";
import { getSupabaseAdmin } from "../lib/supabase";

const visibilitySchema = z.enum(["private", "unlisted", "community", "public"]);
const connectionTierSchema = z.enum(["tier_1_showcase", "tier_2_hosted", "tier_3_lab"]);
const slugSchema = z.string().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: slugSchema,
  description: z.string().trim().max(4000).nullable().optional(),
  visibility: visibilitySchema.default("private"),
  connectionTier: connectionTierSchema.default("tier_1_showcase"),
});

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type DeveloperSpaceRow = Database["public"]["Tables"]["developer_spaces"]["Row"];
type DeveloperSpaceUsageRow = Database["public"]["Tables"]["developer_space_usage"]["Row"];

export const projectsRouter = Router();
projectsRouter.use(requireAuth);

function serializeProject(row: ProjectRow) {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    visibility: row.visibility,
    connectionTier: row.connection_tier,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function serializeAttachedDeveloperSpace(row: Pick<
  DeveloperSpaceRow,
  "id" | "project_name" | "slug" | "description" | "visibility" | "visualisation_type" | "created_at" | "updated_at"
>) {
  return {
    id: row.id,
    projectName: row.project_name,
    slug: row.slug,
    description: row.description,
    visibility: row.visibility,
    visualisationType: row.visualisation_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function serializeProjectActivity(
  usageRows: Array<Pick<
    DeveloperSpaceUsageRow,
    "ingested_nodes_count" | "ingested_events_count" | "ingested_snapshots_count" | "storage_bytes" | "public_detail_reads_count" | "export_count"
  >>,
  developerSpaceCount: number
) {
  return usageRows.reduce((activity, row) => ({
    developerSpaces: activity.developerSpaces,
    nodes: activity.nodes + Number(row.ingested_nodes_count ?? 0),
    events: activity.events + Number(row.ingested_events_count ?? 0),
    snapshots: activity.snapshots + Number(row.ingested_snapshots_count ?? 0),
    storageBytes: activity.storageBytes + Number(row.storage_bytes ?? 0),
    publicReads: activity.publicReads + Number(row.public_detail_reads_count ?? 0),
    exports: activity.exports + Number(row.export_count ?? 0),
  }), {
    developerSpaces: developerSpaceCount,
    nodes: 0,
    events: 0,
    snapshots: 0,
    storageBytes: 0,
    publicReads: 0,
    exports: 0,
  });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isUniqueViolation(error: { code?: string } | null | undefined) {
  return error?.code === "23505";
}

projectsRouter.get("/", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("projects")
    .select("*")
    .eq("owner_user_id", req.user!.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ projects: (data ?? []).map(serializeProject) });
});

projectsRouter.post("/", async (req, res) => {
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const { data: project, error } = await sb
    .from("projects")
    .insert({
      owner_user_id: req.user!.id,
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      visibility: parsed.data.visibility as ProjectVisibility,
      connection_tier: parsed.data.connectionTier as ProjectConnectionTier,
    })
    .select("*")
    .single();

  if (error || !project) {
    if (isUniqueViolation(error)) return res.status(409).json({ error: "Project slug is already in use." });
    return res.status(500).json({ error: error?.message ?? "Could not create project." });
  }

  const { error: memberError } = await sb
    .from("project_members")
    .insert({
      project_id: project.id,
      user_id: req.user!.id,
      role: "owner",
      status: "active",
    })
    .select("id")
    .single();

  if (memberError) {
    return res.status(500).json({ error: memberError.message ?? "Could not create project owner membership." });
  }

  return res.status(201).json({ project: serializeProject(project) });
});

projectsRouter.get("/:idOrSlug", async (req, res) => {
  const idOrSlug = req.params.idOrSlug;
  const sb = getSupabaseAdmin();
  let query = sb
    .from("projects")
    .select("*")
    .eq("owner_user_id", req.user!.id);

  query = isUuid(idOrSlug) ? query.eq("id", idOrSlug) : query.eq("slug", idOrSlug);

  const { data, error } = await query.maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Project not found." });

  const { data: developerSpaces, error: developerSpacesError } = await sb
    .from("developer_spaces")
    .select("id, project_name, slug, description, visibility, visualisation_type, created_at, updated_at")
    .eq("project_id", data.id)
    .eq("owner_user_id", req.user!.id)
    .order("created_at", { ascending: false });

  if (developerSpacesError) return res.status(500).json({ error: developerSpacesError.message });

  const { data: usageRows, error: usageError } = await sb
    .from("developer_space_usage")
    .select("ingested_nodes_count, ingested_events_count, ingested_snapshots_count, storage_bytes, public_detail_reads_count, export_count")
    .eq("project_id", data.id)
    .eq("owner_user_id", req.user!.id);

  if (usageError) return res.status(500).json({ error: usageError.message });

  return res.json({
    project: serializeProject(data),
    developerSpaces: (developerSpaces ?? []).map(serializeAttachedDeveloperSpace),
    activity: serializeProjectActivity(usageRows ?? [], developerSpaces?.length ?? 0),
  });
});
