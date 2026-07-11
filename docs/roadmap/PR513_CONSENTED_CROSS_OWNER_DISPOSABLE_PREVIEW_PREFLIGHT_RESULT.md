# PR513 - Consented Cross-Owner Disposable Preview Preflight Result

Owner: ARGUS / A3

Date: 2026-07-11

Source:
`docs/roadmap/PR513_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_PREFLIGHT_ARGUS.md`

Result:

```text
ACCEPT_PR513A_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_LEDGER_ONLY
```

Blocked candidate:

```text
BLOCK_PR513_CROSS_OWNER_DISPOSABLE_PREVIEW_RUNTIME_ATTEMPT_AUDIT_MISSING
```

## Verdict

ARGUS does not accept provider-backed cross-owner disposable preview as the next
direct implementation lane.

ARGUS accepts the smaller unblock lane:

```text
PR513A - Cross-Owner Runtime Attempt Audit Ledger
Owner: DAEDALUS / A2
```

PR512A/PR512B prove the readback-only context contract locally and on hosted.
That is necessary, but not sufficient, for a provider call. A provider-backed
cross-owner preview would consume another owner's approved consent and generate
disposable words as that owner's persona. The repo still lacks a durable,
bounded, participant-visible runtime attempt record for that consent
consumption.

Actor-local token/rate-limit facts are not enough. They are not a bilateral
cross-owner provenance record and they do not give the counterparty owner a
bounded way to see that their approved consent was used.

## Concrete Blocker

```text
CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_MISSING
```

Why it blocks PR513A disposable preview:

- PR512A's contract defines future metadata-only audit field names, but it does
  not write runtime attempt audit rows.
- PR512B proves the hosted contract readback only; it explicitly does not
  authorize provider runtime.
- The proposed preview would introduce the first provider-backed use of a
  cross-owner consent.
- Without append-only attempt provenance, successful and failed provider
  attempts would leave no participant-visible consent-consumption trail.
- Token rows are actor-owned billing/quota facts, not cross-owner consent audit.

## Policies Resolved For The Later Preview

ARGUS accepts these policies for the later provider-backed disposable preview
lane, after the runtime attempt audit ledger exists and is reviewed:

Provider ownership:

- use only an actor-owned provider route or an already accepted platform route;
- never use the counterparty owner's BYOK keys, provider config, provider
  preference, or private provider setup;
- do not use `responder.provider` from the counterparty persona;
- if a persona provider enum is needed for routing, use only the actor-owned
  initiator persona's provider or an actor-owned/profile route;
- fail closed before provider resolution if the actor-owned/platform provider is
  unavailable.

Token accounting:

- charge quota/token usage only to the initiating actor;
- record token usage only after a successful provider response;
- use `chatId: null`;
- store no prompt text, provider payload, generated output, raw owner ids, raw
  persona ids, provider keys, route labels, model config, token values, or
  private context in token metadata;
- do not bill or quota-charge the counterparty owner.

Prompt/context:

- use a new cross-owner prompt builder, not the same-owner
  `buildEncounterPreviewSystemPrompt`;
- the provider payload may include only owner-authored setup from the initiating
  actor, consent display snapshots for initiator and responder names, bounded
  one-reply instructions, and explicit prohibitions against claiming Memory,
  Archive, Canon, Continuity, transcripts, source retrieval, private profile
  notes, private prompts, provider state, public routes, or shared private
  history;
- do not include `short_description`, `long_description`, `awakening_prompt`,
  `style_notes`, memory, canon, archive, continuity, transcripts, source bodies,
  retrieval output, provider payloads, provider config, storage paths, raw owner
  ids, or raw persona ids.

Consent semantics:

- `run_cross_owner_encounter` may authorize only one private disposable
  generated preview response after the context and audit gates pass;
- it does not authorize save, private session artifact, transcript, summary,
  excerpt, publication, metadata sharing, report creation, public exhibit,
  public search/feed/Discover/Space/persona/forum/document surfacing, or any
  generated-word readback to the counterparty;
- generic consent readback must continue to serialize ledger and requested
  scopes as `executable: false`; runtime eligibility must remain route-local.

Response privacy:

- initiating actor may receive exactly one generated responder reply;
- response provenance must label it generated, private, disposable,
  non-canonical, non-public, not saved, not a transcript, not a summary, not an
  excerpt, not shareable, and not sourced from private retrieval;
- response must not expose raw owner ids, raw persona ids, private prompt/profile
  fields, provider payloads, provider keys, provider route internals, traces, SQL
  details, env values, cookies, bearer values, secret-shaped strings, token
  values, storage paths, or source bodies.

## Accepted PR513A Scope

DAEDALUS may implement only a runtime attempt audit ledger for future
cross-owner provider execution.

Required shape:

- add a dedicated cross-owner runtime attempt audit table or attempt/event table
  pair;
- store only bounded metadata needed for participant-visible provenance:
  consent id, actor role, initiator role, responder role, consent status,
  requested scope version, requested scope, readiness code, attempt lifecycle
  status, and created/completed timestamps;
- allow outcome codes such as blocked-before-provider, provider-succeeded,
  provider-failed, provider-empty, quota-exceeded, rate-limited, and
  provider-unavailable, without storing prompt/output/provider payloads;
- add RLS so participant owners can read bounded attempt metadata for their own
  consent rows and no public/nonparticipant read is possible;
- prevent direct participant update/delete of attempt audit rows;
- add server-side helper/RPC shape that a later preview route can use to record
  before-provider and after-provider attempt events without best-effort audit
  drift;
- serialize participant readback without raw owner ids, raw persona ids, prompts,
  private profile fields, provider payloads, generated words, traces, SQL
  details, env values, cookies, bearer values, token values, or secret-shaped
  strings.

PR513A must not:

- add a provider-backed preview route;
- call a provider;
- assemble provider prompts;
- return generated words;
- record token usage or token transactions;
- create private sessions, public exhibits, reports, memory, canon, archive,
  continuity, export packages, jobs, queues, storage objects, public rows, or
  public surfacing;
- add save, transcript, summary, excerpt, publication, metadata sharing, Salon,
  community, Discover/search/feed, Station Press, public persona, public Space,
  forum, or document surfacing;
- add model/provider selection, embeddings, retrieval, Redis, Cloudflare,
  workers, Stripe, billing, entitlement, package, lockfile, deployment, webhook,
  or broad UI changes.

Allowed files:

- one Supabase migration for the runtime attempt audit ledger;
- `packages/db/src/types.ts`;
- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- roadmap/status/testing docs.

No web UI is accepted for PR513A.

## Required PR513A Validation

DAEDALUS must run:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Required test coverage:

- migration/RLS shape creates participant-readable, nonpublic, append-only
  runtime attempt audit metadata;
- server-side helper/RPC can record bounded before-provider and after-provider
  attempt metadata without storing prompt/output/provider payloads;
- audit insertion failure fails closed for any future state mutation helper;
- participant readback returns safe attempt metadata only;
- nonparticipants get `404` or empty readback without row inference;
- signed-out access returns `401`;
- generic consent readback remains `executable: false`;
- no provider call, generated word, token row, private session, public exhibit,
  report, memory/canon/archive/continuity/export/job/storage/public row, or
  public surfacing appears;
- staged path, forbidden-path, and secret-shaped diff scans pass.

ARIADNE hosted proof is required after ARGUS accepts PR513A because PR513A adds
a migration and participant-readable audit behavior. Browser proof is not
required unless visible UI changes.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Repo evidence review | Pass | Reviewed PR513 packet, PR512A local review, PR512B hosted proof/closeout, current context-contract route, and same-owner provider preview path. |
| Runtime policy review | Pass | Provider ownership, actor-only token accounting, display-snapshot-only prompt context, consent semantics, and response privacy policies are resolved for a later preview lane. |
| Blocker review | Pass | Found the remaining missing piece is durable participant-visible runtime attempt audit before any cross-owner provider call. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 45 tests passed, including PR512A hosted-proven context-contract local coverage and same-owner preview safety coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed; public exhibit report/takedown behavior remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 201 tests passed; PR513 adds no visible UI. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| Staged path scan | Pass | Staged changes are limited to PR513 result/status/testing docs. |
| Secret-shaped diff scan | Pass | No API-key, private-key, GitHub token, bearer-token-shaped, provider-key env, Railway token, or private-key block values found in the staged diff. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
```
