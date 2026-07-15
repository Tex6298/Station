import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("Notes unavailable page renders exact truth copy and two real links", () => {
  const componentSource = readFileSync("apps/web/components/studio/notes-scratchpad.tsx", "utf8");
  const pageSource = readFileSync("apps/web/app/studio/notes/page.tsx", "utf8");
  const navigationSource = readFileSync("apps/web/lib/studio-navigation.ts", "utf8");
  const middlewareSource = readFileSync("apps/web/middleware.ts", "utf8");
  const authRoutesSource = readFileSync("apps/web/lib/auth-routes.ts", "utf8");
  const packageSource = readFileSync("package.json", "utf8");
  const cssSource = readFileSync("apps/web/app/globals.css", "utf8");

  assert.match(componentSource, /Owner-only Studio/);
  assert.match(componentSource, /<h1 id="studio-notes-title">Notes unavailable<\/h1>/);
  assert.match(
    componentSource,
    /Station does not currently save Notes on this route\. The previous\s+scratchpad kept text only in the open page and did not create a\s+durable Notes record, so a refresh did not restore that text\./,
  );
  assert.match(
    componentSource,
    /Global Archive is a separate owner-only view of existing preserved\s+source material\. It is not Notes storage, and text from this route is\s+not carried there\./,
  );
  assert.match(componentSource, /<Link href="\/studio\/archive">Open Global Archive<\/Link>/);
  assert.match(componentSource, /<Link href="\/studio">Back to Studio<\/Link>/);
  assert.equal((componentSource.match(/<Link /g) ?? []).length, 2);

  assert.doesNotMatch(
    componentSource,
    /useState|useMemo|useEffect|onClick|onChange|contentEditable|localStorage|sessionStorage|indexedDB|fetch\(|apiGet|apiPost|setTimeout|setInterval/,
  );
  assert.doesNotMatch(componentSource, /<input|<textarea|<form|<button|Search notes|New note|Pin|Draft post|Attach|word count/i);
  assert.doesNotMatch(componentSource, /Archive mutation|archive note|archive this/i);
  assert.doesNotMatch(
    componentSource,
    /Continuity questions for Station|Publish flow draft|Persona management follow-ups|Start writing|autosave|save endpoint|saved note|private scratchpad/i,
  );

  assert.match(pageSource, /import \{ NotesScratchpad \} from "@\/components\/studio\/notes-scratchpad"/);
  assert.match(pageSource, /return <NotesScratchpad \/>/);
  assert.doesNotMatch(pageSource, /getSession|apiGet|apiPost|redirect|useState|fetch\(/);

  assert.match(navigationSource, /href: "\/studio\/notes"/);
  assert.match(navigationSource, /label: "Notes unavailable"/);
  assert.doesNotMatch(navigationSource, /Notes and Scratchpad|Private working notes|Owner-only notes|Notes stay in the private scratchpad/);

  assert.match(authRoutesSource, /if \(first === "studio"\) return true/);
  assert.match(middlewareSource, /\/studio\/:path\*/);
  assert.match(packageSource, /apps\/web\/components\/studio\/notes-scratchpad\.test\.ts/);

  const notesCss = cssSource.slice(
    cssSource.indexOf(".studio-notes-unavailable"),
    cssSource.indexOf(".studio-frame-header", cssSource.indexOf(".studio-notes-unavailable")),
  );
  const panelRule = notesCss.match(/\.studio-notes-panel\s*\{([^}]*)\}/)?.[1] ?? "";
  const headingRule = notesCss.match(/\.studio-notes-panel h1\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(notesCss, /var\(--station-frame-canvas\)/);
  assert.match(notesCss, /var\(--station-frame-text\)/);
  assert.doesNotMatch(notesCss, /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
  assert.doesNotMatch(panelRule, /(?:^|\s)(?:border|background|border-radius|box-shadow)\s*:/);
  assert.match(headingRule, /font-size:\s*32px/);
  assert.doesNotMatch(headingRule, /clamp\(|vw/);
});
