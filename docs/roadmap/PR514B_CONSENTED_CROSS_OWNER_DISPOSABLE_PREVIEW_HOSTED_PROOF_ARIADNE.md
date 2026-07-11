# PR514B - Consented Cross-Owner Disposable Preview Hosted Proof

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Status: Open

## Purpose

Prove the PR514A cross-owner disposable preview route against hosted staging
before any UI/client expansion.

Inputs:

- `docs/roadmap/PR514A_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_ROUTE_RESULT.md`
- `docs/roadmap/PR514A_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_ROUTE_REVIEW_RESULT.md`
- `docs/roadmap/PR514A_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_ROUTE_CLOSEOUT.md`

Route:

```text
POST /persona-encounters/cross-owner-consents/:consentId/disposable-preview
```

## Required Hosted Proof

Prove:

- hosted web/API freshness includes the PR514A implementation/review floor, or
  classify any deployment wait precisely;
- route is authenticated and separate from same-owner
  `POST /persona-encounters/preview`;
- signed-out request returns `401`;
- nonparticipant request returns `404` without row inference;
- wrong role/pair, inactive consent, wrong scope, and wrong scope version fail
  before provider call and token write;
- approved eligible consent reaches the platform-provider path if hosted
  provider config is present;
- successful hosted preview returns exactly one private disposable generated
  responder reply to the initiating actor;
- successful hosted preview records exactly actor-owned token usage with
  `chatId: null` and no counterparty token rows;
- successful hosted preview records bounded runtime attempt rows, including the
  pre-provider audit and provider-succeeded outcome;
- provider unavailable, quota/rate/provider failure, and empty-provider paths
  record bounded outcomes without token writes when those paths can be safely
  forced;
- generic consent readback remains `executable: false`;
- response/provenance and sampled public surfaces expose no raw owner ids, raw
  persona ids, private prompts, private profile values, provider payloads,
  bearer values, token values, generated text outside the actor response, SQL
  details, env values, cookies, or secret-shaped strings;
- no private session, public exhibit, report, memory/canon/archive/continuity/
  export/job/storage/public row, UI, package, billing, Redis, Cloudflare,
  workers, queues, deployment, webhook, partner adapter, or public-surfacing
  drift appears;
- cleanup leaves no active proof consent.

If hosted platform provider config is unavailable, do not fake a success proof.
Return a clean blocker:

```text
BLOCK_PR514B_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_HOSTED_PROVIDER_CONFIG
```

Include fail-closed evidence for provider-unavailable behavior, no provider
payload leakage, no token write, bounded runtime attempt audit row, cleanup, and
privacy.

## Non-Scope

Do not prove or implement:

- saved cross-owner private sessions;
- public cross-owner exhibits;
- generated-word excerpts;
- transcripts;
- summaries;
- publication;
- report creation;
- counterparty generated-word readback;
- public search/feed/Discover/Space/persona/forum/document surfacing;
- memory/canon/archive/continuity/retrieval/embeddings writes or prompt
  context;
- Redis, Cloudflare, workers, queues, storage, Stripe/billing, migrations,
  package/lockfile, deployment changes, broad UI, browser proof, partner
  adapters, or webhook scope.

Browser proof is not required because PR514A changes no visible UI.

## Expected Result

Return one of:

```text
PASS_PR514B_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_HOSTED_PROOF
FAIL_PR514B_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_HOSTED_PROOF
BLOCK_PR514B_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_HOSTED_PROVIDER_CONFIG
BLOCK_PR514B_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_DEPLOYMENT_WAIT
```

Wake MIMIR with the verdict.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR514A without a review patch.
- PR514A added a separate authenticated cross-owner disposable preview route.
- MIMIR closed PR514A locally and needs hosted proof before UI/client expansion.
Task:
- Prove the hosted PR514A route and boundaries.
- Prefer a successful provider-backed preview proof if hosted platform provider config is present.
- If hosted provider config is unavailable, return the provider-config blocker with fail-closed/no-token/no-drift/privacy evidence rather than faking success.
- Prove auth/participant gates, context-contract gating, actor-only token accounting, bounded runtime attempt audit rows, generic executable:false consent readback, cleanup, privacy, and no persistence/public-surfacing drift.
- Wake MIMIR with PASS/FAIL/BLOCK and exact evidence.
```
