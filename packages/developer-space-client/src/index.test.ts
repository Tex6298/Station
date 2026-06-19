import assert from "node:assert/strict";
import test from "node:test";
import {
  createDeveloperSpaceClient,
  DeveloperSpaceClientError,
} from "./index";

test("client posts node state with encoded path and required headers", async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const client = createDeveloperSpaceClient({
    baseUrl: " https://station.example/api/ ",
    apiKey: " station_dev_test ",
    headers: {
      "X-Station-Developer-Key": "wrong-key",
      "X-Trace-Id": "trace-1",
    },
    fetch: (async (url, init) => {
      calls.push({ url: String(url), init: init ?? {} });
      return new Response(JSON.stringify({ accepted: true }), { status: 202 });
    }) as typeof fetch,
  });

  const result = await client.upsertNodeState("node/alpha one", { fragmentCount: 7 });

  assert.deepEqual(result, { accepted: true });
  assert.equal(calls.length, 1);
  assert.equal(
    calls[0].url,
    "https://station.example/api/developer-spaces/ingest/nodes/node%2Falpha%20one/state",
  );
  assert.deepEqual(calls[0].init.headers, {
    "X-Trace-Id": "trace-1",
    "Content-Type": "application/json",
    "X-Station-Developer-Key": "station_dev_test",
  });
  assert.equal(calls[0].init.body, JSON.stringify({ fragmentCount: 7 }));
});

test("client throws structured errors for failed ingestion responses", async () => {
  const client = createDeveloperSpaceClient({
    baseUrl: "https://station.example",
    apiKey: "station_dev_test",
    fetch: (async () =>
      new Response(JSON.stringify({
        error: "Invalid Developer Space API key.",
        code: "developer_space_key_invalid",
        category: "auth",
      }), { status: 401 })) as typeof fetch,
  });

  await assert.rejects(
    () => client.recordEvent({ eventType: "signal.detected" }),
    (error) => {
      assert.equal(error instanceof DeveloperSpaceClientError, true);
      assert.equal((error as DeveloperSpaceClientError).status, 401);
      assert.deepEqual((error as DeveloperSpaceClientError).body, {
        error: "Invalid Developer Space API key.",
        code: "developer_space_key_invalid",
        category: "auth",
      });
      assert.equal((error as DeveloperSpaceClientError).code, "developer_space_key_invalid");
      assert.equal((error as DeveloperSpaceClientError).category, "auth");
      assert.equal(error.message, "Invalid Developer Space API key.");
      return true;
    },
  );
});

test("client exposes quota and fallback error categories", async () => {
  const quotaClient = createDeveloperSpaceClient({
    baseUrl: "https://station.example",
    apiKey: "station_dev_test",
    fetch: (async () =>
      new Response(JSON.stringify({
        error: "Developer Space event quota exceeded.",
        code: "quota_exceeded",
        category: "quota",
        resource: "developer_space_events",
        limit: 100000,
        used: 100000,
        retryAfter: 60,
      }), { status: 429 })) as typeof fetch,
  });

  await assert.rejects(
    () => quotaClient.recordEvent({ eventType: "signal.detected" }),
    (error) => {
      const clientError = error as DeveloperSpaceClientError;
      assert.equal(clientError.status, 429);
      assert.equal(clientError.code, "quota_exceeded");
      assert.equal(clientError.category, "quota");
      assert.equal(clientError.resource, "developer_space_events");
      assert.equal(clientError.retryAfter, 60);
      return true;
    },
  );

  const fallbackClient = createDeveloperSpaceClient({
    baseUrl: "https://station.example",
    apiKey: "station_dev_test",
    fetch: (async () =>
      new Response("upstream unavailable", { status: 503 })) as typeof fetch,
  });

  await assert.rejects(
    () => fallbackClient.recordSnapshot({ snapshotData: { summary: "test" } }),
    (error) => {
      const clientError = error as DeveloperSpaceClientError;
      assert.equal(clientError.status, 503);
      assert.equal(clientError.code, "server");
      assert.equal(clientError.category, "server");
      assert.equal(clientError.message, "Developer Space request failed with 503.");
      return true;
    },
  );
});

test("client rejects blank connection options after trimming", () => {
  assert.throws(
    () => createDeveloperSpaceClient({ baseUrl: "   ", apiKey: "station_dev_test" }),
    /requires baseUrl/,
  );
  assert.throws(
    () => createDeveloperSpaceClient({ baseUrl: "https://station.example", apiKey: "   " }),
    /requires apiKey/,
  );
});
