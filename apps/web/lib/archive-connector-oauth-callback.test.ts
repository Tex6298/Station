import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isProtectedRoute } from "./auth-routes";
import {
  archiveConnectorCallbackRestartCopy,
  parseArchiveConnectorOAuthCallback,
  verifyArchiveConnectorOAuthCallback,
} from "./archive-connector-oauth-callback";

const validStateHandle = `${"a".repeat(43)}.${"b".repeat(43)}`;
const validCode = "callback-code.fixture_~+/=";

function source(path: string) {
  return readFileSync(path, "utf8");
}

test("archive connector OAuth callback parser bounds provider state code and provider errors", () => {
  const ready = parseArchiveConnectorOAuthCallback({
    provider: "reddit",
    searchParams: new URLSearchParams({ state: validStateHandle, code: validCode }),
  });

  assert.deepEqual(ready, {
    status: "ready",
    provider: "reddit",
    stateHandle: validStateHandle,
    code: validCode,
  });

  assert.deepEqual(
    parseArchiveConnectorOAuthCallback({
      provider: "mastodon",
      searchParams: new URLSearchParams({ state: validStateHandle, code: validCode }),
    }),
    { status: "invalid_provider", provider: null },
  );
  assert.deepEqual(
    parseArchiveConnectorOAuthCallback({
      provider: "discord",
      searchParams: new URLSearchParams("error=access_denied&error_description=hidden-marker"),
    }),
    { status: "provider_error", provider: "discord" },
  );
  assert.equal(JSON.stringify(archiveConnectorCallbackRestartCopy("provider_error")).includes("hidden-marker"), false);

  assert.equal(
    parseArchiveConnectorOAuthCallback({
      provider: "reddit",
      searchParams: new URLSearchParams({ code: validCode }),
    }).status,
    "missing_state",
  );
  assert.equal(
    parseArchiveConnectorOAuthCallback({
      provider: "reddit",
      searchParams: new URLSearchParams({ state: "bad-state", code: validCode }),
    }).status,
    "invalid_state",
  );
  assert.equal(
    parseArchiveConnectorOAuthCallback({
      provider: "reddit",
      searchParams: new URLSearchParams({ state: validStateHandle }),
    }).status,
    "missing_code",
  );
  assert.equal(
    parseArchiveConnectorOAuthCallback({
      provider: "reddit",
      searchParams: new URLSearchParams({ state: validStateHandle, code: "code with spaces" }),
    }).status,
    "invalid_code",
  );
});

test("archive connector OAuth callback route stays outside protected login redirect paths", () => {
  assert.equal(isProtectedRoute("/archive-connectors/oauth/callback/reddit"), false);
  assert.equal(isProtectedRoute("/archive-connectors/oauth/callback/discord"), false);

  const middlewareSource = source("apps/web/middleware.ts");
  const authRouteSource = source("apps/web/lib/auth-routes.ts");
  assert.doesNotMatch(middlewareSource, /archive-connectors\/oauth\/callback/);
  assert.doesNotMatch(authRouteSource, /archive-connectors\/oauth\/callback/);
});

test("archive connector OAuth callback page scrubs query before auth or API work", () => {
  const pageSource = source("apps/web/app/archive-connectors/oauth/callback/[provider]/page.tsx");
  const replaceIndex = pageSource.indexOf("window.history.replaceState");
  const readStoredSessionIndex = pageSource.indexOf("const accessToken = readStoredArchiveConnectorCallbackAccessToken");
  const verifyIndex = pageSource.indexOf("verifyArchiveConnectorOAuthCallback({");

  assert.ok(replaceIndex >= 0, "callback page must scrub browser history");
  assert.ok(readStoredSessionIndex >= 0, "callback page must recover stored auth after scrub");
  assert.ok(verifyIndex >= 0, "callback page must call the API verify route after scrub");
  assert.ok(replaceIndex < readStoredSessionIndex, "history scrub must happen before auth recovery");
  assert.ok(replaceIndex < verifyIndex, "history scrub must happen before API verify");
  assert.doesNotMatch(pageSource, /router\.push|\/login|LOGIN_REDIRECT_PARAM|redirect=/);
  assert.doesNotMatch(pageSource, /error_description|console\.|localStorage\.setItem|sessionStorage/);

  const helperSource = source("apps/web/lib/archive-connector-oauth-callback.ts");
  assert.doesNotMatch(helperSource, /getSession|restoreSession|refreshStoredSession|refreshSession|signIn|signUp/);
  assert.doesNotMatch(helperSource, /console\.|window\.location\.href|router\.push|\/login|redirect=/);
});

test("archive connector OAuth callback verifier calls the bounded API route with Bearer auth", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return new Response(JSON.stringify({
      status: "oauth_state_verified",
      provider: "reddit",
      purpose: "archive_connector",
      consumed: true,
      localRedirectPath: "/studio/archive",
      credentialWritesEnabled: false,
      oauthRedirectsEnabled: false,
      tokenExchangeEnabled: false,
      providerCallsEnabled: false,
      sourceInventoryEnabled: false,
      importWritesEnabled: false,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const response = await verifyArchiveConnectorOAuthCallback({
      provider: "reddit",
      stateHandle: validStateHandle,
      code: validCode,
      accessToken: "owner-session-marker",
    });

    assert.equal(response.status, "oauth_state_verified");
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /\/archive-connectors\/oauth\/reddit\/callback\/verify$/);
    assert.equal(new URL(calls[0].url).search, "");
    assert.equal(calls[0].init?.method, "POST");
    assert.equal(new Headers(calls[0].init?.headers).get("Authorization"), "Bearer owner-session-marker");
    assert.deepEqual(JSON.parse(String(calls[0].init?.body)), {
      stateHandle: validStateHandle,
      code: validCode,
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
