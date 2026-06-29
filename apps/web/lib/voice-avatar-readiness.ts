export type VoiceAvatarReadinessStatus = "Not enabled" | "Required";

export interface VoiceAvatarReadinessItem {
  key: string;
  label: string;
  status: VoiceAvatarReadinessStatus;
  body: string;
}

export interface VoiceAvatarReadinessGate {
  eyebrow: string;
  title: string;
  summary: string;
  privacy: string;
  items: VoiceAvatarReadinessItem[];
}

const VOICE_AVATAR_ITEMS: VoiceAvatarReadinessItem[] = [
  {
    key: "voice-calls",
    label: "Voice calls",
    status: "Not enabled",
    body: "Realtime voice, speech-to-text, text-to-speech, and voice cloning are not configured or callable.",
  },
  {
    key: "avatar-likeness",
    label: "Avatar likeness",
    status: "Not enabled",
    body: "Avatar likeness generation, generated media, audio upload, and video upload are not enabled.",
  },
  {
    key: "media-adapter",
    label: "Media adapter",
    status: "Required",
    body: "A provider media adapter decision is required before any speech or avatar provider call.",
  },
  {
    key: "policy-cost",
    label: "Policy and cost",
    status: "Required",
    body: "Consent, copyright, storage privacy, cost, rate-limit, and plan enforcement must be approved before media behavior.",
  },
];

export function voiceAvatarReadinessGate(): VoiceAvatarReadinessGate {
  return {
    eyebrow: "Voice / Avatar",
    title: "Readiness gate",
    summary: "Voice and avatar features are not enabled yet. This owner-only readback names the gates that must exist before Station can handle speech, likeness, or media behavior.",
    privacy: "Owner-only private Studio readback",
    items: VOICE_AVATAR_ITEMS.map((item) => ({ ...item })),
  };
}

export function voiceAvatarReadinessIsReadbackOnly(gate: VoiceAvatarReadinessGate = voiceAvatarReadinessGate()) {
  return gate.items.every((item) => item.status === "Not enabled" || item.status === "Required");
}
