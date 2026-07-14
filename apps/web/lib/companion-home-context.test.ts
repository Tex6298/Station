import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { companionHomeContextRail } from "./companion-home-context";

test("companion home context rail exposes exact owner route links", () => {
  const rail = companionHomeContextRail({
    personaId: "persona-1",
    personaName: "Ariadne",
    continuity: {
      memoryCount: 2,
      canonCount: 3,
      archiveFileCount: 4,
      archivedChatCount: 5,
      continuityCandidateCount: 6,
      continuityRecordCount: 7,
      integritySessionCount: 8,
    },
  });

  assert.equal(rail.title, "What Ariadne carries forward");
  assert.deepEqual(
    rail.stops.map((stop) => [stop.label, stop.href]),
    [
      ["Memory", "/studio/personas/persona-1/memory"],
      ["Inbox", "/studio/personas/persona-1/memory-inbox"],
      ["Timeline", "/studio/personas/persona-1/continuity"],
      ["Canon", "/studio/personas/persona-1/canon"],
      ["Archive/files", "/studio/personas/persona-1/files"],
      ["Profile", "/studio/personas/persona-1/edit"],
      ["Integrity", "/studio/personas/persona-1/calibration"],
    ],
  );
  assert.equal(rail.stops.find((stop) => stop.label === "Inbox")?.emphasis, true);
});

test("companion home context rail count labels stay aggregate and bounded", () => {
  const rail = companionHomeContextRail({
    personaId: "persona-1",
    longDescription: "  Long   continuity brief  ",
    styleNotes: "  Quiet voice.  ",
    continuity: {
      memoryCount: 1.8,
      canonCount: -2,
      archiveFileCount: 2,
      archivedChatCount: 1,
      continuityCandidateCount: 3,
      continuityRecordCount: 4,
      integritySessionCount: undefined,
    },
  });
  const rendered = JSON.stringify(rail);

  assert.equal(rail.brief, "Long continuity brief");
  assert.equal(rail.styleNotes, "Quiet voice.");
  assert.equal(rail.stops.find((stop) => stop.label === "Memory")?.countLabel, "1 memory item");
  assert.equal(rail.stops.find((stop) => stop.label === "Inbox")?.countLabel, "3 aggregate candidates");
  assert.equal(rail.stops.find((stop) => stop.label === "Inbox")?.detail, "Suggested Memory and Canon review stop.");
  assert.equal(rail.stops.find((stop) => stop.label === "Canon")?.countLabel, "0 canon items");
  assert.equal(rail.stops.find((stop) => stop.label === "Archive/files")?.countLabel, "2 files / 1 archived chat");
  assert.equal(rail.stops.find((stop) => stop.label === "Integrity")?.countLabel, "0 integrity sessions");
  assert.match(rail.boundaryCopy, /Owner-only continuity map with aggregate counts/);
  assert.match(rail.boundaryCopy, /Advanced Studio/);
  assert.doesNotMatch(rendered, /pending-only|source=all|\/conversations\/candidates\/inbox/i);
});

test("companion home context rail falls back without inventing context state", () => {
  const rail = companionHomeContextRail({
    personaId: "persona-1",
    personaName: "",
    awakeningPrompt: "  Wake with care.  ",
    continuity: null,
  });

  assert.equal(rail.title, "What Persona carries forward");
  assert.equal(rail.brief, "Wake with care.");
  assert.equal(rail.styleNotes, null);
  assert.equal(rail.stops.find((stop) => stop.label === "Profile")?.countLabel, "Owner settings");
});

test("persona home puts the focused conversation shell before Advanced Studio", () => {
  const page = readFileSync("apps/web/app/studio/personas/[personaId]/page.tsx", "utf8");
  const layout = readFileSync("apps/web/app/studio/layout.tsx", "utf8");

  assert.match(page, /import \{ companionHomeContextRail \} from "@\/lib\/companion-home-context"/);
  assert.match(page, /<CompanionHomeContextRail persona=\{persona\} \/>/);
  assert.match(page, /<PersonaChat/);
  assert.match(page, /selectedConversationId=\{target\.id\}/);
  assert.match(page, /onConversationCreated=\{conversationCreated\}/);
  assert.match(page, /data-studio-shell="companion"/);
  assert.match(page, /className="studio-companion-primary" data-companion-primary/);
  assert.match(page, /<PersonaCompanionSidebar/);
  assert.match(page, /aria-label="Companion context rail"/);
  assert.match(page, /<strong>Advanced Studio<\/strong>/);
  assert.match(layout, /isExactPersonaHomeRoute\(pathname\)/);
  assert.match(layout, /data-studio-shell="workbench"/);

  const headerIndex = page.indexOf('<header className="studio-companion-header"');
  const chatIndex = page.indexOf("<PersonaChat");
  const advancedIndex = page.indexOf('<details className="studio-companion-advanced"');
  const continuityIndex = page.indexOf("<ContinuityCards persona={persona} />");
  const publicReadbackIndex = page.indexOf("<PublicInteractionReadback persona={persona} />");

  assert.equal(headerIndex > -1, true);
  assert.equal(chatIndex > headerIndex, true);
  assert.equal(advancedIndex > chatIndex, true);
  assert.equal(continuityIndex > advancedIndex, true);
  assert.equal(publicReadbackIndex > advancedIndex, true);
  assert.doesNotMatch(page, /<PersonaWorkspaceHeader/);
});

test("companion navigation keeps complete inventories in ordered disclosures", () => {
  const sidebar = readFileSync("apps/web/components/studio/persona-companion-sidebar.tsx", "utf8");
  const actionsIndex = sidebar.indexOf('className="studio-companion-sidebar-actions"');
  const personasIndex = sidebar.indexOf('<div className="studio-companion-sidebar-label">Companions</div>');
  const threadsIndex = sidebar.indexOf('className="studio-companion-disclosure studio-companion-threads"');
  const careIndex = sidebar.indexOf('className="studio-companion-disclosure studio-companion-care"');
  const settingsIndex = sidebar.indexOf('className="studio-companion-settings"');

  assert.equal(actionsIndex > -1, true);
  assert.equal(personasIndex > actionsIndex, true);
  assert.equal(threadsIndex > personasIndex, true);
  assert.equal(careIndex > threadsIndex, true);
  assert.equal(settingsIndex > careIndex, true);
  assert.match(sidebar, /<summary>[\s\S]*?<span>Threads<\/span>/);
  assert.match(sidebar, /visibleThreads\.map\(\(conversation\) =>/);
  assert.match(sidebar, /ownedPersonas\.map\(\(candidate/);
  assert.match(sidebar, /mobileDisclosureRef\.current\?\.removeAttribute\("open"\)/);
  assert.match(sidebar, /mobileSummaryRef\.current\?\.focus\(\)/);
  assert.match(sidebar, /<summary ref=\{mobileSummaryRef\}>/);
  assert.match(sidebar, /className="studio-companion-mobile-panel" onClick=\{closeMobileAfterSelection\}/);
  assert.doesNotMatch(sidebar, /\.slice\(0, 6\)|studio-companion-sidebar-brand/);
});

test("companion shell CSS stays scoped and retains exact desktop and mobile geometry", () => {
  const css = readFileSync("apps/web/app/globals.css", "utf8");
  assert.match(css, /\.studio-companion-shell\s*\{/);
  assert.match(css, /grid-template-columns: 156px minmax\(0, 1fr\)/);
  assert.match(css, /\.studio-companion-primary\s*\{[\s\S]*?grid-template-rows: auto 34px minmax\(0, 1fr\)/);
  assert.match(css, /\.studio-companion-shortcuts\.studio-companion-shortcuts-compact\s*\{[\s\S]*?grid-template-columns: repeat\(5, minmax\(0, 1fr\)\)/);
  assert.match(css, /height: calc\(100dvh - var\(--station-global-nav-height\)\)/);
  assert.match(css, /@media \(max-width: 959px\)/);
  assert.match(css, /\.studio-companion-mobile-nav/);
  assert.match(css, /\.studio-companion-mobile-panel\s*\{[\s\S]*?max-height: min\(76dvh, 640px\)/);
  assert.match(css, /\.studio-companion-mobile-nav > summary strong\s*\{[\s\S]*?overflow-wrap: anywhere;[\s\S]*?white-space: normal/);
  assert.match(css, /\.studio-companion-mobile-list\s*\{[\s\S]*?grid-auto-rows: max-content/);
  assert.match(css, /\.studio-companion-mobile-panel \.studio-companion-mobile-list a\s*\{[\s\S]*?overflow-wrap: anywhere;[\s\S]*?white-space: normal/);
  assert.match(css, /\.studio-companion-page \.studio-persona-chat\s*\{[\s\S]*?padding: 0/);
  assert.match(css, /height: calc\(100dvh - var\(--station-global-nav-height\) - 68px\)/);
  assert.match(css, /\.studio-companion-page \.studio-persona-chat-return-text\s*\{[\s\S]*?flex: none/);
  assert.match(css, /@media \(max-width: 390px\)/);
  assert.doesNotMatch(css, /grid-template-columns: 232px minmax\(0, 1fr\)|@media \(max-width: 960px\)/);
  assert.doesNotMatch(css, /\.public-persona[^,{]*\.studio-companion|\.studio-companion[^,{]*\.public-persona/);
});
