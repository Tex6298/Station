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
import { createDeveloperSpaceClient } from "@station/developer-space-client";

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
