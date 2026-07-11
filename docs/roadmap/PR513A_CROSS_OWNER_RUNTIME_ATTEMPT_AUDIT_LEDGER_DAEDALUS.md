# PR513A - Cross-Owner Runtime Attempt Audit Ledger

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Status: Open

## Purpose

Implement the smallest accepted unblock lane from ARGUS:

`docs/roadmap/PR513_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_PREFLIGHT_RESULT.md`

PR513A adds durable, bounded, participant-visible runtime attempt audit metadata
for future cross-owner provider execution. It does not add provider-backed
preview.

## Required Shape

Add a dedicated cross-owner runtime attempt audit table, or attempt/event table
pair, for future provider execution attempts tied to a cross-owner consent.

Store only bounded provenance metadata:

- consent id;
- actor role;
- initiator role;
- responder role;
- consent status;
- requested scope version;
- requested scope;
- readiness code;
- attempt lifecycle status;
- created/completed timestamps.

Accepted outcome/lifecycle codes may include:

- `blocked_before_provider`;
- `provider_succeeded`;
- `provider_failed`;
- `provider_empty`;
- `quota_exceeded`;
- `rate_limited`;
- `provider_unavailable`.

Do not store prompts, generated output, provider payloads, provider keys, route
labels, model config, token values, private context, raw owner ids, raw persona
ids, traces, SQL details, env values, cookies, bearer values, source bodies, or
secret-shaped strings.

## Access And Helpers

Required:

- RLS so only participant owners can read bounded attempt metadata for consent
  rows they participate in;
- no public or nonparticipant read access;
- no direct participant update/delete of attempt audit rows;
- server-side helper or RPC shape that a later preview route can use to record
  before-provider and after-provider attempt events without best-effort audit
  drift;
- participant readback serialization that exposes safe metadata only.

Recommended readback route, if useful:

```text
GET /persona-encounters/cross-owner-consents/:consentId/runtime-attempts
```

If adding the route, it must be authenticated, participant-only, and return
`401` signed out and `404` or empty readback for nonparticipants without row
inference.

## Non-Scope

Do not add:

- provider-backed preview route;
- provider calls;
- provider prompt assembly;
- generated words;
- token usage or token transactions;
- private sessions;
- public exhibits;
- reports;
- memory, canon, archive, continuity, export packages, jobs, queues, storage
  objects, public rows, or public surfacing;
- save, transcript, summary, excerpt, publication, metadata sharing, Salon,
  community, Discover/search/feed, Station Press, public persona, public Space,
  forum, or document surfacing;
- model/provider selection, embeddings, retrieval, Redis, Cloudflare, workers,
  Stripe, billing, entitlement, package, lockfile, deployment, webhook, broad UI,
  or browser proof.

No web UI is accepted for PR513A.

## Allowed Files

Keep implementation inside:

- one Supabase migration for the runtime attempt audit ledger;
- `packages/db/src/types.ts`;
- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- roadmap/status/testing docs.

## Required Tests

Cover:

- migration/RLS shape creates participant-readable, nonpublic, append-only
  runtime attempt audit metadata;
- helper/RPC can record bounded before-provider and after-provider attempt
  metadata without storing prompt/output/provider payloads;
- audit insertion failure fails closed for any future state mutation helper;
- participant readback returns safe attempt metadata only;
- nonparticipants get `404` or empty readback without row inference;
- signed-out access returns `401`;
- generic consent readback remains `executable: false`;
- no provider call, generated word, token row, private session, public exhibit,
  report, memory/canon/archive/continuity/export/job/storage/public row, or
  public surfacing appears;
- staged path, forbidden-path, and secret-shaped diff scans pass.

## Required Validation

Run:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run changed-path, forbidden-path, forbidden side-effect, and secret-shaped
diff scans before waking ARGUS.

## Review Path

Wake ARGUS after implementation.

If ARGUS accepts PR513A, MIMIR should route ARIADNE for hosted migration/API
proof because PR513A adds schema and participant-visible audit behavior.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR513A as Cross-Owner Runtime Attempt Audit Ledger only.
- Provider-backed cross-owner disposable preview remains blocked on CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_MISSING.
- PR513A is the bounded participant-visible consent-consumption audit layer required before any cross-owner provider execution.
Task:
- Implement PR513A in the accepted file scope.
- Add a dedicated runtime attempt audit ledger/table or attempt/event pair with participant RLS, append-only behavior, safe readback, and helper/RPC shape for future before-provider and after-provider attempt records.
- Store only bounded metadata: consent id, participant roles, consent status, requested scope/version, readiness code, attempt lifecycle status, and timestamps.
- Do not call providers, assemble prompts, return generated words, record token rows, create private sessions/public exhibits/reports/memory/canon/archive/continuity/export/jobs/storage/public rows, or touch provider/retrieval/Redis/Cloudflare/Stripe/package/deploy/UI scope.
- Run required validation and wake ARGUS with implementation result.
```
