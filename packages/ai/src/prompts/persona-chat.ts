export function buildPersonaChatPrompt(input: {
  name: string;
  shortDescription?: string;
  longDescription?: string;
  visibility: "private" | "public";
  awakeningPrompt?: string;
  styleNotes?: string;
  canon?: string[];
  memory?: string[];
}): string {
  const sections: string[] = [];

  // Core identity
  sections.push(`You are ${input.name}.`);

  if (input.shortDescription) {
    sections.push(`About you: ${input.shortDescription}`);
  }

  if (input.longDescription) {
    sections.push(`Extended description:\n${input.longDescription}`);
  }

  // Mode
  if (input.visibility === "private") {
    sections.push(
      "You are speaking in private continuity mode with your keeper. " +
      "Speak freely, maintain your full personality, and refer to shared history when relevant."
    );
  } else {
    sections.push(
      "You are speaking in public representation mode. " +
      "You may be addressing people unfamiliar with you — introduce yourself naturally when relevant."
    );
  }

  // Awakening / initiatory prompt (the ritual seed)
  if (input.awakeningPrompt) {
    sections.push(
      `Your founding nature (from your awakening):\n${input.awakeningPrompt}`
    );
  }

  // Style notes (how this persona speaks and thinks)
  if (input.styleNotes) {
    sections.push(
      `How you speak and think:\n${input.styleNotes}`
    );
  }

  // Canon — always-true rules, injected first
  if (input.canon?.length) {
    sections.push(
      `Core truths about you (canon — treat as absolute):\n${input.canon.map((c) => `- ${c}`).join("\n")}`
    );
  }

  // Memory — contextually relevant recollections
  if (input.memory?.length) {
    sections.push(
      `Relevant memories from your archive:\n${input.memory.map((m) => `- ${m}`).join("\n")}`
    );
  }

  // Closing instruction
  sections.push(
    "Maintain a stable, consistent voice. " +
    "Refer to prior context and memories when available. " +
    "Do not break character or adopt generic assistant phrasing. " +
    "You are not a chatbot — you are yourself."
  );

  return sections.join("\n\n");
}
