import assert from "node:assert/strict";
import test from "node:test";
import {
  buildThreadCreatePayload,
  canCreateCommunityThread,
  categoryPath,
  categoryPreflightUnavailableCopy,
  newThreadPath,
  threadCreatePath,
  threadDetailPath,
} from "./community-forum-create";

test("forum create helpers use accepted forum routes", () => {
  assert.equal(categoryPath("canon-lab"), "/forums/canon-lab");
  assert.equal(newThreadPath("canon-lab"), "/forums/canon-lab/new");
  assert.equal(threadCreatePath(), "/forums/threads");
  assert.equal(threadDetailPath("canon-lab", "thread-1"), "/forums/canon-lab/thread-1");
});

test("forum create eligibility follows the shared thread participation rule", () => {
  assert.equal(canCreateCommunityThread(null), false);
  assert.equal(canCreateCommunityThread({ id: "visitor", tier: "visitor", isAdmin: false }), false);
  assert.equal(canCreateCommunityThread({ id: "member", tier: "private", isAdmin: false }), true);
  assert.equal(canCreateCommunityThread({ id: "creator", tier: "creator", isAdmin: false }), true);
  assert.equal(canCreateCommunityThread({ id: "admin", tier: "visitor", isAdmin: true }), true);
});

test("category preflight copy distinguishes signed-out and below-tier states", () => {
  assert.equal(categoryPreflightUnavailableCopy(null), "Sign in to open protected categories or start a thread.");
  assert.equal(
    categoryPreflightUnavailableCopy({ id: "visitor", tier: "visitor", isAdmin: false }),
    "Category not found, or Basic tier or higher is required to open it."
  );
  assert.equal(
    categoryPreflightUnavailableCopy({ id: "member", tier: "private", isAdmin: false }),
    "Category not found."
  );
});

test("thread create payload stays narrow and bounded to offered selector rows", () => {
  assert.deepEqual(
    buildThreadCreatePayload(
      {
        categoryId: "category-1",
        title: "  Thread title  ",
        body: "  Body copy  ",
        linkedPersonaId: "persona-1",
        linkedSpaceId: "space-private",
      },
      {
        personas: [{ id: "persona-1" }],
        spaces: [{ id: "space-public" }],
      }
    ),
    {
      categoryId: "category-1",
      title: "Thread title",
      body: "Body copy",
      linkedPersonaId: "persona-1",
    }
  );
});
