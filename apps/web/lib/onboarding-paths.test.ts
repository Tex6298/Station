import assert from "node:assert/strict";
import test from "node:test";
import { onboardingPathCards } from "./onboarding-paths";

test("onboarding path map exposes all four documented alpha paths", () => {
  const cards = onboardingPathCards([]);

  assert.deepEqual(cards.map((card) => card.id), [
    "fresh-start",
    "awakening",
    "document-migrator",
    "api-bridge",
  ]);
  assert.equal(cards.every((card) => card.route.length > 0), true);
});

test("fresh start and awakening route to real persona creation", () => {
  const cards = onboardingPathCards([]);
  const freshStart = cards.find((card) => card.id === "fresh-start");
  const awakening = cards.find((card) => card.id === "awakening");

  assert.equal(freshStart?.status, "live");
  assert.equal(freshStart?.route, "/studio/new?path=fresh-start");
  assert.match(freshStart?.truth ?? "", /existing private persona API path/);

  assert.equal(awakening?.status, "live");
  assert.equal(awakening?.route, "/studio/new?path=awakening");
  assert.match(awakening?.truth ?? "", /real follow-on integrity and memory routes/);
});

test("document migrator is explicit when a persona is required", () => {
  const withoutPersona = onboardingPathCards([]).find((card) => card.id === "document-migrator");
  assert.equal(withoutPersona?.status, "setup-required");
  assert.equal(withoutPersona?.route, "/studio/new?path=document-migrator");
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
  assert.match(withPersona?.summary ?? "", /Archive Owner/);
});

test("api bridge points to Developer Spaces without production infrastructure claims", () => {
  const card = onboardingPathCards([]).find((entry) => entry.id === "api-bridge");

  assert.equal(card?.status, "alpha-live");
  assert.equal(card?.route, "/developer-spaces");
  assert.match(card?.truth ?? "", /Developer Space ingestion is the alpha bridge/);
  assert.match(card?.truth ?? "", /Production workers/);
});
