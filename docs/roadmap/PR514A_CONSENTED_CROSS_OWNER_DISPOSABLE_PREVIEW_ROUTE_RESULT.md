# PR514A - Consented Cross-Owner Disposable Preview Route Result

Owner: DAEDALUS / A2

Date: 2026-07-11

Status:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS implemented PR514A as the first narrow provider-backed cross-owner
disposable preview route:

```text
POST /persona-encounters/cross-owner-consents/:consentId/disposable-preview
```

The route is separate from same-owner `POST /persona-encounters/preview`.

It:

- requires auth and participant-scoped consent loading;
- requires PR512 runtime context contract eligibility;
- requires approved consent, scope version `1`, and
  `run_cross_owner_encounter`;
- requires the actor to own the initiator persona from the consent pair;
- uses only consent display snapshots and actor-authored setup in a new
  cross-owner prompt builder;
- resolves providers through actor-owned platform routing only;
- ignores counterparty BYOK keys, private provider setup, responder provider
  preference, and responder persona provider routing;
- records PR513A runtime attempt audit rows before provider execution and for
  provider/unavailable/quota/rate/failure/empty/success outcomes;
- fails closed before provider call or token write when required audit insertion
  fails;
- records actor-only token usage on successful provider response with
  `chatId: null`;
- returns exactly one private disposable generated responder reply to the
  initiating actor.

## Non-Scope Preserved

PR514A does not add saved cross-owner private sessions, public exhibits,
generated-word excerpts, transcripts, summaries, publication, reports,
counterparty generated-word readback, public search/feed/Discover/Space/persona/
forum/document surfacing, memory/canon/archive/continuity/retrieval/embeddings,
Redis, Cloudflare, workers, queues, storage, Stripe/billing changes, migrations,
package/lockfile changes, deployment changes, broad UI, or browser proof.

Generic consent readback still serializes ledger/requested scopes as
`executable: false`; runtime eligibility remains route-local.

## Files Changed

- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- `docs/roadmap/PR514A_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_ROUTE_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`

No migrations, web UI, package, lockfile, provider adapter, billing, Redis,
Cloudflare, worker, queue, storage, or deploy files changed.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 53 tests passed, including PR514A success, signed-out/nonparticipant, wrong role/pair, inactive/wrong-scope/wrong-version consent, audit fail-closed before provider/token write, provider unavailable, quota exceeded, rate limited, provider failed, provider empty, prompt privacy, actor-only token accounting, and no-drift coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed; public exhibit report/takedown behavior remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 201 tests passed; PR514A adds no visible UI. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| Changed-path scan | Pass | Changes are limited to persona encounter API/test files and PR514A roadmap/testing docs. |
| Forbidden-path scan | Pass | No web UI, package/lockfile, provider service, token service, operational cache, `packages/ai`, `packages/auth`, Supabase migration, Railway, Cloudflare, or deploy-script paths changed. |
| Secret-shaped diff scan | Pass | No API-key, private-key, GitHub token, bearer-token-shaped, provider-key env, Railway token, or private-key block values found in the diff. |
| `git diff --check` | Pass | No unstaged whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Review Handoff

ARGUS should hostile-review:

- provider ownership and platform-only routing;
- prompt contents and privacy exclusions;
- audit fail-closed ordering before provider call and token write;
- actor-only token accounting;
- response labels and non-persistence/non-public semantics;
- no private session, public exhibit, report, memory/canon/archive/continuity/
  export/job/storage/public row, UI, package, billing, Redis, Cloudflare, worker,
  deployment, or public-surfacing drift.

If ARGUS accepts PR514A, MIMIR should route ARIADNE for hosted proof before any
client/UI expansion.
