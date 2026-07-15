# PR527D2 - Forum Reply Count Truth Closeout

Owner: MIMIR / A1

Date closed: 2026-07-15

Status:

```text
CLOSE_PR527D2_FORUM_REPLY_COUNT_TRUTH_ACCEPTED_WITH_DISCOVER_CONTRACT_CAVEATS
```

## Decision

PR527D2 is closed accepted. The original visible defect is fixed: the existing
public replay document reports `2 replies`, its linked Forum thread reports
`2 replies` while exactly two active reply cards render, and the Forum
category card reports `2 replies`. Those values survive refresh at desktop
and mobile.

Migration `083` is durably applied. The hosted database has `12/12` canonical
thread counters, zero counter/hot-score/negative/future-activity mismatches,
one honest migration ledger row, the accepted trigger/guard/constraint/index
and privilege shape, and zero tagged fixture residue.

## Accepted Evidence

### Local contract and correction

- ARGUS accepted database-trigger ownership of active, non-hidden thread reply
  truth with all-thread reconciliation.
- The first implementation review found caller-writable comment time could pin
  parent activity.
- PR527D2A corrected that boundary: only an actual visible insert can advance
  activity, using trusted database statement time; updates cannot replay it.
- Exact migration execution passed `30/30`, wrong-owner application fails
  closed, and focused community/document/report/API validation passes.

### Hosted apply and independent review

- DAEDALUS applied the exact checked-in migration at SHA-256
  `DA4BBF4021723768F9DCEC41E0AD91C6FA4D909BAE17012B72FDF0462907C44B`.
- One honest `083_forum_visible_reply_count_integrity` ledger row was recorded.
- The pre-existing one-thread undercount and one-thread overcount reconciled;
  no product row was hand-edited.
- A bounded disposable lifecycle proved route/direct replies, hide/unhide and
  repeated transitions, remove/restore, soft/hard delete, no-write shim,
  failed-write rollback, trusted activity, hot-score coherence, and cleanup.
- ARGUS independently confirmed the exact hosted catalog, owner/privilege
  boundary, `12/12` aggregate, linked discussion count, and zero residue using
  read-only probes.

### Human readback

ARIADNE followed the public route at `1440x900` and `390x844`. Document,
thread summary, rendered replies, category card, refresh persistence, visual
fit, navigation, and diagnostics pass with zero hosted writes.

## Discover Evidence Limits

Two existing Discover contracts are retained honestly:

1. Discover search exposes no reply-count field. It proves findability only.
2. The unified Discover feed deliberately excludes linked Forum threads with
   `threadRows.filter((thread) => !thread.linked_document_id)` so a linked
   document and its discussion are not duplicated as separate feed cards.
   The existing replay document therefore appears as `Discussion open`, while
   its linked thread has no feed card on which a human can read a count.

The absence is not a stale or incorrect count. DAEDALUS separately proved
reply-count agreement through Discover rising with an eligible standalone
thread, and ARGUS independently confirmed a current eligible public thread
agrees through rising, thread detail, and category listing.

PR527D2 does not add a reply count to search, duplicate linked discussions in
the feed, or change the document-card contract. Any future Discover product
change requires its own numbered response/UI lane.

## Durable Hosted State

```text
threads=12
canonical_counter_matches=12
counter_mismatches=0
hot_score_mismatches=0
negative_counts=0
future_activity_rows=0
canonical_visible_replies=6
migration_083_ledger_rows=1
tagged_fixture_residue=0
```

No connection value, credential, token, cookie, identity, private content,
row id, or raw response is retained in this closeout.

## Scope

PR527D2 changed the database-owned reply-count integrity contract, the
pre/post-migration API compatibility comment/error boundary, focused tests,
and roadmap evidence. It did not change Forum visibility, moderation, copy,
theme, composer, Discover response contracts, auth, tier, billing, providers,
queues, Cloudflare, Redis, Railway configuration, or PR527E.

## Next

Resume the ranked PR527 programme with PR527E Persona Profile Truth And Theme
Repair. Its first step is an ARGUS read-only boundary preflight so working
avatar, anonymous-chat, handoff, continuity, archive, and Integrity behavior
is preserved while false identity/visibility management claims and the fixed
dark presentation are isolated.
