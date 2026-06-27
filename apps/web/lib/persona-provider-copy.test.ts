import assert from "node:assert/strict";
import test from "node:test";
import { PERSONA_PROVIDER_CHOICES, PERSONA_PROVIDER_COPY } from "./persona-provider-copy";

test("persona provider copy does not point users to unavailable Settings setup", () => {
  const visibleCopy = [
    PERSONA_PROVIDER_COPY.channelSubtitle,
    PERSONA_PROVIDER_COPY.setupHint,
    ...PERSONA_PROVIDER_CHOICES.map((choice) => choice.description),
  ].join(" ");

  assert.doesNotMatch(visibleCopy, /Settings/i);
  assert.match(PERSONA_PROVIDER_COPY.setupHint, /not configured in this onboarding flow/);
  assert.equal(PERSONA_PROVIDER_CHOICES[0]?.value, "platform");
  assert.equal(PERSONA_PROVIDER_CHOICES[0]?.badge, "Included");
});

test("persona provider copy keeps BYOK choices separate from immediate platform setup", () => {
  const byokChoices = PERSONA_PROVIDER_CHOICES.filter((choice) => choice.value !== "platform");

  assert.equal(byokChoices.length, 3);
  assert.equal(byokChoices.every((choice) => /outside onboarding/i.test(choice.description)), true);
  assert.equal(PERSONA_PROVIDER_CHOICES.some((choice) => choice.description.includes("Settings")), false);
});
