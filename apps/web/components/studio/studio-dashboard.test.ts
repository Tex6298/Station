import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("apps/web/components/studio/studio-dashboard.tsx", "utf8");

test("dashboard stays a lean companions + recent-conversations landing page", () => {
  assert.match(source, /title="Your companions"/);
  assert.match(source, /title="Recent conversations"/);
  assert.match(source, /studioNewChatHref\(personas\)/);
  assert.doesNotMatch(source, /const archiveEvents|Recent Archive Activity|Continue Where You Left Off/);
  assert.doesNotMatch(source, /index === 0 \? "Today"|index === 1 \? "2d"/);
});

test("dashboard drops Integrity due, Memory, and More Studio tools — they live on the companion quick card and Settings now", () => {
  assert.doesNotMatch(source, /function IntegrityList/);
  assert.doesNotMatch(source, /function MemoryOrientation/);
  assert.doesNotMatch(source, /function MoreStudioTools/);
  assert.doesNotMatch(source, /function UsageStats/);
  assert.doesNotMatch(source, /function ArchiveAndPortability/);
  assert.doesNotMatch(source, /function PersonaOverview/);
  assert.doesNotMatch(source, /<details className="studio-dashboard-tools">/);
});

test("dashboard header drops the four-button action row — folded into the sidebar and Settings", () => {
  assert.match(source, /function Header\(\{ personas \}: \{ personas: PersonaSummary\[\] \}\)/);
  assert.doesNotMatch(source, /Open Companion/);
  assert.doesNotMatch(source, /Choose Path/);
  assert.doesNotMatch(source, /Open Public Space/);
  assert.match(source, /href="\/studio\/assistant" className="studio-dashboard-place-action">Station Assistant/);
  assert.match(source, /<Header personas=\{personas\} \/>/);
});

test("dashboard keeps companions ahead of recent conversations in the primary grid", () => {
  const primaryGrid = source.indexOf('className="studio-dashboard-primary-grid"');
  const companionList = source.indexOf("<ContinueList personas={personas} />");
  const recentConversations = source.indexOf("<RecentConversations", companionList);

  assert.ok(primaryGrid >= 0);
  assert.ok(companionList > primaryGrid);
  assert.ok(recentConversations > companionList);
});

test("dashboard warm composition uses shared classes instead of the old dark inline card palette", () => {
  assert.match(source, /className="studio-dashboard-panel"/);
  assert.match(source, /className="studio-dashboard-row"/);
  assert.doesNotMatch(source, /const panel =|const listRow =|const metricCard =|background: "#101622"|color: "#f8fafc"/);
});
