import type { PersonaSummary } from "@station/types/persona";

const SAFE_DEVELOPER_SPACE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_SHAPED_SLUG_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const API_KEY_LAST_FOUR_PATTERN = /^[A-Za-z0-9_-]{4}$/;

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

export interface OnboardingDeveloperSpaceSummary {
  id: string;
  projectName: string;
  slug: string;
  apiKeyLastFour?: string | null;
}

export interface OnboardingPathState {
  archiveSourceCount?: number | null;
  pendingImportReviewCount?: number | null;
  developerSpaces?: OnboardingDeveloperSpaceSummary[];
}

export interface FirstSpacePublishingGuide {
  title: string;
  summary: string;
  boundary: string;
  assistantActionLabel: string;
  assistantPrompt: string;
  steps: Array<{
    label: string;
    detail: string;
    href: string;
  }>;
}

function firstPersona(personas: PersonaSummary[]) {
  return personas[0] ?? null;
}

function firstDeveloperSpace(spaces: OnboardingDeveloperSpaceSummary[] | undefined) {
  return spaces?.[0] ?? null;
}

function developerSpaceManageRoute(slug: string) {
  return SAFE_DEVELOPER_SPACE_SLUG_PATTERN.test(slug) && !UUID_SHAPED_SLUG_PATTERN.test(slug)
    ? `/developer-spaces/${slug}/manage`
    : "/developer-spaces";
}

function apiKeyLastFourLabel(value?: string | null) {
  return value && API_KEY_LAST_FOUR_PATTERN.test(value) ? value : null;
}

export function firstSpacePublishingGuide(): FirstSpacePublishingGuide {
  return {
    title: "First Space and public publishing",
    summary: "When private setup is ready, create or review a Space before sending owner-reviewed writing into public surfaces.",
    boundary: "Publishing remains owner-controlled: Station Assistant can explain the steps, but it does not create Spaces, change visibility, or publish automatically.",
    assistantActionLabel: "Ask Assistant about first Space",
    assistantPrompt: "Help me plan my first Space and public publishing steps without changing visibility or publishing automatically.",
    steps: [
      {
        label: "Review Spaces",
        detail: "Open the signed-in Space dashboard before creating or editing public homes.",
        href: "/space",
      },
      {
        label: "Create first Space",
        detail: "Create an owner-controlled public home; visibility and content stay explicit owner choices.",
        href: "/space/new",
      },
      {
        label: "Draft public work",
        detail: "Use Studio publishing to draft, choose a Space, and review visibility before public release.",
        href: "/studio/publish",
      },
    ],
  };
}

export function onboardingPathCards(personas: PersonaSummary[], state: OnboardingPathState = {}): OnboardingPathCard[] {
  const persona = firstPersona(personas);
  const developerSpace = firstDeveloperSpace(state.developerSpaces);
  const archiveSourceCount = typeof state.archiveSourceCount === "number" ? Math.max(0, state.archiveSourceCount) : null;
  const pendingImportReviewCount = typeof state.pendingImportReviewCount === "number" ? Math.max(0, state.pendingImportReviewCount) : null;
  const documentMigratorState = documentMigratorReadiness(persona, archiveSourceCount, pendingImportReviewCount);
  const apiBridgeState = apiBridgeReadiness(developerSpace, state.developerSpaces?.length ?? 0);

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
      summary: documentMigratorState.summary,
      firstStep: documentMigratorState.firstStep,
      privacy: "Preview and imported source material stay owner-scoped archive material; external OAuth/recurring pulls are not live here.",
      route: persona ? `/studio/personas/${persona.id}/files` : "/studio/new?path=document-migrator",
      actionLabel: documentMigratorState.actionLabel,
      assistantActionLabel: persona ? "Ask Assistant about archive import" : "Ask Assistant to plan archive prep",
      assistantPrompt: persona
        ? documentMigratorState.assistantPrompt
        : "Help me prepare for Document Migrator after I create the private persona.",
      supportingRoutes: ["/studio/archive", "/studio/personas/<persona-id>/files", "Import Review section"],
      truth: "Supports owner-scoped preview, then explicit import for pasted/uploaded material. It does not claim live Reddit, Discord, OAuth, recurring sync, or external API pulls.",
    },
    {
      id: "api-bridge",
      title: "API Bridge",
      status: "alpha-live",
      statusLabel: "Alpha live",
      summary: apiBridgeState.summary,
      firstStep: apiBridgeState.firstStep,
      privacy: "Manage keys and raw owner evidence stay owner-only; public observatories show only public-safe state.",
      route: apiBridgeState.route,
      actionLabel: apiBridgeState.actionLabel,
      assistantActionLabel: "Ask Assistant about bridge setup",
      assistantPrompt: apiBridgeState.assistantPrompt,
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

function documentMigratorReadiness(
  persona: PersonaSummary | null,
  archiveSourceCount: number | null,
  pendingImportReviewCount: number | null,
) {
  if (!persona) {
    return {
      summary: "Create a private persona first, then import pasted/uploaded source material into its owner-only archive.",
      firstStep: "Create the private persona first. Station will send you to the real workspace before archive import.",
      actionLabel: "Create persona for archive",
      assistantPrompt: "Help me prepare for Document Migrator after I create the private persona.",
    };
  }

  if (archiveSourceCount === 0) {
    return {
      summary: `${persona.name} has no private archive sources detected yet. Start with a pasted source or uploaded file on the Archive tab.`,
      firstStep: "Open the persona Archive tab, preview the first owner-only source, then confirm import; import review appears after Station extracts candidates.",
      actionLabel: "Add first archive source",
      assistantPrompt: `Help me choose a first private archive source for ${persona.name} without using live connectors.`,
    };
  }

  if (pendingImportReviewCount && pendingImportReviewCount > 0) {
    return {
      summary: `${persona.name} has ${pendingImportReviewCount} import review candidate${pendingImportReviewCount === 1 ? "" : "s"} waiting from ${archiveSourceCount ?? "existing"} private source${archiveSourceCount === 1 ? "" : "s"}.`,
      firstStep: "Open the Import Review section on the Archive tab and accept, edit, or reject extracted Memory/Canon candidates.",
      actionLabel: "Review import candidates",
      assistantPrompt: `Help me review ${persona.name}'s import candidates without promoting anything automatically.`,
    };
  }

  if (archiveSourceCount && archiveSourceCount > 0) {
    return {
      summary: `${persona.name} already has ${archiveSourceCount} private archive source${archiveSourceCount === 1 ? "" : "s"} attached.`,
      firstStep: "Open the Archive tab to inspect source status, add another source, or continue with Import Review when candidates appear.",
      actionLabel: "Open archive sources",
      assistantPrompt: `Help me decide the next owner-reviewed archive step for ${persona.name}.`,
    };
  }

  return {
    summary: `Add pasted or uploaded source material into ${persona.name}'s private archive and review import outcomes.`,
    firstStep: "Open the persona Archive tab, preview pasted or uploaded source material, then confirm import and review status before using it.",
    actionLabel: "Open private archive",
    assistantPrompt: `Help me import source material into ${persona.name}'s private archive and review the results.`,
  };
}

function apiBridgeReadiness(
  developerSpace: OnboardingDeveloperSpaceSummary | null,
  developerSpaceCount: number,
) {
  if (!developerSpace) {
    return {
      summary: "Create a private Developer Space first, then use its owner manage page for ingestion-key readback.",
      firstStep: "Open Developer Spaces, create a private observatory, then use Manage for ingestion keys and event readback.",
      route: "/developer-spaces",
      actionLabel: "Create Developer Space",
      assistantPrompt: "Help me plan an API Bridge Developer Space without creating credentials or exposing private keys.",
    };
  }

  const keyTail = apiKeyLastFourLabel(developerSpace.apiKeyLastFour);
  const keyReadback = keyTail
    ? `ingestion-key readback ending ${keyTail}`
    : "no ingestion-key readback yet";
  const route = developerSpaceManageRoute(developerSpace.slug);

  return {
    summary: developerSpaceCount > 1
      ? `${developerSpaceCount} Developer Spaces exist. Start with ${developerSpace.projectName}'s owner manage surface for bridge setup.`
      : `${developerSpace.projectName} exists as the first API Bridge surface with ${keyReadback}.`,
    firstStep: `Open ${developerSpace.projectName} Manage to review ingestion-key status, owner evidence, and public-safe observatory state.`,
    route,
    actionLabel: "Open bridge manage",
    assistantPrompt: `Help me understand ${developerSpace.projectName}'s API Bridge setup without exposing private keys or running external calls.`,
  };
}
