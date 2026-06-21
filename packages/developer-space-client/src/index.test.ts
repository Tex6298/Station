import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  agentsObserveHookEventFixture,
  createAgentsObserveOfflineDryRunSummary,
  createObservedRuntimeWebhookRequest,
  createDeveloperSpaceClient,
  DeveloperSpaceClientError,
  signObservedRuntimeWebhookBody,
  transformAgentsObserveHookEvent,
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

test("client exposes quota, rate-limit, and fallback error categories", async () => {
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

  const rateLimitClient = createDeveloperSpaceClient({
    baseUrl: "https://station.example",
    apiKey: "station_dev_test",
    fetch: (async () =>
      new Response(JSON.stringify({
        error: "Developer Space ingestion rate limit exceeded.",
        code: "developer_space_rate_limited",
        category: "rate_limit",
        resource: "developer_space_ingest_requests",
        limit: 120,
        used: 121,
        retryAfter: 60,
      }), { status: 429 })) as typeof fetch,
  });

  await assert.rejects(
    () => rateLimitClient.recordEvent({ eventType: "signal.detected" }),
    (error) => {
      const clientError = error as DeveloperSpaceClientError;
      assert.equal(clientError.status, 429);
      assert.equal(clientError.code, "developer_space_rate_limited");
      assert.equal(clientError.category, "rate_limit");
      assert.equal(clientError.resource, "developer_space_ingest_requests");
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

test("observed runtime webhook helper signs the exact raw JSON body", async () => {
  const request = await createObservedRuntimeWebhookRequest({
    deliveryId: "delivery-001",
    webhookId: "webhook-001",
    observedAt: "2026-06-21T00:00:00.000Z",
    signingSecret: "station_whsec_test",
    timestamp: 1_771_452_800,
    source: {
      id: "operator-smoke",
    },
    payload: {
      nodes: [
        {
          nodeId: "world:gate",
          nodeName: "World Gate",
          fragmentCount: 12,
          metrics: { publicState: "stable" },
        },
      ],
      events: [],
      snapshots: [],
      supportingContext: [],
    },
  });

  const expectedSignature = createHmac("sha256", "station_whsec_test")
    .update("1771452800.")
    .update(Buffer.from(request.body, "utf8"))
    .digest("hex");

  assert.equal(request.headers["Content-Type"], "application/json");
  assert.equal(request.headers["X-Station-Webhook-Id"], "webhook-001");
  assert.equal(request.headers["X-Station-Signature"], `t=1771452800,v1=${expectedSignature}`);
  assert.deepEqual(JSON.parse(request.body), {
    schema: "station.observed_runtime.webhook.v1",
    deliveryId: "delivery-001",
    source: {
      id: "operator-smoke",
      runtimeHostedBy: "external",
      stationRole: "observer",
    },
    observedAt: "2026-06-21T00:00:00.000Z",
    payload: {
      nodes: [
        {
          nodeId: "world:gate",
          nodeName: "World Gate",
          fragmentCount: 12,
          metrics: { publicState: "stable" },
        },
      ],
      events: [],
      snapshots: [],
      supportingContext: [],
    },
  });
});

test("client sends signed observed runtime webhooks without logging secrets", async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const client = createDeveloperSpaceClient({
    baseUrl: "https://station.example",
    apiKey: "station_dev_test",
    fetch: (async (url, init) => {
      calls.push({ url: String(url), init: init ?? {} });
      return new Response(JSON.stringify({
        accepted: true,
        replayed: false,
        webhookId: "delivery-001",
        imported: { nodes: 1, events: 0, snapshots: 0, supportingContext: 0 },
      }), { status: 202 });
    }) as typeof fetch,
  });

  const result = await client.sendObservedRuntimeWebhook({
    deliveryId: "delivery-001",
    signingSecret: "station_whsec_dedicated",
    timestamp: 1_771_452_800,
    payload: {
      nodes: [{ nodeId: "world:gate", fragmentCount: 12 }],
    },
  });

  assert.deepEqual(result, {
    accepted: true,
    replayed: false,
    webhookId: "delivery-001",
    imported: { nodes: 1, events: 0, snapshots: 0, supportingContext: 0 },
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://station.example/developer-spaces/ingest/observed-runtime");
  const headers = calls[0].init.headers as Record<string, string>;
  assert.equal(headers["X-Station-Developer-Key"], "station_dev_test");
  assert.equal(headers["X-Station-Webhook-Id"], "delivery-001");
  assert.match(headers["X-Station-Signature"], /^t=1771452800,v1=[a-f0-9]{64}$/);
  assert.equal(String(calls[0].init.body).includes("station_whsec_dedicated"), false);
});

test("client falls back to ingestion key signing and exposes webhook in-progress errors", async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const client = createDeveloperSpaceClient({
    baseUrl: "https://station.example",
    apiKey: "station_dev_fallback",
    fetch: (async (url, init) => {
      calls.push({ url: String(url), init: init ?? {} });
      return new Response(JSON.stringify({
        error: "Observed runtime webhook delivery is already being processed.",
        code: "developer_space_webhook_in_progress",
        category: "validation",
        details: { webhookId: "delivery-002", retryable: true },
      }), { status: 409 });
    }) as typeof fetch,
  });

  await assert.rejects(
    () => client.sendObservedRuntimeWebhook({
      deliveryId: "delivery-002",
      timestamp: 1_771_452_800,
      payload: { nodes: [{ nodeId: "world:gate" }] },
    }),
    (error) => {
      const clientError = error as DeveloperSpaceClientError;
      assert.equal(clientError.status, 409);
      assert.equal(clientError.code, "developer_space_webhook_in_progress");
      assert.equal(clientError.category, "validation");
      assert.deepEqual((clientError.body as any).details, {
        webhookId: "delivery-002",
        retryable: true,
      });
      return true;
    },
  );

  const headers = calls[0].init.headers as Record<string, string>;
  const body = String(calls[0].init.body);
  assert.equal(
    headers["X-Station-Signature"],
    await signObservedRuntimeWebhookBody({
      rawBody: body,
      signingSecret: "station_dev_fallback",
      timestamp: 1_771_452_800,
    }),
  );
});

test("agents observe fixture maps to deterministic Developer Space import payload", () => {
  const payload = transformAgentsObserveHookEvent(agentsObserveHookEventFixture);

  assert.equal(payload.nodes?.length, 2);
  assert.equal(payload.events?.length, 1);
  assert.equal(payload.snapshots?.length, 1);
  assert.equal(payload.supportingContext?.length, 1);
  assert.deepEqual(payload.nodes?.map((node) => node.nodeId), [
    "agents-observe:session:fixture",
    "agents-observe:agent:reviewer",
  ]);
  assert.deepEqual(payload.events?.[0].eventData, {
    source: "agents-observe",
    hookName: "tool_call",
    toolName: "shell",
    status: "completed",
    agentRole: "reviewer",
    fileTouchCount: 2,
    inputTokenCount: 1200,
    outputTokenCount: 340,
    redactedSensitiveFieldCount: 6,
  });
  assert.equal(payload.events?.[0].fieldClassifications?.hookName, "public");
  assert.equal(payload.events?.[0].visibility, "public");
  assert.equal(payload.events?.[0].provenance, "imported");
});

test("agents observe transform redacts raw values and classifies sensitive fields", () => {
  const payload = transformAgentsObserveHookEvent(agentsObserveHookEventFixture);
  const serialized = JSON.stringify(payload);

  for (const rawValue of [
    agentsObserveHookEventFixture.raw.prompt,
    agentsObserveHookEventFixture.raw.commandBody,
    agentsObserveHookEventFixture.raw.terminalOutput,
    agentsObserveHookEventFixture.raw.tokenValue,
    agentsObserveHookEventFixture.raw.toolPayload?.token,
    agentsObserveHookEventFixture.raw.toolPayload?.path,
    agentsObserveHookEventFixture.sessionId,
    agentsObserveHookEventFixture.eventId,
    agentsObserveHookEventFixture.agent.id,
    ...(agentsObserveHookEventFixture.filesTouched ?? []),
  ]) {
    assert.equal(serialized.includes(String(rawValue)), false, `raw value leaked: ${rawValue}`);
  }

  const publicEventKeys = Object.keys(payload.events?.[0].eventData ?? {});
  assert.equal(publicEventKeys.includes("rawPrompt"), false);
  assert.equal(publicEventKeys.includes("commandBody"), false);
  assert.equal(publicEventKeys.includes("tokenValue"), false);
  assert.equal(publicEventKeys.includes("filePaths"), false);

  const context = payload.supportingContext?.[0];
  assert.equal(context?.fieldClassifications?.rawPrompt, "private");
  assert.equal(context?.fieldClassifications?.commandBody, "private");
  assert.equal(context?.fieldClassifications?.filePaths, "private");
  assert.equal(context?.fieldClassifications?.toolPayload, "private");
  assert.equal(context?.fieldClassifications?.terminalOutput, "private");
  assert.equal(context?.fieldClassifications?.tokenValue, "secret");
});

test("agents observe transform builds signed observed-runtime request without live send", async () => {
  const payload = transformAgentsObserveHookEvent(agentsObserveHookEventFixture);
  const request = await createObservedRuntimeWebhookRequest({
    deliveryId: "agents-observe-fixture-001",
    signingSecret: "station_whsec_agents_observe_fixture",
    timestamp: 1_771_452_800,
    observedAt: agentsObserveHookEventFixture.observedAt,
    source: {
      id: "agents-observe-local-fixture",
    },
    payload,
  });

  const expectedSignature = createHmac("sha256", "station_whsec_agents_observe_fixture")
    .update("1771452800.")
    .update(Buffer.from(request.body, "utf8"))
    .digest("hex");
  const body = JSON.parse(request.body);

  assert.equal(request.headers["X-Station-Webhook-Id"], "agents-observe-fixture-001");
  assert.equal(request.headers["X-Station-Signature"], `t=1771452800,v1=${expectedSignature}`);
  assert.equal(body.schema, "station.observed_runtime.webhook.v1");
  assert.equal(body.source.runtimeHostedBy, "external");
  assert.equal(body.source.stationRole, "observer");
  assert.equal(body.payload.events[0].eventType, "agents_observe.tool_call");
  assert.equal(request.body.includes("station_whsec_agents_observe_fixture"), false);
  assert.equal(request.body.includes("FIXTURE_RAW_PROMPT_SHOULD_NOT_APPEAR"), false);
  assert.equal(request.body.includes("FIXTURE_TOKEN_VALUE_SHOULD_NOT_APPEAR"), false);
});

test("agents observe offline dry run returns safe not-sent summary with no live config", async () => {
  const previousFetch = globalThis.fetch;
  let fetchCalled = false;
  globalThis.fetch = (async () => {
    fetchCalled = true;
    throw new Error("network should not be used");
  }) as typeof fetch;
  const previousEnv = {
    STATION_DEVELOPER_KEY: process.env.STATION_DEVELOPER_KEY,
    STATION_API_URL: process.env.STATION_API_URL,
    STATION_OBSERVED_RUNTIME_WEBHOOK_ID: process.env.STATION_OBSERVED_RUNTIME_WEBHOOK_ID,
  };
  delete process.env.STATION_DEVELOPER_KEY;
  delete process.env.STATION_API_URL;
  delete process.env.STATION_OBSERVED_RUNTIME_WEBHOOK_ID;

  try {
    const summary = await createAgentsObserveOfflineDryRunSummary({
      includeSignedRequest: true,
      timestamp: 1_771_452_800,
    });
    const serialized = JSON.stringify(summary);

    assert.equal(summary.status, "not_sent");
    assert.equal(summary.liveConfigRequired, false);
    assert.equal(summary.networkAccessRequired, false);
    assert.equal(fetchCalled, false);
    assert.deepEqual(summary.payloadSummary, {
      nodes: 2,
      events: 1,
      snapshots: 1,
      supportingContext: 1,
      eventTypes: ["agents_observe.tool_call"],
      publicEventDataKeys: [
        "source",
        "hookName",
        "toolName",
        "status",
        "agentRole",
        "fileTouchCount",
        "inputTokenCount",
        "outputTokenCount",
        "redactedSensitiveFieldCount",
      ],
      provenanceRefs: ["simple10/agents-observe public docs"],
    });
    assert.equal(summary.classificationCounts.private, 5);
    assert.equal(summary.classificationCounts.secret, 1);
    assert.equal(summary.signedRequest?.status, "not_sent");
    assert.equal(summary.signedRequest?.demoWebhookId, "demo-agents-observe-dry-run");
    assert.equal(summary.signedRequest?.signatureHeader, "t=1771452800,v1=<redacted>");

    for (const forbidden of [
      agentsObserveHookEventFixture.sessionId,
      agentsObserveHookEventFixture.eventId,
      agentsObserveHookEventFixture.agent.id,
      agentsObserveHookEventFixture.raw.prompt,
      agentsObserveHookEventFixture.raw.commandBody,
      agentsObserveHookEventFixture.raw.terminalOutput,
      agentsObserveHookEventFixture.raw.tokenValue,
      "demo-agents-observe-dry-run-signing-material",
      ...(agentsObserveHookEventFixture.filesTouched ?? []),
    ]) {
      assert.equal(serialized.includes(forbidden), false, `dry-run output leaked: ${forbidden}`);
    }
  } finally {
    globalThis.fetch = previousFetch;
    restoreEnv("STATION_DEVELOPER_KEY", previousEnv.STATION_DEVELOPER_KEY);
    restoreEnv("STATION_API_URL", previousEnv.STATION_API_URL);
    restoreEnv("STATION_OBSERVED_RUNTIME_WEBHOOK_ID", previousEnv.STATION_OBSERVED_RUNTIME_WEBHOOK_ID);
  }
});

test("agents observe offline dry run privacy errors do not echo raw values", async () => {
  const rawPrompt = "agents-observe";
  await assert.rejects(
    () => createAgentsObserveOfflineDryRunSummary({
      fixture: {
        ...agentsObserveHookEventFixture,
        raw: {
          ...agentsObserveHookEventFixture.raw,
          prompt: rawPrompt,
        },
      },
    }),
    (error) => {
      const message = error instanceof Error ? error.message : String(error);
      assert.match(message, /rawPrompt/);
      assert.equal(message.includes(rawPrompt), false);
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

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}
