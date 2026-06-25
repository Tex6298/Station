import type { PersonaSummary } from "@station/types/persona";

export const STUDIO_MOBILE_NAV_SUMMARY_LABEL = "Toggle Studio mobile navigation";
export const SIGNED_MOBILE_TOP_NAV_MENU_ROUTES = ["/studio", "/projects", "/space", "/developer-spaces"] as const;

export type StudioRouteContext = {
  label: string;
  detail: string;
  privacy: string;
  href: string;
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
  { label: "Home", suffix: "", detail: "Persona overview and continuity brief" },
  { label: "Continuity", suffix: "/continuity", detail: "Timeline records and runtime context" },
  { label: "Memory", suffix: "/memory", detail: "Recallable context and lifecycle state" },
  { label: "Canon", suffix: "/canon", detail: "Stable rules and commitments" },
  { label: "Archive", suffix: "/files", detail: "Private source material and imports" },
  { label: "Integrity", suffix: "/calibration", detail: "Guided checks and history" },
] as const;

const studioStaticRouteContexts: StudioRouteContext[] = [
  { label: "Dashboard", href: "/studio", detail: "Private workbench overview", privacy: "Owner-only Studio" },
  { label: "New Persona", href: "/studio/new", detail: "Create a private persona workspace", privacy: "Owner-only setup" },
  { label: "Onboarding Paths", href: "/studio/onboarding", detail: "Choose a starting path", privacy: "Owner-only setup" },
  { label: "Publish", href: "/studio/publish", detail: "Prepare public-safe work", privacy: "Owner review required" },
  { label: "Publishing", href: "/studio/publishing", detail: "Drafts and public-writing handoff", privacy: "Owner-controlled publishing" },
  { label: "Station Assistant", href: "/studio/assistant", detail: "Operational helper for Studio work", privacy: "Owner-only helper" },
  { label: "Global Archive", href: "/studio/archive", detail: "Owner-only archive search", privacy: "Private archive" },
  { label: "Export Workspace", href: "/studio/export", detail: "Portable bundle planning", privacy: "Owner-only export planning" },
  { label: "Notes and Scratchpad", href: "/studio/notes", detail: "Private working notes", privacy: "Owner-only notes" },
];

export function activeStudioHref(pathname: string, href: string) {
  if (href === "/studio") return pathname === "/studio";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function studioPersonaHref(persona: Pick<PersonaSummary, "id">) {
  return `/studio/personas/${persona.id}`;
}

export function studioPersonaMeta(persona: Pick<PersonaSummary, "visibility">) {
  return `${persona.visibility} - private Studio`;
}

export function studioPersonaWorkspaceTabs(personaId: string) {
  const base = `/studio/personas/${personaId}`;
  return personaWorkspaceTabSpecs.map((tab) => ({
    label: tab.label,
    detail: tab.detail,
    href: `${base}${tab.suffix}`,
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

export function studioRouteContext(
  pathname: string,
  personas: Array<Pick<PersonaSummary, "id" | "name">> = [],
): StudioRouteContext {
  const personaMatch = pathname.match(/^\/studio\/personas\/([^/]+)(\/[^?#]*)?/);
  if (personaMatch) {
    const personaId = personaMatch[1] ?? "";
    const suffix = personaMatch[2] ?? "";
    const tab = personaWorkspaceTabSpecs.find((item) => item.suffix === suffix)
      ?? personaWorkspaceTabSpecs[0];
    const persona = personas.find((item) => item.id === personaId);
    const label = `${persona?.name ?? "Persona"} / ${tab.label}`;

    return {
      label,
      detail: tab.detail,
      privacy: "Owner-only persona workspace",
      href: `/studio/personas/${personaId}${tab.suffix}`,
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
  };
}
