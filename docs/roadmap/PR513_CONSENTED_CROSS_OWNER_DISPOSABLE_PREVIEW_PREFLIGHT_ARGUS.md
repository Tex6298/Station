# PR513 - Consented Cross-Owner Disposable Preview Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Status: Open

## Purpose

Decide the smallest safe Phase 3 lane for consented cross-owner encounter
runtime now that the context-contract boundary has passed local review and
hosted proof.

This is a hostile preflight. Do not implement runtime in PR513.

## Product Intent

Station should eventually let one owner initiate a private disposable encounter
with another owner's persona after explicit bilateral consent. The output should
be clearly labelled as generated, private, non-canonical, non-public, and not a
saved artifact unless a later lane explicitly adds saving/publication consent.

The current same-owner `/persona-encounters/preview` route is provider-backed
and sends both same-owner persona profile context into the prompt. That is not
automatically safe for cross-owner personas.

PR512A/PR512B now prove a readback-only cross-owner gate:

- explicit `consentId`;
- explicit `initiatorPersonaId`;
- explicit `responderPersonaId`;
- actor must participate in the consent;
- actor must own the initiator persona;
- responder must be the other participant persona;
- status must be `approved`;
- scope version must be `1`;
- requested scopes must include `run_cross_owner_encounter`;
- generic consent readback remains `executable: false`.

## Decision Required

ARGUS should decide whether the next DAEDALUS lane may be:

```text
PR513A - Consented Cross-Owner Disposable Preview
```

Candidate PR513A shape, if accepted:

- add a separate authenticated cross-owner preview route, not a silent widening
  of same-owner `/preview`;
- require `consentId`, `initiatorPersonaId`, `responderPersonaId`, owner-authored
  setup, and optional bounded `maxOutputTokens`;
- call the PR512A context-contract helper first and fail closed unless the
  contract is eligible;
- actor pays/uses only an accepted actor-owned or platform provider route unless
  ARGUS explicitly accepts a different policy;
- never use the counterparty owner's BYOK keys, provider config, private prompt
  fields, private memory, canon, archive, continuity, transcripts, source
  bodies, or storage paths;
- generate only a disposable responder reply returned to the authenticated
  initiating actor;
- record only necessary actor-owned token usage/rate-limit facts if a provider
  call actually succeeds;
- return bounded provenance stating that the output is generated, private,
  disposable, not canonical, not public, not saved, and not sourced from private
  retrieval;
- create no private session, public exhibit, memory, canon, archive,
  continuity, export, report, storage, public row, job, queue, worker, Redis,
  Cloudflare, billing/Stripe, migration, package, or UI drift.

## Risks To Resolve

ARGUS must explicitly review:

- provider ownership policy: actor-owned provider, platform provider, or a
  concrete blocker if neither is acceptable;
- token accounting policy: actor-only cost and no counterparty billing;
- prompt/context policy: whether bounded display snapshots plus owner-authored
  setup are enough, or whether a separate public/persona-consented prompt
  contract is required first;
- consent semantics: `run_cross_owner_encounter` grants only private disposable
  generation, not save, transcript, summary, excerpt, publication, report, or
  public surfacing;
- response privacy: no raw owner ids, raw persona ids, private prompt/profile
  fields, provider payloads, traces, SQL details, env values, cookies, bearer
  values, or secret-shaped strings;
- failure behavior for pending, rejected, cancelled, revoked, wrong-pair,
  wrong-role, wrong-scope, wrong-version, nonparticipant, signed-out,
  provider-unavailable, quota-exceeded, rate-limited, provider-empty, and
  provider-failed cases.

## If Blocked

Do not return a bare refusal.

If PR513A is not safe yet, name the concrete blocker and open the smallest
numbered unblock lane. Acceptable examples include:

- `PR513A - Cross-Owner Provider Ownership Policy Readback`;
- `PR513A - Cross-Owner Prompt/Context Contract Only`;
- `PR513A - Cross-Owner Token Accounting Boundary`;
- another smaller lane if ARGUS finds a more precise blocker.

## Non-Scope

Do not open or approve:

- saved cross-owner private sessions;
- public exhibits;
- generated-word excerpts;
- transcripts;
- summaries;
- publication;
- public search/feed/Discover/Space/persona/forum/document surfacing;
- memory, canon, archive, continuity, retrieval, embeddings, Redis, Cloudflare,
  workers, queues, storage, Stripe/billing changes;
- migrations, package/lockfile changes, deployment changes, broad UI changes,
  or browser proof.

## Required Validation For ARGUS

Run or inspect enough to make the decision:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

If ARGUS only edits docs/status, name any commands not rerun and why.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- PR512B hosted API/data proof passed and MIMIR closed it as accepted.
- The PR512A/PR512B context contract is now locally reviewed and hosted-proven.
- MIMIR is opening PR513 to decide whether the smallest safe next Phase 3 lane is consented cross-owner disposable preview.
Task:
- Hostile-preflight whether DAEDALUS may implement PR513A as a separate authenticated cross-owner disposable preview route gated by the PR512A runtime-context contract.
- Decide provider ownership, token accounting, prompt/context, consent semantics, privacy, and fail-closed requirements.
- If PR513A is safe, wake MIMIR with the exact accepted implementation lane.
- If not safe, name the concrete blocker and the smallest numbered unblock lane, not a bare refusal.
```
