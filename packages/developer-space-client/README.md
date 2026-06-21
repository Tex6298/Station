# @station/developer-space-client

Tiny TypeScript client for Station Developer Space ingestion.

Keep `STATION_DEVELOPER_KEY` server-side. Do not ship it to browser code.

## Install

This package is currently workspace-local:

```bash
pnpm --filter @station/developer-space-client build
```

## Node example

```ts
import {
  createDeveloperSpaceClient,
  DeveloperSpaceClientError,
} from "@station/developer-space-client";

const station = createDeveloperSpaceClient({
  baseUrl: process.env.STATION_API_URL ?? "http://localhost:4000",
  apiKey: process.env.STATION_DEVELOPER_KEY!,
});

await station.upsertNodeState("animus-alpha", {
  nodeName: "Animus Alpha",
  topologyType: "radial",
  fragmentCount: 128,
  selfSimilarityScore: 0.73,
  sourceRefs: ["run-2026-05-23"],
});

await station.recordEvent({
  eventType: "fragment_absorbed",
  eventLabel: "Alpha absorbed a grief-domain fragment",
  nodeId: "animus-alpha",
  eventData: { domain: "grief", fragmentId: "frag_0042" },
  visibility: "public",
});

await station.recordSnapshot({
  snapshotData: {
    summary: "Weekly manifold snapshot",
    nodes: 3,
  },
});
```

See `examples/node-ingest.ts` for a complete local example.

## Signed observed-runtime webhook

The observed-runtime webhook is for importing state from an external runtime
that Station observes. Station does not execute, host, schedule, or control
that runtime.

Use `sendObservedRuntimeWebhook` when you need the PR125/PR126 signature
contract:

```ts
await station.sendObservedRuntimeWebhook({
  deliveryId: "stable-delivery-id",
  signingSecret: process.env.STATION_OBSERVED_RUNTIME_SIGNING_SECRET,
  source: {
    id: "external-runtime-id",
  },
  payload: {
    nodes: [{ nodeId: "runtime:alpha", fragmentCount: 1 }],
    events: [],
    snapshots: [],
    supportingContext: [],
  },
});
```

The helper builds a `station.observed_runtime.webhook.v1` envelope, serializes it
to raw JSON, and signs those exact bytes with:

```text
X-Station-Signature: t=<unix-seconds>,v1=<hex-hmac>
```

The HMAC input is `<timestamp>.<raw-body-bytes>` using SHA-256. The request also
sends `X-Station-Developer-Key` and `X-Station-Webhook-Id`.

Run the local smoke example with env names only:

```bash
STATION_API_URL=http://localhost:4000 \
STATION_DEVELOPER_KEY=... \
STATION_OBSERVED_RUNTIME_WEBHOOK_ID=local-delivery-001 \
STATION_OBSERVED_RUNTIME_SIGNING_SECRET=... \
npx tsx packages/developer-space-client/examples/observed-runtime-webhook.ts
```

Required:

- `STATION_API_URL`
- `STATION_DEVELOPER_KEY`
- `STATION_OBSERVED_RUNTIME_WEBHOOK_ID`

Optional:

- `STATION_OBSERVED_RUNTIME_SIGNING_SECRET`: required when the Developer Space
  has an active dedicated observed-runtime signing secret. If no active
  dedicated secret exists, the client can use the Developer Space ingestion key
  as the PR125 fallback signing material.
- `STATION_OBSERVED_RUNTIME_SOURCE_ID`: source id written into the envelope.
- `STATION_OBSERVED_RUNTIME_PAYLOAD_PATH`: JSON file containing a
  `DeveloperSpaceBatchImportPayload`; otherwise the example sends a small
  public-safe sample payload.

Do not print or commit key or signing-secret values. The example prints only
structured success/error readback and never includes the secret in the body.

Expected readback categories:

| Case | Typical status | Client readback |
| --- | --- | --- |
| Accepted first delivery | `202` | `{ accepted:true, replayed:false, webhookId, imported }` |
| Same id and same payload after completion | `200` | `{ accepted:false, replayed:true, webhookId, imported }` |
| Same id and same payload while processing | `409` | `code:"developer_space_webhook_in_progress"`, `category:"validation"`, `details.retryable:true` |
| Same id and different payload | `409` | `code:"developer_space_webhook_replay_conflict"`, `category:"validation"` |
| Missing, invalid, stale, or wrong signing material | `401` or `403` | `category:"auth"` |

## Agents Observe transform spike

`transformAgentsObserveHookEvent` is a PR132 local proof helper, not a live
adapter. It maps a tiny Agents Observe-style hook/session fixture into
`DeveloperSpaceBatchImportPayload`, then the PR128 request helper can wrap that
payload into a signed observed-runtime webhook request without sending it.

The fixture shape follows public Agents Observe docs that describe hook stdin
JSON, a CLI posting events to a local API server, SQLite storage, and WebSocket
live updates. No external Agents Observe code is vendored.

Privacy defaults are intentionally conservative:

- raw prompts, command bodies, file paths, tool payloads, terminal/stdout-like
  material, and token values are not copied into public event data;
- fixture session, event, and agent source ids are not copied into structural
  `nodeId` or supporting-context `externalId` fields;
- retained redacted fields are classified `private` or `secret`;
- public output is limited to coarse labels, counts, status, role, and
  provenance.

This is adapter-shape evidence only. It does not install Agents Observe, send a
live webhook, request a Developer Space key, or make Station execute, host,
schedule, or control an external runtime.

### Offline dry run

Run the PR133 offline dry run with no Station URL, Developer Space key, live
webhook id, Railway, Supabase, Cloudflare, or network access:

```bash
npx tsx packages/developer-space-client/examples/agents-observe-offline-dry-run.ts --signed-demo
```

Optional local fixture path:

```bash
npx tsx packages/developer-space-client/examples/agents-observe-offline-dry-run.ts --fixture=./agents-observe-fixture.json --signed-demo
```

The output is safe to paste into a review handoff. It includes not-sent status,
payload counts, classification counts, coarse event labels, provenance names,
privacy assertion booleans, and a redacted demo signature header. It does not
print raw prompts, command bodies, file paths, token values, raw tool payloads,
terminal/stdout/stderr-like output, fixture session/event/agent ids, live API
keys, live signing secrets, or non-demo webhook ids. Privacy assertion errors
name the failed field only; they do not echo the raw fixture value.

### Guarded live-send bridge

The Agents Observe dry-run helper stays offline by default. Live send requires
the explicit `--live-send` command flag or `liveSend: { enabled: true, ... }`
in code; setting environment variables alone never sends.

Future PR130 staging smoke config names:

- `STATION_API_URL`
- `STATION_DEVELOPER_KEY`
- `STATION_OBSERVED_RUNTIME_WEBHOOK_ID`
- `STATION_OBSERVED_RUNTIME_SIGNING_SECRET`, optional unless the target
  Developer Space has an active dedicated observed-runtime signing secret.

After a staging smoke lane provides real values, run the explicit live-send
command:

```bash
npx tsx packages/developer-space-client/examples/agents-observe-offline-dry-run.ts --live-send
```

The example refuses missing config and obvious demo/fake/placeholder values
before network access. Live targets must use HTTPS; plain HTTP is accepted only
for `localhost` or loopback testing.

Tests use only a mocked transport. Do not run the live-send command with real
config until the staging smoke lane explicitly asks for it.

## Error handling

Failed ingestion calls throw `DeveloperSpaceClientError`. Branch on `category`
and `code` rather than parsing the human message:

```ts
try {
  await station.recordEvent({ eventType: "fragment_absorbed" });
} catch (error) {
  if (error instanceof DeveloperSpaceClientError) {
    if (error.category === "auth") {
      // Missing, invalid, or revoked Developer Space key.
    }
    if (error.category === "validation") {
      // Inspect error.body.details for field-level validation messages.
    }
    if (error.category === "quota") {
      // error.resource, error.retryAfter, and error.body limit/used are available when present.
    }
    if (error.category === "rate_limit") {
      // Wait error.retryAfter seconds before retrying the ingestion request.
    }
    if (error.category === "server") {
      // Unexpected Station API failure. Retry cautiously and keep raw payloads out of logs.
    }
  }
}
```

Current ingestion responses use these categories:

| Category | Typical status | Notes |
| --- | --- | --- |
| `auth` | `401` | Missing, invalid, or revoked ingestion key. |
| `validation` | `400` | Payload shape, JSON size, or JSON depth failed validation. |
| `quota` | `429` | Developer Space node/event/snapshot/storage quota was exceeded. |
| `rate_limit` | `429` | Short-window ingestion request limit was exceeded. |
| `server` | `500` | Unexpected API or database failure. |

Station uses two separate limit families:

- `quota` is durable usage accounting for nodes, events, snapshots, storage,
  public reads, and exports.
- `rate_limit` is a short request window for ingestion-key routes. By default
  it is `120` authenticated ingestion requests per `60` seconds when the
  operational cache provider is enabled. If the cache provider is disabled,
  Station does not pretend the request-window limiter is active.

## Curl equivalents

```bash
curl -X POST "$STATION_API_URL/developer-spaces/ingest/nodes/animus-alpha/state" \
  -H "X-Station-Developer-Key: $STATION_DEVELOPER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"nodeName":"Animus Alpha","topologyType":"radial","fragmentCount":128}'
```

```bash
curl -X POST "$STATION_API_URL/developer-spaces/ingest/events" \
  -H "X-Station-Developer-Key: $STATION_DEVELOPER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"eventType":"fragment_absorbed","nodeId":"animus-alpha","visibility":"public"}'
```

```bash
curl -X POST "$STATION_API_URL/developer-spaces/ingest/snapshots" \
  -H "X-Station-Developer-Key: $STATION_DEVELOPER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"snapshotData":{"summary":"Weekly manifold snapshot","nodes":3}}'
```

```bash
curl -X POST "$STATION_API_URL/developer-spaces/ingest/import" \
  -H "X-Station-Developer-Key: $STATION_DEVELOPER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"nodes":[{"nodeId":"animus-alpha","fragmentCount":128}],"events":[],"snapshots":[]}'
```
