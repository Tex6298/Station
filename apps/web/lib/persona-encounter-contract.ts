export type PersonaEncounterContractStatus = "Limited exception" | "Required" | "Blocked";

export interface PersonaEncounterContractItem {
  key: string;
  label: string;
  status: PersonaEncounterContractStatus;
  body: string;
}

export interface PersonaEncounterContractGate {
  eyebrow: string;
  title: string;
  summary: string;
  privacy: string;
  items: PersonaEncounterContractItem[];
}

const PERSONA_ENCOUNTER_CONTRACT_ITEMS: PersonaEncounterContractItem[] = [
  {
    key: "consent-scope",
    label: "Consent scope",
    status: "Limited exception",
    body: "General encounter runtime remains same-owner only. The approved cross-owner exception is a consent-scoped disposable preview that infers participants server-side, stays private, is not saved, and does not publish or share generated words.",
  },
  {
    key: "provenance-labels",
    label: "Provenance labels",
    status: "Required",
    body: "Future output must label owner-authored setup, selected persona identities, model-generated turns, simulated text, public inputs, private inputs, archived sources, transcript state, and shareability.",
  },
  {
    key: "stop-revoke",
    label: "Stop and revoke",
    status: "Required",
    body: "Future runtime must be explicitly started by the owner, manually stoppable, non-background by default, bounded by turn limits, and revocable before persistence or sharing.",
  },
  {
    key: "cost-public-safety",
    label: "Cost and sharing",
    status: "Blocked",
    body: "Provider calls need cost estimates, owner attribution, per-run and per-day limits, and fail-closed quota behavior; public or shareable output remains blocked until reporting, moderation, takedown, retract, and provenance policy exists.",
  },
];

export function personaEncounterContractGate(): PersonaEncounterContractGate {
  return {
    eyebrow: "Encounter Contract",
    title: "Consent and provenance",
    summary: "Persona-to-persona encounters are still blocked by default. This owner-visible contract names the minimum conditions future runtime must satisfy, with one approved private cross-owner disposable preview path that creates no transcript or sharing.",
    privacy: "Owner-only private Studio contract",
    items: PERSONA_ENCOUNTER_CONTRACT_ITEMS.map((item) => ({ ...item })),
  };
}

export function personaEncounterContractIsReadbackOnly(
  gate: PersonaEncounterContractGate = personaEncounterContractGate(),
) {
  return gate.items.every((item) => (
    item.status === "Limited exception"
    || item.status === "Required"
    || item.status === "Blocked"
  ));
}

export function personaEncounterContractCanRenderForOwner(
  persona: { ownerUserId?: string | null } | null | undefined,
  viewerUserId: string | null | undefined,
) {
  return Boolean(persona?.ownerUserId && viewerUserId && persona.ownerUserId === viewerUserId);
}
