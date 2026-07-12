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
