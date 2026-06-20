# Observed Runtime Fixture Preflight

PR120 defines a file/sample-first contract for observing an external runtime.
It does not make Station host, execute, control, schedule, or deploy that
runtime.

## Fixture Contract

Canonical fixture:

- `apps/web/lib/__fixtures__/observed-runtime-canonical.json`

Shadow stress fixtures:

- `apps/web/lib/__fixtures__/observed-runtime-identity-shadow.json`
- `apps/web/lib/__fixtures__/observed-runtime-world-shadow.json`

All fixtures use:

```json
{
  "schema": "station.observed_runtime.fixture.v1",
  "source": {},
  "nodes": [],
  "events": [],
  "snapshots": [],
  "zones": [],
  "resources": [],
  "edges": [],
  "provenance": {}
}
```

`source.runtimeHostedBy` must be `external`, and `source.stationRole` must be
`observer`. This is the central boundary: Station reads observed state; it does
not claim runtime ownership.

Every object carries a `fieldClassifications` map. Supported classifications
are:

- `public`
- `member`
- `owner`
- `private`
- `secret`

Public readback includes only `public` fields. Member readback includes
`public` and `member` fields. Owner readback includes `public`, `member`,
`owner`, and `private` fields. `secret` fields are never serialized by the
normalizer.

Fields whose path looks like a credential, token, API key, cookie, prompt, raw
payload, password, or secret must be classified as `secret`; otherwise the
parser rejects the fixture as overexposed.

## Normalization

The parser and normalizer live in:

- `apps/web/lib/observed-runtime-fixture.ts`

The normalizer maps fixture nodes, events, and snapshots into the existing
Developer Space observatory readback shape:

- nodes become `DeveloperSpaceNode` records with filtered `metrics`;
- events become `DeveloperSpaceEvent` records with filtered `eventData`;
- snapshots become `DeveloperSpaceSnapshot` records with filtered
  `snapshotData`;
- zones, resources, edges, source, and provenance are returned as filtered
  supporting readback records.

Focused tests in `apps/web/lib/developer-space-observatory.test.ts` prove:

- canonical and shadow fixtures parse;
- malformed hosted-by-Station claims fail;
- missing field classifications fail;
- overexposed secret-shaped fields fail;
- public/member/owner/private/secret filtering behaves as intended;
- Developer Space observatory summary helpers can read normalized public-safe
  fixture data.

## Dry-Run Developer Space Ingest Bridge

PR121 adds a helper-only dry-run bridge in:

- `apps/web/lib/observed-runtime-fixture.ts`

`bridgeObservedRuntimeFixtureToDeveloperSpaceImport` converts the accepted
fixture into the existing Developer Space batch import payload shape:

- fixture nodes become `nodes[]` entries with `nodeId`, node display fields,
  classified `metrics`, source refs, and `provenance: "imported"`;
- fixture events become `events[]` entries with event type, label, node id,
  classified `eventData`, public visibility, source refs, and occurrence time;
- fixture snapshots become `snapshots[]` entries with classified
  `snapshotData`, source refs, public visibility, and occurrence times.

The bridge keeps the existing auth boundary intact: the dry-run payload targets
`/developer-spaces/ingest/import` and still requires
`X-Station-Developer-Key`. No new route, webhook, auth bypass, or key shape was
added.

PR121 originally kept the route payload public-safe because classification
storage did not exist yet. PR122 adds durable classification metadata for the
node/event/snapshot fields below.

## Classification Persistence

PR122 adds nullable JSONB metadata columns:

- `developer_space_nodes.observed_runtime_classifications`
- `developer_space_events.observed_runtime_classifications`
- `developer_space_snapshots.observed_runtime_classifications`

The metadata shape is:

```json
{
  "schema": "station.observed_runtime.classifications.v1",
  "fields": {
    "field.path": "public"
  }
}
```

`fields` may use `public`, `member`, `owner`, `private`, and `secret` during
ingestion validation. Secret-class values are stripped before persistence, and
secret-class field names are not kept in the persisted metadata. Secret-shaped
paths such as token, key, cookie, prompt, raw, password, credential, or secret
must be classified as `secret`; otherwise ingestion fails with a validation
error.

Legacy rows and current imports without classification metadata keep the
existing behavior: owner reads can see raw stored data, while public/member
reads use the existing public-safe scrubber and field allowlists.

Rows with classification metadata are filtered by access on detail and SSE
readback:

- public reads include only `public` fields;
- member reads include `public` and `member` fields;
- owner reads include `public`, `member`, `owner`, and `private` fields;
- `secret` fields are never serialized.

Zones, resources/economy, edges, and provenance remain supporting dry-run
readback. They are not silently treated as complete persistence mappings; a
future schema lane needs explicit homes for them before a live webhook can
claim full observed-runtime ingestion.

## Future Webhook Shape

A later lane can turn this fixture contract into an ingress envelope without
changing the visibility model:

```json
{
  "schema": "station.observed_runtime.webhook.v1",
  "source": {
    "id": "external-runtime-id",
    "runtimeHostedBy": "external",
    "stationRole": "observer"
  },
  "observedAt": "2026-06-20T10:15:00.000Z",
  "payload": {
    "nodes": [],
    "events": [],
    "snapshots": [],
    "zones": [],
    "resources": [],
    "edges": [],
    "provenance": {}
  }
}
```

That later step still needs authentication, replay protection, rate limits,
storage policy, and hosted-environment evidence before it can be called a live
ingestion path.

## Non-Claims

PR120-PR122 add no hosted runtime, Cloudflare Worker, Vectorize index, D1
binding, queue, background job, partner adapter, user-pasted secret flow,
billing, Stripe behavior, Redis memory truth, provider routing, or visible
Developer Space redesign.
