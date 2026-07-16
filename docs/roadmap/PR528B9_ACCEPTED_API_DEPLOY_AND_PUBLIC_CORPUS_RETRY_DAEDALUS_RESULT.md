# PR528B9 - Accepted API Deploy And Public Corpus Retry DAEDALUS Result

Owner: DAEDALUS / A2

Date: 2026-07-16

Status: Accepted deployment complete; public corpus blocked before first write

```text
BLOCK_PR528B9_DISCOVER_BODY_PHRASE_SEARCH_UNAVAILABLE_WITH_ZERO_PUBLIC_STATE
```

## Accepted Deployment

Railway automatically deployed the exact ARGUS-accepted source before the
hosted product-data phase began:

```text
f8349f09433bdee9dc8770a2623829cc8f03beb3
```

Read-only binding proved:

- API and web both report exact `f8349f09` and are ready;
- current `fork/main` differs from the accepted commit only in roadmap/status
  documentation;
- the runtime source-tree diff from `f8349f09` is empty;
- migration readiness remains `025-086`; and
- all seven migration proofs remain green.

No manual redeploy was needed, and no unrelated service was triggered merely
for activity.

## Preflight State

The pre-write collision gate remained clean:

| Target | Count |
| --- | ---: |
| Profile username `station-guide` | `0` |
| Space slug `continuity-field-notes` | `0` |
| Approved document slug | `0` |
| Approved document title | `0` |
| Approved customized thread title | `0` |
| Default `Discuss: ...` thread title | `0` |
| Tagged public partner Auth owners | `0` |
| `documents-and-codexes` categories | `1` |

The retained private Aster corpus was independently reverified against copied
DPAPI-encrypted PR528B6 evidence on the new deployment:

- the three Memory weights remain `1.25`, `1.25`, and `1.5`;
- all Memory, lifecycle, unrelated-row, storage-object, and storage-accounting
  invariants remain unchanged;
- anonymous and cross-owner private disclosure remains zero;
- 46 forbidden owner scopes remain zero, with the same two unavailable hosted
  connector scopes; and
- conversations, archived transcripts, traces, token transactions, and token
  use remain zero.

An ignored DPAPI-encrypted PR528B9 preflight ledger binds the accepted and
actual deployment identities, source equivalence, collision counts, private
invariant receipt hash, and zero-write blocker. No public-owner credential
envelope was created because signup never began.

## Exact Blocker

PR528B9 requires anonymous Discover validation by both exact document title and
a phrase from the approved document body.

The exact accepted `GET /discover/search` implementation cannot perform the
second check:

- public document search selects `body` and `summary` for serialization but
  filters rows only with `ilike("title", ...)`;
- forum thread search also filters only by title;
- Space search filters only by title; and
- both public web search entry points call this same `/discover/search`
  endpoint, with no alternate body-search path.

Static inspection of the exact accepted `discover.ts` source found four title
filters and zero body or summary filters. The approved document body is not an
alternate title, so a meaningful body-phrase query cannot return the document.

Creating the retained owner/corpus would therefore guarantee a failed required
acceptance check after hosted writes. DAEDALUS stopped before signup instead of
creating data that would immediately require cleanup or weakening the evidence
standard.

## Hosted Write Result

The accepted deployment remains live, but the PR528 public data state remains
exactly zero:

| Retained public scope | Rows created |
| --- | ---: |
| Auth/profile review owner | `0` |
| Token/storage trigger rows | `0` |
| Space / standard pages | `0` / `0` |
| Document / versions | `0` / `0` |
| Linked thread / community profile | `0` / `0` |
| Public persona / Discover feed rows | `0` / `0` |
| Comments, votes, Watches, witnesses, reports, notifications | `0` |
| Billing, provider, chat, traces, token transactions | `0` |

No cleanup was necessary. The target username, slugs, titles, and fixture role
remain available for a later authorized retry.

## Validation

| Check | Result |
| --- | --- |
| Railway active deployment inspection | Pass: API and web `SUCCESS` on exact `f8349f09` |
| API/web `/health/deployment` | Pass: both ready; migration `025-086`; seven proofs green |
| Runtime diff `f8349f09..fork/main` | Pass: empty |
| Hosted target collision and category preflight | Pass: seven target collisions zero; one category |
| Copied encrypted PR528B6 private verifier | Pass on `f8349f09` |
| Accepted Discover source inspection | Blocker confirmed: title filters present; body/summary filters absent |
| `git diff --check` | Pass |

## Decision Required

MIMIR must choose one bounded next step before public corpus creation:

1. authorize a narrow public-document Discover search repair for body and/or
   first-class summary, send it through ARGUS review, deploy it, then retry the
   corpus lane; or
2. explicitly revise PR528 acceptance to title-only search.

No search source patch, corpus write, or acceptance downgrade was assumed in
this lane.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS verified exact accepted f8349f09 is live and healthy, but stopped the PR528 public corpus before signup because accepted Discover search filters documents by title only and cannot satisfy the required body-phrase hit.
- All public fixture collisions and retained rows remain zero; private Aster invariants remain green.
Verdict:
- BLOCK_PR528B9_DISCOVER_BODY_PHRASE_SEARCH_UNAVAILABLE_WITH_ZERO_PUBLIC_STATE
Task:
- Reconcile the required body-phrase acceptance with the public Discover search contract before authorizing another corpus retry.
```
