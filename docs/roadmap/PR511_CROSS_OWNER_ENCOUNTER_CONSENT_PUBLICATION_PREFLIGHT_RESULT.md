# PR511 - Cross-Owner Encounter Consent / Publication Preflight Result

Owner: ARGUS / A3

Date: 2026-07-11

Status: Accepted

## Verdict

ARGUS accepts the smallest safe next cross-owner encounter lane as:

```text
ACCEPT_PR511A_CROSS_OWNER_ENCOUNTER_CONSENT_LEDGER_ONLY
```

Next lane:

```text
PR511A - Cross-Owner Encounter Consent Ledger
Owner: DAEDALUS / A2
```

MIMIR should close PR511 if accepted and route DAEDALUS to PR511A with this
ledger-only boundary. PR511A is not approval for cross-owner encounter runtime,
private cross-owner saved artifacts, public cross-owner exhibits, generated-word
publication, excerpts, transcripts, summaries, Salon/community surfacing,
Discover/search/feed surfacing, or any provider call.

## Why Ledger First

The product vision permits persona-to-persona encounters between different
creators, but it also states that each creator owns their persona's
contributions and neither creator can publish the other creator's persona's
words without permission.

The existing implementation is correctly same-owner only:

- preview readiness loads both personas through `owner_user_id`;
- preview and private-session creation reject a cross-owner responder before
  provider calls, quota writes, token transactions, or durable encounter rows;
- public exhibit publish rechecks that both source personas are still owned by
  the exhibit owner;
- public exhibit serialization is metadata-only and same-owner;
- PR510B hosted proof established same-owner public detail, index, report,
  takedown, and Discover search without public/private drift.

That means the next unsafe edge is not another public same-owner surface. The
repo needs durable bilateral consent, revocation, audit, deletion/export, and
owner readback semantics before any cross-owner generated words or artifacts can
exist.

## Rejected Shapes

`PR511A - Cross-Owner Private Encounter Artifact Consent` is too large. Saving a
private cross-owner artifact would require the consent ledger plus runtime
gates, persistence gates, readback split, deletion/export semantics, and future
publication locks in one lane.

`PR511A - Same-Owner Excerpt Publication Preflight First` is not required before
the consent ledger. Same-owner excerpts still need a separate preflight before
any generated words are published, but a ledger-only cross-owner consent lane
does not publish or store generated words.

Rejecting cross-owner work entirely is not necessary. The same-owner exhibit
path is now hosted-proven, and a ledger-only slice can advance the product
boundary without touching runtime or public output.

## Accepted PR511A Product Shape

PR511A may add a durable owner-scoped consent/provenance ledger for a specific
pair of personas owned by different users.

Allowed behavior:

- creator A can create a cross-owner invitation for one owned persona and one
  counterparty persona;
- creator B can approve, reject, or later revoke only their side;
- creator A can cancel or later revoke their side;
- both participant owners can read bounded ledger and audit readback;
- nonparticipants and signed-out users cannot discover, read, approve, reject,
  or revoke ledger rows;
- ledger rows can record requested future scopes, but no PR511A route may
  consume approval as permission to run, save, publish, summarize, or surface an
  encounter.

The PR511A ledger must be honest that approval is a consent record only. It must
not claim the encounter can run, be saved, be published, be searched, be shown
in Salon/community surfaces, or produce an excerpt/transcript/summary.

## Consent States

Required ledger status states:

- `pending`: invitation created by one owner and awaiting counterparty action;
- `approved`: both owners have an active approval for the same versioned scope
  set, but PR511A still performs no runtime or persistence side effect;
- `rejected`: counterparty declined the invitation;
- `cancelled`: requester withdrew a pending invitation before approval;
- `revoked`: at least one participant owner withdrew an earlier approval;
- `expired`: invitation exceeded its bounded response window;
- `superseded`: a newer invitation/scope version replaces the prior one;
- `blocked_by_deletion`: a participant persona or owner account deletion makes
  the consent unusable;
- `moderation_locked`: platform moderation freezes future use or restoration.

Required scope labels:

- `run_cross_owner_encounter`;
- `save_private_cross_owner_artifact`;
- `share_participant_metadata_between_owners`;
- `publish_metadata_only_public_exhibit`;
- `publish_generated_words_excerpt`;
- `publish_transcript`;
- `publish_generated_summary`.

PR511A may store requested scopes and approval states for these labels, but all
runtime, save, public, excerpt, transcript, and summary scopes must remain
non-executable until later ARGUS-accepted implementation lanes wire them.

Each executable future scope requires explicit approval from both owners for the
same scope version. One owner cannot approve on behalf of the other, and
same-owner consent cannot be reused for cross-owner behavior.

## Revocation Requirements

Future lanes must honor the following revocation behavior, and PR511A must
encode enough audit/state to support it:

| Lifecycle point | Required behavior |
| --- | --- |
| Invitation before run | Cancel, reject, revoke, or expire blocks future run/save/public use. |
| After approval before run | Either owner can revoke; future run/save/public use becomes blocked. |
| After run before save | Future save/publication becomes blocked; ephemeral output must be discarded or treated as non-persistable. |
| After save before publication | Future publication becomes blocked; any private artifact remains non-public and non-publishable until fresh bilateral consent exists. |
| After publication | Public cross-owner output must hide/retract immediately, leave safe audit/tombstone state, disappear from public routes/search/feed, and require fresh bilateral approval plus any moderation requirements before restoration. |
| During report or moderation review | Revocation cannot restore removed content. Moderation removal remains hidden until moderator action and active bilateral consent both allow a future restore. |

PR511A itself cannot create post-run, post-save, or post-publication states, but
its schema and state machine must not make those future states impossible.

## Ownership And Readback

| Reader | Allowed readback | Forbidden readback |
| --- | --- | --- |
| Requesting owner | Own invitation, counterparty display snapshot, requested scopes, status, timestamps, bounded audit events, safe route hints. | Counterparty private setup, raw owner/persona ids in UI, prompts, provider payloads, generated words, private source bodies, SQL detail, secrets. |
| Counterparty owner | Invitation addressed to an owned persona, requester display snapshot, requested scopes, status, timestamps, bounded audit events, approve/reject/revoke affordance. | Requester private setup, raw ids in UI, prompts, provider payloads, generated words, private source bodies, SQL detail, secrets. |
| Nonparticipant user | Nothing, with bounded `404` or `403` that does not reveal row existence. | Any ledger, audit, persona, owner, scope, or status information. |
| Admin/moderator | Bounded support/moderation context only when needed for review. | Private setup, generated words, prompts, provider payloads, source bodies, env values, tokens, cookies, stack traces. |
| Public/signed-out | Nothing. | Any consent, audit, status, persona-pair, owner, route, or availability information. |

Owner-visible API responses may include an opaque consent id for follow-up API
calls. UI-visible copy should prefer display snapshots, roles, status, and route
hints over raw internal ids.

## Audit Requirements

PR511A must record an append-only audit stream for:

- invitation created;
- requester approved or cancelled;
- counterparty approved or rejected;
- approval revoked by either participant;
- invitation expired;
- scope version superseded;
- persona/account deletion blocked future use;
- moderation lock applied or cleared.

Audit rows must store server-owned actor identity, actor role, event type,
status transition, bounded scope labels, timestamps, and optional bounded reason
codes. Do not store private setup text, generated replies, prompts, provider
payloads, source bodies, credentials, env values, SQL details, stack traces,
cookies, bearer values, or secret-shaped strings.

Both participant owners may read the safe audit events for their pair. Admins
may read bounded audit for support/moderation. The audit is never public.

## Deletion And Export Requirements

| Deletion/export event | Required handling |
| --- | --- |
| Persona deletion | Mark active consent involving that persona `blocked_by_deletion`, block future run/save/public use, and keep only minimal audit/tombstone state needed for participant readback and compliance. |
| Owner account deletion | Revoke or block that owner's active consents, hide future public cross-owner use, and retain only minimal compliance/moderation records if policy requires. |
| Private artifact deletion in future lanes | Public use remains blocked; minimal audit should record deletion without retaining generated words. |
| Public exhibit/publication deletion in future lanes | Public routes/search/feed must hide; audit/tombstone state stays safe and participant/admin bounded. |
| Space/publication deletion | Do not orphan cross-owner generated words or metadata into another public surface. |
| Owner export | Include only the requesting owner's participant consent ledger/audit readback, with counterparty information bounded to safe display snapshots and statuses. |

PR511A must not add export routes, deletion execution routes outside the ledger
boundary, or public deletion affordances. It must define data so those later
obligations can be implemented without exposing private material.

## Publication And Excerpt Boundaries

PR511A does not permit:

- cross-owner encounter runtime;
- private cross-owner saved artifacts;
- public cross-owner exhibits;
- owner-selected excerpts;
- transcript publication;
- public summaries of generated persona words;
- public route, Discover/search/feed, forum/community, Salon, Station Press, or
  Space/persona surfacing.

Metadata-only public cross-owner exhibits require a later preflight and later
implementation with bilateral public metadata approval, report/takedown,
retraction, moderation restore rules, hosted proof, and public no-drift tests.

Generated-word excerpts, transcripts, and generated summaries require separate
explicit approvals from both owners for a versioned scope, clear labels showing
whose persona produced the words, revocation behavior, report/takedown,
moderation review, deletion/export handling, and hosted proof. This applies to
cross-owner generated-word publication and to any future same-owner excerpt
publication. Same-owner excerpts are not a prerequisite for PR511A, but they
remain blocked until their own hostile preflight.

## Moderation, Report, And Takedown

PR511A has no public report target because it creates no public object.

Any later public cross-owner lane must include, before visibility:

- a dedicated public target type or extension of the existing public encounter
  exhibit moderation target;
- report creation and admin queue readback that show safe metadata only;
- owner revocation separate from platform moderation removal;
- moderation removal that hides public routes/search/feed immediately;
- restoration that requires both active bilateral consent and moderator action;
- tests that removed, revoked, retracted, expired, malformed, missing-source,
  wrong-schema, and deleted rows cannot surface publicly.

## Allowed PR511A File Scope

Allowed implementation files for PR511A:

- `infra/supabase/migrations/077_persona_encounter_cross_owner_consents.sql`;
- `packages/db/src/types.ts`;
- `packages/types/src/index.ts` only if a shared consent type is needed;
- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/web/lib/persona-encounter-runtime.ts`;
- `apps/web/lib/persona-encounter-runtime.test.ts`;
- `docs/roadmap/PR511A_CROSS_OWNER_ENCOUNTER_CONSENT_LEDGER_DAEDALUS.md`;
- `docs/testing/VALIDATION_BASELINE.md`.

PR511A should not add visible Studio UI by default. If MIMIR decides visible
owner controls are required in PR511A, MIMIR should name the exact Studio files
before waking DAEDALUS; otherwise UI belongs in a later lane after API/schema
semantics pass review.

Do not touch package/lockfile, provider adapters/router defaults, private
encounter runtime generation, public exhibit routes, Discover/search/feed,
public persona routes, Space routes, forum/community/Salon/Station Press,
Archive, Memory, Canon, Continuity, Integrity, retrieval/vector/embedding,
billing/Stripe, storage buckets, social connectors, Redis, Cloudflare,
queue/worker/webhook code, deployment config, or broad Studio/public UI.

## Required PR511A Tests

DAEDALUS should prove at minimum:

- migration creates dedicated consent and audit tables with owner-participant
  RLS and no public select/write policy;
- invitations require auth and requester ownership of the requester persona;
- invitations require the counterparty persona to be owned by a different owner;
- nonparticipants cannot read, approve, reject, revoke, cancel, or infer rows;
- counterparty owner can approve or reject only invitations addressed to an
  owned persona;
- requester can cancel only pending invitations they created;
- either participant owner can revoke an approved consent;
- rejected, cancelled, revoked, expired, superseded, deletion-blocked, and
  moderation-locked states cannot be approved or consumed as active;
- requested scopes are bounded to accepted labels and default to
  non-executable;
- PR511A routes perform no provider call, token accounting, private-session
  insert, public-exhibit insert/update, report insert, source retrieval,
  storage write, queue/worker job, Redis/Cloudflare operation, billing action,
  social post, or package/lockfile change;
- owner readback excludes raw owner/persona ids from UI-visible payloads and
  excludes private setup, generated replies, prompts, provider payloads, source
  bodies, SQL details, stack traces, cookies, tokens, env values, and
  secret-shaped strings;
- audit events are append-only and readable only by participant owners and
  bounded admin contexts;
- existing same-owner preview/private-session/public-exhibit tests remain
  green.

Minimum validation:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

ARGUS review must also run changed-path, forbidden-path, public/no-drift,
cross-owner runtime drift, provider/retrieval drift, package/lockfile drift,
Cloudflare/Redis/queue/worker/storage/billing/social drift, raw-id leakage, and
secret-shaped value scans.

## Hosted Proof Requirement

If PR511A is implemented and accepted locally, MIMIR should route ARIADNE for a
hosted proof before any customer-facing closeout.

Hosted proof should verify:

- hosted migration is applied;
- owner A can create one cross-owner invitation for an owned persona and owner
  B's persona;
- owner B can approve, reject, and revoke in separate disposable proof rows, or
  the proof records why only one safe path was exercised;
- owner A can cancel a pending invitation;
- both participant owners see bounded ledger/audit readback;
- signed-out users and nonparticipant owners fail closed without row discovery;
- no provider call, private-session row, public-exhibit row, report row,
  Discover/search/feed surfacing, public persona/Space/forum/Salon/Station
  Press surfacing, storage write, queue/worker job, billing/social action, or
  package/runtime drift occurs;
- cleanup leaves no active proof consent, or marks proof rows revoked/cancelled
  with safe audit state;
- sanitized proof output records no raw ids, private setup, generated reply
  text, prompt bodies, source bodies, provider details, env values, tokens,
  cookies, SQL detail, stack traces, screenshots, traces, videos, browser
  storage state, bearer values, or secret-shaped strings.

If visible owner UI is deliberately added to PR511A by MIMIR before DAEDALUS
starts, ARIADNE must also rehearse desktop and `390px` mobile layout.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Product/source review | Pass | Product vision confirms cross-owner encounters require permission to publish another creator's persona words; PR472/PR507/PR508 keep cross-owner runtime/artifacts/publication blocked until bilateral consent, revocation, audit, deletion, and readback semantics exist. |
| Current code boundary review | Pass | Current preview/private-session creation loads both personas by current `owner_user_id`; cross-owner responder probes fail before provider calls or durable writes; public exhibit publish rechecks same-owner source personas. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 37 tests passed, including cross-owner-before-provider, private-session no side-effect, same-owner metadata-only public exhibit, and no client-certified reply coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed; public exhibit report/takedown and admin moderation boundaries remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 201 tests passed; owner-only encounter contract/readiness/runtime and public exhibit helper copy remain bounded. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed from cache. |
| Changed-path scan | Pass | PR511 is docs/status only. No runtime, schema, package, lockfile, hosted config, provider, retrieval, billing, storage, social, Redis, Cloudflare, queue, worker, webhook, public route, or UI implementation was changed. |
| Secret-shaped value scan | Pass | No API-key, private-key, GitHub token, OpenAI-style key, Google key, Slack token, or bearer-token-shaped values found in touched files. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors after staging PR511 docs/status updates. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR511A as ACCEPT_PR511A_CROSS_OWNER_ENCOUNTER_CONSENT_LEDGER_ONLY.
- The smallest safe next cross-owner lane is a durable owner-scoped consent/provenance ledger with invitation, approval, rejection, revocation, expiry/supersession/deletion-block/moderation-lock states, participant owner readback, and append-only audit.
- PR511A may record requested future scopes, but no approval can be consumed to run an encounter, save a private cross-owner artifact, publish metadata, publish excerpts, publish transcripts, publish summaries, or surface anything publicly.
- Cross-owner runtime, private cross-owner saved artifacts, public cross-owner exhibits, generated-word excerpts, transcripts, summaries, Discover/search/feed, Salon/community/forum/Station Press/Space/persona surfacing, provider calls, retrieval, billing, storage, social, Redis, Cloudflare, queues/workers, package/lockfile, and deployment drift remain blocked.
- Same-owner generated-word excerpts are not a prerequisite for the ledger, but any generated-word publication still needs a separate hostile preflight.
- PR511 validation passed.
Task:
- Close PR511 if accepted and wake DAEDALUS for PR511A using the ledger-only boundary in this result, or adjust the next lane explicitly if you want a narrower non-migration contract first.
```
