export type PersonaEncounterReadinessStatus = "Not enabled" | "Not callable" | "Not generated" | "Required";

export interface PersonaEncounterReadinessItem {
  key: string;
  label: string;
  status: PersonaEncounterReadinessStatus;
  body: string;
}

export interface PersonaEncounterReadinessGate {
  eyebrow: string;
  title: string;
  summary: string;
  privacy: string;
  items: PersonaEncounterReadinessItem[];
}

const PERSONA_ENCOUNTER_ITEMS: PersonaEncounterReadinessItem[] = [
  {
    key: "encounters",
    label: "Encounters",
    status: "Not enabled",
    body: "Autonomous persona chat, background conversations, scheduled encounters, and cross-persona runtime are not enabled.",
  },
  {
    key: "provider-loops",
    label: "Provider loops",
    status: "Not callable",
    body: "Provider calls, multi-turn model loops, token-credit deductions, and encounter rate-limit accounting are not callable.",
  },
  {
    key: "outputs",
    label: "Outputs",
    status: "Not generated",
    body: "Durable encounter transcripts, generated encounter output, public pages, shareable pages, comments, and posts are not stored or generated.",
  },
  {
    key: "policy-gates",
    label: "Policy gates",
    status: "Required",
    body: "Consent, provenance, moderation, reporting, stop controls, revocation, cost, rate-limit, and plan enforcement are required first.",
  },
];

export function personaEncounterReadinessGate(): PersonaEncounterReadinessGate {
  return {
    eyebrow: "Persona Encounters",
    title: "Readiness gate",
    summary: "Persona-to-persona encounters are not enabled yet. This owner-only readback names the gates that must exist before Station can run, store, or share encounter behavior.",
    privacy: "Owner-only private Studio readback",
    items: PERSONA_ENCOUNTER_ITEMS.map((item) => ({ ...item })),
  };
}

export function personaEncounterReadinessIsReadbackOnly(
  gate: PersonaEncounterReadinessGate = personaEncounterReadinessGate(),
) {
  return gate.items.every((item) => (
    item.status === "Not enabled"
    || item.status === "Not callable"
    || item.status === "Not generated"
    || item.status === "Required"
  ));
}
