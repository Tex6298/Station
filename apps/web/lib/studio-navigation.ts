import type { PersonaSummary } from "@station/types/persona";

export const STUDIO_MOBILE_NAV_SUMMARY_LABEL = "Toggle Studio mobile navigation";
export const SIGNED_MOBILE_TOP_NAV_MENU_ROUTES = ["/studio", "/projects", "/space", "/developer-spaces"] as const;
export const STUDIO_CONVERSATION_QUERY = "c";

export type StudioRouteContext = {
  label: string;
  detail: string;
  privacy: string;
  state: string;
  href: string;
  nextAction: {
    label: string;
    href: string;
  };
};

export type StudioDashboardMemoryStop = {
  label: "Memory";
  href: string;
  actionLabel: string;
  statusLabel: string;
  statusDetail: string;
  body: string;
  privacy: string;
};

export type StudioPersonaCompanionShortcut = {
  label: "Memory" | "Inbox" | "Timeline" | "Profile" | "Integrity";
  href: string;
  detail: string;
};

export const studioPublicLinks = [
  { label: "Blog Posts", href: "/studio/publishing", mark: "B" },
  { label: "Public Space", href: "/space", mark: "P" },
] as const;

export const studioWorkspaceLinks = [
  { label: "Onboarding Paths", href: "/studio/onboarding", mark: "O", detail: "Start, migrate, bridge" },
  { label: "Station Assistant", href: "/studio/assistant", mark: "?", detail: "Archive and publishing help" },
  { label: "Global Archive", href: "/studio/archive", mark: "A", detail: "Owner-only archive search" },
  { label: "Notes and Scratchpad", href: "/studio/notes", mark: "N", detail: "Private working notes" },
  { label: "Export Workspace", href: "/studio/export", mark: "E", detail: "Portable bundle planning" },
  { label: "Settings", href: "/settings", mark: "S" },
] as const;

const personaWorkspaceTabSpecs = [
  {
    label: "Home",
    suffix: "",
    detail: "Persona overview and continuity brief",
    state: "Chat and continuity stay private until you publish.",
    nextActionLabel: "Open Memory",
    nextActionSuffix: "/memory",
  },
  {
    label: "Continuity",
    suffix: "/continuity",
    detail: "Timeline records and runtime context",
    state: "Continuity records are durable owner-only context.",
    nextActionLabel: "Review Memory",
    nextActionSuffix: "/memory",
  },
  {
    label: "Memory",
    suffix: "/memory",
    detail: "Recallable context and lifecycle state",
    state: "Saved memory can shape runtime context.",
    nextActionLabel: "Open Archive",
    nextActionSuffix: "/files",
  },
  {
    label: "Canon",
    suffix: "/canon",
    detail: "Stable rules and commitments",
    state: "Canon carries priority when runtime context is selected.",
    nextActionLabel: "Review Continuity",
    nextActionSuffix: "/continuity",
  },
  {
    label: "Archive",
    suffix: "/files",
    detail: "Private source material and imports",
    state: "Files, imports, and archived chats remain owner-only source material.",
    nextActionLabel: "Review Continuity",
    nextActionSuffix: "/continuity",
  },
  {
    label: "Integrity",
    suffix: "/calibration",
    detail: "Guided checks and history",
    state: "Outputs wait for owner review before becoming continuity.",
    nextActionLabel: "Open Continuity",
    nextActionSuffix: "/continuity",
  },
] as const;

const personaWorkspaceAuxiliarySpecs = [
  {
    label: "Inbox",
    suffix: "/memory-inbox",
    detail: "Suggested Memory and Canon awaiting owner review",
    state: "Pending suggestions remain private until the owner accepts or rejects them.",
    nextActionLabel: "Back to chat",
    nextActionSuffix: "",
  },
  {
    label: "Profile",
    suffix: "/edit",
    detail: "Identity, boundaries, and public controls",
    state: "Profile changes remain owner-controlled and do not publish private continuity.",
    nextActionLabel: "Back to chat",
    nextActionSuffix: "",
  },
] as const;

const studioStaticRouteContexts: StudioRouteContext[] = [
  {
    label: "Dashboard",
    href: "/studio",
    detail: "Private workbench overview",
    privacy: "Owner-only Studio",
    state: "Private work stays in Studio until you choose to publish.",
    nextAction: { label: "New Persona", href: "/studio/new" },
  },
  {
    label: "New Persona",
    href: "/studio/new",
    detail: "Create a private persona workspace",
    privacy: "Owner-only setup",
    state: "Draft setup stays private while you shape the persona.",
    nextAction: { label: "Back to Studio", href: "/studio" },
  },
  {
    label: "Onboarding Paths",
    href: "/studio/onboarding",
    detail: "Choose a starting path",
    privacy: "Owner-only setup",
    state: "Path progress is owner-only and can feed later Studio work.",
    nextAction: { label: "New Persona", href: "/studio/new" },
  },
  {
    label: "Publish",
    href: "/studio/publish",
    detail: "Prepare public-safe work",
    privacy: "Owner review required",
    state: "Drafts stay private until an owner publishes them.",
    nextAction: { label: "Publishing Dashboard", href: "/studio/publishing" },
  },
  {
    label: "Publishing",
    href: "/studio/publishing",
    detail: "Drafts and public-writing handoff",
    privacy: "Owner-controlled publishing",
    state: "Public copies require owner approval and visibility review.",
    nextAction: { label: "Create Draft", href: "/studio/publish" },
  },
  {
    label: "Station Assistant",
    href: "/studio/assistant",
    detail: "Operational helper for Studio work",
    privacy: "Owner-only helper",
    state: "Assistant guidance does not publish or move private material.",
    nextAction: { label: "Open Archive", href: "/studio/archive" },
  },
  {
    label: "Global Archive",
    href: "/studio/archive",
    detail: "Live owner-only archive search",
    privacy: "Private archive",
    state: "Global Archive searches preserved owner-only material; persona Archive tabs handle source intake.",
    nextAction: { label: "Review Exports", href: "/studio/export" },
  },
  {
    label: "Export Workspace",
    href: "/studio/export",
    detail: "Portable bundle planning",
    privacy: "Owner-only export planning",
    state: "Export readbacks describe what Station can preserve for the owner.",
    nextAction: { label: "Open Personas", href: "/studio" },
  },
  {
    label: "Notes and Scratchpad",
    href: "/studio/notes",
    detail: "Private working notes",
    privacy: "Owner-only notes",
    state: "Notes stay in the private scratchpad until copied elsewhere.",
    nextAction: { label: "Back to Studio", href: "/studio" },
  },
];

export function activeStudioHref(pathname: string, href: string) {
  if (href === "/studio") return pathname === "/studio";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function studioPersonaHref(persona: Pick<PersonaSummary, "id">) {
  return `/studio/personas/${persona.id}`;
}

export function isExactPersonaHomeRoute(pathname: string) {
  return /^\/studio\/personas\/[^/]+\/?$/.test(pathname);
}

export function studioPersonaIdFromRoute(pathname: string) {
  return pathname.match(/^\/studio\/personas\/([^/?#]+)/)?.[1] ?? null;
}

export function studioPersonaConversationHref(personaId: string, conversationId: string | "new") {
  const params = new URLSearchParams({ [STUDIO_CONVERSATION_QUERY]: conversationId });
  return `/studio/personas/${encodeURIComponent(personaId)}?${params.toString()}`;
}

export function studioNewChatHref(
  personas: Array<Pick<PersonaSummary, "id">>,
  activePersonaId?: string | null,
) {
  const target = personas.find((persona) => persona.id === activePersonaId) ?? personas[0];
  return target ? studioPersonaConversationHref(target.id, "new") : "/studio/new";
}

export function filterStudioPersonas<T extends Pick<PersonaSummary, "name">>(personas: T[], query: string) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return personas;
  return personas.filter((persona) => persona.name.toLocaleLowerCase().includes(normalized));
}

export function studioPersonaMeta(persona: Pick<PersonaSummary, "visibility">) {
  return `${persona.visibility} - private Studio`;
}

export function studioPersonaWorkspaceTabs(personaId: string) {
  const base = `/studio/personas/${personaId}`;
  return personaWorkspaceTabSpecs.map((tab) => ({
    label: tab.label,
    detail: tab.detail,
    state: tab.state,
    href: `${base}${tab.suffix}`,
    nextAction: {
      label: tab.nextActionLabel,
      href: `${base}${tab.nextActionSuffix}`,
    },
  }));
}

export function studioPersonaWorkspacePrimaryActions(personaId: string) {
  const memoryTab = studioPersonaWorkspaceTabs(personaId).find((tab) => tab.label === "Memory");

  return [
    ...(memoryTab
      ? [{ label: "Open Memory", href: memoryTab.href, detail: memoryTab.detail }]
      : []),
    { label: "Ask Assistant", href: "/studio/assistant", detail: "Operational helper for Studio work" },
  ];
}

export function studioPersonaCompanionShortcuts(personaId: string): StudioPersonaCompanionShortcut[] {
  const base = `/studio/personas/${personaId}`;

  return [
    { label: "Memory", href: `${base}/memory`, detail: "Review what carries forward" },
    { label: "Inbox", href: `${base}/memory-inbox`, detail: "Review continuity suggestions" },
    { label: "Timeline", href: `${base}/continuity`, detail: "Trace the relationship" },
    { label: "Profile", href: `${base}/edit`, detail: "Shape identity and boundaries" },
    { label: "Integrity", href: `${base}/calibration`, detail: "Check alignment" },
  ];
}

export function studioDashboardMemoryStop(
  personas: Array<Pick<PersonaSummary, "id" | "name">>,
): StudioDashboardMemoryStop {
  if (personas.length === 0) {
    return {
      label: "Memory",
      href: "/studio/new",
      actionLabel: "Create persona",
      statusLabel: "No persona memory yet",
      statusDetail: "Create a private persona before Memory can collect owner-reviewed context.",
      body: "Memory is the recallable context layer inside each private persona workspace. It stays owner-only and separate from Archive source intake, Continuity timeline records, Canon rules, and Integrity sessions.",
      privacy: "Owner-only Studio",
    };
  }

  const firstPersona = personas[0];
  const countLabel = `${personas.length} persona memory workspace${personas.length === 1 ? "" : "s"}`;

  return {
    label: "Memory",
    href: `/studio/personas/${firstPersona.id}/memory`,
    actionLabel: "Open Memory",
    statusLabel: countLabel,
    statusDetail: `${firstPersona.name} is ready for Memory review${personas.length > 1 ? `, with ${personas.length - 1} more persona${personas.length === 2 ? "" : "s"} behind it` : ""}.`,
    body: "Review recallable context and lifecycle state before it shapes runtime answers. Memory is distinct from Archive sources, Continuity records, Canon commitments, and Integrity checks.",
    privacy: "Owner-only persona workspace",
  };
}

export function studioRouteContext(
  pathname: string,
  personas: Array<Pick<PersonaSummary, "id" | "name">> = [],
): StudioRouteContext {
  const personaMatch = pathname.match(/^\/studio\/personas\/([^/]+)(\/[^?#]*)?/);
  if (personaMatch) {
    const personaId = personaMatch[1] ?? "";
    const suffix = personaMatch[2] ?? "";
    const tab = [...personaWorkspaceTabSpecs, ...personaWorkspaceAuxiliarySpecs]
      .find((item) => item.suffix === suffix)
      ?? personaWorkspaceTabSpecs[0];
    const persona = personas.find((item) => item.id === personaId);
    const label = `${persona?.name ?? "Persona"} / ${tab.label}`;

    return {
      label,
      detail: tab.detail,
      privacy: "Owner-only persona workspace",
      state: tab.state,
      href: `/studio/personas/${personaId}${tab.suffix}`,
      nextAction: {
        label: tab.nextActionLabel,
        href: `/studio/personas/${personaId}${tab.nextActionSuffix}`,
      },
    };
  }

  const staticMatch = [...studioStaticRouteContexts]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => activeStudioHref(pathname, item.href));

  return staticMatch ?? {
    label: "Dashboard",
    href: "/studio",
    detail: "Private workbench overview",
    privacy: "Owner-only Studio",
    state: "Private work stays in Studio until you choose to publish.",
    nextAction: { label: "New Persona", href: "/studio/new" },
  };
}
