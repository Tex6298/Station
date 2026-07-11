# PR512 - Consented Cross-Owner Encounter Runtime Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Status: Open

## Purpose

Choose the smallest safe Phase 3 Persona-to-Persona Encounter expansion after
the hosted consent ledger proof.

PR511A/PR511B proved a bilateral consent ledger. They did not make any scope
executable. The product question now is whether Station can safely open the
first consented cross-owner runtime slice, or whether one smaller unblock lane
must come first.

## Product Context

The future-vision docs describe cross-owner persona-to-persona encounters as a
structured format where each persona is assembled from its own canon and memory,
the creators can observe or intervene, transcripts can be archived later, and
neither creator can publish the other creator's persona words without
permission.

Repo facts:

- same-owner disposable owner encounter preview exists;
- same-owner private session artifacts exist;
- same-owner metadata-only public encounter exhibits exist and are
  hosted-proven;
- cross-owner preview/private-session/public-exhibit paths currently reject
  before provider calls, token transactions, or durable writes;
- hosted PR511B proves the cross-owner consent ledger, participant readback,
  audit, signed-out/nonparticipant fail-closed behavior, and no public/runtime
  drift;
- all cross-owner consent scopes still serialize as `executable: false`.

## Proposed Next Slice For ARGUS To Accept Or Patch

Proposed implementation lane:

```text
PR512A - Consented Cross-Owner Disposable Encounter Preview
Owner: DAEDALUS / A2
```

Shape to review:

- authenticated participant-owner only;
- requires one active `approved` consent row for the exact requester persona,
  counterparty persona, and current scope version;
- requires requested scope `run_cross_owner_encounter`;
- flips only that specific runtime readback to executable inside the preview
  route, not in the generic ledger serializer;
- produces one disposable private preview response for the requesting
  participant owner;
- persists no transcript, private session, public exhibit, report, token beyond
  the already accepted preview token accounting, archive item, memory, canon,
  continuity record, export, queue job, storage object, or public row;
- logs/audit only safe bounded runtime attempt metadata if ARGUS says an audit
  event is required before or after provider call;
- exposes no counterparty private setup, memory, canon, archive source bodies,
  prompts, provider payloads, raw ids, traces, or generated words to
  nonparticipants or public routes;
- keeps publication, save, excerpt, transcript, summary, metadata sharing,
  Salon/community, Discover/search/feed, Station Press, and public persona/Space
  surfacing blocked.

ARGUS may accept that slice, narrow it, or replace it with the smallest unblock
lane. Do not return a bare refusal. If PR512A is not safe, name the concrete
blocker and the smallest numbered lane that removes it.

## ARGUS Questions

Answer these directly:

- Is an `approved` consent ledger row plus `run_cross_owner_encounter` enough
  to permit a disposable cross-owner preview, or is a separate runtime-consent
  execution record needed first?
- Which participant owners can initiate the preview: requester only,
  counterparty only, or either approved participant?
- Must the route require consent id plus persona ids, or can it select the
  active consent by persona pair?
- What exact status/scope/version checks must happen immediately before the
  provider call?
- What provider payload boundary is acceptable when two owners' persona context
  is involved?
- Can the first slice use the existing same-owner preview prompt/context shape,
  or must it add a cross-owner context contract first?
- Should each persona context be assembled separately and then merged into a
  bounded encounter prompt, or must cross-owner context assembly be a separate
  readback-only lane?
- What runtime output may the initiating owner see, if the output contains the
  counterparty persona's generated words?
- What may the counterparty owner read after the preview, if the preview is
  disposable and not persisted?
- Must token accounting charge only the initiator, or is billing blocked until
  a separate policy lane?
- What no-drift tests must prove that private sessions, public exhibits,
  reports, memory/canon/continuity/archive writes, jobs, storage, and public
  surfaces remain untouched?
- After DAEDALUS and ARGUS, does ARIADNE need hosted proof, browser proof, or
  API/data proof only?

## Non-Scope

PR512 preflight and any accepted PR512A must not open:

- saved cross-owner artifacts;
- public cross-owner exhibits;
- generated-word excerpts;
- transcripts;
- generated summaries;
- participant metadata sharing outside bounded ledger/runtime readback;
- Discover/search/feed, Salon, community, Station Press, public persona, or
  public Space surfacing;
- anonymous visitor behavior;
- new model/provider selection;
- embeddings, retrieval, Redis, Cloudflare, queues, workers, storage, social,
  Stripe, entitlement, or package/lockfile changes unless ARGUS names one as
  the smallest concrete blocker;
- broad UI redesign.

## Expected Result

Write:

`docs/roadmap/PR512_CONSENTED_CROSS_OWNER_ENCOUNTER_RUNTIME_PREFLIGHT_RESULT.md`

Use one of:

```text
ACCEPT_PR512A_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW
ACCEPT_PR512A_CROSS_OWNER_CONTEXT_CONTRACT_ONLY
BLOCK_PR512_CROSS_OWNER_RUNTIME_<concrete_blocker>
```

If blocked, include:

- the blocker;
- why it blocks the proposed runtime slice;
- the smallest numbered lane to remove it;
- the next owner;
- exact tests/files to inspect;
- whether MIMIR must decide a product question before DAEDALUS starts.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- PR511B passed hosted cross-owner consent ledger proof and MIMIR closed it.
- The ledger is now hosted-proven but still non-executable; cross-owner runtime, provider calls, saved artifacts, public exhibits, excerpts, transcripts, summaries, public surfacing, and infra expansion remain blocked.
- The next Phase 3 Persona-to-Persona Encounter question is whether to open PR512A as a consented cross-owner disposable encounter preview, or whether one smaller unblock lane must come first.
Task:
- Run PR512 hostile preflight.
- Accept, patch, or reject the proposed PR512A consented cross-owner disposable preview.
- Do not return a bare refusal; if PR512A is unsafe, name the concrete blocker and the smallest numbered lane that removes it.
- Wake MIMIR with verdict, next owner, exact scope, and required validation.
```

