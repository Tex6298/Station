import assert from "node:assert/strict";
import test from "node:test";
import { PERSONA_PROVIDER_CHOICES, PERSONA_PROVIDER_COPY } from "./persona-provider-copy";

test("persona provider copy points supported BYOK setup to Settings without exposing Gemini chat", () => {
  const visibleCopy = [
    PERSONA_PROVIDER_COPY.channelSubtitle,
    PERSONA_PROVIDER_COPY.setupHint,
    ...PERSONA_PROVIDER_CHOICES.map((choice) => choice.description),
  ].join(" ");

  assert.match(visibleCopy, /Settings AI provider/i);
  assert.match(PERSONA_PROVIDER_COPY.setupHint, /OpenAI, Anthropic, or DeepSeek BYOK keys/);
  assert.match(PERSONA_PROVIDER_COPY.setupHint, /Gemini chat is deferred/);
  assert.equal(PERSONA_PROVIDER_CHOICES[0]?.value, "platform");
  assert.equal(PERSONA_PROVIDER_CHOICES[0]?.badge, "Included");
  assert.equal(PERSONA_PROVIDER_CHOICES.some((choice) => choice.value === "gemini"), false);
});

test("persona provider copy keeps BYOK choices separate from platform routing", () => {
  const byokChoices = PERSONA_PROVIDER_CHOICES.filter((choice) => choice.value !== "platform");

  assert.equal(byokChoices.length, 3);
  assert.equal(byokChoices.every((choice) => /BYOK in Settings/i.test(choice.description)), true);
  assert.equal(byokChoices.every((choice) => /platform mode still uses Station routing/i.test(choice.description)), true);
});
