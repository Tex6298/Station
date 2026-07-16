import assert from "node:assert/strict";
import test from "node:test";

import {
  assertProtectedAuthReadName,
  assertProtectedProductGet,
  createProtectedReadVerifier,
} from "./protected-read-verifier.mjs";

test("protected verifier permits registered Auth reads and product GETs", async () => {
  const requests = [];
  const verifier = createProtectedReadVerifier({
    fetchImpl: async (url, init) => {
      requests.push({ url: String(url), init });
      return { ok: true };
    },
    authReads: {
      "admin.getUserById": async (id) => ({ id }),
      "database.selectAuthState": async () => ({ sessions: 0 }),
    },
  });

  assert.deepEqual(await verifier.authRead("admin.getUserById", "owner"), { id: "owner" });
  assert.deepEqual(await verifier.authRead("database.selectAuthState"), { sessions: 0 });
  assert.deepEqual(Object.keys(verifier).sort(), ["authRead", "productGet"]);
  assert.equal(Object.isFrozen(verifier), true);
  assert.equal("auth" in verifier, false);
  await verifier.productGet("https://station.example/discover/feed?tab=new", {
    headers: { Accept: "application/json" },
  });

  assert.equal(requests.length, 1);
  assert.equal(requests[0].init.method, "GET");
});

test("protected verifier rejects Auth-producing helper names", () => {
  for (const operation of [
    "signUp",
    "signInWithPassword",
    "refreshSession",
    "auth.signOut",
    "admin.createSession",
    "set_session",
    "update-session",
    "delete/session",
    "revokeSession",
    "exchangeCodeForSession",
    "session.create",
    "SESSION / UPDATE",
    "session revoke",
    "sessionDelete",
    "code.exchange.for.session",
    "signInWithOtp",
    "verifyOtp",
    "otp.verify",
    "sendOtp",
  ]) {
    assert.throws(() => assertProtectedAuthReadName(operation), /rejected Auth mutation/);
  }
});

test("protected verifier rejects non-GET product requests and Auth-producing paths", async () => {
  let transportCalls = 0;
  const verifier = createProtectedReadVerifier({
    fetchImpl: async () => {
      transportCalls += 1;
      return { ok: true };
    },
  });

  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    await assert.rejects(verifier.productGet("https://station.example/spaces", { method }), /rejected product method/);
  }
  assert.throws(
    () => assertProtectedProductGet("https://station.example/discover/feed", { body: "unexpected" }),
    /rejected a product GET body/,
  );
  for (const path of [
    "/auth/signup",
    "/auth/signin",
    "/auth/refresh",
    "/auth/signout",
    "/auth/%73ignin",
    "/auth%2fsignin",
    "/auth/%2573ignin",
    "/AUTH//SIGNIN",
    "/ignored/%252e%252e/auth/signin",
  ]) {
    await assert.rejects(verifier.productGet(`https://station.example${path}`), /rejected Auth-producing product path/);
  }
  assert.doesNotThrow(() => assertProtectedProductGet("https://station.example/documents/100%25-ready"));

  assert.equal(transportCalls, 0);
});

test("protected verifier exposes only explicitly registered Auth reads", async () => {
  const verifier = createProtectedReadVerifier({ fetchImpl: async () => ({ ok: true }) });
  await assert.rejects(verifier.authRead("admin.getUserById", "owner"), /not registered/);
  assert.throws(
    () => createProtectedReadVerifier({ authReads: { "auth.signOut": async () => undefined } }),
    /rejected Auth mutation/,
  );
});
