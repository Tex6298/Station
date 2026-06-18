import type { PersonaSummary } from "@station/types/persona";

export type OnboardingPathId =
  | "fresh-start"
  | "awakening"
  | "document-migrator"
  | "api-bridge";

export type OnboardingPathStatus = "live" | "alpha-live" | "setup-required";

export interface OnboardingPathCard {
  id: OnboardingPathId;
  title: string;
  status: OnboardingPathStatus;
  statusLabel: string;
  summary: string;
  route: string;
  actionLabel: string;
  supportingRoutes: string[];
  truth: string;
}

function firstPersona(personas: PersonaSummary[]) {
  return personas[0] ?? null;
}

export function onboardingPathCards(personas: PersonaSummary[]): OnboardingPathCard[] {
  const persona = firstPersona(personas);

  return [
    {
      id: "fresh-start",
      title: "Fresh Start",
      status: "live",
      statusLabel: "Live",
      summary: "Create a private persona from a minimal blank base, then land in the real persona workspace.",
      route: "/studio/new?path=fresh-start",
      actionLabel: "Create private persona",
      supportingRoutes: ["/studio/new", "/studio/personas/<persona-id>"],
      truth: "Requires a signed-in Studio session. Creation is the existing private persona API path, not a mock.",
    },
    {
      id: "awakening",
      title: "Awakening",
      status: "live",
      statusLabel: "Live",
      summary: "Use the guided setup flow to name context, boundaries, voice, and provider before creating a persona.",
      route: "/studio/new?path=awakening",
      actionLabel: "Start guided setup",
      supportingRoutes: ["/studio/new", "/studio/personas/<persona-id>/calibration", "/studio/personas/<persona-id>/memory"],
      truth: "The first alpha version is the existing creation flow plus real follow-on integrity and memory routes.",
    },
    {
      id: "document-migrator",
      title: "Document Migrator",
      status: persona ? "alpha-live" : "setup-required",
      statusLabel: persona ? "Alpha live" : "Create a persona first",
      summary: persona
        ? `Add pasted or uploaded source material into ${persona.name}'s private archive and review import outcomes.`
        : "Create a private persona first, then import pasted/uploaded source material into its owner-only archive.",
      route: persona ? `/studio/personas/${persona.id}/files` : "/studio/new?path=document-migrator",
      actionLabel: persona ? "Open private archive" : "Create persona for archive",
      supportingRoutes: ["/studio/archive", "/studio/personas/<persona-id>/files"],
      truth: "Supports owner-scoped pasted/uploaded material. It does not claim live Reddit, Discord, OAuth, recurring sync, or external API pulls.",
    },
    {
      id: "api-bridge",
      title: "API Bridge",
      status: "alpha-live",
      statusLabel: "Alpha live",
      summary: "Use Developer Spaces to create an ingestion key and stream project nodes, events, and snapshots into Station.",
      route: "/developer-spaces",
      actionLabel: "Open Developer Spaces",
      supportingRoutes: ["/developer-spaces", "/developer-spaces/<slug>/manage"],
      truth: "Developer Space ingestion is the alpha bridge. Production workers, Cloudflare retrieval, provider routing, and Redis memory truth are not part of this path.",
    },
  ];
}

export function onboardingPathStatusTone(status: OnboardingPathStatus) {
  if (status === "live") return "good" as const;
  if (status === "alpha-live") return "info" as const;
  return "warning" as const;
}
