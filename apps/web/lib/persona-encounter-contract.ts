export type PersonaEncounterContractStatus = "Same-owner only" | "Required" | "Blocked";

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
    status: "Same-owner only",
    body: "The next possible runtime slice can only be owner-initiated for personas owned by the same account; cross-owner encounters remain blocked until bilateral consent, visibility, revocation, and audit policy exists.",
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
    summary: "Persona-to-persona encounters still have no runtime here. This owner-only contract readback names the minimum conditions a future provider-backed encounter must satisfy before any call, transcript, or sharing exists.",
    privacy: "Owner-only private Studio contract",
    items: PERSONA_ENCOUNTER_CONTRACT_ITEMS.map((item) => ({ ...item })),
  };
}

export function personaEncounterContractIsReadbackOnly(
  gate: PersonaEncounterContractGate = personaEncounterContractGate(),
) {
  return gate.items.every((item) => (
    item.status === "Same-owner only"
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
