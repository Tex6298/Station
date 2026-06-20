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

PR122 still left zones, resources/economy, edges, and provenance as explicit
supporting-context deltas. PR123 adds a durable table for those families.

## Supporting Context Persistence

PR123 adds:

- `developer_space_observed_runtime_context`

Each row belongs to one Developer Space and has:

- `context_type`: `zone`, `resource`, `edge`, or `provenance`;
- optional `external_id` and `source_ref`;
- classified `payload`;
- nullable `observed_runtime_classifications`;
- provenance and timestamps.

The existing `/developer-spaces/ingest/import` batch route accepts optional
`supportingContext[]` entries. The observed-runtime bridge maps canonical
fixture zones, resources/economy, graph edges, and provenance into those
entries instead of leaving them unmapped.

Supporting context uses the same PR122 validation and serialization rules:
secret-shaped paths must be classified `secret`, secret-class values are
stripped before persistence, secret-class field names are not stored, and
public/member/owner detail plus SSE readback filters payload fields by access.

No supporting context is exposed through a new route. It rides on the existing
Developer Space detail and SSE responses as `supportingContext`.

## Webhook Ingress Alpha

PR124 adds the first observed-runtime webhook ingress route:

- `POST /developer-spaces/ingest/observed-runtime`

The route uses the existing Developer Space ingestion-key boundary:

- `X-Station-Developer-Key` is still required;
- missing or invalid keys fail before import;
- no unauthenticated public webhook route was added.

Accepted envelope:

```json
{
  "schema": "station.observed_runtime.webhook.v1",
  "deliveryId": "stable-delivery-id",
  "source": {
    "runtimeHostedBy": "external",
    "stationRole": "observer"
  },
  "observedAt": "2026-06-20T10:15:00.000Z",
  "payload": {
    "nodes": [],
    "events": [],
    "snapshots": [],
    "supportingContext": []
  }
}
```

The route also accepts `X-Station-Webhook-Id` or `Idempotency-Key`; those
headers take precedence over `deliveryId`. A webhook id is required.

PR125 adds alpha HMAC hardening for the same route:

- `X-Station-Signature` is required after Developer Space key auth and before
  parsing, rate/quota checks, import, receipt creation, or SSE broadcast;
- header contract: `t=<unix-seconds>,v1=<hex-hmac>`;
- signed input: `<timestamp>.<raw-body-bytes>`;
- HMAC: SHA-256 using the existing Developer Space ingestion key as alpha
  signing material;
- default timestamp tolerance: 300 seconds, configurable with
  `DEVELOPER_SPACE_OBSERVED_RUNTIME_WEBHOOK_SIGNATURE_TOLERANCE_SECONDS`.

Missing, malformed, stale, or invalid signatures fail with non-secret
machine-readable errors. Signature verification proves the sender knows the
current ingestion key and that Station received the same raw JSON bytes that
were signed. It does not add separate signing-secret rotation, partner-specific
adapter semantics, concurrent delivery locking, or hosted runtime execution.

PR126 adds a dedicated observed-runtime webhook signing-secret lifecycle:

- table: `developer_space_webhook_signing_secrets`;
- owner endpoints:
  - `POST /developer-spaces/:id/observed-runtime-signing-secret` creates or
    rotates and returns the raw secret only once;
  - `POST /developer-spaces/:id/observed-runtime-signing-secret/revoke` revokes
    active dedicated signing secrets;
- stored data: encrypted signing material plus hash/fingerprint/last-four
  metadata, never plaintext;
- encryption: AES-256-GCM with key material derived from
  `DEVELOPER_SPACE_WEBHOOK_SIGNING_SECRET_ENCRYPTION_KEY`;
- missing encryption config blocks create/rotate with a bounded config error;
- webhook verification prefers the newest active dedicated signing secret when
  one exists and the encryption primitive is configured;
- PR125 ingestion-key HMAC fallback remains only when no active dedicated
  signing secret exists, or when the dedicated-secret primitive is not
  configured.

Active dedicated secrets verify signatures, old/revoked dedicated secrets do
not, and non-owners cannot create or revoke secret metadata. This is still an
API/docs/test foundation, not a partner onboarding adapter or visible
secret-management UI.

PR127 adds the bounded concurrent-delivery guard for the same webhook path:

- payload hashes use stable sorted JSON rather than insertion-order
  `JSON.stringify`;
- after auth, signature verification, JSON parse, envelope validation, webhook
  id extraction, and payload hashing, the route claims the existing unique
  `(developer_space_id, webhook_id)` receipt before import-side effects;
- the initial claim stores non-secret processing state in `response_body`;
- same-id/same-payload arrivals that see a processing receipt receive
  `developer_space_webhook_in_progress` with `retryable:true` and do not import;
- same-id/different-payload arrivals receive the existing bounded
  `developer_space_webhook_replay_conflict` and do not import;
- completed same-id/same-payload receipts keep returning the stored non-secret
  replay summary.

The guard is Supabase receipt-table based. It does not introduce workers,
queues, Redis locks, Cloudflare, or a separate runtime truth store.

PR124 adds durable idempotency receipts:

- `developer_space_observed_runtime_webhook_receipts`

Receipts store Developer Space id, webhook id, payload hash, non-secret response
summary, and timestamp. They do not store raw webhook bodies. Replaying the same
webhook id with the same payload returns the stored non-secret import summary
and does not import again. Reusing the id with a different payload returns a
machine-readable conflict.

The webhook route reuses the existing batch import persistence path, including
classification validation, secret stripping, supporting-context persistence,
usage/quota checks, rate limits, and detail/SSE readback.

Partner adapters, hosted secret-management UX, delivery retry policy, and any
future worker/queue delivery model remain future hardening work.

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

That later step still needs partner-specific semantics, delivery retry policy,
storage policy, and hosted-environment evidence before it can be called a
partner or production ingestion path.

## Non-Claims

PR120-PR127 add no hosted runtime, Cloudflare Worker, Vectorize index, D1
binding, queue, background job, partner adapter, user-pasted secret flow,
billing, Stripe behavior, Redis memory truth, provider routing, or visible
Developer Space redesign.
