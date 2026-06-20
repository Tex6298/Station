import assert from "node:assert/strict";
import test from "node:test";
import {
  getViewerModerationActions,
  moderationActionLabel,
  moderationActionPath,
} from "./community-moderation";

test("community moderation helpers use only PR99 thread and comment routes", () => {
  assert.equal(moderationActionPath("thread", "thread-1"), "/threads/thread-1/moderation");
  assert.equal(moderationActionPath("comment", "comment-1"), "/comments/comment-1/moderation");
});

test("community moderation helper filters capability readback to safety actions", () => {
  const member = { id: "member", tier: "private" as const, isAdmin: false };
  const visitor = { id: "visitor", tier: "visitor" as const, isAdmin: false };
  const admin = { id: "admin", tier: "visitor" as const, isAdmin: true };
  const target = {
    viewer_moderation_actions: ["hide", "pin", "remove", "lock", "restore", "unhide", "mute"],
  };

  assert.deepEqual(getViewerModerationActions(null, target), []);
  assert.deepEqual(getViewerModerationActions(visitor, target), []);
  assert.deepEqual(getViewerModerationActions(member, target), ["hide", "remove", "restore", "unhide"]);
  assert.deepEqual(getViewerModerationActions(admin, target), ["hide", "remove", "restore", "unhide"]);
});

test("community moderation labels stay action-only and do not expose reasons or identities", () => {
  assert.equal(moderationActionLabel("hide"), "Hide");
  assert.equal(moderationActionLabel("unhide"), "Unhide");
  assert.equal(moderationActionLabel("remove"), "Remove");
  assert.equal(moderationActionLabel("restore"), "Restore");
});
