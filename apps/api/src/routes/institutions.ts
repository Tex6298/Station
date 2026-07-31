import { Router, type Request, type Response } from "express";
import { z } from "zod";
import type { Database, ProjectConnectionTier, ProjectVisibility } from "@station/db";
import type {
  InstitutionAccess,
  InstitutionAdminSummary,
  InstitutionIdentity,
  InstitutionInvitation,
  InstitutionProjectSummary,
  InstitutionSummary,
  InstitutionTeamMember,
  InstitutionTeamResponse,
  PublicInstitutionResponse,
} from "@station/types";
import { getSupabaseAdmin } from "../lib/supabase";
import { requireAuth } from "../middleware/require-auth";

type InstitutionRow = Database["public"]["Tables"]["institutions"]["Row"];
type InstitutionMemberRow = Database["public"]["Tables"]["institution_members"]["Row"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type InstitutionSpaceRow = Database["public"]["Tables"]["institution_spaces"]["Row"];
type InstitutionPublicationRow = Database["public"]["Tables"]["institution_publications"]["Row"];
type ProfileIdentityRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "username" | "display_name"
>;

const slugSchema = z.string().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const usernameSchema = z.string().trim().min(3).max(30).regex(/^[A-Za-z0-9_-]+$/);
const usernameBodySchema = z.object({ username: usernameSchema }).strict();
const emptyBodySchema = z.object({}).strict();
const provisionSchema = z.object({
  ownerUsername: usernameSchema,
  name: z.string().trim().min(1).max(120),
  slug: slugSchema,
  summary: z.string().trim().min(1).max(1000).nullable().optional(),
}).strict();
const verificationSchema = z.object({ verified: z.boolean() }).strict();
const publicationSchema = z.object({ public: z.boolean() }).strict();
const projectVisibilitySchema = z.enum(["private", "unlisted", "community", "public"]);
const projectConnectionTierSchema = z.enum(["tier_1_showcase", "tier_2_hosted", "tier_3_lab"]);
const createInstitutionProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: slugSchema,
  description: z.string().trim().max(4000).nullable().optional(),
  visibility: projectVisibilitySchema.default("private"),
  connectionTier: projectConnectionTierSchema.default("tier_1_showcase"),
}).strict();

const OWNER_ACCESS = {
  role: "owner",
  readOnly: false,
  canManageTeam: true,
  canManagePublication: true,
} as const;
const MEMBER_ACCESS = {
  role: "member",
  readOnly: true,
  canManageTeam: false,
  canManagePublication: false,
} as const;
const INSTITUTION_PROJECT_OWNER_ACCESS = { role: "institution_owner", readOnly: false } as const;
const INSTITUTION_PROJECT_MEMBER_ACCESS = { role: "institution_member", readOnly: true } as const;

const INSTITUTION_NOT_FOUND = {
  error: "Institution not found.",
  code: "institution_not_found",
} as const;
const INSTITUTION_READ_FAILED = {
  error: "Could not load institutions.",
  code: "institution_load_failed",
} as const;
const INSTITUTION_WRITE_FAILED = {
  error: "Could not update institution access.",
  code: "institution_update_failed",
} as const;

export const institutionsRouter = Router();

function setPrivateNoStore(res: Response) {
  res.set("Cache-Control", "private, no-store");
}

function setPublicNoStore(res: Response) {
  res.set("Cache-Control", "no-store");
}

function firstRpcRow<T>(data: T | T[] | null): T | null {
  return Array.isArray(data) ? data[0] ?? null : data;
}

function publicHref(row: Pick<InstitutionRow, "slug" | "verification_status" | "public_status">) {
  return row.verification_status === "verified" && row.public_status === "public"
    ? `/institutions/${encodeURIComponent(row.slug)}`
    : null;
}

function serializeIdentity(profile: ProfileIdentityRow): InstitutionIdentity {
  return {
    username: profile.username,
    displayName: profile.display_name,
  };
}

function serializeInstitutionBase(row: InstitutionRow): Omit<InstitutionSummary, "access"> {
  return {
    name: row.name,
    slug: row.slug,
    summary: row.summary,
    verificationStatus: row.verification_status,
    publicStatus: row.public_status,
    publicHref: publicHref(row),
  };
}

function serializeInstitution(row: InstitutionRow, access: InstitutionAccess): InstitutionSummary {
  return {
    ...serializeInstitutionBase(row),
    access,
  };
}

function serializeInstitutionProject(
  project: ProjectRow,
  institution: InstitutionRow,
  access: typeof INSTITUTION_PROJECT_OWNER_ACCESS | typeof INSTITUTION_PROJECT_MEMBER_ACCESS
): InstitutionProjectSummary {
  return {
    name: project.name,
    slug: project.slug,
    description: project.description,
    visibility: project.visibility,
    connectionTier: project.connection_tier,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    publicHref: project.visibility === "public"
      && institution.verification_status === "verified"
      && institution.public_status === "public"
      ? `/projects/public/${encodeURIComponent(project.slug)}`
      : null,
    institution: {
      name: institution.name,
      slug: institution.slug,
      href: publicHref(institution),
    },
    access,
  };
}

function serializeAdminInstitution(
  row: InstitutionRow,
  owner: ProfileIdentityRow
): InstitutionAdminSummary {
  return {
    ...serializeInstitutionBase(row),
    owner: serializeIdentity(owner),
    verifiedAt: row.verified_at,
    verificationRevokedAt: row.verification_revoked_at,
    publishedAt: row.published_at,
    unpublishedAt: row.unpublished_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function loadProfiles(ids: string[]) {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) {
    return { profiles: new Map<string, ProfileIdentityRow>(), error: false };
  }

  const { data, error } = await getSupabaseAdmin()
    .from("profiles")
    .select("id, username, display_name")
    .in("id", uniqueIds);

  return {
    profiles: new Map((data ?? []).map((profile) => [profile.id, profile as ProfileIdentityRow])),
    error: Boolean(error),
  };
}

async function resolveInstitution(slug: string) {
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return { institution: null, error: false };

  const { data, error } = await getSupabaseAdmin()
    .from("institutions")
    .select("*")
    .eq("slug", parsed.data)
    .maybeSingle();

  return { institution: data as InstitutionRow | null, error: Boolean(error) };
}

async function resolvePrivateAccess(institution: InstitutionRow, userId: string) {
  if (institution.owner_user_id === userId) {
    return { access: OWNER_ACCESS as InstitutionAccess, error: false };
  }

  const { data, error } = await getSupabaseAdmin()
    .from("institution_members")
    .select("id")
    .eq("institution_id", institution.id)
    .eq("user_id", userId)
    .eq("role", "member")
    .eq("status", "active")
    .maybeSingle();

  return {
    access: data ? MEMBER_ACCESS as InstitutionAccess : null,
    error: Boolean(error),
  };
}

async function loadAdminSummary(institution: InstitutionRow) {
  const profilesResult = await loadProfiles([institution.owner_user_id]);
  const owner = profilesResult.profiles.get(institution.owner_user_id);
  return {
    summary: owner ? serializeAdminInstitution(institution, owner) : null,
    error: profilesResult.error || !owner,
  };
}

function requireAdmin(req: Request, res: Response) {
  if (!req.user?.isAdmin) {
    res.status(404).json(INSTITUTION_NOT_FOUND);
    return false;
  }
  return true;
}

institutionsRouter.get("/public/:slug", async (req, res) => {
  setPublicNoStore(res);
  const parsed = slugSchema.safeParse(req.params.slug);
  if (!parsed.success) return res.status(404).json(INSTITUTION_NOT_FOUND);

  const { data, error } = await getSupabaseAdmin()
    .from("institutions")
    .select("id, name, slug, summary, verification_status, public_status")
    .eq("slug", parsed.data)
    .eq("verification_status", "verified")
    .eq("public_status", "public")
    .maybeSingle();

  if (error) return res.status(500).json(INSTITUTION_READ_FAILED);
  if (!data) return res.status(404).json(INSTITUTION_NOT_FOUND);

  const response: PublicInstitutionResponse = {
    institution: {
      name: data.name,
      slug: data.slug,
      summary: data.summary,
      verified: true,
    },
  };
  const { data: spaceData, error: spaceError } = await getSupabaseAdmin().from("institution_spaces").select("*").eq("institution_id", data.id).maybeSingle();
  if (spaceError) return res.status(500).json(INSTITUTION_READ_FAILED);
  const space = spaceData as InstitutionSpaceRow | null;
  if (space?.status === "published" && space.published_at) {
    const { data: projectData, error: projectError } = await getSupabaseAdmin().from("projects").select("*").eq("institution_id", data.id).eq("visibility", "public").order("updated_at", { ascending: false });
    const { data: publicationData, error: publicationError } = await getSupabaseAdmin().from("institution_publications").select("*").eq("institution_id", data.id).eq("status", "published").order("published_at", { ascending: false });
    if (projectError || publicationError) return res.status(500).json(INSTITUTION_READ_FAILED);
    const projects = (projectData ?? []) as ProjectRow[];
    const projectMap = new Map(projects.map((project) => [project.id, project]));
    response.space = { markText:space.mark_text,headline:space.headline,about:space.about,accentKey:space.accent_key,publishedAt:space.published_at,creatorLabel:space.creator_label,lastEditorLabel:space.last_editor_label };
    response.projects = projects.map((project)=>({name:project.name,slug:project.slug,description:project.description,connectionTier:project.connection_tier,href:`/projects/public/${encodeURIComponent(project.slug)}`}));
    response.publications = ((publicationData ?? []) as InstitutionPublicationRow[]).map((publication)=>{const project=projectMap.get(publication.project_id);if(!project||!publication.published_at)return null;return{title:publication.title,slug:publication.slug,summary:publication.summary,documentType:publication.document_type,publishedAt:publication.published_at,creatorLabel:publication.creator_label,lastEditorLabel:publication.last_editor_label,href:`/institutions/${encodeURIComponent(data.slug)}/publications/public/${encodeURIComponent(publication.slug)}`,project:{name:project.name,slug:project.slug,href:`/projects/public/${encodeURIComponent(project.slug)}`}}}).filter((item):item is NonNullable<typeof item>=>Boolean(item));
  }
  return res.json(response);
});

institutionsRouter.use(requireAuth);
institutionsRouter.use((_req, res, next) => {
  setPrivateNoStore(res);
  next();
});

institutionsRouter.get("/admin", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const { data, error } = await getSupabaseAdmin()
    .from("institutions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(INSTITUTION_READ_FAILED);
  const rows = (data ?? []) as InstitutionRow[];
  const profilesResult = await loadProfiles(rows.map((row) => row.owner_user_id));
  if (profilesResult.error) return res.status(500).json(INSTITUTION_READ_FAILED);

  const institutions = rows
    .map((row) => {
      const owner = profilesResult.profiles.get(row.owner_user_id);
      return owner ? serializeAdminInstitution(row, owner) : null;
    })
    .filter((row): row is InstitutionAdminSummary => Boolean(row));

  if (institutions.length !== rows.length) {
    return res.status(500).json(INSTITUTION_READ_FAILED);
  }
  return res.json({ institutions });
});

institutionsRouter.post("/admin", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const parsed = provisionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Enter valid institution details.",
      code: "institution_details_invalid",
    });
  }

  const sb = getSupabaseAdmin();
  const { data: owner, error: ownerError } = await sb
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", parsed.data.ownerUsername)
    .maybeSingle();

  if (ownerError) return res.status(500).json(INSTITUTION_WRITE_FAILED);
  if (!owner) return res.status(404).json(INSTITUTION_NOT_FOUND);

  const { data, error } = await sb.rpc("provision_institution_v1", {
    p_actor_user_id: req.user!.id,
    p_owner_user_id: owner.id,
    p_name: parsed.data.name,
    p_slug: parsed.data.slug,
    p_summary: parsed.data.summary ?? null,
  });

  if (error) return res.status(500).json(INSTITUTION_WRITE_FAILED);
  const result = firstRpcRow(data);
  if (!result || result.outcome === "unavailable") {
    return res.status(404).json(INSTITUTION_NOT_FOUND);
  }
  if (result.outcome === "conflict") {
    return res.status(409).json({
      error: "Institution slug is already in use.",
      code: "institution_slug_conflict",
    });
  }
  if (!result.institution_id) return res.status(500).json(INSTITUTION_WRITE_FAILED);

  const { data: institution, error: institutionError } = await sb
    .from("institutions")
    .select("*")
    .eq("id", result.institution_id)
    .maybeSingle();
  if (institutionError || !institution) return res.status(500).json(INSTITUTION_WRITE_FAILED);

  return res.status(201).json({
    institution: serializeAdminInstitution(institution as InstitutionRow, owner as ProfileIdentityRow),
  });
});

institutionsRouter.post("/admin/:slug/verification", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const parsed = verificationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Choose a valid verification state.",
      code: "institution_verification_invalid",
    });
  }

  const resolved = await resolveInstitution(req.params.slug);
  if (resolved.error) return res.status(500).json(INSTITUTION_READ_FAILED);
  if (!resolved.institution) return res.status(404).json(INSTITUTION_NOT_FOUND);

  const sb = getSupabaseAdmin();
  const { data, error } = await sb.rpc("transition_institution_verification_v1", {
    p_institution_id: resolved.institution.id,
    p_actor_user_id: req.user!.id,
    p_verified: parsed.data.verified,
  });
  if (error) return res.status(500).json(INSTITUTION_WRITE_FAILED);
  const result = firstRpcRow(data);
  if (!result || result.outcome === "unavailable") {
    return res.status(404).json(INSTITUTION_NOT_FOUND);
  }

  const refreshed = await resolveInstitution(req.params.slug);
  if (refreshed.error || !refreshed.institution) {
    return res.status(500).json(INSTITUTION_WRITE_FAILED);
  }
  const summaryResult = await loadAdminSummary(refreshed.institution);
  if (summaryResult.error || !summaryResult.summary) {
    return res.status(500).json(INSTITUTION_WRITE_FAILED);
  }
  return res.json({ institution: summaryResult.summary });
});

institutionsRouter.get("/invitations", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("institution_members")
    .select("institution_id, status, created_at, invite_expires_at")
    .eq("user_id", req.user!.id)
    .eq("role", "member")
    .eq("status", "invited")
    .gt("invite_expires_at", "now")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(INSTITUTION_READ_FAILED);
  const memberships = (data ?? []) as Array<Pick<
    InstitutionMemberRow,
    "institution_id" | "status" | "created_at" | "invite_expires_at"
  >>;
  if (memberships.length === 0) return res.json({ invitations: [] });

  const { data: institutionRows, error: institutionError } = await sb
    .from("institutions")
    .select("*")
    .in("id", memberships.map((membership) => membership.institution_id));
  if (institutionError) return res.status(500).json(INSTITUTION_READ_FAILED);

  const institutions = new Map(
    ((institutionRows ?? []) as InstitutionRow[]).map((row) => [row.id, row])
  );
  const profilesResult = await loadProfiles(
    [...institutions.values()].map((row) => row.owner_user_id)
  );
  if (profilesResult.error) return res.status(500).json(INSTITUTION_READ_FAILED);

  const invitations = memberships
    .map((membership): InstitutionInvitation | null => {
      const institution = institutions.get(membership.institution_id);
      const owner = institution
        ? profilesResult.profiles.get(institution.owner_user_id)
        : null;
      if (!institution || !owner) return null;
      return {
        institution: serializeInstitutionBase(institution),
        owner: serializeIdentity(owner),
        role: "member",
        status: "invited",
        invitedAt: membership.created_at,
        expiresAt: membership.invite_expires_at,
      };
    })
    .filter((invitation): invitation is InstitutionInvitation => Boolean(invitation));

  if (invitations.length !== memberships.length) {
    return res.status(500).json(INSTITUTION_READ_FAILED);
  }
  return res.json({ invitations });
});

institutionsRouter.get("/", async (req, res) => {
  const sb = getSupabaseAdmin();
  const [ownerResult, memberResult] = await Promise.all([
    sb
      .from("institutions")
      .select("*")
      .eq("owner_user_id", req.user!.id)
      .order("created_at", { ascending: false }),
    sb
      .from("institution_members")
      .select("institution_id")
      .eq("user_id", req.user!.id)
      .eq("role", "member")
      .eq("status", "active"),
  ]);

  if (ownerResult.error || memberResult.error) {
    return res.status(500).json(INSTITUTION_READ_FAILED);
  }

  const ownerRows = (ownerResult.data ?? []) as InstitutionRow[];
  const memberIds = (memberResult.data ?? []).map((row) => row.institution_id);
  let memberRows: InstitutionRow[] = [];
  if (memberIds.length > 0) {
    const memberInstitutions = await sb
      .from("institutions")
      .select("*")
      .in("id", memberIds)
      .order("created_at", { ascending: false });
    if (memberInstitutions.error) return res.status(500).json(INSTITUTION_READ_FAILED);
    memberRows = (memberInstitutions.data ?? []) as InstitutionRow[];
  }

  return res.json({
    institutions: [
      ...ownerRows.map((row) => serializeInstitution(row, OWNER_ACCESS)),
      ...memberRows.map((row) => serializeInstitution(row, MEMBER_ACCESS)),
    ],
  });
});

institutionsRouter.get("/:slug/team", async (req, res) => {
  const resolved = await resolveInstitution(req.params.slug);
  if (resolved.error) return res.status(500).json(INSTITUTION_READ_FAILED);
  if (!resolved.institution) return res.status(404).json(INSTITUTION_NOT_FOUND);

  const accessResult = await resolvePrivateAccess(resolved.institution, req.user!.id);
  if (accessResult.error) return res.status(500).json(INSTITUTION_READ_FAILED);
  if (!accessResult.access) return res.status(404).json(INSTITUTION_NOT_FOUND);

  const sb = getSupabaseAdmin();
  const { data: projectData, error: projectError } = await sb
    .from("projects")
    .select("*")
    .eq("institution_id", resolved.institution.id)
    .order("created_at", { ascending: false });
  if (projectError) return res.status(500).json(INSTITUTION_READ_FAILED);

  let query = sb
    .from("institution_members")
    .select("user_id, role, status, invite_expires_at, responded_at, created_at")
    .eq("institution_id", resolved.institution.id)
    .eq("role", "member")
    .order("created_at", { ascending: true });

  query = accessResult.access.role === "owner"
    ? query.in("status", ["invited", "active"]).or("status.eq.active,invite_expires_at.gt.now")
    : query.eq("status", "active");

  const { data, error } = await query;
  if (error) return res.status(500).json(INSTITUTION_READ_FAILED);
  const memberRows = (data ?? []) as Array<Pick<
    InstitutionMemberRow,
    "user_id" | "role" | "status" | "invite_expires_at" | "responded_at" | "created_at"
  >>;
  const profilesResult = await loadProfiles([
    resolved.institution.owner_user_id,
    ...memberRows.map((row) => row.user_id),
  ]);
  if (profilesResult.error) return res.status(500).json(INSTITUTION_READ_FAILED);
  const owner = profilesResult.profiles.get(resolved.institution.owner_user_id);
  if (!owner) return res.status(500).json(INSTITUTION_READ_FAILED);

  const members = memberRows
    .map((row): InstitutionTeamMember | null => {
      const profile = profilesResult.profiles.get(row.user_id);
      if (!profile || row.status === "removed") return null;
      return {
        ...serializeIdentity(profile),
        role: "member",
        status: row.status,
        invitedAt: row.created_at,
        ...(row.status === "invited" ? { expiresAt: row.invite_expires_at } : {}),
        ...(row.status === "active" && row.responded_at
          ? { respondedAt: row.responded_at }
          : {}),
      };
    })
    .filter((member): member is InstitutionTeamMember => Boolean(member));

  if (members.length !== memberRows.length) {
    return res.status(500).json(INSTITUTION_READ_FAILED);
  }

  const response: InstitutionTeamResponse = {
    institution: serializeInstitution(resolved.institution, accessResult.access),
    owner: {
      ...serializeIdentity(owner),
      role: "owner",
      status: "active",
    },
    members,
    projects: ((projectData ?? []) as ProjectRow[]).map((project) => (
      serializeInstitutionProject(
        project,
        resolved.institution!,
        accessResult.access!.role === "owner"
          ? INSTITUTION_PROJECT_OWNER_ACCESS
          : INSTITUTION_PROJECT_MEMBER_ACCESS
      )
    )),
  };
  return res.json(response);
});

institutionsRouter.post("/:slug/projects", async (req, res) => {
  const parsed = createInstitutionProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Enter valid Project details.",
      code: "institution_project_details_invalid",
    });
  }

  const resolved = await resolveInstitution(req.params.slug);
  if (resolved.error) return res.status(500).json(INSTITUTION_READ_FAILED);
  if (!resolved.institution || resolved.institution.owner_user_id !== req.user!.id) {
    return res.status(404).json(INSTITUTION_NOT_FOUND);
  }

  const { data, error } = await getSupabaseAdmin().rpc("create_institution_project_v1", {
    p_institution_id: resolved.institution.id,
    p_actor_user_id: req.user!.id,
    p_name: parsed.data.name,
    p_slug: parsed.data.slug,
    p_description: parsed.data.description ?? null,
    p_visibility: parsed.data.visibility as ProjectVisibility,
    p_connection_tier: parsed.data.connectionTier as ProjectConnectionTier,
  });
  if (error || !data) {
    if (error?.code === "23505") {
      return res.status(409).json({
        error: "Project slug is already in use.",
        code: "institution_project_slug_conflict",
      });
    }
    return res.status(500).json(INSTITUTION_WRITE_FAILED);
  }

  return res.status(201).json({
    project: serializeInstitutionProject(
      data as ProjectRow,
      resolved.institution,
      INSTITUTION_PROJECT_OWNER_ACCESS
    ),
  });
});

institutionsRouter.post("/:slug/invitations", async (req, res) => {
  const parsed = usernameBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Enter a valid Station username.",
      code: "institution_member_username_invalid",
    });
  }

  const resolved = await resolveInstitution(req.params.slug);
  if (resolved.error) return res.status(500).json(INSTITUTION_READ_FAILED);
  if (!resolved.institution || resolved.institution.owner_user_id !== req.user!.id) {
    return res.status(404).json(INSTITUTION_NOT_FOUND);
  }

  const sb = getSupabaseAdmin();
  const { data: target, error: targetError } = await sb
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", parsed.data.username)
    .maybeSingle();
  if (targetError) return res.status(500).json(INSTITUTION_WRITE_FAILED);
  if (!target || target.id === req.user!.id) {
    return res.status(404).json(INSTITUTION_NOT_FOUND);
  }

  const { data, error } = await sb.rpc("invite_institution_member_v1", {
    p_institution_id: resolved.institution.id,
    p_actor_user_id: req.user!.id,
    p_target_user_id: target.id,
  });
  if (error) return res.status(500).json(INSTITUTION_WRITE_FAILED);
  const result = firstRpcRow(data);
  if (!result || result.outcome === "unavailable") {
    return res.status(404).json(INSTITUTION_NOT_FOUND);
  }
  if (result.outcome === "already_invited") {
    return res.status(409).json({
      error: "That member already has a current invitation.",
      code: "institution_member_already_invited",
    });
  }
  if (result.outcome === "already_active") {
    return res.status(409).json({
      error: "That member already belongs to this institution.",
      code: "institution_member_already_active",
    });
  }
  if (!result.invited_at || !result.expires_at) {
    return res.status(500).json(INSTITUTION_WRITE_FAILED);
  }

  const member: InstitutionTeamMember = {
    ...serializeIdentity(target as ProfileIdentityRow),
    role: "member",
    status: "invited",
    invitedAt: result.invited_at,
    expiresAt: result.expires_at,
  };
  return res.status(201).json({ member });
});

async function respondToInvitation(
  req: Request,
  res: Response,
  action: "accept" | "decline"
) {
  if (!emptyBodySchema.safeParse(req.body ?? {}).success) {
    return res.status(400).json({
      error: "This invitation action does not accept fields.",
      code: "institution_invitation_body_invalid",
    });
  }

  const resolved = await resolveInstitution(req.params.slug);
  if (resolved.error) return res.status(500).json(INSTITUTION_READ_FAILED);
  if (!resolved.institution) return res.status(404).json(INSTITUTION_NOT_FOUND);

  const { data, error } = await getSupabaseAdmin().rpc(
    "respond_institution_invitation_v1",
    {
      p_institution_id: resolved.institution.id,
      p_actor_user_id: req.user!.id,
      p_action: action,
    }
  );
  if (error) return res.status(500).json(INSTITUTION_WRITE_FAILED);
  const result = firstRpcRow(data);
  if (!result || result.outcome === "unavailable") {
    return res.status(404).json(INSTITUTION_NOT_FOUND);
  }
  if (result.outcome === "stale") {
    return res.status(410).json({
      error: "This institution invitation has expired.",
      code: "institution_invitation_stale",
    });
  }

  return res.json({ status: result.outcome === "accepted" ? "active" : "removed" });
}

institutionsRouter.post("/:slug/invitation/accept", (req, res) => (
  respondToInvitation(req, res, "accept")
));

institutionsRouter.post("/:slug/invitation/decline", (req, res) => (
  respondToInvitation(req, res, "decline")
));

institutionsRouter.post("/:slug/members/revoke", async (req, res) => {
  const parsed = usernameBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Enter a valid Station username.",
      code: "institution_member_username_invalid",
    });
  }

  const resolved = await resolveInstitution(req.params.slug);
  if (resolved.error) return res.status(500).json(INSTITUTION_READ_FAILED);
  if (!resolved.institution || resolved.institution.owner_user_id !== req.user!.id) {
    return res.status(404).json(INSTITUTION_NOT_FOUND);
  }

  const sb = getSupabaseAdmin();
  const { data: target, error: targetError } = await sb
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", parsed.data.username)
    .maybeSingle();
  if (targetError) return res.status(500).json(INSTITUTION_WRITE_FAILED);
  if (!target || target.id === req.user!.id) {
    return res.status(404).json(INSTITUTION_NOT_FOUND);
  }

  const { data, error } = await sb.rpc("revoke_institution_member_v1", {
    p_institution_id: resolved.institution.id,
    p_actor_user_id: req.user!.id,
    p_target_user_id: target.id,
  });
  if (error) return res.status(500).json(INSTITUTION_WRITE_FAILED);
  const result = firstRpcRow(data);
  if (!result || result.outcome !== "revoked") {
    return res.status(404).json(INSTITUTION_NOT_FOUND);
  }
  return res.json({ status: "removed" });
});

institutionsRouter.post("/:slug/publication", async (req, res) => {
  const parsed = publicationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Choose a valid publication state.",
      code: "institution_publication_invalid",
    });
  }

  const resolved = await resolveInstitution(req.params.slug);
  if (resolved.error) return res.status(500).json(INSTITUTION_READ_FAILED);
  if (!resolved.institution || resolved.institution.owner_user_id !== req.user!.id) {
    return res.status(404).json(INSTITUTION_NOT_FOUND);
  }

  const { data, error } = await getSupabaseAdmin().rpc(
    "transition_institution_publication_v1",
    {
      p_institution_id: resolved.institution.id,
      p_actor_user_id: req.user!.id,
      p_public: parsed.data.public,
    }
  );
  if (error) return res.status(500).json(INSTITUTION_WRITE_FAILED);
  const result = firstRpcRow(data);
  if (!result || result.outcome === "unavailable") {
    return res.status(404).json(INSTITUTION_NOT_FOUND);
  }
  if (result.outcome === "not_verified") {
    return res.status(409).json({
      error: "Only verified institutions can be published.",
      code: "institution_verification_required",
    });
  }

  const refreshed = await resolveInstitution(req.params.slug);
  if (refreshed.error || !refreshed.institution) {
    return res.status(500).json(INSTITUTION_WRITE_FAILED);
  }
  return res.json({
    institution: serializeInstitution(refreshed.institution, OWNER_ACCESS),
  });
});
