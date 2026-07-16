# PR528B11 - Accepted Search Deploy And Public Corpus Completion DAEDALUS Result

Owner: DAEDALUS / A2

Date completed: 2026-07-16

Status: Exact approved public chain retained; ready for independent ARGUS review

```text
READY_PR528B11_PUBLIC_PARTNER_CORPUS_FOR_ARGUS
```

## Accepted Deployment Binding

The hosted API and web both report the exact ARGUS acceptance head:

```text
6794ac996d416d023aa729a8293918251776aad3
```

The pre-write gate proved:

- API and web are ready on `main`;
- migration readiness is `025-086` with all seven proofs green;
- `fork/main` has no production-route change after the accepted head;
- the accepted and current Git blobs for `documents.ts` and `discover.ts` are
  identical;
- public document search uses the fixed `title`, `summary`, and `body` fields;
- document-id deduplication occurs before the global eight-result cap; and
- no redeploy or unrelated service trigger was needed.

Accepted route evidence:

| Route | SHA-256 prefix |
| --- | --- |
| `apps/api/src/routes/documents.ts` | `00E92803A075D9EE` |
| `apps/api/src/routes/discover.ts` | `C55D472EE7BEB179` |

## Zero-Write Gate

Before signup, the fresh hosted preflight found:

| Target | Count |
| --- | ---: |
| Profile username `station-guide` | `0` |
| Tagged public partner Auth owners | `0` |
| Space slug `continuity-field-notes` | `0` |
| Approved document slug | `0` |
| Approved document title | `0` |
| Approved customized thread title | `0` |
| Default `Discuss: ...` thread title | `0` |
| `documents-and-codexes` categories | `1` |

The same gate launched hosted Chromium successfully and probed all 51 required
public-owner forbidden table/column scopes with a zero UUID before any Auth or
product write.

The retained private Aster corpus was also reverified before the write:

- Memory weights remain `1.25`, `1.25`, and `1.5`;
- storage remains exactly `1145` bytes;
- 46 private-owner forbidden scopes remain zero, with the same two unavailable
  hosted connector scopes;
- anonymous and cross-owner private disclosure remains zero; and
- conversations, archived transcripts, traces, token transactions, and token
  use remain zero.

## Exact Product Sequence

DAEDALUS used normal Station product APIs for the public corpus sequence:

1. signed up and reauthenticated the dedicated `Station Guide` / `station-guide`
   owner;
2. applied only the approved private Auth metadata and controlled `creator`
   entitlement;
3. created the public `Continuity Field Notes` Space and its four normal default
   pages;
4. created the approved summarized essay with comments disabled;
5. published the document while comments remained disabled, creating no thread;
6. enabled comments through the owner document PATCH, which created exactly one
   linked helper discussion;
7. customized that same discussion through
   `PATCH /documents/:id/discussion`; and
8. signed the owner session out after verification.

`POST /forums/threads` was never called. No direct database product-data write
was used. Service-role writes were limited to the approved Auth metadata and
profile entitlement boundary.

## Retained State

The retained hosted state is exactly:

| Scope | Retained result |
| --- | ---: |
| Auth owner / profile | `1` / `1` |
| Token usage / storage usage trigger rows | `1` / `1` |
| Tokens used / top-up tokens / storage bytes | `0` / `0` / `0` |
| Space / standard pages | `1` / `4` |
| Current document / prior versions | `1` / `2` |
| Current document version | `3` |
| Linked discussion threads | `1` |
| Community profile rows | `0` |
| Comments | `0` |
| Explicit `discover_feed` rows | `0` |
| Public-owner storage objects | `0` |

Version history is exact:

- version `1` is the original public-visibility draft with comments disabled,
  no publication timestamp, and no discussion pointer;
- version `2` is the published public document with comments still disabled and
  no discussion pointer; and
- current version `3` has comments enabled and points to the one approved
  discussion.

The current document remains `user_authored` / `manual`, public, attached to the
approved Space, and has genuine operation timestamps. The linked thread remains
public, active, visible, normally moderated, user-authored, and attached to the
same Space and document. It has zero score, comments, reports, pins, watches,
witnesses, or other engagement.

## Anonymous Readback

One retained run and one separate read-only replay both passed all seven
required anonymous surfaces:

1. Latest Discover;
2. public Space;
3. public document;
4. document discussion link;
5. thread detail;
6. exact document-title search; and
7. canonical body-phrase search using
   `leave enough room for the next conversation to matter`.

Both searches returned the same document exactly once. Latest Discover used the
approved summary as its excerpt, the public Space returned the summary and body
separately, and the linked thread did not appear as a duplicate standalone feed
item.

Headless Chromium independently followed the visible route chain:

```text
/discover
  -> /space/continuity-field-notes/documents/<retained-document>
  -> /forums/documents-and-codexes/<retained-thread>
```

It also loaded the public Space directly and proved that at least one document
card uses the first-class summary excerpt while the document page renders the
summary separately from the canonical body.

## Privacy And Forbidden Writes

Final and replay verification proved:

- all 51 available public-owner forbidden scopes contain zero rows;
- the same two connector scopes remain unavailable in the hosted schema;
- no public persona, Memory, archive, continuity, integrity, provider, chat,
  trace, billing, top-up, subscription, notification, moderation, project,
  Developer Space, export, connector, seminar, encounter, or Cloudflare state
  was created;
- no public-owner storage object exists;
- no explicit Discover promotion row exists; and
- the private Aster owner/corpus remains exact and read-only at `1145` bytes,
  with zero private forbidden rows and zero provider-token use.

Credentials, tokens, owner/corpus ids, private timestamps, and encrypted ledger
contents remain ignored and local-only.

## Cleanup Safety Rehearsal

The first operator execution completed the product chain but its browser proof
selected the first Space document link, which is a reading-path link without an
excerpt. The operator treated that proof failure as fatal and removed the full
public owner.

After cleanup, a strengthened audit proved all of the following were zero:

- target username, slug, title, and Auth collisions;
- allowed owner rows across profile, Space, document, version, thread,
  community-profile, token, and storage scopes;
- all 51 forbidden owner scopes; and
- owner storage objects.

The selector was then narrowed to inspect every matching Space document link.
DAEDALUS discarded only the completed encrypted zero-state ledger and deleted
owner credentials, reran the complete pre-write gate with fresh credentials,
and performed the retained run documented above.

## Validation

| Check | Result |
| --- | --- |
| `node --check .station-private/pr528b11/operator.mjs` | Pass |
| Fresh PR528B11 preflight | Pass: exact accepted deployment, seven proofs, zero collisions |
| Retained PR528B11 run | Pass: exact approved chain retained |
| Separate `operator.mjs verify` replay | Pass: same aggregate receipt |
| Anonymous API acceptance | Pass: seven surfaces |
| Headless Chromium visible route chain | Pass |
| Public-owner forbidden scope audit | Pass: 51 checked, zero rows |
| Copied encrypted private Aster verifier, before and after | Pass |
| Cleanup safety rehearsal | Pass: zero target, allowed, forbidden, and storage residue |

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS bound exact accepted 6794ac99, completed the bounded Station Guide public partner corpus, and retained only one Space, one versioned summarized document, and one linked customized discussion.
- Both title and canonical-body search, all anonymous API surfaces, the visible browser chain, 51 public-owner forbidden scopes, and the private Aster invariant pass on a separate replay.
Verdict:
- READY_PR528B11_PUBLIC_PARTNER_CORPUS_FOR_ARGUS
Task:
- Route ARGUS independent hosted deployment/corpus review before ARIADNE human rehearsal.
```
