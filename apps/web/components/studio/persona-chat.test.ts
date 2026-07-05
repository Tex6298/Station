import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("apps/web/components/studio/persona-chat.tsx", "utf8");

test("PersonaChat return card preserves the existing streaming send path", () => {
  assert.match(source, /import \{ sendPersonaChatWithStream \} from "@\/lib\/chat-stream"/);
  assert.match(source, /const \{ conversationId, reply \} = await sendPersonaChatWithStream\(\{/);
  assert.match(source, /conversationId: state\.conversationId/);
  assert.match(source, /onStatus: \(status\) =>/);
  assert.match(source, /privateProviderSetupNoticeFromChatError/);
});

test("PersonaChat return card only renders for active existing non-empty threads", () => {
  assert.match(source, /const showReturnThreadCard =/);
  assert.match(source, /state\.conversationStatus === "active"/);
  assert.match(source, /Boolean\(state\.conversationId\)/);
  assert.match(source, /visibleMessages\.length > 0/);
  assert.match(source, /!state\.sending/);
  assert.match(source, /aria-label="Return to active thread"/);
  assert.match(source, /Return to this thread/);
});

test("PersonaChat return card actions remain local and owner-triggered", () => {
  const continueBody = functionBody("focusComposerOnly");
  const summarizeBody = functionBody("prefillThreadSummary");
  const startFreshBody = functionBody("startNewChat");

  assert.match(continueBody, /composerRef\.current\?\.focus\(\)/);
  assert.doesNotMatch(continueBody, /send\(|sendPersonaChatWithStream|apiGet|apiPost|apiPatch|fetch\(/);

  assert.match(summarizeBody, /setInput\(returnToThreadSummaryRequest\(personaName\)\)/);
  assert.match(summarizeBody, /composerRef\.current\?\.focus\(\)/);
  assert.doesNotMatch(summarizeBody, /send\(|sendPersonaChatWithStream|apiGet|apiPost|apiPatch|fetch\(/);

  assert.match(startFreshBody, /conversationId: null/);
  assert.match(startFreshBody, /messages: \[\]/);
  assert.match(source, /onClick=\{startNewChat\}/);
});

test("PersonaChat return card keeps archived conversations read-only and avoids route drift", () => {
  assert.match(source, /state\.conversationStatus === "archived" \? "Start a new chat to continue\."/);
  assert.match(source, /disabled=\{state\.sending \|\| state\.conversationStatus === "archived"\}/);
  assert.match(source, /state\.conversationStatus === "archived" \? "Archived"/);
  assert.doesNotMatch(
    source,
    /useRouter|useSearchParams|URLSearchParams|window\.history|\?c=|source=all|\/conversations\/candidates\/inbox|archive-connectors|source_inventory|cloudflare|redis|stripe|billing|new Queue|Worker\(|social connector|provider payload|prompt context/i,
  );
});

function functionBody(name: string) {
  const match = source.match(new RegExp(`function ${name}\\([^)]*\\) \\{([\\s\\S]*?)\\n  \\}`));
  assert.ok(match, `${name} should be present`);
  return match[1] ?? "";
}
