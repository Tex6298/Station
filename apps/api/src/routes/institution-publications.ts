import { Router } from "express";
import { z } from "zod";
import type { Database } from "@station/db";
import type { InstitutionPublicationDetail, InstitutionPublicationSummary, PublicInstitutionPublicationResponse } from "@station/types";
import { getSupabaseAdmin } from "../lib/supabase";
import { requireAuth } from "../middleware/require-auth";

type InstitutionRow = Database["public"]["Tables"]["institutions"]["Row"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type PublicationRow = Database["public"]["Tables"]["institution_publications"]["Row"];

const slug = z.string().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const snapshot = z.object({
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().min(1).max(1000),
  body: z.string().trim().min(1).max(100000),
  documentType: z.enum(["article", "research", "report", "note"]),
}).strict();
const createSchema = snapshot.extend({ slug, projectSlug: slug }).strict();
const editSchema = snapshot.extend({ expectedVersion: z.number().int().positive() }).strict();
const transitionSchema = z.object({ expectedVersion: z.number().int().positive() }).strict();

const NOT_FOUND = { error: "Institution publication not found.", code: "institution_publication_not_found" } as const;
const READ_FAILED = { error: "Could not load Institution publications.", code: "institution_publication_load_failed" } as const;
const WRITE_FAILED = { error: "Could not update Institution publication.", code: "institution_publication_update_failed" } as const;

export const institutionPublicationsRouter = Router();

function first<T>(data: T | T[] | null) { return Array.isArray(data) ? data[0] ?? null : data; }
function institutionHref(row: InstitutionRow) { return row.verification_status === "verified" && row.public_status === "public" ? `/institutions/${encodeURIComponent(row.slug)}` : null; }
function publicHref(row: PublicationRow, institution: InstitutionRow, project: ProjectRow) { return row.status === "published" && institutionHref(institution) && project.visibility === "public" ? `/institutions/${encodeURIComponent(institution.slug)}/publications/public/${encodeURIComponent(row.slug)}` : null; }
function access(role: "institution_owner" | "institution_member", status: PublicationRow["status"]) {
  const owner = role === "institution_owner";
  return { role, readOnly: false, canPublish: owner && status === "draft", canRetract: owner && status === "published" } as const;
}
function serialize(row: PublicationRow, institution: InstitutionRow, project: ProjectRow, role: "institution_owner" | "institution_member"): InstitutionPublicationDetail {
  return {
    title: row.title, slug: row.slug, summary: row.summary, body: row.body,
    documentType: row.document_type, status: row.status, visibility: row.status === "published" ? "public" : "private",
    version: row.version, creatorLabel: row.creator_label, lastEditorLabel: row.last_editor_label,
    createdAt: row.created_at, updatedAt: row.updated_at, publishedAt: row.published_at,
    publicHref: publicHref(row, institution, project),
    institution: { name: institution.name, slug: institution.slug, href: institutionHref(institution) },
    project: { name: project.name, slug: project.slug, href: `/projects/${encodeURIComponent(project.slug)}` },
    access: access(role, row.status),
  };
}
function summary(detail: InstitutionPublicationDetail): InstitutionPublicationSummary { const { body: _body, ...value } = detail; return value; }

async function resolveInstitution(value: string) {
  if (!slug.safeParse(value).success) return null;
  const { data, error } = await getSupabaseAdmin().from("institutions").select("*").eq("slug", value).maybeSingle();
  if (error) throw new Error("institution read");
  return data as InstitutionRow | null;
}
async function resolveAccess(institution: InstitutionRow, userId: string) {
  if (institution.owner_user_id === userId) return "institution_owner" as const;
  const { data, error } = await getSupabaseAdmin().from("institution_members").select("id").eq("institution_id", institution.id).eq("user_id", userId).eq("role", "member").eq("status", "active").maybeSingle();
  if (error) throw new Error("membership read");
  return data ? "institution_member" as const : null;
}
async function actorLabel(userId: string) {
  const { data, error } = await getSupabaseAdmin().from("profiles").select("username, display_name").eq("id", userId).maybeSingle();
  if (error || !data) throw new Error("profile read");
  return String(data.display_name || data.username).trim().slice(0, 120);
}
async function projectFor(institutionId: string, projectSlug: string) {
  const { data, error } = await getSupabaseAdmin().from("projects").select("*").eq("institution_id", institutionId).eq("slug", projectSlug).maybeSingle();
  if (error) throw new Error("project read");
  return data as ProjectRow | null;
}
async function publicationFor(institutionId: string, publicationSlug: string) {
  const { data, error } = await getSupabaseAdmin().from("institution_publications").select("*").eq("institution_id", institutionId).eq("slug", publicationSlug).maybeSingle();
  if (error) throw new Error("publication read");
  return data as PublicationRow | null;
}

institutionPublicationsRouter.get("/institutions/:institutionSlug/publications/public/:publicationSlug", async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    const institution = await resolveInstitution(req.params.institutionSlug);
    if (!institution || institution.verification_status !== "verified" || institution.public_status !== "public") return res.status(404).json(NOT_FOUND);
    const publication = await publicationFor(institution.id, req.params.publicationSlug);
    if (!publication || publication.status !== "published" || !publication.published_at) return res.status(404).json(NOT_FOUND);
    const { data: project, error } = await getSupabaseAdmin().from("projects").select("*").eq("id", publication.project_id).eq("institution_id", institution.id).eq("visibility", "public").maybeSingle();
    if (error) return res.status(500).json(READ_FAILED);
    if (!project) return res.status(404).json(NOT_FOUND);
    const response: PublicInstitutionPublicationResponse = { publication: {
      title: publication.title, slug: publication.slug, summary: publication.summary, body: publication.body,
      documentType: publication.document_type, publishedAt: publication.published_at,
      creatorLabel: publication.creator_label, lastEditorLabel: publication.last_editor_label,
      institution: { name: institution.name, slug: institution.slug, href: `/institutions/${encodeURIComponent(institution.slug)}` },
      project: { name: project.name, slug: project.slug, href: `/projects/public/${encodeURIComponent(project.slug)}` },
    } };
    return res.json(response);
  } catch { return res.status(500).json(READ_FAILED); }
});

institutionPublicationsRouter.use("/institutions/:institutionSlug/publications", requireAuth);
institutionPublicationsRouter.use("/institutions/:institutionSlug/publications", (_req, res, next) => { res.set("Cache-Control", "private, no-store"); next(); });

institutionPublicationsRouter.get("/institutions/:institutionSlug/publications", async (req, res) => {
  try {
    const institution = await resolveInstitution(req.params.institutionSlug);
    if (!institution) return res.status(404).json(NOT_FOUND);
    const role = await resolveAccess(institution, req.user!.id);
    if (!role) return res.status(404).json(NOT_FOUND);
    const { data, error } = await getSupabaseAdmin().from("institution_publications").select("*").eq("institution_id", institution.id).order("updated_at", { ascending: false });
    if (error) return res.status(500).json(READ_FAILED);
    const projects = new Map<string, ProjectRow>();
    for (const row of (data ?? []) as PublicationRow[]) { const { data: project } = await getSupabaseAdmin().from("projects").select("*").eq("id", row.project_id).maybeSingle(); if (project) projects.set(row.project_id, project as ProjectRow); }
    return res.json({ publications: ((data ?? []) as PublicationRow[]).map((row) => projects.get(row.project_id) ? summary(serialize(row, institution, projects.get(row.project_id)!, role)) : null).filter(Boolean) });
  } catch { return res.status(500).json(READ_FAILED); }
});

institutionPublicationsRouter.post("/institutions/:institutionSlug/publications", async (req, res) => {
  const parsed = createSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: "Enter valid publication details.", code: "institution_publication_details_invalid" });
  try {
    const institution = await resolveInstitution(req.params.institutionSlug); if (!institution) return res.status(404).json(NOT_FOUND);
    const role = await resolveAccess(institution, req.user!.id); if (!role) return res.status(404).json(NOT_FOUND);
    const project = await projectFor(institution.id, parsed.data.projectSlug); if (!project) return res.status(404).json(NOT_FOUND);
    const { data, error } = await getSupabaseAdmin().rpc("create_institution_publication_v1", { p_institution_id: institution.id, p_project_id: project.id, p_actor_user_id: req.user!.id, p_actor_label: await actorLabel(req.user!.id), p_slug: parsed.data.slug, p_title: parsed.data.title, p_summary: parsed.data.summary, p_body: parsed.data.body, p_document_type: parsed.data.documentType });
    if (error?.code === "23505") return res.status(409).json({ error: "Publication slug is already in use.", code: "institution_publication_slug_conflict" });
    if (error || !data) return res.status(500).json(WRITE_FAILED);
    return res.status(201).json({ publication: serialize(data as PublicationRow, institution, project, role) });
  } catch { return res.status(500).json(WRITE_FAILED); }
});

institutionPublicationsRouter.get("/institutions/:institutionSlug/publications/:publicationSlug", async (req, res) => {
  try {
    const institution = await resolveInstitution(req.params.institutionSlug); if (!institution) return res.status(404).json(NOT_FOUND);
    const role = await resolveAccess(institution, req.user!.id); if (!role) return res.status(404).json(NOT_FOUND);
    const publication = await publicationFor(institution.id, req.params.publicationSlug); if (!publication) return res.status(404).json(NOT_FOUND);
    const { data: project, error } = await getSupabaseAdmin().from("projects").select("*").eq("id", publication.project_id).maybeSingle();
    if (error || !project) return res.status(500).json(READ_FAILED);
    return res.json({ publication: serialize(publication, institution, project as ProjectRow, role) });
  } catch { return res.status(500).json(READ_FAILED); }
});

institutionPublicationsRouter.patch("/institutions/:institutionSlug/publications/:publicationSlug", async (req, res) => {
  const parsed = editSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: "Enter a complete draft snapshot.", code: "institution_publication_snapshot_invalid" });
  try {
    const institution = await resolveInstitution(req.params.institutionSlug); if (!institution || !(await resolveAccess(institution, req.user!.id))) return res.status(404).json(NOT_FOUND);
    const publication = await publicationFor(institution.id, req.params.publicationSlug); if (!publication) return res.status(404).json(NOT_FOUND);
    const { data, error } = await getSupabaseAdmin().rpc("edit_institution_publication_v1", { p_publication_id: publication.id, p_actor_user_id: req.user!.id, p_actor_label: await actorLabel(req.user!.id), p_expected_version: parsed.data.expectedVersion, p_title: parsed.data.title, p_summary: parsed.data.summary, p_body: parsed.data.body, p_document_type: parsed.data.documentType });
    if (error) return res.status(500).json(WRITE_FAILED); const result = first(data);
    if (result?.outcome === "conflict") return res.status(409).json({ error: "This draft changed. Reload before saving.", code: "institution_publication_version_conflict", currentVersion: result.new_version });
    if (result?.outcome !== "edited") return res.status(404).json(NOT_FOUND);
    return res.json({ status: "edited", version: result.new_version });
  } catch { return res.status(500).json(WRITE_FAILED); }
});

async function transition(req: any, res: any, action: "publish" | "retract") {
  const parsed = transitionSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: "Use the current publication version.", code: "institution_publication_version_invalid" });
  try {
    const institution = await resolveInstitution(req.params.institutionSlug); if (!institution || institution.owner_user_id !== req.user!.id) return res.status(404).json(NOT_FOUND);
    const publication = await publicationFor(institution.id, req.params.publicationSlug); if (!publication) return res.status(404).json(NOT_FOUND);
    const { data, error } = await getSupabaseAdmin().rpc("transition_institution_publication_work_v1", { p_publication_id: publication.id, p_actor_user_id: req.user!.id, p_expected_version: parsed.data.expectedVersion, p_action: action });
    if (error) return res.status(500).json(WRITE_FAILED); const result = first(data);
    if (result?.outcome === "conflict") return res.status(409).json({ error: "This publication changed. Reload before continuing.", code: "institution_publication_version_conflict", currentVersion: result.new_version });
    if (result?.outcome !== (action === "publish" ? "published" : "retracted")) return res.status(404).json(NOT_FOUND);
    return res.json({ status: result.outcome, version: result.new_version });
  } catch { return res.status(500).json(WRITE_FAILED); }
}
institutionPublicationsRouter.post("/institutions/:institutionSlug/publications/:publicationSlug/publish", (req,res)=>transition(req,res,"publish"));
institutionPublicationsRouter.post("/institutions/:institutionSlug/publications/:publicationSlug/retract", (req,res)=>transition(req,res,"retract"));
