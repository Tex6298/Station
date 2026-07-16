# PR528B7 - Public Partner Corpus

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - bounded hosted public corpus lane

## Purpose

Create the small truthful public editorial chain selected by PR528A so Marty
and his partner can follow Station from Discover to a public Space, summarized
document, and linked forum discussion on the accepted hosted product.

## Authority

Execute only the public implementation packet, owner boundary, write allow-list,
retention ledger, and cleanup packet in
`PR528B2_PARTNER_CORPUS_PROVIDER_PREFLIGHT_ARGUS_RESULT.md`. Use the exact public
copy in `PR528B_PARTNER_CORPUS_CONTENT_BRIEF_MIMIR.md` and that packet.

The current API/web deployment is accepted on exact SHA
`c13d8ea0b30ce6637cc8499feef74492dd29330c`. Migrations `085` and `086` and all
seven deployment migration proofs are green.

## Required Sequence

1. Confirm zero current collision for username `station-guide`, Space slug
   `continuity-field-notes`, approved document slug/title, and approved thread
   title. Bind pre-run public/forbidden counts and deployment identity in an
   ignored DPAPI-encrypted ledger.
2. Create one dedicated public review owner through normal signup with visible
   identity `Station Guide` and username `station-guide`. Add only the private
   Auth purpose/role/cleanup metadata, then set exactly `creator` tier through a
   controlled service-role operation. Keep subscription inactive, Stripe fields
   null, admin false, and sign in again for current entitlement readback.
3. Through the owner product APIs, create exactly one public Space, the exact
   summarized draft with comments initially disabled, publish it with genuine
   server time, create exactly one linked `documents-and-codexes` thread, then
   enable comments so the discussion helper recovers that existing thread.
4. Require the first-class summary to persist separately from the unchanged
   canonical body and render on public document detail. Discover and Space
   excerpts must use the summary.
5. Validate anonymously through Latest Discover, exact-title and body-phrase
   search, public Space, public document, document discussion, and linked forum
   thread. Follow the route as a human chain as well as direct API readback.
6. Prove the document has normal `user_authored` / `manual` provenance, the
   thread has normal user-authored provenance, and every public visibility,
   comment/discussion, route, and authorship label is truthful.

## Write Boundary

Allowed retained product writes are exactly:

- one Auth/profile review owner plus trigger-maintained zero token/storage rows;
- one Space and its four standard Space pages;
- one document and normal version rows produced by create/publish/update;
- one linked thread and at most one normal community user profile.

Do not write `discover_feed`, a public persona, votes, comments, Watches,
witnesses, reports, pins, featured/staff state, notifications, billing, top-ups,
active subscription, provider/BYOK state, chat, traces, token transactions,
Developer Spaces, exports, connectors, queues, Cloudflare, or private-corpus
rows. Do not backdate or fabricate engagement.

## Privacy And Retention

- The existing private Aster owner/corpus and encrypted ledger are read-only
  invariants; require zero drift and zero cross-owner disclosure.
- Keep public-owner credentials separate from the cleanup ledger. Never print
  or commit credentials, owner/row IDs, private metadata, or private timestamps.
- Retain the public chain only through Marty and his partner's PR528 review.
  MIMIR will later order promotion/replacement or exact cleanup; silence is not
  promotion.

## Acceptance

- Exact public copy, summary/body separation, provenance, visibility, and one
  linked discussion read back correctly.
- Latest/search/Space/document/discussion/thread anonymous routes all succeed on
  the exact accepted deployment.
- Enabling comments recovers the existing linked thread and creates no second
  `Discuss:` thread.
- No private Aster content is disclosed or changed.
- Exact retained/forbidden write counts and encrypted cleanup coverage pass.
- No chat/provider/configuration or source change is required.

## Result And Handoff

Create:

`docs/roadmap/PR528B7_PUBLIC_PARTNER_CORPUS_DAEDALUS_RESULT.md`

Use verdict:

```text
READY_PR528B7_PUBLIC_PARTNER_CORPUS_FOR_ARGUS
```

Commit and push only public-safe aggregate evidence, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS created and verified the bounded public Station Guide partner chain.
Verdict:
- READY_PR528B7_PUBLIC_PARTNER_CORPUS_FOR_ARGUS (or exact blocker)
Task:
- Route ARGUS independent hosted public-corpus review before human rehearsal.
```
