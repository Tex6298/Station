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
  assert.equal(rail.stops.find((stop) => stop.label === "Canon")?.countLabel, "0 canon items");
  assert.equal(rail.stops.find((stop) => stop.label === "Archive/files")?.countLabel, "2 files / 1 archived chat");
  assert.equal(rail.stops.find((stop) => stop.label === "Integrity")?.countLabel, "0 integrity sessions");
  assert.match(rail.boundaryCopy, /Owner-only continuity map with aggregate counts/);
  assert.match(rail.boundaryCopy, /Runtime Context Preview/);
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

test("persona home renders context rail beside chat without PersonaChat drift", () => {
  const page = readFileSync("apps/web/app/studio/personas/[personaId]/page.tsx", "utf8");

  assert.match(page, /import \{ companionHomeContextRail \} from "@\/lib\/companion-home-context"/);
  assert.match(page, /<CompanionHomeContextRail persona=\{persona\} \/>/);
  assert.match(page, /<PersonaChat personaId=\{persona\.id\} personaName=\{persona\.name\} \/>/);
  assert.match(page, /className="studio-home-grid"/);
  assert.match(page, /aria-label="Companion context rail"/);
  assert.equal(page.includes("Companion Home"), true);

  const headerIndex = page.indexOf("<PersonaWorkspaceHeader persona={persona} />");
  const homeIndex = page.indexOf('<section className="studio-home-grid">');
  const continuityIndex = page.indexOf("<ContinuityCards persona={persona} />");
  const publicReadbackIndex = page.indexOf("<PublicInteractionReadback persona={persona} />");

  assert.equal(headerIndex > -1, true);
  assert.equal(homeIndex > headerIndex, true);
  assert.equal(continuityIndex > homeIndex, true);
  assert.equal(publicReadbackIndex > homeIndex, true);
  assert.doesNotMatch(
    page,
    /useSearchParams|URLSearchParams|\?c=|source=all|\/conversations\/candidates\/inbox|StudioRightPanel|sendPersonaChatWithStream|provider payload|compiled prompt/i,
  );
});

test("companion context rail CSS stays scoped", () => {
  const css = readFileSync("apps/web/app/globals.css", "utf8");
  const selectors = css
    .split("}")
    .map((block) => block.split("{")[0]?.trim() ?? "")
    .filter((selector) => selector.includes(".studio-companion-context"));

  assert.equal(selectors.length > 6, true);
  for (const selector of selectors) {
    for (const part of selector.split(",")) {
      assert.match(part.trim(), /^\.studio-companion-context/);
      assert.doesNotMatch(part, /\.studio-frame|\.studio-dashboard|\.studio-sidebar|\.public-persona|\.public-home|\.studio-persona-chat/);
    }
  }
});
