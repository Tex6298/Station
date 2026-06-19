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
