# PR514A - Consented Cross-Owner Disposable Preview Route

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Status: Open

## Purpose

Implement the first narrow provider-backed cross-owner disposable preview route
now that the required context contract and runtime attempt audit ledger have
passed local and hosted proof.

This lane follows the accepted PR513 policies and the PR513A-PR513D audit
floor. It should be API-only unless DAEDALUS finds a small client helper update
is necessary for tests.

## Required Shape

Add a separate authenticated route rather than widening same-owner
`POST /persona-encounters/preview`.

Suggested route:

```text
POST /persona-encounters/cross-owner-consents/:consentId/disposable-preview
```

Body:

```text
initiatorPersonaId
responderPersonaId
setup
maxOutputTokens? (bounded like same-owner preview)
```

Required behavior:

- require auth;
- load the consent through the existing participant path;
- require the actor to participate in the consent;
- require the actor to own the initiator persona;
- require the responder persona to be the other participant persona;
- require approved consent, scope version `1`, and requested scope
  `run_cross_owner_encounter`;
- call the existing cross-owner runtime context contract helper first and fail
  closed unless it is eligible;
- use a new cross-owner prompt builder, not the same-owner
  `buildEncounterPreviewSystemPrompt`;
- use only owner-authored setup, consent/persona display snapshots, bounded
  one-reply instructions, and explicit no-private-retrieval/no-persistence
  boundaries;
- do not include `short_description`, `long_description`, `awakening_prompt`,
  `style_notes`, memory, canon, archive, continuity, transcripts, source bodies,
  retrieval output, provider payloads, provider config, storage paths, raw owner
  ids, or raw persona ids in the provider prompt;
- resolve the provider through the initiating actor's owned/platform route only;
- never use the counterparty owner's BYOK keys, provider config, private
  provider setup, provider preference, or responder persona provider routing;
- charge quota/token usage only to the initiating actor;
- record token usage only after a successful provider response;
- use `chatId: null`;
- return exactly one generated responder reply to the initiating actor;
- label the reply as generated, private, disposable, non-canonical, non-public,
  not saved, not a transcript, not a summary, not an excerpt, not shareable, and
  not sourced from private retrieval;
- record bounded runtime attempt audit rows for blocked-before-provider and
  after-provider outcomes;
- if required audit insertion fails, fail closed before any provider call or
  token write.

## Suggested Code Map

Likely files:

- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- `apps/web/lib/persona-encounter-runtime.ts` only if a tiny helper/type update
  is useful
- roadmap/status/testing docs

Existing pieces to reuse carefully:

- same-owner preview input bounds and provider failure shapes;
- `buildCrossOwnerRuntimeContextContract`;
- `recordCrossOwnerRuntimeAttemptAudit`;
- `loadCrossOwnerConsentForParticipant`;
- same-owner provider resolution only after changing ownership semantics so
  cross-owner preview uses actor-owned/platform provider policy, not the
  counterparty responder provider.

## Non-Scope

Do not add:

- same-owner route widening;
- saved cross-owner private sessions;
- public cross-owner exhibits;
- generated-word excerpts;
- transcripts;
- summaries;
- publication;
- report creation;
- counterparty generated-word readback;
- public search/feed/Discover/Space/persona/forum/document surfacing;
- memory, canon, archive, continuity, retrieval, embeddings, Redis, Cloudflare,
  workers, queues, storage, Stripe/billing changes;
- migrations;
- package/lockfile changes;
- deployment changes;
- broad UI changes or browser proof.

Generic consent readback must continue to serialize ledger/requested scopes as
`executable: false`. Runtime eligibility remains route-local.

## Required Tests

Add or update focused tests for:

- signed-out request returns `401`;
- nonparticipant request returns `404` or no row inference;
- wrong actor/initiator/responder pair fails before provider call;
- pending/rejected/cancelled/revoked/wrong-scope/wrong-version consent fails
  before provider call;
- provider unavailable, quota exceeded, rate limited, provider failed, and
  provider empty return bounded errors;
- audit insertion failure fails closed before provider call or token write;
- successful preview records actor-owned token usage and no counterparty token
  usage;
- successful preview records bounded runtime attempt metadata;
- generated reply is returned only to the initiating actor and is labelled
  private/disposable/not saved/not public/not sourced from private retrieval;
- provider prompt excludes forbidden private/profile/retrieval/source/provider
  material;
- no private session, public exhibit, report, memory/canon/archive/continuity/
  export/job/storage/public row, or public surfacing appears.

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

Also run staged path, forbidden-path, forbidden side-effect, and secret-shaped
diff scans.

## Review Path

Wake ARGUS after implementation.

ARGUS should hostile-review provider ownership, prompt context, audit
fail-closed behavior, actor-only token accounting, privacy, and no-drift.

If ARGUS accepts PR514A, MIMIR should route ARIADNE for hosted proof before any
UI/client expansion.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- PR513D passed hosted rerun; the runtime attempt audit blocker is repaired and hosted-proven.
- The concrete PR513 blocker CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_MISSING is removed.
- PR514A opens the first narrow provider-backed consented cross-owner disposable preview route.
Task:
- Implement PR514A as a separate authenticated cross-owner disposable preview route, not a widening of same-owner /preview.
- Gate on participant consent, approved run_cross_owner_encounter scope, PR512A runtime context contract eligibility, and PR513A runtime attempt audit.
- Use actor-owned/platform provider routing only; never use counterparty BYOK/provider config/responder provider preference.
- Use a new bounded cross-owner prompt builder with display snapshots and setup only; no private profile fields, memory/canon/archive/continuity/retrieval/transcripts/source bodies/provider internals/raw ids.
- Return exactly one private disposable generated reply to the initiating actor, label it non-persistent/non-public/not sourced from private retrieval, record actor-only token usage only on success, and record bounded runtime attempt audit rows.
- Preserve non-scope: no private sessions, public exhibits, reports, memory/canon/archive/continuity/export/jobs/storage/public rows, UI, package, billing, Redis, Cloudflare, workers, webhooks, deployment, partner adapters, or public surfacing.
- Run required validation and wake ARGUS with implementation result.
```
