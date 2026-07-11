# PR512A - Cross-Owner Runtime Context Contract

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Status: Open

## Purpose

Implement the readback-only contract that unblocks future consented
cross-owner runtime without calling a provider or returning generated words.

PR512A is not cross-owner runtime. It is the exact context boundary and
eligibility readback future runtime must pass before provider execution can be
considered.

## Accepted Scope

Use ARGUS's accepted scope:

`docs/roadmap/PR512_CONSENTED_CROSS_OWNER_ENCOUNTER_RUNTIME_PREFLIGHT_RESULT.md`

Implement a server-side contract helper and focused tests. You may add one
authenticated participant-only API readback route if that is the cleanest
implementation.

Recommended route shape:

```text
GET /persona-encounters/cross-owner-consents/:consentId/runtime-context-contract?initiatorPersonaId=...&responderPersonaId=...
```

Required request contract:

- authenticated owner only;
- explicit `consentId`;
- explicit `initiatorPersonaId`;
- explicit `responderPersonaId`;
- actor must be a participant in the consent row;
- actor must own the `initiatorPersonaId`;
- `responderPersonaId` must be the other participant persona;
- consent status must be `approved`;
- requested scopes must include `run_cross_owner_encounter`;
- scope version must match the accepted/current consent version;
- generic consent ledger readback must still serialize every scope and ledger
  flag as `executable: false`.

Required response contract:

- schema name:
  `station.persona_encounter.cross_owner_runtime_context_contract.v1`;
- no provider call permitted;
- no generated words permitted;
- no token accounting permitted;
- bounded participant role and safe display snapshots only;
- explicit ineligible states for pending, rejected, cancelled, revoked,
  wrong-scope, wrong-version, wrong-pair, wrong-role, and nonparticipant cases;
- denied context classes named explicitly:
  - `long_description`;
  - `awakening_prompt`;
  - `style_notes`;
  - private memory;
  - canon;
  - archive;
  - continuity;
  - transcripts;
  - source bodies;
  - provider payloads;
  - provider config;
  - raw owner ids;
  - raw persona ids;
  - traces;
  - storage paths;
  - generated words;
- future runtime attempt audit fields defined as bounded metadata only.

## Non-Scope

Do not add:

- provider calls;
- generated cross-owner words;
- prompt assembly for a provider;
- token usage or token transactions;
- private sessions;
- public exhibits;
- moderation reports;
- memory, canon, archive, continuity, export, jobs, queues, storage, or public
  rows;
- publication, save, excerpt, transcript, summary, metadata sharing, Salon,
  community, Discover/search/feed, Station Press, public persona, or public
  Space surfacing;
- model/provider selection;
- embeddings, retrieval, Redis, Cloudflare, workers, queues, Stripe, billing,
  entitlement, package, lockfile, deployment, webhook, migration, or broad UI
  changes.

No migration is accepted for PR512A unless MIMIR explicitly reopens scope.

## Allowed Files

Keep the implementation inside:

- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/web/lib/persona-encounter-runtime.ts` only if a route helper/path
  builder is necessary;
- `apps/web/lib/persona-encounter-runtime.test.ts` only if that helper changes;
- roadmap/status/testing docs.

## Required Tests

Cover:

- approved exact consent and `run_cross_owner_encounter` returns contract
  readback, not runtime execution;
- pending, rejected, cancelled, revoked, wrong-scope, wrong-version,
  wrong-pair, and wrong-role cases fail closed;
- nonparticipants get `404` or empty readback without row inference;
- actor must own the initiator persona;
- generic ledger readback remains `executable: false`;
- provider is never called;
- token transactions are never recorded;
- private sessions, public exhibits, reports, memory, canon, archive,
  continuity, export, jobs, storage, and public-surfacing tables are unchanged;
- response/readback excludes raw owner ids, raw persona ids, private prompts,
  private profile fields, provider payloads, generated words, traces, SQL
  detail, env values, cookies, bearer values, and secret-shaped strings.

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

Also run focused changed-path, forbidden side-effect, and secret-shaped diff
scans before waking ARGUS.

## Review Path

Wake ARGUS after implementation.

If PR512A includes an authenticated API readback route, ARGUS should decide
whether ARIADNE needs hosted API/data proof after review. Browser proof is only
needed if PR512A changes visible UI.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR512A as Cross-Owner Runtime Context Contract Only.
- Provider-backed disposable cross-owner preview remains blocked on CROSS_OWNER_RUNTIME_CONTEXT_BOUNDARY_MISSING.
- PR512A is readback-only: define the exact consent/status/scope/persona-pair/runtime-context contract before any cross-owner provider call can be considered.
Task:
- Implement PR512A in the accepted file scope.
- Add a server-side contract helper and, if cleanest, one authenticated participant-only readback route under /persona-encounters/cross-owner-consents/:consentId.
- Require explicit consentId, initiatorPersonaId, responderPersonaId, approved status, run_cross_owner_encounter scope, matching persona pair, participant actor, and actor-owned initiator persona.
- Preserve generic consent ledger executable:false readback.
- Return only bounded contract/readiness facts; no provider calls, generated words, token rows, private sessions, public exhibits, reports, memory/canon/archive/continuity/export/jobs/storage/public rows, infra, package, migration, billing, or UI drift.
- Run the required PR512A validation and wake ARGUS with implementation result.
```

