# Developer Space Tier 1 partner onboarding

Date: 2026-06-24

Status: protected-alpha integration guide.

## Tier 1 scope

Tier 1 is a Station-hosted public Developer Space showcase and readback for a
developer whose app or runtime stays self-hosted.

In Tier 1:

- Station hosts the public Developer Space page and owner readback surfaces.
- Your app/runtime sends public-safe observatory state into Station through the
  Developer Space ingestion API.
- You decide which events, snapshots, fields, and linked documents are public.
- Station can show evidence, methodology, field logs, observatory state,
  selected status notes, usage/quota readback, and owner-only exports.

Tier 1 does not mean Station hosts your app, runtime, database, deployment
pipeline, background jobs, repository, queue, or infrastructure operations.

Use placeholders in every local script or partner handoff until you are in the
private owner console and ready to copy the real values:

- `<STATION_API_BASE_URL>` - the Station API base URL, without a trailing slash.
- `<DEVELOPER_SPACE_API_KEY>` - the Developer Space ingestion key.
- `<WEBHOOK_SIGNING_SECRET>` - the observed-runtime webhook signing secret.
- `<WEBHOOK_DELIVERY_ID>` - an idempotency key for one webhook delivery.
- `<NODE_ID>` - your stable external node id.

## Ingestion with curl

Every ingestion request uses `X-Station-Developer-Key`. Keep that key private.
The examples below are placeholders only.

### Node state

```bash
curl -X POST "<STATION_API_BASE_URL>/developer-spaces/ingest/nodes/<NODE_ID>/state" \
  -H "Content-Type: application/json" \
  -H "X-Station-Developer-Key: <DEVELOPER_SPACE_API_KEY>" \
  -d '{
    "nodeName": "Runtime coordinator",
    "topologyType": "lattice",
    "fragmentCount": 42,
    "selfSimilarityScore": 0.73,
    "dimensionality": 1536,
    "metrics": {
      "publicState": "stable",
      "queueDepth": 2,
      "privateOperatorNote": "redacted-before-public-use"
    },
    "fieldClassifications": {
      "metrics.publicState": "public",
      "metrics.queueDepth": "owner",
      "metrics.privateOperatorNote": "private"
    },
    "sourceRefs": ["methodology:<PUBLIC_DOCUMENT_SLUG>"],
    "provenance": "api"
  }'
```

### Event

```bash
curl -X POST "<STATION_API_BASE_URL>/developer-spaces/ingest/events" \
  -H "Content-Type: application/json" \
  -H "X-Station-Developer-Key: <DEVELOPER_SPACE_API_KEY>" \
  -d '{
    "eventType": "runtime.checkpoint",
    "eventLabel": "Checkpoint completed",
    "nodeId": "<NODE_ID>",
    "eventData": {
      "publicSummary": "Checkpoint completed with stable public state.",
      "operatorTrace": "redacted-before-public-use"
    },
    "fieldClassifications": {
      "eventData.publicSummary": "public",
      "eventData.operatorTrace": "owner"
    },
    "visibility": "public",
    "sourceRefs": ["field-log:<PUBLIC_DOCUMENT_SLUG>"],
    "provenance": "api",
    "occurredAt": "2026-06-24T12:00:00.000Z"
  }'
```

Use `visibility: "public"` only for public-safe events. Use `"community"` or
`"private"` when an event should not be fully public.

### Snapshot

```bash
curl -X POST "<STATION_API_BASE_URL>/developer-spaces/ingest/snapshots" \
  -H "Content-Type: application/json" \
  -H "X-Station-Developer-Key: <DEVELOPER_SPACE_API_KEY>" \
  -d '{
    "snapshotData": {
      "publicStatus": "nominal",
      "activeNodes": 4,
      "operatorOnlyDiagnostic": "redacted-before-public-use"
    },
    "fieldClassifications": {
      "snapshotData.publicStatus": "public",
      "snapshotData.activeNodes": "public",
      "snapshotData.operatorOnlyDiagnostic": "owner"
    },
    "visibility": "public",
    "sourceRefs": ["finding:<PUBLIC_DOCUMENT_SLUG>"],
    "provenance": "api",
    "occurredAt": "2026-06-24T12:05:00.000Z"
  }'
```

### Batch import

```bash
curl -X POST "<STATION_API_BASE_URL>/developer-spaces/ingest/import" \
  -H "Content-Type: application/json" \
  -H "X-Station-Developer-Key: <DEVELOPER_SPACE_API_KEY>" \
  -d '{
    "nodes": [
      {
        "nodeId": "<NODE_ID>",
        "nodeName": "Runtime coordinator",
        "fragmentCount": 42,
        "metrics": { "publicState": "stable" },
        "fieldClassifications": {
          "metrics.publicState": "public"
        }
      }
    ],
    "events": [
      {
        "eventType": "runtime.checkpoint",
        "eventLabel": "Checkpoint completed",
        "nodeId": "<NODE_ID>",
        "eventData": { "publicSummary": "Checkpoint completed." },
        "visibility": "public"
      }
    ],
    "snapshots": [
      {
        "snapshotData": { "publicStatus": "nominal" },
        "visibility": "public"
      }
    ],
    "supportingContext": [
      {
        "contextType": "provenance",
        "sourceRef": "methodology:<PUBLIC_DOCUMENT_SLUG>",
        "payload": { "publicMethod": "Synthetic replay fixture." },
        "fieldClassifications": {
          "payload.publicMethod": "public"
        }
      }
    ]
  }'
```

### Observed-runtime webhook

Observed-runtime webhooks use the same developer key plus a signed raw body.
Prefer the TypeScript helper in the next section to create the exact body and
signature header.

```bash
curl -X POST "<STATION_API_BASE_URL>/developer-spaces/ingest/observed-runtime" \
  -H "Content-Type: application/json" \
  -H "X-Station-Developer-Key: <DEVELOPER_SPACE_API_KEY>" \
  -H "X-Station-Webhook-Id: <WEBHOOK_DELIVERY_ID>" \
  -H "X-Station-Signature: t=<UNIX_SECONDS>,v1=<HEX_HMAC_SIGNATURE>" \
  -d '{
    "schema": "station.observed_runtime.webhook.v1",
    "deliveryId": "<WEBHOOK_DELIVERY_ID>",
    "source": {
      "runtimeHostedBy": "external",
      "stationRole": "observer",
      "id": "<EXTERNAL_RUNTIME_ID>"
    },
    "observedAt": "2026-06-24T12:10:00.000Z",
    "payload": {
      "nodes": [
        {
          "nodeId": "<NODE_ID>",
          "nodeName": "Runtime coordinator",
          "fragmentCount": 42,
          "metrics": { "publicState": "stable" },
          "fieldClassifications": {
            "metrics.publicState": "public"
          }
        }
      ],
      "events": [],
      "snapshots": [],
      "supportingContext": []
    }
  }'
```

## Ingestion with TypeScript

Install and import the Station client package from the Station workspace or
from the package distribution you are using for the protected-alpha partner
build.

```ts
import { createDeveloperSpaceClient } from "@station/developer-space-client";

const client = createDeveloperSpaceClient({
  baseUrl: "<STATION_API_BASE_URL>",
  apiKey: "<DEVELOPER_SPACE_API_KEY>",
});

await client.upsertNodeState("<NODE_ID>", {
  nodeName: "Runtime coordinator",
  topologyType: "lattice",
  fragmentCount: 42,
  selfSimilarityScore: 0.73,
  dimensionality: 1536,
  metrics: {
    publicState: "stable",
    queueDepth: 2,
    privateOperatorNote: "redacted-before-public-use",
  },
  fieldClassifications: {
    "metrics.publicState": "public",
    "metrics.queueDepth": "owner",
    "metrics.privateOperatorNote": "private",
  },
  sourceRefs: ["methodology:<PUBLIC_DOCUMENT_SLUG>"],
  provenance: "api",
});

await client.recordEvent({
  eventType: "runtime.checkpoint",
  eventLabel: "Checkpoint completed",
  nodeId: "<NODE_ID>",
  eventData: {
    publicSummary: "Checkpoint completed with stable public state.",
    operatorTrace: "redacted-before-public-use",
  },
  fieldClassifications: {
    "eventData.publicSummary": "public",
    "eventData.operatorTrace": "owner",
  },
  visibility: "public",
  sourceRefs: ["field-log:<PUBLIC_DOCUMENT_SLUG>"],
  provenance: "api",
  occurredAt: "2026-06-24T12:00:00.000Z",
});

await client.recordSnapshot({
  snapshotData: {
    publicStatus: "nominal",
    activeNodes: 4,
    operatorOnlyDiagnostic: "redacted-before-public-use",
  },
  fieldClassifications: {
    "snapshotData.publicStatus": "public",
    "snapshotData.activeNodes": "public",
    "snapshotData.operatorOnlyDiagnostic": "owner",
  },
  visibility: "public",
  sourceRefs: ["finding:<PUBLIC_DOCUMENT_SLUG>"],
  provenance: "api",
  occurredAt: "2026-06-24T12:05:00.000Z",
});

await client.importBatch({
  nodes: [
    {
      nodeId: "<NODE_ID>",
      nodeName: "Runtime coordinator",
      fragmentCount: 42,
      metrics: { publicState: "stable" },
      fieldClassifications: {
        "metrics.publicState": "public",
      },
    },
  ],
  events: [
    {
      eventType: "runtime.checkpoint",
      eventLabel: "Checkpoint completed",
      nodeId: "<NODE_ID>",
      eventData: { publicSummary: "Checkpoint completed." },
      visibility: "public",
    },
  ],
  snapshots: [
    {
      snapshotData: { publicStatus: "nominal" },
      visibility: "public",
    },
  ],
  supportingContext: [
    {
      contextType: "provenance",
      sourceRef: "methodology:<PUBLIC_DOCUMENT_SLUG>",
      payload: { publicMethod: "Synthetic replay fixture." },
      fieldClassifications: {
        "payload.publicMethod": "public",
      },
    },
  ],
});

await client.sendObservedRuntimeWebhook({
  webhookId: "<WEBHOOK_DELIVERY_ID>",
  deliveryId: "<WEBHOOK_DELIVERY_ID>",
  signingSecret: "<WEBHOOK_SIGNING_SECRET>",
  source: {
    id: "<EXTERNAL_RUNTIME_ID>",
  },
  observedAt: "2026-06-24T12:10:00.000Z",
  payload: {
    nodes: [
      {
        nodeId: "<NODE_ID>",
        nodeName: "Runtime coordinator",
        fragmentCount: 42,
        metrics: { publicState: "stable" },
        fieldClassifications: {
          "metrics.publicState": "public",
        },
      },
    ],
    events: [],
    snapshots: [],
    supportingContext: [],
  },
});
```

The client throws structured errors with `status`, `code`, `category`,
`resource`, and `retryAfter` when the API returns those fields.

## Visibility and privacy

Treat Developer Space ingestion as publication-adjacent. Sending data to
Station does not mean every field becomes public, but every payload should be
prepared as if an owner may later choose to expose selected summaries.

Use these controls deliberately:

- Developer Space visibility controls who can discover the space:
  `private`, `unlisted`, `community`, or `public`.
- Event and snapshot `visibility` controls the event/snapshot level:
  `private`, `community`, or `public`.
- Observed-runtime `fieldClassifications` classify nested fields as `public`,
  `member`, `owner`, `private`, or `secret`.
- Document links are `owner` or `public`. A public link should point only to a
  document that is already safe to show publicly.
- Public field controls and scrubbers decide which configured metric, event,
  snapshot, or observed-runtime fields can appear outside the owner context.

Never make these public:

- raw payloads;
- ingestion keys or signing secrets;
- auth tokens or hosted credentials;
- prompt content;
- provider request or response data;
- private document bodies;
- source ids or raw link ids;
- hosted logs;
- database, deploy, queue, or runtime internals.

Use public fields for summaries a visitor can understand. Use owner/private
fields for diagnostics. Use secret fields for material that should be stored
only as protected operational context, or omit it from the payload entirely.

## Owner-console readiness checklist

Before treating a Developer Space as partner-ready for Tier 1, the owner should
confirm these existing controls in the private manage route:

- Ingestion key: create or identify the key used by the self-hosted runtime.
  Store it outside source control.
- Observed-runtime signing secret: configure a dedicated signing secret when
  webhook signing should not fall back to the ingestion key.
- Usage and quota: check current node, event, snapshot, storage, public read,
  and export usage before traffic increases.
- Evidence templates: create methodology, finding, field-log, or note documents
  for the public evidence path.
- Linked documents: keep drafts owner-only until the document and link are both
  ready for public readback.
- Field visibility: review event visibility, document/link visibility, and
  observed-runtime field classifications before publishing.
- Exports/readback: use owner-only export packages for private archive and
  audit review. Do not publish raw bundles directly.
- Safe developer-agent readbacks: use readbacks, confirmations, receipts,
  selected public status notes, layout suggestions, and `run_job`
  dry-run/readiness readback only within their current boundaries.

## Sanitized troubleshooting

All examples below are sanitized shapes. Do not paste live keys, signatures,
request bodies, private ids, or hosted logs into public docs or tickets.

### Auth failure

Likely causes:

- missing `X-Station-Developer-Key`;
- revoked or mistyped Developer Space ingestion key;
- request sent to the wrong Station API base URL.

Sanitized response shape:

```json
{
  "error": "Invalid Developer Space API key.",
  "code": "developer_space_key_invalid",
  "category": "auth"
}
```

### Visibility mistake

Likely causes:

- an event or snapshot marked `public` contains owner-only fields;
- a public document link points to a draft/private document;
- field classifications are missing for nested operational values.

Correction:

- lower the event/snapshot visibility to `community` or `private`;
- keep the document link as `owner`;
- classify sensitive fields as `owner`, `private`, or `secret`;
- send a new corrected event/snapshot rather than trying to expose raw logs.

### Quota or rate-limit response

Likely causes:

- usage quota has been reached for nodes, events, snapshots, storage, public
  reads, or exports;
- ingestion request rate exceeded the configured limit.

Sanitized response shape:

```json
{
  "error": "Developer Space ingestion rate limit exceeded.",
  "code": "developer_space_rate_limited",
  "category": "rate_limit",
  "resource": "developer_space_ingest_requests",
  "limit": 120,
  "used": 121,
  "retryAfter": 60
}
```

Respect `retryAfter` when it is present. Repeated retries without delay can make
the integration look less healthy than it is.

### Webhook signature error

Likely causes:

- missing or malformed `X-Station-Signature`;
- signed body differs from the body sent to Station;
- signing timestamp is outside the accepted tolerance;
- wrong observed-runtime signing secret.

Sanitized response shape:

```json
{
  "error": "Observed runtime webhook signature is invalid.",
  "code": "developer_space_webhook_signature_invalid",
  "category": "auth"
}
```

Generate the signature over the exact raw JSON body that you send.

### Payload validation error

Likely causes:

- invalid `eventType`;
- payload too large or too deeply nested;
- invalid `visibility`;
- invalid observed-runtime field classification;
- missing `snapshotData`, `payload`, or `contextType` for the selected shape.

Sanitized response shape:

```json
{
  "error": "Developer Space ingestion payload failed validation.",
  "code": "developer_space_payload_invalid",
  "category": "validation",
  "details": "<VALIDATION_SUMMARY>"
}
```

Trim the payload to public-safe summaries first, then add owner/private
diagnostics only when they are genuinely useful in the owner console.

## Not in Tier 1

The following work remains deferred and should not be promised in Tier 1
partner onboarding:

- Station-hosted compute;
- per-project databases;
- Redis, queues, or background workers;
- deploy pipeline;
- repository push/deploy;
- real job execution;
- key rotation by developer agent;
- signing-secret creation by developer agent;
- direct layout mutation;
- Docker, Coolify, or container provisioning;
- public interaction simulator;
- project-specific community/forum;
- billing;
- tipping or donation flows;
- Tier 2 full hosted infrastructure;
- Tier 3 interconnected lab work.

If a partner needs any deferred item, open a separate roadmap lane before
promising or implementing it.
