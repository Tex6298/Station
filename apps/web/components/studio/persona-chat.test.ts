import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("apps/web/components/studio/persona-chat.tsx", "utf8");
const css = readFileSync("apps/web/app/globals.css", "utf8");

test("PersonaChat return card preserves the existing streaming send path", () => {
  assert.match(source, /import \{ sendPersonaChatWithStream \} from "@\/lib\/chat-stream"/);
  assert.match(source, /const \{ conversationId, reply \} = await sendPersonaChatWithStream\(\{/);
  assert.match(source, /conversationId: state\.conversationId/);
  assert.match(source, /onStatus: \(status\) =>/);
  assert.match(source, /privateProviderSetupNoticeFromChatError/);
});

test("PersonaChat keeps auto-scroll contained inside the chat thread", () => {
  assert.match(source, /const threadRef = useRef<HTMLDivElement>\(null\)/);
  assert.match(source, /const thread = threadRef\.current/);
  assert.match(source, /thread\.scrollTo\(\{/);
  assert.match(source, /top: thread\.scrollHeight/);
  assert.match(source, /ref=\{threadRef\}[\s\S]*?className="studio-persona-chat-thread"/);
  assert.doesNotMatch(source, /scrollIntoView|bottomRef/);
});

test("PersonaChat return card only renders for active existing non-empty threads", () => {
  assert.match(source, /const showReturnThreadCard =/);
  assert.match(source, /state\.conversationStatus === "active"/);
  assert.match(source, /Boolean\(state\.conversationId\)/);
  assert.match(source, /visibleMessages\.length > 0/);
  assert.match(source, /!state\.sending/);
  assert.match(source, /aria-label="Return to active thread"/);
  assert.match(source, /Pick up where you left off/);
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
  assert.match(startFreshBody, /onStartNewChat\(\)/);
  assert.match(source, /onClick=\{startNewChat\}/);
  assert.match(source, /Ask for recap/);
});

test("PersonaChat keeps archived and unavailable conversations read-only while route ownership stays outside", () => {
  assert.match(source, /Start a new chat to continue\./);
  assert.match(source, /state\.conversationStatus === "archived" \|\| selectedConversationUnavailable/);
  assert.match(source, /state\.conversationStatus === "archived" \? "Archived"/);
  assert.match(source, /personaConversationBelongsToPersona\(conversation, personaId\)/);
  assert.match(source, /\/conversations\/\$\{encodeURIComponent\(selectedConversationId\)\}/);
  assert.match(source, /personaId=\$\{encodeURIComponent\(personaId\)\}/);
  assert.match(source, /onConversationCreated\(conversationId\)/);
  assert.match(source, /onConversationArchived\(\)/);
  assert.doesNotMatch(
    source,
    /useRouter|useSearchParams|URLSearchParams|window\.history|\?c=|source=all|\/conversations\/candidates\/inbox/i,
  );
});

test("PersonaChat ignores stale async completions after thread selection changes", () => {
  assert.match(source, /selectionGenerationRef/);
  assert.match(source, /useLayoutEffect\(\(\) =>/);
  assert.match(source, /selectionGenerationRef\.current !== requestGeneration/);
  assert.match(source, /selectionGenerationRef\.current \+= 1/);
});

test("PersonaChat keeps messages and candidate review accessible inside the bounded log", () => {
  assert.match(source, /role="log"/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /aria-busy=\{state\.sending\}/);
  assert.match(source, /Message \{personaName\}/);
  assert.match(source, /Candidate title/);
  assert.match(source, /Candidate content/);

  const threadStart = source.indexOf('className="studio-persona-chat-thread"');
  const archiveIndex = source.indexOf('className="studio-persona-chat-archive"');
  const threadEnd = source.indexOf('className="studio-persona-chat-composer"');
  assert.equal(threadStart > -1 && archiveIndex > threadStart && threadEnd > archiveIndex, true);
});

test("PersonaChat polish keeps live controls honest and avoids placeholders", () => {
  assert.match(source, /studio-persona-chat-header/);
  assert.match(source, /studio-persona-chat-return/);
  assert.match(source, /studio-persona-chat-message-actions/);
  assert.match(source, /Opening private companion workspace/);
  assert.match(source, /Private conversation/);
  assert.match(source, /Start with \{personaName\}/);
  assert.match(source, /Write privately to \$\{personaName\}/);
  assert.match(source, /Save to memory/);
  assert.match(source, /Promote to canon/);
  assert.match(source, /Continuity candidates/);
  assert.match(source, /studio-persona-chat-composer/);
  assert.doesNotMatch(source, /\b(?:Attach|Microphone|Mic|Tools|Regenerate|Copy|Notes|Menu|More options)\b/i);
});

test("PersonaChat polish CSS stays scoped to chat or focused companion selectors", () => {
  assert.match(css, /\.studio-persona-chat/);
  assert.doesNotMatch(css, /\.public-persona-chat[^{]*\.studio-persona-chat|\.studio-persona-chat[^{]*\.public-persona-chat/);

  const selectors = css
    .split("}")
    .map((block) => block.split("{")[0]?.trim() ?? "")
    .filter((selector) => selector.includes(".studio-persona-chat"));
  assert.equal(selectors.length > 20, true);

  for (const selector of selectors) {
    for (const part of selector.split(",")) {
      if (!part.includes(".studio-persona-chat")) continue;
      assert.match(part.trim(), /^(?:\.studio-persona-chat|\.studio-companion-page (?:> )?\.studio-persona-chat)/);
      assert.doesNotMatch(part, /\.public-persona/);
    }
  }
});

function functionBody(name: string) {
  const match = source.match(new RegExp(`function ${name}\\([^)]*\\) \\{([\\s\\S]*?)\\n  \\}`));
  assert.ok(match, `${name} should be present`);
  return match[1] ?? "";
}
