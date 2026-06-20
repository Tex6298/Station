import assert from "node:assert/strict";
import test from "node:test";
import {
  authorRecognitionApiPath,
  authorRecognitionHref,
  authorRecognitionKindLabel,
  authorRecognitionLabel,
  authorRecognitionPagePath,
  authorRecognitionVisibleKeys,
  canReadAuthorRecognition,
  recognitionCountItems,
  sanitizeAuthorRecognitions,
  totalRecognitionCount,
} from "./community-author-recognition";

test("author recognition paths stay scoped to PR106 readback", () => {
  assert.equal(authorRecognitionPagePath(), "/forums/witnesses");
  assert.equal(authorRecognitionApiPath(), "/forums/witnesses/mine?limit=50");
  assert.equal(authorRecognitionApiPath(0), "/forums/witnesses/mine?limit=1");
  assert.equal(authorRecognitionApiPath(150), "/forums/witnesses/mine?limit=100");
});

test("author recognition readback gates signed-out and below-tier states before fetch", () => {
  assert.equal(canReadAuthorRecognition(null), false);
  assert.equal(canReadAuthorRecognition({ id: "visitor", tier: "visitor", isAdmin: false }), false);
  assert.equal(canReadAuthorRecognition({ id: "member", tier: "private", isAdmin: false }), true);
  assert.equal(canReadAuthorRecognition({ id: "creator", tier: "creator", isAdmin: false }), true);
  assert.equal(canReadAuthorRecognition({ id: "admin-visitor", tier: "visitor", isAdmin: true }), false);
});

test("author recognition sanitizes to aggregate-only visible rows", () => {
  const rows = sanitizeAuthorRecognitions([
    {
      targetType: "thread",
      targetId: "thread-1",
      witnessCounts: { helpful: 2, grounded: 0, careful: 1 },
      witness_user_id: "private-witness",
      ownerUserId: "raw-owner",
      category_id: "raw-category",
      targetContext: {
        title: "Visible thread",
        routeHref: "/forums/general/thread-1",
        routeLabel: "Visible thread",
        canOpenRoute: true,
        createdAt: "2026-06-20T10:00:00.000Z",
        body: "private body",
      },
    },
    {
      targetType: "comment",
      targetId: "comment-1",
      witnessCounts: { grounded: 3 },
      targetContext: {
        title: "Parent thread",
        parentThreadId: "thread-1",
        routeHref: "https://example.com/unsafe",
        routeLabel: "Parent thread / comment",
        canOpenRoute: true,
        updatedAt: "2026-06-20T11:00:00.000Z",
      },
    },
  ]);

  assert.equal(rows.length, 2);
  assert.deepEqual(authorRecognitionVisibleKeys(rows[0]), ["targetContext", "targetId", "targetType", "witnessCounts"]);
  assert.equal(JSON.stringify(rows).includes("private-witness"), false);
  assert.equal(JSON.stringify(rows).includes("raw-owner"), false);
  assert.equal(JSON.stringify(rows).includes("raw-category"), false);
  assert.equal(JSON.stringify(rows).includes("private body"), false);
  assert.deepEqual(rows[0].witnessCounts, { helpful: 2, grounded: 0, careful: 1 });
  assert.deepEqual(rows[1].witnessCounts, { helpful: 0, grounded: 3, careful: 0 });
});

test("author recognition labels and links stay safe and non-ranking", () => {
  const rows = sanitizeAuthorRecognitions([
    {
      targetType: "thread",
      targetId: "thread-1",
      witnessCounts: { helpful: 1 },
      targetContext: {
        routeLabel: "Grounded thread",
        routeHref: "/forums/general/thread-1",
        canOpenRoute: true,
      },
    },
    {
      targetType: "comment",
      targetId: "comment-1",
      witnessCounts: { careful: 2 },
      targetContext: {
        title: "Parent thread",
        routeHref: "/space/private",
        canOpenRoute: true,
      },
    },
  ]);

  assert.equal(authorRecognitionKindLabel(rows[0].targetType), "Thread");
  assert.equal(authorRecognitionKindLabel(rows[1].targetType), "Comment");
  assert.equal(authorRecognitionLabel(rows[0]), "Grounded thread");
  assert.equal(authorRecognitionLabel(rows[1]), "Parent thread");
  assert.equal(authorRecognitionHref(rows[0]), "/forums/general/thread-1");
  assert.equal(authorRecognitionHref(rows[1]), null);
  assert.deepEqual(recognitionCountItems(rows[0].witnessCounts), [{ key: "helpful", label: "Helpful", value: 1 }]);
  assert.equal(totalRecognitionCount(rows[1].witnessCounts), 2);
});
