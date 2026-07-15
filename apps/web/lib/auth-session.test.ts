import assert from "node:assert/strict";
import test from "node:test";
import {
  deriveUsername,
  parseStoredSession,
  parseStoredSessionFromStorage,
  serializeSession,
  sessionFromAuthResponse,
  sessionWithUser,
} from "./auth-session";

test("auth session helpers normalize API auth responses for existing callers", () => {
  const session = sessionFromAuthResponse({
    userId: "user-1",
    email: "user@example.test",
    tier: "creator",
    accessToken: "access-token",
    refreshToken: "refresh-token",
  });

  assert.equal(session.accessToken, "access-token");
  assert.equal(session.access_token, "access-token");
  assert.equal(session.refreshToken, "refresh-token");
  assert.equal(session.refresh_token, "refresh-token");
  assert.deepEqual(session.user, {
    id: "user-1",
    email: "user@example.test",
    tier: "creator",
    isAdmin: false,
  });

  const restored = sessionWithUser(session, {
    id: "user-1",
    email: "user@example.test",
    tier: "canon",
    isAdmin: true,
  });

  assert.equal(restored.user.tier, "canon");
  assert.equal(restored.user.isAdmin, true);
  assert.equal(restored.access_token, "access-token");
});

test("stored session parsing rejects malformed values", () => {
  const session = sessionFromAuthResponse({
    userId: "user-1",
    email: "user@example.test",
    tier: "private",
    accessToken: "access-token",
    refreshToken: "refresh-token",
  });

  assert.equal(parseStoredSession(null), null);
  assert.equal(parseStoredSession("not-json"), null);
  assert.equal(parseStoredSession(JSON.stringify({ accessToken: "missing-user" })), null);
  assert.deepEqual(parseStoredSession(serializeSession(session))?.user, session.user);
});

test("stored session reads fail safely when browser storage is denied", () => {
  const denied = {
    getItem() {
      throw new DOMException("Storage denied", "SecurityError");
    },
  };

  assert.equal(parseStoredSessionFromStorage(null), null);
  assert.equal(parseStoredSessionFromStorage(denied), null);
});

test("deriveUsername creates API-safe beta signup usernames", () => {
  assert.equal(deriveUsername({ username: "Given_Name", email: "u@example.test" }), "given_name");
  assert.equal(deriveUsername({ displayName: "Marty Station!", email: "m@example.test" }), "marty-station");
  assert.equal(deriveUsername({ email: "ab@example.test" }), "abuser");
  assert.equal(deriveUsername({ email: "long.long.long.long.long.long@example.test" }).length <= 30, true);
});
