# PR542 Institution Activity Privacy Correction - ARGUS Result

Owner: ARGUS / A3 -> ARIADNE / A4

Date completed: 2026-08-04

Corrected source: `47576f5b5e969d96888479d9d698dfba01772d06`

Status:

```text
ACCEPT_PR542_OPAQUE_CURSOR_AND_RELATIONSHIP_TRUTH_CORRECTION
READY_PR542_INSTITUTION_ACTIVITY_AND_AUDIT_READBACK_FOR_ARIADNE
```

## Verdict

ARGUS accepts the bounded PR542 correction and authorizes the existing ARIADNE
owner/member/unrelated/signed-out rehearsal. The correction closes both prior
findings: pagination no longer discloses a private audit-event id, and actor
relationships now follow supported membership and invitation history.

This acceptance does not close PR542, open PR543, or authorize roadmap,
infrastructure, schema, or unrelated UI work. Migration `098` remains
byte-identical. ARIADNE owns the next customer-facing proof.

## Resolved Findings

The opaque cursor contains only an event timestamp and same-timestamp ordinal.
The server validates that ordinal against the owner-scoped Institution boundary
before querying the next page, while retaining the internal `id` tie-breaker.
Focused eleven-event and hosted seven-event equal-timestamp fixtures traverse
every event exactly once. Whole-response and decoded-cursor scans against known
private ids remain clean; legacy id-bearing, malformed, zero, and out-of-bound
cursors fail with bounded `400` responses.

Relationship labels now distinguish active members, invitees, accepted-history
former members, past Institution contacts, and Station users with no membership
row. Owner and system labels remain explicit. No admin flag, raw actor id, or
private profile field enters the response.

## Comparison With DAEDALUS

DAEDALUS's corrected result accurately names source `47576f5b` and reports the
same cursor, relationship, authorization, restoration, and deployment truth.
ARGUS independently inspected the three-file source delta, reran focused and
static gates, and repeated the decisive hosted cursor and operator probes. The
submitted and independent results agree.

No Cloudflare, hosted-runtime architecture, queue, partner adapter, billing,
provider, schema, or unrelated UI behavior entered the correction.

## Validation

| Command or proof | ARGUS result |
| --- | --- |
| API/web deployment identity | Exact `47576f5b5e969d96888479d9d698dfba01772d06` on both services |
| Migration `098` identity | SHA-256 `14277E34E4B02439E1888EB2F9197310CE10C2B07B35B67668C8DBF7529E58EE`; hosted ledger/exact ledger `1/1` |
| Source scope | Pass; route, focused tests, and shared response type only |
| `test:institution-activity` | Pass, `23/23` |
| Independent decoded-cursor probe | Pass; JSON contains timestamp, no UUID, and no private event-id match |
| Hosted operator proof | Pass; owner `200`, anonymous `401`, member/hostile states `404`, six domains, equal-timestamp correction proof, atomic rollback, and safe missing-resource behavior |
| Final hosted state | Retained events `58`; Institution Project/audit `1/1`; Space `8`; proof Project/report residue `0/0` |
| Root typecheck; web lint | Pass; zero lint warnings/errors |
| Source hygiene | Migration hash exact; correction diff limited to three source files; `git diff --check` passes |

DAEDALUS's broader neighboring-suite, responsive-browser, frozen-install, and
root-build receipts remain submitted evidence. ARGUS did not rerun those
unchanged checks after the focused correction gates and decisive hosted proof
passed.

## Baton

ARIADNE owns the already specified independent PR542 owner/member/unrelated/
signed-out rehearsal at exact source `47576f5b`. Preserve migration `098`,
retained data, owner-only readback, cursor privacy, and final restoration;
report a public-safe pass or exact blocker, then wake MIMIR. Do not open PR543
from this acceptance.
