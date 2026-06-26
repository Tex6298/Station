import assert from "node:assert/strict";
import test from "node:test";
import { firstSpacePublishingGuide, onboardingPathCards } from "./onboarding-paths";

test("onboarding path map exposes all four documented alpha paths", () => {
  const cards = onboardingPathCards([]);

  assert.deepEqual(cards.map((card) => card.id), [
    "fresh-start",
    "awakening",
    "document-migrator",
    "api-bridge",
  ]);
  assert.equal(cards.every((card) => card.route.length > 0), true);
  assert.equal(cards.every((card) => card.firstStep.length > 0), true);
  assert.equal(cards.every((card) => card.privacy.length > 0), true);
  assert.equal(cards.every((card) => card.assistantActionLabel.length > 0), true);
  assert.equal(cards.every((card) => card.assistantPrompt.length > 0), true);
});

test("fresh start and awakening route to real persona creation", () => {
  const cards = onboardingPathCards([]);
  const freshStart = cards.find((card) => card.id === "fresh-start");
  const awakening = cards.find((card) => card.id === "awakening");

  assert.equal(freshStart?.status, "live");
  assert.equal(freshStart?.route, "/studio/new?path=fresh-start");
  assert.equal(freshStart?.assistantActionLabel, "Ask Assistant to plan first setup");
  assert.match(freshStart?.firstStep ?? "", /Name the private persona/);
  assert.match(freshStart?.privacy ?? "", /Private Studio/);
  assert.match(freshStart?.truth ?? "", /existing private persona API path/);

  assert.equal(awakening?.status, "live");
  assert.equal(awakening?.route, "/studio/new?path=awakening");
  assert.equal(awakening?.assistantActionLabel, "Ask Assistant to prepare notes");
  assert.match(awakening?.assistantPrompt ?? "", /Awakening setup/);
  assert.match(awakening?.truth ?? "", /real follow-on integrity and memory routes/);
});

test("document migrator is explicit when a persona is required", () => {
  const withoutPersona = onboardingPathCards([]).find((card) => card.id === "document-migrator");
  assert.equal(withoutPersona?.status, "setup-required");
  assert.equal(withoutPersona?.route, "/studio/new?path=document-migrator");
  assert.equal(withoutPersona?.assistantActionLabel, "Ask Assistant to plan archive prep");
  assert.match(withoutPersona?.firstStep ?? "", /Create the private persona first/);
  assert.match(withoutPersona?.truth ?? "", /does not claim live Reddit, Discord, OAuth/);

  const withPersona = onboardingPathCards([
    {
      id: "persona-1",
      name: "Archive Owner",
      shortDescription: null,
      visibility: "private",
      provider: "platform",
      createdAt: "2026-06-18T00:00:00.000Z",
    },
  ]).find((card) => card.id === "document-migrator");

  assert.equal(withPersona?.status, "alpha-live");
  assert.equal(withPersona?.route, "/studio/personas/persona-1/files");
  assert.equal(withPersona?.assistantActionLabel, "Ask Assistant about archive import");
  assert.match(withPersona?.summary ?? "", /Archive Owner/);
  assert.match(withPersona?.assistantPrompt ?? "", /Archive Owner/);
});

test("api bridge points to Developer Spaces without production infrastructure claims", () => {
  const card = onboardingPathCards([]).find((entry) => entry.id === "api-bridge");

  assert.equal(card?.status, "alpha-live");
  assert.equal(card?.route, "/developer-spaces");
  assert.equal(card?.assistantActionLabel, "Ask Assistant about bridge setup");
  assert.match(card?.firstStep ?? "", /ingestion keys/);
  assert.match(card?.privacy ?? "", /owner-only/);
  assert.match(card?.truth ?? "", /Developer Space ingestion is the alpha bridge/);
  assert.match(card?.truth ?? "", /Production workers/);
});

test("first Space publishing guide points to existing owner-controlled routes", () => {
  const guide = firstSpacePublishingGuide();

  assert.equal(guide.assistantActionLabel, "Ask Assistant about first Space");
  assert.match(guide.assistantPrompt, /without changing visibility or publishing automatically/);
  assert.match(guide.boundary, /does not create Spaces, change visibility, or publish automatically/);
  assert.deepEqual(guide.steps.map((step) => step.href), ["/space", "/space/new", "/studio/publish"]);
  assert.equal(guide.steps.every((step) => step.label.length > 0 && step.detail.length > 0), true);
});
