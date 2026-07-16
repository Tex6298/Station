# PR528B11 - Accepted Search Deploy And Public Corpus Completion

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - serialized hosted completion after two zero-write blockers

## Purpose

Deploy the accepted public document title/summary/body Discover search, then
complete the exact PR528 Station Guide public partner corpus through the
already accepted one-thread discussion path.

PR528B7 and PR528B9 both stopped correctly before signup. Public fixture state
is still zero. This is a fresh hosted operation with one result and one cleanup
ledger, not a narrative continuation of a partially mutated run.

## Accepted Source

Acceptance head:

```text
6794ac996d416d023aa729a8293918251776aad3
```

Accepted runtime changes:

- document-discussion owner customization and moderation safety through
  `f8349f09433bdee9dc8770a2623829cc8f03beb3`;
- public document title/summary/body search in
  `da520604a7ee1e4b6e09f1149c562c4f83213d8b`; and
- ARGUS acceptance/test evidence at `6794ac99`.

A Railway deployment may report the runtime commit, acceptance head, or a
later coordination-only descendant only if ancestry and exact production route
file hashes prove both accepted runtime changes are present and no later
production API source change intervened.

## Phase 1 - Deploy And Bind

1. Bind current API/web deployment identities, `fork/main`, accepted ancestry,
   exact hashes for the changed production route files, migration readiness,
   target collision counts, forbidden counts, and retained private Aster
   invariants in an ignored protected ledger without printing secrets.
2. Wait for or trigger only the required Railway API deployment. If web is
   automatically rebuilt, verify readiness but do not trigger it merely for
   activity.
3. Require API readiness, accepted production route hashes, migration range
   `025-086`, and all seven migration proofs green before any Auth/product
   write.
4. Require the hosted search source to contain fixed-field title, summary, body
   queries with dedupe before the existing eight-result cap. Do not create a
   canary corpus merely to prove deployment.

## Phase 2 - Complete The Public Corpus

Execute the PR528B9 product sequence and every PR528B7/PR528B2 ownership,
content, retention, privacy, allow-list, and cleanup boundary, with these exact
accepted operations:

1. Create and reauthenticate the dedicated nonbilling `creator` review owner
   `Station Guide` / `station-guide` through the approved signup, private Auth
   metadata, and controlled entitlement path.
2. Create the exact public Continuity Field Notes Space.
3. Create the exact summarized document with comments disabled and publish it
   while comments remain disabled.
4. Enable comments through the owner document PATCH and capture exactly one
   helper-created linked discussion.
5. Customize that same discussion through
   `PATCH /documents/:id/discussion` with the exact approved title/body.
6. Require one linked thread total, the same thread id throughout, the expected
   documents-and-codexes category, and no leftover default `Discuss: ...` row.
7. Validate anonymously through Latest Discover, public Space, public document,
   document discussion, thread detail, exact document-title search, and a
   distinctive approved canonical-body phrase search. Both searches must route
   to the same document.
8. Prove summary/body separation, summary-based excerpts, exact provenance and
   visibility labels, genuine timestamps, no fake engagement, no private leak,
   and no forbidden write.

Do not call `POST /forums/threads` for this document. Do not use direct database
product-data writes or weaken either accepted API contract.

## Failure And Retention

- If deployment/source/readiness binding fails, make zero hosted Auth/product
  writes.
- If a write begins but the exact retained chain cannot be proved, execute the
  full public-owner cleanup from the protected ledger and prove all target
  collisions, owner residue, and forbidden counts returned to zero.
- On success, retain only the exact public review owner, Space/pages,
  summarized document/version rows, one linked discussion, and at most one
  normal community profile through Marty and his partner's PR528 review.
- Keep the private Aster owner/corpus read-only and exact throughout.
- Never print or commit credentials, tokens, private ids, ledger contents, or
  private timestamps.

## Result And Handoff

Create:

`docs/roadmap/PR528B11_ACCEPTED_SEARCH_DEPLOY_AND_PUBLIC_CORPUS_COMPLETION_DAEDALUS_RESULT.md`

Use one exact verdict:

```text
READY_PR528B11_PUBLIC_PARTNER_CORPUS_FOR_ARGUS
BLOCK_PR528B11_<EXACT_REASON>_WITH_<ZERO_OR_EXACT_RETAINED_STATE>
```

Commit and push public-safe aggregate evidence, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS deployed the accepted Discover search and completed the bounded Station Guide public partner corpus operation.
Verdict:
- READY_PR528B11_PUBLIC_PARTNER_CORPUS_FOR_ARGUS (or exact blocker/state)
Task:
- Route ARGUS independent hosted deployment/corpus review before ARIADNE human rehearsal.
```
