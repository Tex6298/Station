# PR528C3 - Private Partner Corpus Review

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - independent hosted retained-state review

## Review Target

Review `PR528B4_PRIVATE_PARTNER_CORPUS_DAEDALUS_RESULT.md` against the private
implementation packet, allow-list, retention boundary, and cleanup contract in
`PR528B2_PARTNER_CORPUS_PROVIDER_PREFLIGHT_ARGUS_RESULT.md`.

Use the ignored DPAPI-encrypted ledger and credential envelope only in-process.
Do not print, commit, copy into a command line, or expose any secret, owner ID,
row ID, signed URL, storage path, private body, or private timestamp.

## Required Review

1. Bind the retained hosted rows to exactly one dedicated private nonbilling
   owner with the required Auth purpose metadata, `private` tier, inactive
   subscription, platform mode, no Stripe links, and no admin state.
2. Independently prove the exact Aster/persona-layer/lifecycle, two curated
   Memory, one processed file/import/archive chunk, one pending file-sourced
   Inbox candidate, one private Continuity record, storage byte count, Gemini
   embedding metadata, and lifecycle states.
3. Re-run bounded anonymous and fresh cross-owner private-route/search probes,
   plus the forbidden owner-scoped surface comparison. Require zero private
   disclosure and no public, chat, trace, billing, engagement, moderation,
   notification, connector, queue, or provider writes.
4. Confirm the encrypted cleanup ledger contains every retained identifier,
   zero baseline, owner entitlement field, and explicit review-window trigger,
   while the separate credential envelope contains no ledger metadata drift.
5. Inspect the relevance-weight contract as a first-class finding. The Memory
   UI and API accept fractional values (`0.1..5`, including the approved
   `1.25`), while `memory_items.relevance_weight` is currently integer and the
   create service rounds to an integer. Determine whether the retained `1`
   readback is truthful product behavior or a partner-pass blocker. If the
   public product promises fractional precision that cannot persist, block and
   specify the smallest source/migration repair plus exact retained-row
   correction; do not normalize the mismatch away in the result.
6. Confirm no chat/provider call occurred and that Gemini remained embeddings
   only. Missing non-NVIDIA chat configuration is not a corpus-review blocker.

## Mutation Boundary

This is read-only except for ordinary sign-in/session effects needed to prove
the dedicated and cross-owner boundaries. Do not apply migration `085`, deploy,
alter a Memory weight, create public corpus, call chat, configure a provider,
or clean up the retained corpus. If a failed probe creates a disposable Auth
session, revoke only that exact session and record the cleanup privately.

## Result And Handoff

Create:

`docs/roadmap/PR528C3_PRIVATE_PARTNER_CORPUS_REVIEW_ARGUS_RESULT.md`

Use one exact verdict:

```text
ACCEPT_PR528B4_PRIVATE_PARTNER_CORPUS_RETAINED_FOR_REVIEW
BLOCK_PR528B4_PRIVATE_PARTNER_CORPUS_<EXACT_REASON>
```

Commit and push public-safe evidence only, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS independently reviewed the retained PR528 private partner corpus.
Verdict:
- ACCEPT_PR528B4_PRIVATE_PARTNER_CORPUS_RETAINED_FOR_REVIEW (or exact blocker)
Task:
- Route any smallest correction, otherwise proceed to serialized summary migration/deployment.
```
