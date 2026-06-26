import assert from "node:assert/strict";
import test from "node:test";
import {
  discoverDiscussionCue,
  publicDocumentDiscussionCue,
  publicDocumentDiscussionEntrypointCopy,
  publicPersonaEmptyCopy,
  publicSpaceHomeCopy,
  spaceStoryStats,
} from "./public-story-polish";

test("space story stats avoid zero page and persona counters when works carry the story", () => {
  assert.deepEqual(
    spaceStoryStats({
      authoredPageCount: 0,
      documentCount: 3,
      personaCount: 0,
      discussionCount: 1,
    }),
    [
      { label: "Works", value: "3" },
      { label: "Discussion", value: "1" },
      { label: "Story", value: "Works-led" },
      { label: "Collaborators", value: "Optional" },
    ]
  );
});

test("space story stats keep authored modules when they exist", () => {
  assert.deepEqual(
    spaceStoryStats({
      authoredPageCount: 2,
      documentCount: 1,
      personaCount: 1,
      discussionCount: 0,
    }),
    [
      { label: "Work", value: "1" },
      { label: "Pages", value: "2" },
      { label: "Persona", value: "1" },
    ]
  );
});

test("public Space fallback copy treats works-led Spaces as intentional", () => {
  assert.equal(
    publicSpaceHomeCopy({ longDescription: null, shortDescription: null, hasDocuments: true }),
    "This Space is publishing through its works right now. Authored pages can be added later when the owner wants more context around the public story."
  );
  assert.equal(publicPersonaEmptyCopy(true), "This Space is led by its published works for now. Public personas can be added later when they help explain the story.");
});

test("Discover discussion cue only appears for document cards with linked discussions", () => {
  assert.equal(publicDocumentDiscussionCue({ discussionThreadId: "thread-1" }), "Open document and linked discussion");
  assert.equal(publicDocumentDiscussionCue({ discussionThreadId: null }), null);
  assert.equal(discoverDiscussionCue({ type: "document", discussionThreadId: "thread-1" }), "Open document and linked discussion");
  assert.equal(discoverDiscussionCue({ type: "document", discussionThreadId: null }), null);
  assert.equal(discoverDiscussionCue({ type: "thread", discussionThreadId: "thread-1" }), null);
});

test("public document discussion entrypoint copy stays clear and honest", () => {
  assert.deepEqual(
    publicDocumentDiscussionEntrypointCopy({
      hasDiscussion: true,
      loading: false,
      eligible: true,
      isOwner: false,
    }),
    {
      title: "Linked forum discussion",
      body: "Continue from this public document into its attached discussion thread.",
      actionLabel: "Open linked discussion",
    }
  );
  assert.deepEqual(
    publicDocumentDiscussionEntrypointCopy({
      hasDiscussion: false,
      loading: true,
      eligible: false,
      isOwner: false,
    }),
    {
      title: "Checking linked discussion",
      body: "Looking for the public forum thread attached to this document.",
      actionLabel: null,
    }
  );
  assert.deepEqual(
    publicDocumentDiscussionEntrypointCopy({
      hasDiscussion: false,
      loading: false,
      eligible: true,
      isOwner: false,
    }),
    {
      title: "No linked discussion yet",
      body: "This public document is eligible for discussion, but no thread has been opened.",
      actionLabel: null,
    }
  );
});
