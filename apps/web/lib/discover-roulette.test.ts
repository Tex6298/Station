import assert from "node:assert/strict";
import test from "node:test";
import {
  DISCOVER_ROULETTE_MAX_VISITOR_MESSAGES,
  discoverRouletteAfterSubmittedMessage,
  discoverRouletteCanSend,
  discoverRouletteExhaustedCopy,
  discoverRouletteInitialEncounterState,
  discoverRouletteParseSession,
  discoverRouletteSerializeSession,
  discoverRouletteStatusCopy,
} from "./discover-roulette";

test("discover roulette status copy keeps unavailable states honest", () => {
  assert.equal(discoverRouletteStatusCopy("loading"), "Drawing...");
  assert.equal(discoverRouletteStatusCopy("empty"), "No public personas yet.");
  assert.equal(discoverRouletteStatusCopy("unavailable"), "Persona roulette unavailable.");
  assert.equal(discoverRouletteStatusCopy("ready"), null);
});

test("discover roulette encounter limit is browser-session UX only", () => {
  let state = discoverRouletteInitialEncounterState("owner-gated-roulette");

  for (let index = 0; index < DISCOVER_ROULETTE_MAX_VISITOR_MESSAGES; index += 1) {
    assert.equal(discoverRouletteCanSend(state), true);
    state = discoverRouletteAfterSubmittedMessage(state);
  }

  assert.equal(state.submittedMessages, DISCOVER_ROULETTE_MAX_VISITOR_MESSAGES);
  assert.equal(state.exhausted, true);
  assert.equal(discoverRouletteCanSend(state), false);
  assert.match(discoverRouletteExhaustedCopy(), /browser-session encounter/);
  assert.match(discoverRouletteExhaustedCopy(), /real abuse boundary/);
});

test("discover roulette session serialization stores only safe encounter counters", () => {
  const serialized = discoverRouletteSerializeSession({
    publicSlug: "alpha-roulette",
    submittedMessages: 2,
    exhausted: false,
  });

  assert.deepEqual(JSON.parse(serialized), {
    publicSlug: "alpha-roulette",
    submittedCount: 2,
    exhausted: false,
  });
  assert.doesNotMatch(
    serialized,
    /message|reply|prompt|completion|provider|payload|visitor|identity|cookie|auth|user agent|ip address|owner|personaId|document|source body|token|secret/i,
  );
});

test("discover roulette session parsing fails closed to the current slug", () => {
  assert.deepEqual(
    discoverRouletteParseSession("not-json", "owner-gated-roulette"),
    discoverRouletteInitialEncounterState("owner-gated-roulette"),
  );
  assert.deepEqual(
    discoverRouletteParseSession(
      JSON.stringify({ publicSlug: "other-persona", submittedMessages: 5, exhausted: true }),
      "owner-gated-roulette",
    ),
    discoverRouletteInitialEncounterState("owner-gated-roulette"),
  );
  assert.deepEqual(
    discoverRouletteParseSession(
      JSON.stringify({ publicSlug: "owner-gated-roulette", submittedMessages: 999, exhausted: false }),
      "owner-gated-roulette",
    ),
    {
      publicSlug: "owner-gated-roulette",
      submittedMessages: DISCOVER_ROULETTE_MAX_VISITOR_MESSAGES,
      exhausted: true,
    },
  );
});
