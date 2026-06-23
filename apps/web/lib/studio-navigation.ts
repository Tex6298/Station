import type { PersonaSummary } from "@station/types/persona";

export const STUDIO_MOBILE_NAV_SUMMARY_LABEL = "Toggle Studio mobile navigation";
export const SIGNED_MOBILE_TOP_NAV_MENU_ROUTES = ["/studio", "/projects", "/space", "/developer-spaces"] as const;

export const studioPublicLinks = [
  { label: "Blog Posts", href: "/studio/publishing", mark: "B" },
  { label: "Public Space", href: "/space", mark: "P" },
] as const;

export const studioWorkspaceLinks = [
  { label: "Onboarding Paths", href: "/studio/onboarding", mark: "O", detail: "Start, migrate, bridge" },
  { label: "Station Assistant", href: "/studio/assistant", mark: "?", detail: "Archive and publishing help" },
  { label: "Global Archive", href: "/studio/archive", mark: "A", detail: "Recent import queue" },
  { label: "Notes and Scratchpad", href: "/studio/notes", mark: "N" },
  { label: "Export Workspace", href: "/studio/export", mark: "E" },
  { label: "Settings", href: "/settings", mark: "S" },
] as const;

const personaWorkspaceTabSpecs = [
  { label: "Home", suffix: "" },
  { label: "Continuity", suffix: "/continuity" },
  { label: "Memory", suffix: "/memory" },
  { label: "Canon", suffix: "/canon" },
  { label: "Archive", suffix: "/files" },
  { label: "Integrity", suffix: "/calibration" },
] as const;

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
    href: `${base}${tab.suffix}`,
  }));
}
