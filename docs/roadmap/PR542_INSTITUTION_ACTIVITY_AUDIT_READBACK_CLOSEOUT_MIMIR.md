# PR542 - Institution Activity And Audit Readback Closeout

Owner: MIMIR / A1

Date closed: 2026-08-04

Status:

```text
CLOSE_PR542_INSTITUTION_ACTIVITY_AND_AUDIT_READBACK_ACCEPTED
```

## Decision

MIMIR accepts and closes PR542 on ARGUS's controlling privacy/truth review and
ARIADNE's independent owner/member/unrelated/signed-out rehearsal. The accepted
API and web source is
`47576f5b5e969d96888479d9d698dfba01772d06` on both Railway services.

Migration `098_institution_activity_audit_readback.sql` remains applied and
ledgered exactly once at SHA-256
`14277E34E4B02439E1888EB2F9197310CE10C2B07B35B67668C8DBF7529E58EE`.

## Accepted Customer Result

The owner of `Station Institutional Alpha` now has a private Activity workspace
with bounded summary counts and a typed newest-first timeline across identity,
team, Project, publication, Space, and community events. Owner shortcuts from
the related private workspaces lead back to that readback.

Active members and unrelated signed-in users receive the same bounded not-found
state and no Activity affordance. Signed-out access preserves the exact login
return path. The public Institution route exposes no Activity control.

## Privacy And Truth Corrections

ARGUS found and DAEDALUS corrected two material defects before rehearsal:

1. Continuation cursors now contain only an event timestamp and validated
   same-timestamp ordinal, with no recoverable private audit-event id.
2. Actor labels distinguish owner, active member, invitee, former member with
   accepted history, past Institution contact, and a Station user with no
   membership evidence.

The response remains allow-listed and contains no raw audit, actor, subject, or
resource ids; email, avatar, or private profile fields; or arbitrary event text.
Missing resources retain a generic label without an unsafe link.

## Hosted And Human Proof

The retained owner traversed all `58` events exactly once in pages of
`25 / 25 / 8`. Both cursors decoded to exactly `{ at, ordinal }`; whole-response
and decoded-cursor scans remained free of known private ids and UUIDs. Owner API
access returned `200`, anonymous access `401`, and active-member and unrelated
access `404`.

ARIADNE independently passed owner desktop/light, owner mobile/dark and
mobile/light, active-member, unrelated-user, signed-out, and public-boundary
journeys. The rehearsal was read-only, responsive, and free of unclassified
console, page, HTTP, product-request, loading, or session failures.

Final retained truth remained Institution events `58`, Institution
Project/audit `1/1`, Institutional Space version/audit `8/8`, and proof
Project/report residue `0/0`, with the complete before/after state object
byte-for-byte equivalent.

## Validation

Focused Institution Activity `23/23`, Institutions `20/20`, Projects `33/33`,
Institution publications `4/4`, Institution Spaces `6/6`, Institution Community
`20/20`, Community `59/59`, and AI settings `14/14` pass. Root typecheck and web
lint pass. The root build compiled, typechecked, and generated `42/42` pages
before the established local Windows standalone symlink `EPERM`; no application
compile or page-generation failure occurred.

## Programme Boundary

PR542 is closed. PR536 Institutional Alpha remains open only through PR543's
final coherent cross-role hosted rehearsal and programme closeout. This closeout
does not open, assign, or infer PR543.
