import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("apps/web/components/studio/studio-dashboard.tsx", "utf8");

test("dashboard calls navigable surfaces what they are instead of fabricating activity", () => {
  assert.match(source, /const archiveDestinations =/);
  assert.match(source, /title="Archive and portability"/);
  assert.match(source, /title="Your companions"/);
  assert.match(source, /studioNewChatHref\(personas\)/);
  assert.doesNotMatch(source, /const archiveEvents|Recent Archive Activity|Continue Where You Left Off/);
  assert.doesNotMatch(source, /index === 0 \? "Today"|index === 1 \? "2d"/);
});

test("dashboard integrity list filters current sessions and distinguishes unavailable data", () => {
  assert.match(source, /persona\.sessionStatus !== "ok"/);
  assert.match(source, /dueRows\.length === 0/);
  assert.match(source, /No Integrity Sessions are currently due\./);
  assert.match(source, /Integrity due status is temporarily unavailable\./);
  assert.doesNotMatch(source, /integrityDue\.length > 0 \? integrityDue : personas/);
});

test("dashboard makes the companion home a first-viewport action without breaking zero-persona setup", () => {
  assert.match(source, /function Header\(\{ personas \}: \{ personas: PersonaSummary\[\] \}\)/);
  assert.match(source, /const companionHref = studioNewChatHref\(personas\)/);
  assert.match(source, /personaCount > 0 \? \(\s*<Link href=\{companionHref\} className="studio-dashboard-action" data-variant="primary">Open Companion<\/Link>/);
  assert.match(source, /<Link href="\/studio\/new" className="studio-dashboard-action" data-variant="primary">New Persona<\/Link>/);
  assert.match(source, /<Link href="\/studio\/onboarding" className="studio-dashboard-action">Choose Path<\/Link>/);
  assert.match(source, /<Link href="\/space" className="studio-dashboard-action" data-variant="public">Open Public Space<\/Link>/);
  assert.match(source, /href="\/studio\/assistant" className="studio-dashboard-place-action">Station Assistant/);
  assert.match(source, /<Header personas=\{personas\} \/>/);
  assert.doesNotMatch(source, /router\.(?:push|replace)\(.*studioNewChatHref/);
});

test("dashboard keeps companions and truthful Integrity state ahead of disclosed secondary tools", () => {
  const primaryGrid = source.indexOf('className="studio-dashboard-primary-grid"');
  const companionList = source.indexOf("<ContinueList personas={personas} />");
  const integrityList = source.indexOf("<IntegrityList integrityDue={integrityDue} available={integrityAvailable} />");
  const memory = source.indexOf("<MemoryOrientation personas={personas} />");
  const secondaryTools = source.indexOf("<MoreStudioTools personas={personas} />");

  assert.ok(primaryGrid >= 0);
  assert.ok(companionList > primaryGrid);
  assert.ok(integrityList > companionList);
  assert.ok(memory > integrityList);
  assert.ok(secondaryTools > memory);
  assert.match(source, /<details className="studio-dashboard-tools">/);
  assert.match(source, /<UsageStats \/>/);
  assert.match(source, /<ArchiveAndPortability \/>/);
  assert.match(source, /<PersonaOverview personas=\{personas\} \/>/);
});

test("dashboard warm composition uses shared classes instead of the old dark inline card palette", () => {
  assert.match(source, /className="studio-dashboard-panel"/);
  assert.match(source, /className="studio-dashboard-row"/);
  assert.doesNotMatch(source, /const panel =|const listRow =|const metricCard =|background: "#101622"|color: "#f8fafc"/);
});
