import assert from "node:assert/strict";
import test from "node:test";
import {
  filterPersonaConversations,
  personaConversationBelongsToPersona,
  personaConversationsPath,
  personaConversationTarget,
  personaConversationTitle,
  uniqueRecentConversationPersonas,
} from "./persona-conversations";

const conversations = [
  { id: "recent", title: "Planning the next chapter" },
  { id: "older", title: "A quiet check-in" },
];

test("conversation target is URL-driven and only defaults when the URL is silent", () => {
  assert.deepEqual(personaConversationTarget("new", conversations), { kind: "new", id: null });
  assert.deepEqual(personaConversationTarget(" older ", conversations), { kind: "conversation", id: "older" });
  assert.deepEqual(personaConversationTarget(null, conversations), { kind: "conversation", id: "recent" });
  assert.deepEqual(personaConversationTarget(null, []), { kind: "new", id: null });
});

test("conversation ownership accepts API snake case and normalized camel case", () => {
  assert.equal(personaConversationBelongsToPersona({ persona_id: "persona-1" }, "persona-1"), true);
  assert.equal(personaConversationBelongsToPersona({ personaId: "persona-1" }, "persona-1"), true);
  assert.equal(personaConversationBelongsToPersona({ persona_id: "persona-2" }, "persona-1"), false);
  assert.equal(personaConversationBelongsToPersona({}, "persona-1"), false);
});

test("conversation labels and filters stay deterministic", () => {
  assert.equal(personaConversationTitle({ title: "  Named thread  " }), "Named thread");
  assert.equal(personaConversationTitle({ title: null }), "Untitled conversation");
  assert.deepEqual(filterPersonaConversations(conversations, "QUIET"), [conversations[1]]);
  assert.deepEqual(filterPersonaConversations(conversations, ""), conversations);
});

test("recent conversation fanout requests each persona once with an encoded path", () => {
  const first = { id: "persona/one", name: "First label" };
  const duplicate = { id: "persona/one", name: "Duplicate label" };
  const second = { id: "persona two", name: "Second" };

  assert.deepEqual(uniqueRecentConversationPersonas([first, duplicate, second]), [first, second]);
  assert.equal(personaConversationsPath(first.id), "/conversations/persona/persona%2Fone");
  assert.equal(personaConversationsPath(second.id), "/conversations/persona/persona%20two");
});
