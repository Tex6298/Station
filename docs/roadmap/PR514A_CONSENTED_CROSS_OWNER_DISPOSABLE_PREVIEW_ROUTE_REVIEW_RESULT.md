# PR514A - Consented Cross-Owner Disposable Preview Route ARGUS Review Result

Owner: ARGUS / A3

Date: 2026-07-11

Reviewed implementation:

- `docs/roadmap/PR514A_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_ROUTE_DAEDALUS.md`
- `docs/roadmap/PR514A_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_ROUTE_RESULT.md`
- `docs/roadmap/PR513D_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_HOSTED_RERUN_RESULT.md`
- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`

Result:

```text
ACCEPT_PR514A_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_ROUTE
```

## Verdict

ARGUS accepts PR514A without a review patch.

DAEDALUS implemented the accepted narrow route as a separate authenticated API
surface:

```text
POST /persona-encounters/cross-owner-consents/:consentId/disposable-preview
```

The same-owner `POST /persona-encounters/preview` route was not widened.

## Boundary Findings

Accepted:

- the route requires auth and participant-scoped consent loading;
- nonparticipants receive `404` without row inference;
- the PR512 runtime context contract must be eligible before provider
  execution;
- approved consent, scope version `1`, and `run_cross_owner_encounter` are
  required;
- actor-owned initiator and other-participant responder checks are enforced;
- runtime attempt audit insertion is required before provider execution;
- provider unavailable, quota exceeded, rate limited, provider failed, provider
  empty, and provider succeeded outcomes record bounded runtime attempt rows;
- audit insertion failure fails closed before provider call or token write;
- provider routing is platform-only for this lane, selected from the initiating
  actor's tier, and does not load counterparty BYOK keys, counterparty provider
  config, responder provider preference, or responder persona provider routing;
- the provider prompt uses consent display names and actor-authored setup only;
- provider prompt tests exclude raw owner ids, raw persona ids, private persona
  profile fields, awakening prompts, style notes, provider payload markers,
  bearer material, and provider keys;
- successful replies record actor-only token usage with `chatId: null`;
- no counterparty token usage is recorded;
- the route returns exactly one generated responder reply to the initiating
  actor;
- response/provenance labels remain private, disposable, non-canonical,
  non-public, not saved, not transcript/summary/excerpt/shareable, and not
  sourced from private retrieval;
- generic consent readback remains `executable: false`.

Still blocked:

- saved cross-owner private sessions;
- public cross-owner exhibits;
- generated-word excerpts, transcripts, summaries, publication, and report
  creation;
- counterparty generated-word readback;
- public search/feed/Discover/Space/persona/forum/document surfacing;
- memory/canon/archive/continuity/retrieval/embeddings writes or prompt
  context;
- Redis, Cloudflare, workers, queues, storage, Stripe/billing, migrations,
  package/lockfile, deployment, broad UI, browser proof, partner adapters, and
  webhook scope.

## Next Routing

ARGUS recommends MIMIR close PR514A locally and route:

```text
PR514B - Consented Cross-Owner Disposable Preview Hosted Proof
Owner: ARIADNE / A4
```

Hosted proof scope:

- hosted web/API freshness includes the PR514A review floor;
- route is authenticated and separate from same-owner preview;
- signed-out request returns `401`;
- nonparticipant request returns `404`;
- wrong role/pair, inactive consent, wrong scope, and wrong scope version fail
  before provider call and token write;
- approved eligible consent either returns one private disposable generated
  responder reply through the hosted platform provider route, or if hosted
  platform provider config is unavailable, fails closed with the existing
  provider-unavailable envelope and no token write;
- successful hosted preview records exactly actor-owned token usage with
  `chatId: null` and no counterparty token rows;
- successful hosted preview records bounded blocked-before-provider and
  provider-succeeded runtime attempt rows;
- provider unavailable, quota/rate/provider failure, and empty-provider paths
  record bounded outcomes without token writes;
- generic consent readback remains `executable: false`;
- response/provenance and sampled public surfaces expose no raw owner ids, raw
  persona ids, private prompts, private profile values, provider payloads,
  bearer values, token values, generated text outside the actor response, SQL
  details, env values, cookies, or secret-shaped strings;
- no private session, public exhibit, report, memory/canon/archive/continuity/
  export/job/storage/public row, UI, package, billing, Redis, Cloudflare,
  workers, queues, deployment, webhook, partner adapter, or public-surfacing
  drift appears.

Browser proof is not required because PR514A changes no visible UI.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Implementation review | Pass | Reviewed PR514A handoff/result, PR513D hosted audit floor, route/provider/audit/token code, focused tests, and no-drift docs. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 53 tests passed, including PR514A success, auth/participant failures, wrong role/pair, inactive/wrong-scope/wrong-version consent, audit fail-closed, provider unavailable/quota/rate/failure/empty outcomes, prompt privacy, actor-only token accounting, and no-drift coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed; public exhibit report/takedown behavior remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 201 tests passed; PR514A adds no visible UI. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| Staged path scan | Pass | Staged changes are limited to PR514A review/status/testing docs. |
| Forbidden-path scan | Pass | No web UI, package/lockfile, provider service, token service, operational cache, `packages/ai`, `packages/auth`, Supabase migration, Railway, Cloudflare, worker, queue, billing, Stripe, or deploy-script paths changed. |
| Secret-shaped diff scan | Pass | No API-key, private-key, GitHub token, bearer-token-shaped, provider-key env, Railway token, or private-key block values found in the staged diff. |
| `git diff --check` | Pass | No unstaged whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
```
