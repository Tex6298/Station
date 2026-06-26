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
  firstStep: string;
  privacy: string;
  route: string;
  actionLabel: string;
  assistantActionLabel: string;
  assistantPrompt: string;
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
      firstStep: "Name the private persona. You can leave the context fields light and add archive, memory, canon, and public work later.",
      privacy: "Private Studio material by default; publishing is a later owner action.",
      route: "/studio/new?path=fresh-start",
      actionLabel: "Create private persona",
      assistantActionLabel: "Ask Assistant to plan first setup",
      assistantPrompt: "Help me start with a private persona and keep the first setup light.",
      supportingRoutes: ["/studio/new", "/studio/personas/<persona-id>"],
      truth: "Requires a signed-in Studio session. Creation is the existing private persona API path, not a mock.",
    },
    {
      id: "awakening",
      title: "Awakening",
      status: "live",
      statusLabel: "Live",
      summary: "Use the guided setup flow to name context, boundaries, voice, and provider before creating a persona.",
      firstStep: "Fill in context, boundaries, voice, and provider, then review before creating the private base.",
      privacy: "Setup notes stay owner-scoped in Studio until you deliberately publish later.",
      route: "/studio/new?path=awakening",
      actionLabel: "Start guided setup",
      assistantActionLabel: "Ask Assistant to prepare notes",
      assistantPrompt: "Help me choose what to write first for an Awakening setup without overclaiming identity.",
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
      firstStep: persona
        ? "Open the persona Archive tab, paste or upload source material, then review import status before using it."
        : "Create the private persona first. Station will send you to the real workspace before archive import.",
      privacy: "Imported source material is owner-scoped archive material; external OAuth/recurring pulls are not live here.",
      route: persona ? `/studio/personas/${persona.id}/files` : "/studio/new?path=document-migrator",
      actionLabel: persona ? "Open private archive" : "Create persona for archive",
      assistantActionLabel: persona ? "Ask Assistant about archive import" : "Ask Assistant to plan archive prep",
      assistantPrompt: persona
        ? `Help me import source material into ${persona.name}'s private archive and review the results.`
        : "Help me prepare for Document Migrator after I create the private persona.",
      supportingRoutes: ["/studio/archive", "/studio/personas/<persona-id>/files"],
      truth: "Supports owner-scoped pasted/uploaded material. It does not claim live Reddit, Discord, OAuth, recurring sync, or external API pulls.",
    },
    {
      id: "api-bridge",
      title: "API Bridge",
      status: "alpha-live",
      statusLabel: "Alpha live",
      summary: "Use Developer Spaces to create an ingestion key and stream project nodes, events, and snapshots into Station.",
      firstStep: "Open Developer Spaces, create or choose a Space, then use the owner manage page for ingestion keys.",
      privacy: "Manage keys and raw owner evidence stay owner-only; public observatories show only public-safe state.",
      route: "/developer-spaces",
      actionLabel: "Open Developer Spaces",
      assistantActionLabel: "Ask Assistant about bridge setup",
      assistantPrompt: "Help me understand the API Bridge path using Developer Spaces without exposing private keys.",
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
