import { Router, type Request, type Response } from "express";
import { z } from "zod";
import type { Database, ProjectConnectionTier, ProjectVisibility } from "@station/db";
import type {
  ProjectCollaboratorIdentity,
  ProjectEvidenceItem,
  ProjectInvitation,
  ProjectViewerMember,
  PublicProjectEvidenceItem,
  PublicProjectDeveloperSpaceSummary,
  PublicProjectProfile,
  SharedProjectDetailResponse,
  SharedProjectDeveloperSpaceSummary,
  SharedProjectEvidenceItem,
  SharedProjectSummary,
} from "@station/types";
import { requireAuth } from "../middleware/require-auth";
import { getSupabaseAdmin } from "../lib/supabase";

export const PROJECT_EVIDENCE_LIMIT = 24;
export const PUBLIC_PROJECT_DEVELOPER_SPACE_LIMIT = 12;
export const PUBLIC_PROJECT_EVIDENCE_LIMIT = 8;

const visibilitySchema = z.enum(["private", "unlisted", "community", "public"]);
const connectionTierSchema = z.enum(["tier_1_showcase", "tier_2_hosted", "tier_3_lab"]);
const slugSchema = z.string().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const usernameSchema = z.string().trim().min(3).max(30).regex(/^[A-Za-z0-9_-]+$/);

const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: slugSchema,
  description: z.string().trim().max(4000).nullable().optional(),
  visibility: visibilitySchema.default("private"),
  connectionTier: connectionTierSchema.default("tier_1_showcase"),
}).strict();
const projectUsernameSchema = z.object({ username: usernameSchema }).strict();
const emptyBodySchema = z.object({}).strict();

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectMemberRow = Database["public"]["Tables"]["project_members"]["Row"];
type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "username" | "display_name"
>;
type DeveloperSpaceRow = Database["public"]["Tables"]["developer_spaces"]["Row"];
type DeveloperSpaceUsageRow = Database["public"]["Tables"]["developer_space_usage"]["Row"];
type DeveloperSpaceDocumentRow = Database["public"]["Tables"]["developer_space_documents"]["Row"];
type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];
type ProjectEvidenceLinkRow = Pick<
  DeveloperSpaceDocumentRow,
  | "developer_space_id"
  | "document_id"
  | "document_role"
  | "link_visibility"
  | "sort_order"
  | "created_at"
  | "updated_at"
>;
type ProjectEvidenceDocumentRow = Pick<
  DocumentRow,
  | "id"
  | "title"
  | "slug"
  | "document_type"
  | "status"
  | "visibility"
  | "published_at"
  | "created_at"
  | "updated_at"
  | "provenance_type"
  | "source_label"
>;
type PublicProjectRow = Pick<
  ProjectRow,
  "id" | "owner_user_id" | "name" | "slug" | "description" | "visibility" | "created_at" | "updated_at"
>;
type PublicProjectDeveloperSpaceRow = Pick<
  DeveloperSpaceRow,
  "id" | "owner_user_id" | "project_name" | "slug" | "description" | "visibility" | "visualisation_type" | "updated_at"
>;
type PublicProjectEvidenceLinkRow = Pick<
  DeveloperSpaceDocumentRow,
  "developer_space_id" | "document_id" | "document_role" | "link_visibility" | "sort_order" | "created_at" | "updated_at"
>;
type PublicProjectEvidenceDocumentRow = Pick<
  DocumentRow,
  "id" | "title" | "document_type" | "status" | "visibility" | "published_at" | "updated_at"
>;

export const projectsRouter = Router();

const PROJECT_ERROR_RESPONSES = {
  publicRead: {
    error: "Could not load public Project.",
    code: "project_public_load_failed",
  },
  publicDeveloperSpaces: {
    error: "Could not load public Project Developer Spaces.",
    code: "project_public_developer_spaces_load_failed",
  },
  publicEvidence: {
    error: "Could not load public Project evidence.",
    code: "project_public_evidence_load_failed",
  },
  ownerList: {
    error: "Could not load your Projects.",
    code: "project_owner_list_failed",
  },
  create: {
    error: "Could not create Project.",
    code: "project_create_failed",
  },
  ownerRead: {
    error: "Could not load Project.",
    code: "project_owner_load_failed",
  },
  ownerDeveloperSpaces: {
    error: "Could not load attached Developer Spaces.",
    code: "project_attached_developer_spaces_load_failed",
  },
  ownerActivity: {
    error: "Could not load Project activity.",
    code: "project_activity_load_failed",
  },
  ownerEvidence: {
    error: "Could not load Project evidence.",
    code: "project_evidence_load_failed",
  },
  collaborationRead: {
    error: "Could not load Project collaboration.",
    code: "project_collaboration_load_failed",
  },
  collaborationWrite: {
    error: "Could not update Project collaboration.",
    code: "project_collaboration_update_failed",
  },
  sharedRead: {
    error: "Could not load shared Project.",
    code: "project_shared_load_failed",
  },
} as const;

const OWNER_ACCESS = { role: "owner", readOnly: false } as const;
const VIEWER_ACCESS = { role: "viewer", readOnly: true } as const;

function setPrivateNoStore(res: Response) {
  res.set("Cache-Control", "private, no-store");
}

function firstRpcRow<T>(data: T | T[] | null): T | null {
  return Array.isArray(data) ? data[0] ?? null : data;
}

function serializeCollaborator(profile: ProfileRow): ProjectCollaboratorIdentity {
  return {
    username: profile.username,
    displayName: profile.display_name,
  };
}

function publicProjectHref(project: Pick<ProjectRow, "slug" | "visibility">) {
  return project.visibility === "public"
    ? `/projects/public/${encodeURIComponent(project.slug)}`
    : null;
}

function publicDeveloperSpaceHref(space: Pick<DeveloperSpaceRow, "slug" | "visibility">) {
  return space.visibility === "public"
    ? `/developer-spaces/${encodeURIComponent(space.slug)}`
    : null;
}

function serializeProject(row: ProjectRow) {
  return {
    id: row.id,
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

function serializePublicProject(row: PublicProjectRow, publicDeveloperSpaceCount: number): PublicProjectProfile {
  return {
    name: row.name,
    slug: row.slug,
    description: row.description,
    visibility: "public",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publicDeveloperSpaceCount,
  };
}

function serializePublicDeveloperSpace(row: PublicProjectDeveloperSpaceRow): PublicProjectDeveloperSpaceSummary {
  return {
    projectName: row.project_name,
    slug: row.slug,
    description: row.description,
    visibility: "public",
    visualisationType: row.visualisation_type,
    href: `/developer-spaces/${encodeURIComponent(row.slug)}`,
    updatedAt: row.updated_at,
  };
}

function serializePublicProjectEvidence(
  link: PublicProjectEvidenceLinkRow,
  document: PublicProjectEvidenceDocumentRow,
  space: Pick<DeveloperSpaceRow, "slug">
): PublicProjectEvidenceItem {
  return {
    title: document.title,
    kind: link.document_role ?? document.document_type,
    href: `/developer-spaces/${encodeURIComponent(space.slug)}`,
    sourceLabel: "Public Developer Space",
    ...(document.published_at ? { publishedAt: document.published_at } : {}),
    updatedAt: document.updated_at,
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

function projectEvidenceSortTimestamp(item: ProjectEvidenceItem) {
  return item.document.publishedAt ?? item.document.updatedAt ?? item.updatedAt ?? item.linkedAt;
}

function isPublicRouteableDocument(document: Pick<DocumentRow, "status" | "visibility">) {
  return document.status === "published" && document.visibility === "public";
}

function isOwnerDraftRouteable(document: Pick<DocumentRow, "id" | "status" | "visibility">) {
  return Boolean(document.id) && document.status === "draft" && document.visibility === "private";
}

function evidenceRoute(link: ProjectEvidenceLinkRow, document: ProjectEvidenceDocumentRow, space: Pick<DeveloperSpaceRow, "slug">) {
  if (link.link_visibility === "public" && isPublicRouteableDocument(document)) {
    return {
      routeHref: `/developer-spaces/${encodeURIComponent(space.slug)}`,
      routeLabel: "Open observatory",
    };
  }

  if (isOwnerDraftRouteable(document)) {
    return {
      routeHref: `/studio/publish?documentId=${encodeURIComponent(document.id)}`,
      routeLabel: "Review draft",
    };
  }

  return {
    routeHref: null,
    routeLabel: null,
  };
}

function serializeProjectEvidence(
  link: ProjectEvidenceLinkRow,
  document: ProjectEvidenceDocumentRow,
  space: Pick<DeveloperSpaceRow, "id" | "project_name" | "slug">
): ProjectEvidenceItem {
  const route = evidenceRoute(link, document, space);
  return {
    developerSpace: {
      id: space.id,
      projectName: space.project_name,
      slug: space.slug,
    },
    document: {
      id: document.id,
      title: document.title,
      slug: document.slug,
      documentType: document.document_type,
      status: document.status,
      visibility: document.visibility,
      provenanceType: document.provenance_type,
      sourceLabel: isPublicRouteableDocument(document) ? document.source_label ?? null : null,
      publishedAt: document.published_at ?? null,
      createdAt: document.created_at,
      updatedAt: document.updated_at,
    },
    role: link.document_role,
    linkVisibility: link.link_visibility,
    sortOrder: Number(link.sort_order ?? 0),
    linkedAt: link.created_at,
    updatedAt: link.updated_at,
    ...route,
  };
}

async function loadProjectEvidence(
  developerSpaces: Array<Pick<DeveloperSpaceRow, "id" | "owner_user_id" | "project_name" | "slug">>,
  ownerUserId: string
): Promise<{ evidence?: ProjectEvidenceItem[]; error?: true }> {
  const attachedSpaces = developerSpaces.filter((space) => space.owner_user_id === ownerUserId);
  const spaceIds = attachedSpaces.map((space) => space.id);
  if (spaceIds.length === 0) return { evidence: [] };

  const sb = getSupabaseAdmin();
  const { data: links, error: linkError } = await sb
    .from("developer_space_documents")
    .select("developer_space_id, document_id, document_role, link_visibility, sort_order, created_at, updated_at")
    .eq("owner_user_id", ownerUserId)
    .in("developer_space_id", spaceIds)
    .order("updated_at", { ascending: false });

  if (linkError) return { error: true };

  const linkRows = links ?? [];
  const documentIds = [...new Set(linkRows.map((link) => link.document_id))];
  if (documentIds.length === 0) return { evidence: [] };

  const { data: documents, error: documentError } = await sb
    .from("documents")
    .select("id, title, slug, document_type, status, visibility, published_at, created_at, updated_at, provenance_type, source_label")
    .eq("author_user_id", ownerUserId)
    .in("id", documentIds);

  if (documentError) return { error: true };

  const spacesById = new Map(attachedSpaces.map((space) => [space.id, space]));
  const documentsById = new Map((documents ?? []).map((document) => [document.id, document]));
  const evidence = linkRows
    .map((link) => {
      const space = spacesById.get(link.developer_space_id);
      const document = documentsById.get(link.document_id);
      if (!space || !document) return null;
      return serializeProjectEvidence(link, document, space);
    })
    .filter((item): item is ProjectEvidenceItem => Boolean(item))
    .sort((a, b) => {
      const newest = Date.parse(projectEvidenceSortTimestamp(a));
      const older = Date.parse(projectEvidenceSortTimestamp(b));
      if (newest !== older) return older - newest;
      const spaceName = a.developerSpace.projectName.localeCompare(b.developerSpace.projectName);
      if (spaceName !== 0) return spaceName;
      return a.document.title.localeCompare(b.document.title);
    })
    .slice(0, PROJECT_EVIDENCE_LIMIT);

  return { evidence };
}

async function loadPublicProjectEvidence(
  developerSpaces: PublicProjectDeveloperSpaceRow[],
  ownerUserId: string
): Promise<{ publicEvidence?: PublicProjectEvidenceItem[]; error?: true }> {
  const publicSpaces = developerSpaces.filter(
    (space) => space.owner_user_id === ownerUserId && space.visibility === "public"
  );
  const spaceIds = publicSpaces.map((space) => space.id);
  if (spaceIds.length === 0) return { publicEvidence: [] };

  const sb = getSupabaseAdmin();
  const { data: links, error: linkError } = await sb
    .from("developer_space_documents")
    .select("developer_space_id, document_id, document_role, link_visibility, sort_order, created_at, updated_at")
    .eq("owner_user_id", ownerUserId)
    .eq("link_visibility", "public")
    .in("developer_space_id", spaceIds)
    .order("updated_at", { ascending: false });

  if (linkError) return { error: true };

  const linkRows = links ?? [];
  const documentIds = [...new Set(linkRows.map((link) => link.document_id))];
  if (documentIds.length === 0) return { publicEvidence: [] };

  const { data: documents, error: documentError } = await sb
    .from("documents")
    .select("id, title, document_type, status, visibility, published_at, updated_at")
    .eq("author_user_id", ownerUserId)
    .eq("status", "published")
    .eq("visibility", "public")
    .in("id", documentIds);

  if (documentError) return { error: true };

  const spacesById = new Map(publicSpaces.map((space) => [space.id, space]));
  const documentsById = new Map((documents ?? []).map((document) => [document.id, document]));
  const publicEvidence = linkRows
    .map((link) => {
      const space = spacesById.get(link.developer_space_id);
      const document = documentsById.get(link.document_id);
      if (!space || !document) return null;
      return serializePublicProjectEvidence(link, document, space);
    })
    .filter((item): item is PublicProjectEvidenceItem => Boolean(item))
    .sort((a, b) => {
      const newest = Date.parse(a.publishedAt ?? a.updatedAt);
      const older = Date.parse(b.publishedAt ?? b.updatedAt);
      if (newest !== older) return older - newest;
      return a.title.localeCompare(b.title);
    })
    .slice(0, PUBLIC_PROJECT_EVIDENCE_LIMIT);

  return { publicEvidence };
}

type SharedDeveloperSpaceRow = Pick<
  DeveloperSpaceRow,
  "id" | "owner_user_id" | "project_name" | "slug" | "description" | "visibility" | "visualisation_type" | "updated_at"
>;
type SharedEvidenceLinkRow = Pick<
  DeveloperSpaceDocumentRow,
  "developer_space_id" | "document_id" | "document_role" | "link_visibility"
>;
type SharedEvidenceDocumentRow = Pick<
  DocumentRow,
  "id" | "title" | "document_type" | "status" | "visibility" | "published_at" | "updated_at"
>;

function serializeSharedProject(project: ProjectRow, owner: ProfileRow): SharedProjectSummary {
  return {
    name: project.name,
    slug: project.slug,
    description: project.description,
    visibility: project.visibility,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    owner: serializeCollaborator(owner),
    access: VIEWER_ACCESS,
    publicHref: publicProjectHref(project),
  };
}

function serializeSharedDeveloperSpace(space: SharedDeveloperSpaceRow): SharedProjectDeveloperSpaceSummary {
  return {
    projectName: space.project_name,
    slug: space.slug,
    description: space.description,
    visibility: space.visibility,
    visualisationType: space.visualisation_type,
    updatedAt: space.updated_at,
    publicHref: publicDeveloperSpaceHref(space),
  };
}

function serializeSharedEvidence(
  link: SharedEvidenceLinkRow,
  document: SharedEvidenceDocumentRow,
  space: SharedDeveloperSpaceRow
): SharedProjectEvidenceItem {
  const publiclyRouteable = space.visibility === "public"
    && link.link_visibility === "public"
    && document.status === "published"
    && document.visibility === "public";

  return {
    developerSpace: {
      projectName: space.project_name,
      slug: space.slug,
    },
    document: {
      title: document.title,
      documentType: document.document_type,
      updatedAt: document.updated_at,
      ...(document.published_at ? { publishedAt: document.published_at } : {}),
    },
    role: link.document_role,
    publicHref: publiclyRouteable ? `/developer-spaces/${encodeURIComponent(space.slug)}` : null,
  };
}

async function resolveProject(idOrSlug: string): Promise<{ project: ProjectRow | null; error: boolean }> {
  const sb = getSupabaseAdmin();
  let query = sb.from("projects").select("*");
  query = isUuid(idOrSlug) ? query.eq("id", idOrSlug) : query.eq("slug", idOrSlug);
  const { data, error } = await query.maybeSingle();
  return { project: data ?? null, error: Boolean(error) };
}

async function resolveOwnerProject(
  idOrSlug: string,
  actorUserId: string
): Promise<{ project: ProjectRow | null; error: boolean }> {
  const resolved = await resolveProject(idOrSlug);
  if (resolved.error || !resolved.project || resolved.project.owner_user_id !== actorUserId) {
    return resolved.error ? resolved : { project: null, error: false };
  }

  const sb = getSupabaseAdmin();
  const { data: ownerMembership, error } = await sb
    .from("project_members")
    .select("project_id")
    .eq("project_id", resolved.project.id)
    .eq("user_id", actorUserId)
    .eq("role", "owner")
    .eq("status", "active")
    .maybeSingle();

  if (error) return { project: null, error: true };
  return { project: ownerMembership ? resolved.project : null, error: false };
}

async function loadProfiles(ids: string[]): Promise<{ profiles: Map<string, ProfileRow>; error: boolean }> {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return { profiles: new Map(), error: false };

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("profiles")
    .select("id, username, display_name")
    .in("id", uniqueIds);

  return {
    profiles: new Map(((data ?? []) as ProfileRow[]).map((profile) => [profile.id, profile])),
    error: Boolean(error),
  };
}

async function loadSharedProjects(actorUserId: string): Promise<{ projects: SharedProjectSummary[]; error: boolean }> {
  const sb = getSupabaseAdmin();
  const { data: memberships, error: membershipError } = await sb
    .from("project_members")
    .select("project_id")
    .eq("user_id", actorUserId)
    .eq("role", "viewer")
    .eq("status", "active");

  if (membershipError) return { projects: [], error: true };
  const projectIds = [...new Set((memberships ?? []).map((membership) => membership.project_id))];
  if (projectIds.length === 0) return { projects: [], error: false };

  const { data: projects, error: projectError } = await sb
    .from("projects")
    .select("*")
    .in("id", projectIds);

  if (projectError) return { projects: [], error: true };
  const projectRows = (projects ?? []) as ProjectRow[];
  const profilesResult = await loadProfiles(projectRows.map((project) => project.owner_user_id));
  if (profilesResult.error) return { projects: [], error: true };

  return {
    projects: projectRows
      .map((project) => {
        const owner = profilesResult.profiles.get(project.owner_user_id);
        return owner ? serializeSharedProject(project, owner) : null;
      })
      .filter((project): project is SharedProjectSummary => Boolean(project))
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt) || a.name.localeCompare(b.name)),
    error: false,
  };
}

async function loadInvitations(actorUserId: string): Promise<{ invitations: ProjectInvitation[]; error: boolean }> {
  const sb = getSupabaseAdmin();
  const { data: memberships, error: membershipError } = await sb
    .from("project_members")
    .select("project_id, created_at, invite_expires_at")
    .eq("user_id", actorUserId)
    .eq("role", "viewer")
    .eq("status", "invited")
    .order("created_at", { ascending: false });

  if (membershipError) return { invitations: [], error: true };
  const now = Date.now();
  const currentMemberships = ((memberships ?? []) as Array<Pick<
    ProjectMemberRow,
    "project_id" | "created_at" | "invite_expires_at"
  >>).filter((membership) => (
    membership.invite_expires_at !== null && Date.parse(membership.invite_expires_at) > now
  ));
  if (currentMemberships.length === 0) return { invitations: [], error: false };

  const { data: projects, error: projectError } = await sb
    .from("projects")
    .select("*")
    .in("id", [...new Set(currentMemberships.map((membership) => membership.project_id))]);

  if (projectError) return { invitations: [], error: true };
  const projectRows = (projects ?? []) as ProjectRow[];
  const projectsById = new Map(projectRows.map((project) => [project.id, project]));
  const profilesResult = await loadProfiles(projectRows.map((project) => project.owner_user_id));
  if (profilesResult.error) return { invitations: [], error: true };

  return {
    invitations: currentMemberships
      .map((membership) => {
        const project = projectsById.get(membership.project_id);
        const owner = project ? profilesResult.profiles.get(project.owner_user_id) : null;
        if (!project || !owner || !membership.invite_expires_at) return null;
        return {
          project: {
            name: project.name,
            slug: project.slug,
            description: project.description,
            visibility: project.visibility,
          },
          owner: serializeCollaborator(owner),
          role: "viewer" as const,
          status: "invited" as const,
          invitedAt: membership.created_at,
          expiresAt: membership.invite_expires_at,
        };
      })
      .filter((invitation): invitation is ProjectInvitation => Boolean(invitation)),
    error: false,
  };
}

async function loadSharedProjectDetail(
  project: ProjectRow,
  actorUserId: string
): Promise<{ detail: SharedProjectDetailResponse | null; error: boolean }> {
  const sb = getSupabaseAdmin();
  const { data: membership, error: membershipError } = await sb
    .from("project_members")
    .select("project_id")
    .eq("project_id", project.id)
    .eq("user_id", actorUserId)
    .eq("role", "viewer")
    .eq("status", "active")
    .maybeSingle();

  if (membershipError) return { detail: null, error: true };
  if (!membership) return { detail: null, error: false };

  const profilesResult = await loadProfiles([project.owner_user_id]);
  if (profilesResult.error) return { detail: null, error: true };
  const owner = profilesResult.profiles.get(project.owner_user_id);
  if (!owner) return { detail: null, error: false };

  const { data: developerSpaces, error: developerSpacesError } = await sb
    .from("developer_spaces")
    .select("id, owner_user_id, project_name, slug, description, visibility, visualisation_type, updated_at")
    .eq("project_id", project.id)
    .eq("owner_user_id", project.owner_user_id)
    .order("updated_at", { ascending: false });

  if (developerSpacesError) return { detail: null, error: true };
  const spaceRows = (developerSpaces ?? []) as SharedDeveloperSpaceRow[];
  const spaceIds = spaceRows.map((space) => space.id);
  let evidence: SharedProjectEvidenceItem[] = [];

  if (spaceIds.length > 0) {
    const { data: links, error: linkError } = await sb
      .from("developer_space_documents")
      .select("developer_space_id, document_id, document_role, link_visibility")
      .eq("owner_user_id", project.owner_user_id)
      .in("developer_space_id", spaceIds);

    if (linkError) return { detail: null, error: true };
    const linkRows = (links ?? []) as SharedEvidenceLinkRow[];
    const documentIds = [...new Set(linkRows.map((link) => link.document_id))];

    if (documentIds.length > 0) {
      const { data: documents, error: documentError } = await sb
        .from("documents")
        .select("id, title, document_type, status, visibility, published_at, updated_at")
        .eq("author_user_id", project.owner_user_id)
        .in("id", documentIds);

      if (documentError) return { detail: null, error: true };
      const spacesById = new Map(spaceRows.map((space) => [space.id, space]));
      const documentsById = new Map(((documents ?? []) as SharedEvidenceDocumentRow[]).map((document) => [document.id, document]));
      evidence = linkRows
        .map((link) => {
          const space = spacesById.get(link.developer_space_id);
          const document = documentsById.get(link.document_id);
          return space && document ? serializeSharedEvidence(link, document, space) : null;
        })
        .filter((item): item is SharedProjectEvidenceItem => Boolean(item))
        .sort((a, b) => Date.parse(b.document.updatedAt) - Date.parse(a.document.updatedAt) || a.document.title.localeCompare(b.document.title))
        .slice(0, PROJECT_EVIDENCE_LIMIT);
    }
  }

  const sharedProject = serializeSharedProject(project, owner);
  return {
    detail: {
      access: VIEWER_ACCESS,
      owner: sharedProject.owner,
      project: {
        name: sharedProject.name,
        slug: sharedProject.slug,
        description: sharedProject.description,
        visibility: sharedProject.visibility,
        createdAt: sharedProject.createdAt,
        updatedAt: sharedProject.updatedAt,
        publicHref: sharedProject.publicHref,
      },
      developerSpaces: spaceRows.map(serializeSharedDeveloperSpace),
      evidence,
    },
    error: false,
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isUniqueViolation(error: { code?: string } | null | undefined) {
  return error?.code === "23505";
}

projectsRouter.get("/public/:slug", async (req, res) => {
  const slug = req.params.slug;
  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success || isUuid(slug)) {
    return res.status(404).json({ error: "Public Project not found." });
  }

  const sb = getSupabaseAdmin();
  const { data: project, error } = await sb
    .from("projects")
    .select("id, owner_user_id, name, slug, description, visibility, created_at, updated_at")
    .eq("slug", parsedSlug.data)
    .eq("visibility", "public")
    .maybeSingle();

  if (error) return res.status(500).json(PROJECT_ERROR_RESPONSES.publicRead);
  if (!project) return res.status(404).json({ error: "Public Project not found." });

  const { data: developerSpaces, error: developerSpacesError } = await sb
    .from("developer_spaces")
    .select("id, owner_user_id, project_name, slug, description, visibility, visualisation_type, updated_at")
    .eq("project_id", project.id)
    .eq("owner_user_id", project.owner_user_id)
    .eq("visibility", "public")
    .order("updated_at", { ascending: false });

  if (developerSpacesError) return res.status(500).json(PROJECT_ERROR_RESPONSES.publicDeveloperSpaces);

  const sortedDeveloperSpaces = [...(developerSpaces ?? [])].sort((a, b) => {
    const updated = Date.parse(b.updated_at) - Date.parse(a.updated_at);
    if (updated !== 0) return updated;
    return a.project_name.localeCompare(b.project_name);
  });

  const publicEvidenceResult = await loadPublicProjectEvidence(sortedDeveloperSpaces, project.owner_user_id);
  if (publicEvidenceResult.error) return res.status(500).json(PROJECT_ERROR_RESPONSES.publicEvidence);

  return res.json({
    project: serializePublicProject(project, sortedDeveloperSpaces.length),
    developerSpaces: sortedDeveloperSpaces
      .slice(0, PUBLIC_PROJECT_DEVELOPER_SPACE_LIMIT)
      .map(serializePublicDeveloperSpace),
    publicEvidence: publicEvidenceResult.publicEvidence ?? [],
  });
});

projectsRouter.use(requireAuth);

projectsRouter.get("/", async (req, res) => {
  setPrivateNoStore(res);
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("projects")
    .select("*")
    .eq("owner_user_id", req.user!.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(PROJECT_ERROR_RESPONSES.ownerList);
  const sharedResult = await loadSharedProjects(req.user!.id);
  if (sharedResult.error) return res.status(500).json(PROJECT_ERROR_RESPONSES.collaborationRead);
  return res.json({
    projects: (data ?? []).map(serializeProject),
    sharedProjects: sharedResult.projects,
  });
});

projectsRouter.get("/invitations", async (req, res) => {
  setPrivateNoStore(res);
  const result = await loadInvitations(req.user!.id);
  if (result.error) return res.status(500).json(PROJECT_ERROR_RESPONSES.collaborationRead);
  return res.json({ invitations: result.invitations });
});

projectsRouter.post("/", async (req, res) => {
  setPrivateNoStore(res);
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const { data: project, error } = await sb
    .rpc("create_project_with_owner_v1", {
      p_actor_user_id: req.user!.id,
      p_name: parsed.data.name,
      p_slug: parsed.data.slug,
      p_description: parsed.data.description ?? null,
      p_visibility: parsed.data.visibility as ProjectVisibility,
      p_connection_tier: parsed.data.connectionTier as ProjectConnectionTier,
    });

  if (error || !project) {
    if (isUniqueViolation(error)) return res.status(409).json({ error: "Project slug is already in use." });
    return res.status(500).json(PROJECT_ERROR_RESPONSES.create);
  }

  return res.status(201).json({ project: serializeProject(project) });
});

projectsRouter.post("/:idOrSlug/invitations", async (req, res) => {
  setPrivateNoStore(res);
  const parsed = projectUsernameSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Enter a valid Station username.",
      code: "project_collaborator_username_invalid",
    });
  }

  const ownerResult = await resolveOwnerProject(req.params.idOrSlug, req.user!.id);
  if (ownerResult.error) return res.status(500).json(PROJECT_ERROR_RESPONSES.collaborationRead);
  if (!ownerResult.project) return res.status(404).json({ error: "Project not found." });

  const sb = getSupabaseAdmin();
  const { data: target, error: targetError } = await sb
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", parsed.data.username)
    .maybeSingle();

  if (targetError) return res.status(500).json(PROJECT_ERROR_RESPONSES.collaborationWrite);
  if (!target || target.id === req.user!.id) {
    return res.status(404).json({
      error: "That Station account is not available for this invitation.",
      code: "project_collaborator_unavailable",
    });
  }

  const { data, error } = await sb.rpc("invite_project_viewer_v1", {
    p_project_id: ownerResult.project.id,
    p_actor_user_id: req.user!.id,
    p_target_user_id: target.id,
  });

  if (error) return res.status(500).json(PROJECT_ERROR_RESPONSES.collaborationWrite);
  const result = firstRpcRow(data);
  if (!result || result.outcome === "unavailable") {
    return res.status(404).json({
      error: "That Station account is not available for this invitation.",
      code: "project_collaborator_unavailable",
    });
  }
  if (result.outcome === "already_invited") {
    return res.status(409).json({
      error: "That viewer already has a current invitation.",
      code: "project_viewer_already_invited",
    });
  }
  if (result.outcome === "already_active") {
    return res.status(409).json({
      error: "That viewer already has access to this Project.",
      code: "project_viewer_already_active",
    });
  }
  if (!result.invited_at || !result.expires_at) {
    return res.status(500).json(PROJECT_ERROR_RESPONSES.collaborationWrite);
  }

  const member: ProjectViewerMember = {
    ...serializeCollaborator(target as ProfileRow),
    role: "viewer",
    status: "invited",
    invitedAt: result.invited_at,
    expiresAt: result.expires_at,
  };
  return res.status(201).json({ member });
});

projectsRouter.get("/:idOrSlug/members", async (req, res) => {
  setPrivateNoStore(res);
  const ownerResult = await resolveOwnerProject(req.params.idOrSlug, req.user!.id);
  if (ownerResult.error) return res.status(500).json(PROJECT_ERROR_RESPONSES.collaborationRead);
  if (!ownerResult.project) return res.status(404).json({ error: "Project not found." });

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("project_members")
    .select("user_id, status, created_at, invite_expires_at, responded_at")
    .eq("project_id", ownerResult.project.id)
    .eq("role", "viewer")
    .in("status", ["invited", "active"])
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(PROJECT_ERROR_RESPONSES.collaborationRead);
  const now = Date.now();
  const currentRows = ((data ?? []) as Array<Pick<
    ProjectMemberRow,
    "user_id" | "status" | "created_at" | "invite_expires_at" | "responded_at"
  >>).filter((membership) => (
    membership.status === "active"
    || (membership.invite_expires_at !== null && Date.parse(membership.invite_expires_at) > now)
  ));
  const profilesResult = await loadProfiles(currentRows.map((membership) => membership.user_id));
  if (profilesResult.error) return res.status(500).json(PROJECT_ERROR_RESPONSES.collaborationRead);

  const members = currentRows
    .map((membership): ProjectViewerMember | null => {
      const profile = profilesResult.profiles.get(membership.user_id);
      if (!profile) return null;
      return {
        ...serializeCollaborator(profile),
        role: "viewer",
        status: membership.status as "invited" | "active",
        invitedAt: membership.created_at,
        ...(membership.status === "invited" && membership.invite_expires_at
          ? { expiresAt: membership.invite_expires_at }
          : {}),
        ...(membership.status === "active" && membership.responded_at
          ? { respondedAt: membership.responded_at }
          : {}),
      };
    })
    .filter((member): member is ProjectViewerMember => Boolean(member));

  return res.json({ members });
});

async function respondToInvitation(
  req: Request,
  res: Response,
  action: "accept" | "decline"
) {
  setPrivateNoStore(res);
  if (!emptyBodySchema.safeParse(req.body ?? {}).success) {
    return res.status(400).json({ error: "This invitation action does not accept fields." });
  }

  const resolved = await resolveProject(req.params.idOrSlug);
  if (resolved.error) return res.status(500).json(PROJECT_ERROR_RESPONSES.collaborationRead);
  if (!resolved.project) {
    return res.status(404).json({
      error: "This invitation is no longer available.",
      code: "project_invitation_unavailable",
    });
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await sb.rpc("respond_project_viewer_invitation_v1", {
    p_project_id: resolved.project.id,
    p_actor_user_id: req.user!.id,
    p_action: action,
  });

  if (error) return res.status(500).json(PROJECT_ERROR_RESPONSES.collaborationWrite);
  const result = firstRpcRow(data);
  if (!result || result.outcome === "unavailable") {
    return res.status(404).json({
      error: "This invitation is no longer available.",
      code: "project_invitation_unavailable",
    });
  }
  if (result.outcome === "stale") {
    return res.status(410).json({
      error: "This invitation has expired.",
      code: "project_invitation_stale",
    });
  }

  return res.json({ status: result.outcome === "accepted" ? "active" : "removed" });
}

projectsRouter.post("/:idOrSlug/invitation/accept", (req, res) => (
  respondToInvitation(req, res, "accept")
));

projectsRouter.post("/:idOrSlug/invitation/decline", (req, res) => (
  respondToInvitation(req, res, "decline")
));

projectsRouter.post("/:idOrSlug/members/revoke", async (req, res) => {
  setPrivateNoStore(res);
  const parsed = projectUsernameSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Enter a valid Station username.",
      code: "project_collaborator_username_invalid",
    });
  }

  const ownerResult = await resolveOwnerProject(req.params.idOrSlug, req.user!.id);
  if (ownerResult.error) return res.status(500).json(PROJECT_ERROR_RESPONSES.collaborationRead);
  if (!ownerResult.project) return res.status(404).json({ error: "Project not found." });

  const sb = getSupabaseAdmin();
  const { data: target, error: targetError } = await sb
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", parsed.data.username)
    .maybeSingle();

  if (targetError) return res.status(500).json(PROJECT_ERROR_RESPONSES.collaborationWrite);
  if (!target || target.id === req.user!.id) {
    return res.status(404).json({
      error: "That viewer is no longer available on this Project.",
      code: "project_viewer_unavailable",
    });
  }

  const { data, error } = await sb.rpc("revoke_project_viewer_v1", {
    p_project_id: ownerResult.project.id,
    p_actor_user_id: req.user!.id,
    p_target_user_id: target.id,
  });

  if (error) return res.status(500).json(PROJECT_ERROR_RESPONSES.collaborationWrite);
  const result = firstRpcRow(data);
  if (!result || result.outcome !== "revoked") {
    return res.status(404).json({
      error: "That viewer is no longer available on this Project.",
      code: "project_viewer_unavailable",
    });
  }

  return res.json({ status: "removed" });
});

projectsRouter.get("/:idOrSlug", async (req, res) => {
  setPrivateNoStore(res);
  const idOrSlug = req.params.idOrSlug;
  const resolved = await resolveProject(idOrSlug);
  if (resolved.error) return res.status(500).json(PROJECT_ERROR_RESPONSES.ownerRead);
  if (!resolved.project) return res.status(404).json({ error: "Project not found." });

  const data = resolved.project;
  if (data.owner_user_id !== req.user!.id) {
    const sharedResult = await loadSharedProjectDetail(data, req.user!.id);
    if (sharedResult.error) return res.status(500).json(PROJECT_ERROR_RESPONSES.sharedRead);
    if (!sharedResult.detail) return res.status(404).json({ error: "Project not found." });
    return res.json(sharedResult.detail);
  }

  const sb = getSupabaseAdmin();

  const { data: developerSpaces, error: developerSpacesError } = await sb
    .from("developer_spaces")
    .select("id, owner_user_id, project_name, slug, description, visibility, visualisation_type, created_at, updated_at")
    .eq("project_id", data.id)
    .eq("owner_user_id", req.user!.id)
    .order("created_at", { ascending: false });

  if (developerSpacesError) return res.status(500).json(PROJECT_ERROR_RESPONSES.ownerDeveloperSpaces);

  const { data: usageRows, error: usageError } = await sb
    .from("developer_space_usage")
    .select("ingested_nodes_count, ingested_events_count, ingested_snapshots_count, storage_bytes, public_detail_reads_count, export_count")
    .eq("project_id", data.id)
    .eq("owner_user_id", req.user!.id);

  if (usageError) return res.status(500).json(PROJECT_ERROR_RESPONSES.ownerActivity);

  const evidenceResult = await loadProjectEvidence(developerSpaces ?? [], req.user!.id);
  if (evidenceResult.error) return res.status(500).json(PROJECT_ERROR_RESPONSES.ownerEvidence);

  return res.json({
    access: OWNER_ACCESS,
    project: serializeProject(data),
    developerSpaces: (developerSpaces ?? []).map(serializeAttachedDeveloperSpace),
    activity: serializeProjectActivity(usageRows ?? [], developerSpaces?.length ?? 0),
    evidence: evidenceResult.evidence ?? [],
  });
});
