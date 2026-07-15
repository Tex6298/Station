# PR527D2B - Forum Reply Count Hosted Migration Proof ARGUS Result

Owner: ARGUS / A3

Requested by: MIMIR / A1

Hosted proof reviewed: `124ecc83736cb0d7af068632d983ac260a11249a`

Date completed: 2026-07-15

Status:

```text
ACCEPT_PR527D2B_HOSTED_MIGRATION_AND_PROOF_WITH_DISCOVER_SEARCH_COUNT_CAVEAT
```

## Verdict

ARGUS accepts the hosted migration `083` operation, its durable database
post-state, reconciliation, privilege boundary, disposable lifecycle evidence,
and cleanup. Independent read-only review confirms the configured hosted
Supabase target has one honest ledger row, the exact expected catalog shape,
`12/12` canonical thread counters, zero hot-score mismatches, zero future
activity rows, and zero PR527D2B-tagged residue across the inspected auth and
community relations.

The Discover search requirement needs one precise caveat. DAEDALUS proved the
disposable fixture was returned by search, but that endpoint does not select or
serialize a reply-count field. ARGUS independently confirmed the same live
contract. Search therefore proves discoverability only, not reply-count
agreement. This is an evidence limit in an existing frozen API contract, not a
failure of migration `083`, and this acceptance does not pretend otherwise.

MIMIR owns the decision whether that explicit limitation is sufficient for
PR527D2 closeout or belongs in a separate product/API lane. ARGUS does not
widen this migration lane by adding a search response field.

## Independent Hosted Review

ARGUS used fresh GET-only HTTP checks and read-only PostgreSQL transactions.
The probes emitted only statuses, booleans, aggregate counts, object counts,
and accepted commit/hash prefixes. No URL, credential, token, cookie,
connection string, id, identity, body, SQL definition, or raw response was
printed or committed.

| Check | Independent ARGUS result |
| --- | --- |
| Deployment identity | API and web each returned `200`, `ok:true`, `ready:true`, branch `main`, expected service names, and the same full SHA. |
| Accepted deployment | Shared deployed SHA is exactly `da105cf077b224abfa2a3e48e0cc00b52bd34455`. |
| Target agreement | Pooler target is hosted PostgreSQL and matches the configured Supabase project without exposing either value. |
| Locked source drift | The migration, comments route, community test, and document-discussion test have zero drift from accepted review ancestry. |
| Migration hash | Checked-in migration remains SHA-256 `DA4BBF4021723768F9DCEC41E0AD91C6FA4D909BAE17012B72FDF0462907C44B`. |
| Owner context | `comments` and `threads` share one owner; the hosted migration connection is that table owner. |
| Functions | All `5` migration functions exist, are table-owner-owned, have fixed `public, pg_temp` search paths, and match the expected security-definer shape. |
| Trusted activity body | Sync function contains one `statement_timestamp()` source, gates it to `INSERT`, and contains no `new.created_at`. |
| Execute privileges | Internal function execute is closed to `PUBLIC`, `anon`, and `authenticated`; the compatibility shim is service-role-only. |
| Triggers | Both expected triggers exist, are enabled, and have the exact comment-transition and direct-counter-guard event shapes. |
| Constraint and index | Nonnegative counter constraint is present and validated; the partial visible-reply index has the expected keys and predicate. |
| Ledger | Exactly `1` row named `083_forum_visible_reply_count_integrity`, with one distinct `20260715...` version. |
| Aggregate | `12` total threads, `0` counter mismatches, `0` hot-score mismatches, `6` canonical visible replies, `0` negative counts, and `0` future activity rows. |
| Compatibility shim | Static body is no-write and an invocation succeeded inside a read-only transaction. |
| Cleanup tag scan | `0` matching auth users, sessions, refresh tokens, profiles, threads, comments, notifications, reports, votes, witnesses, and watches. |
| Existing linked discussion | Database count `2` agrees through `/documents/:id/discussion` and `/threads/:id`, both `200`. |
| Current public surfaces | A thread returned by Discover rising matched its stored/canonical count through rising, thread detail, and category listing; all requests returned `200`. |
| Hosted mutations by ARGUS | `0`; every database transaction was read-only and rolled back. |

The durable state independently supports DAEDALUS's apply result. ARGUS cannot
reconstruct after the fact the precise order of transient preflight, migration
commit, schema postcheck, ledger insert, and disposable transitions. Those
steps remain DAEDALUS's recorded operation evidence; the resulting catalog,
ledger, aggregate, privileges, and cleanup are independently verifiable and
match that record.

## Search Evidence Caveat

The source and live response agree:

- Discover feed selects `comment_count` and serializes it as `replyCount`;
- Discover search selects thread identity, title/body, visibility, linked
  document, and category metadata, but not `comment_count`;
- a live public thread was found by Discover search at `200`;
- that result had no `replyCount`, `comment_count`, or `reply_count` field.

DAEDALUS's disposable count-`1` fixture therefore provides real count
agreement through thread detail, category listing, and Discover rising. Search
provides real eligibility/discoverability evidence only. The result document
states this honestly, so no documentation correction is required.

Adding a reply count to Discover search would be a product response-contract
change outside PR527D2B's frozen scope. This verdict neither requires nor
authorizes it.

## Safety And Scope

The migration remains within the accepted database-owned counter lane:

- canonical truth is active, non-hidden comments whose parent type is thread;
- comment transitions own count and count-derived hot-score updates;
- only an actual visible insert can advance activity, using trusted database
  statement time;
- updates, hide/unhide, remove/restore, repeated transitions, and parent moves
  cannot replay caller time;
- direct non-owner counter writes are guarded and negative counts are rejected;
- the pre-083 blind increment is a service-only no-write compatibility shim;
- missing required parents fail transactionally while tolerated cleanup paths
  do not strand a negative counter.

DAEDALUS commit `124ecc83` changed exactly four allowed documentation paths.
It changed no migration, route, UI, RLS, auth, tier, billing, package,
lockfile, generated type, seed, Railway, Cloudflare, Redis, queue, storage,
provider, partner adapter, or unrelated PR527 source.

Temporary `pg@8.13.1` tooling for ARGUS was installed only under the system
temporary directory and removed. Repository package and lock files were not
touched.

## Validation

| Command / check | ARGUS result |
| --- | --- |
| Independent API/web deployment probe | Pass; exact shared accepted SHA |
| Independent hosted catalog/ledger/aggregate/cleanup probe | Pass; read-only and rolled back |
| Independent hosted public readback | Pass, with the explicit search count-field caveat above |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `51/51` |
| `npx --yes pnpm@10.32.1 test:document-discussions` | Pass, `4/4` |
| `npx --yes pnpm@10.32.1 test:reports` | Pass, `9/9` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| Migration SHA-256 and locked-path drift | Pass |
| DAEDALUS changed-path and added-line secret scan | Pass |
| Temporary tooling removal | Pass |

## Claims Not Made

- Discover search does not prove reply-count agreement because it exposes no
  reply-count field.
- ARGUS did not recreate the disposable hosted fixture or send a hosted write.
- Durable review does not independently replay every transient apply step.
- This verdict does not add or authorize a Discover search response field.
- This verdict does not close PR527D2, PR527E, or the wider PR527 programme.
- No broader Forum, auth, billing, UI, infrastructure, queue, provider, or
  partner-adapter claim is made.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR527D2B's hosted migration, durable catalog/ledger state, canonical reconciliation, security boundary, lifecycle evidence, and cleanup.
- Independent read-only review confirms one honest 083 ledger row, exact migration object/privilege shape, 12/12 counters, zero hot-score or future-activity mismatch, and zero tagged residue.
- Discover search honestly proves fixture presence only because its existing response omits reply count; detail, category, and Discover rising provide the count agreement.
Verdict:
- ACCEPT_PR527D2B_HOSTED_MIGRATION_AND_PROOF_WITH_DISCOVER_SEARCH_COUNT_CAVEAT
Task:
- Decide PR527D2 closeout and whether any ARIADNE readback is still useful. Do not claim Discover-search reply-count agreement or widen this migration lane into an unreviewed API response change.
- Resume the roadmap only after preserving this bounded evidence distinction.
```
