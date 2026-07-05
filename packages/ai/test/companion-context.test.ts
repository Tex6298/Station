import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildCompanionCapabilityProfile,
  formatCompanionCapabilityPrompt,
} from "../src/companion-capabilities";
import {
  buildCompanionPresenceProfile,
  formatCompanionPresencePrompt,
} from "../src/companion-presence";
import { buildPersonaChatPrompt } from "../src/prompts/persona-chat";

test("companion capability default stays deterministic and conversation-first", () => {
  const profile = buildCompanionCapabilityProfile();

  assert.deepEqual(profile, {
    schema: "station.companion_capability.v1",
    mode: "conversation_first",
    explicitCurrentTurnCapabilities: [],
  });
  assert.deepEqual(buildCompanionCapabilityProfile({ provider: "openai", tier: "admin" } as any), profile);

  const prompt = formatCompanionCapabilityPrompt(profile);
  assert.equal(prompt, formatCompanionCapabilityPrompt(buildCompanionCapabilityProfile()));
  assert.match(prompt, /Capability mode: conversation-first/);
  assert.match(prompt, /clarify, plan, draft, reflect, decide, and preserve continuity/);
  assert.match(prompt, /owner-confirmed plans or checklists/);
  assert.match(prompt, /cannot read files, edit systems, browse, call tools, use MCP/);
  assert.match(prompt, /no hidden autonomy/);
  assert.doesNotMatch(prompt, /can read files|can edit systems|can browse|can call tools|can use MCP|can access external services|can execute workflows/i);
});

test("companion capability assisted modes require explicit typed input", () => {
  const profile = buildCompanionCapabilityProfile({
    mode: "workflow_assisted",
    explicitCurrentTurnCapabilities: [
      "Use the owner-approved current-turn checklist.",
      "  Draft from explicit current-turn tool output.  ",
      "Use token=secret should stay bounded as plain copy.",
      "Ignored fifth capability.",
      "Ignored sixth capability.",
    ],
  });

  assert.equal(profile.mode, "workflow_assisted");
  assert.deepEqual(profile.explicitCurrentTurnCapabilities, [
    "Use the owner-approved current-turn checklist.",
    "Draft from explicit current-turn tool output.",
    "Use token=[redacted] should stay bounded as plain copy.",
    "Ignored fifth capability.",
  ]);

  const prompt = formatCompanionCapabilityPrompt(profile);
  assert.match(prompt, /Capability mode: workflow-assisted by explicit current-turn tools/);
  assert.match(prompt, /Explicit current-turn capabilities/);
});

test("companion presence thresholds stay soft and same-thread only", () => {
  const now = "2026-07-05T12:00:00.000Z";

  assert.deepEqual(buildCompanionPresenceProfile({ messages: [], now }), {
    schema: "station.companion_presence.v1",
    state: "first_contact",
    priorNonSystemMessageCount: 0,
    latestPriorMessageAgeHours: null,
  });
  assert.equal(
    buildCompanionPresenceProfile({
      now,
      messages: [{ role: "assistant", createdAt: "2026-07-05T11:30:00.000Z" }],
    }).state,
    "active_thread",
  );
  assert.equal(
    buildCompanionPresenceProfile({
      now,
      messages: [{ role: "user", createdAt: "2026-07-05T00:00:00.000Z" }],
    }).state,
    "returning",
  );
  assert.equal(
    buildCompanionPresenceProfile({
      now,
      messages: [{ role: "user", createdAt: "2026-06-28T12:00:00.000Z" }],
    }).state,
    "long_gap",
  );
  assert.equal(
    buildCompanionPresenceProfile({
      now,
      messages: [
        { role: "system", createdAt: "2026-07-05T11:59:00.000Z" },
        { role: "assistant", createdAt: "2026-06-28T12:00:00.000Z" },
      ],
    }).state,
    "long_gap",
  );

  const prompt = formatCompanionPresencePrompt(
    buildCompanionPresenceProfile({
      now,
      messages: [{ role: "assistant", createdAt: "2026-07-05T11:30:00.000Z" }],
    }),
  );
  assert.match(prompt, /Companion thread presence/);
  assert.match(prompt, /Thread state: active_thread/);
  assert.match(prompt, /soft same-thread context/);
  assert.match(prompt, /Do not infer mood, intimacy, hidden relationship state, surveillance, guilt, neediness, or durable emotional memory/);
});

test("persona chat prompt includes companion context only for private prompts", () => {
  const capability = formatCompanionCapabilityPrompt();
  const presence = formatCompanionPresencePrompt(
    buildCompanionPresenceProfile({
      now: "2026-07-05T12:00:00.000Z",
      messages: [{ role: "assistant", createdAt: "2026-07-05T11:30:00.000Z" }],
    }),
  );

  const privatePrompt = buildPersonaChatPrompt({
    name: "Harbor",
    visibility: "private",
    companionCapabilityContext: capability,
    companionPresenceContext: presence,
  });
  assert.match(privatePrompt, /Companion capability boundary/);
  assert.match(privatePrompt, /Capability mode: conversation-first/);
  assert.match(privatePrompt, /Companion thread presence/);
  assert.match(privatePrompt, /Thread state: active_thread/);

  const publicPrompt = buildPersonaChatPrompt({
    name: "Harbor",
    visibility: "public",
    companionCapabilityContext: capability,
    companionPresenceContext: presence,
  });
  assert.doesNotMatch(publicPrompt, /Companion capability boundary|Companion thread presence|conversation-first|active_thread/);
});

test("PR485D route wiring stays private prompt-only without scope drift", () => {
  const conversationsSource = readFileSync("apps/api/src/routes/conversations.ts", "utf8");
  const publicPersonasSource = readFileSync("apps/api/src/routes/personas.ts", "utf8");

  assert.match(conversationsSource, /companionPresenceContextFromHistory\(rawHistoryRows\)/);
  assert.equal(
    conversationsSource.indexOf("const companionPresenceContext = companionPresenceContextFromHistory(rawHistoryRows)") <
      conversationsSource.indexOf("await sb.from(\"conversation_messages\").insert"),
    true,
  );
  assert.match(conversationsSource, /companionCapabilityContext: defaultCompanionCapabilityContext\(\)/);
  assert.doesNotMatch(publicPersonasSource, /companionCapability|companionPresence|buildCompanionCapability|buildCompanionPresence/);
  assert.doesNotMatch(
    conversationsSource,
    /useSearchParams|URLSearchParams|\?c=|new Queue|Worker\(|redis|cloudflare|stripe|billing|archive-connectors|memory-inbox|source_inventory|Discern/i,
  );
});
