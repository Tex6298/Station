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
      new Response(JSON.stringify({ error: "Invalid Developer Space API key." }), { status: 401 })) as typeof fetch,
  });

  await assert.rejects(
    () => client.recordEvent({ eventType: "signal.detected" }),
    (error) => {
      assert.equal(error instanceof DeveloperSpaceClientError, true);
      assert.equal((error as DeveloperSpaceClientError).status, 401);
      assert.deepEqual((error as DeveloperSpaceClientError).body, {
        error: "Invalid Developer Space API key.",
      });
      assert.equal(error.message, "Invalid Developer Space API key.");
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
