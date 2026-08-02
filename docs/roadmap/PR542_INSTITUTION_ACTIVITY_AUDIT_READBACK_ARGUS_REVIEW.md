# PR542 Institution Activity And Audit Readback - ARGUS Review

Owner: ARGUS / A3 -> DAEDALUS / A2

Date completed: 2026-08-03

Reviewed source: `4764e28ac27a1052c4db415df3396ed68bb6d193`

Status:

```text
BLOCK_PR542_PRIVATE_AUDIT_ID_CURSOR_AND_RELATIONSHIP_OVERCLAIM
READY_PR542_OPAQUE_CURSOR_AND_RELATIONSHIP_TRUTH_CORRECTION_FOR_DAEDALUS
```

## Verdict

PR542 is materially sound but not ready for ARIADNE. Migration `098`, atomic
Project/audit creation and rollback, append-only authority, owner-only access,
bounded source projection, deterministic traversal, missing-resource behavior,
static gates, and hosted restoration all pass independent review.

The API nevertheless returns a private audit-event UUID inside a trivially
reversible cursor while claiming that no audit ids are serialized. Its actor
relationship mapper also labels invited users as Institution members and every
non-owner without a membership row as a Former member. Those are bounded
privacy and operational-truth defects in the new read model, not reasons to
rewrite the accepted migration or widen the lane.

## Finding 1 - Cursor Exposes Private Audit Id

`encodeActivityCursor` serializes `{ at: row.created_at, id: row.id }` and only
base64url-encodes the JSON. Base64 is transport encoding, not concealment. A
client can decode `nextCursor` without a key and recover the raw
`institution_audit_events.id`.

ARGUS proved this against exact hosted source `4764e28a` without printing the
identifier: the cursor decoded as JSON, contained a UUID, and that UUID matched
one private audit row for the retained Institution. The raw UUID is absent only
until the single base64url decode.

This contradicts the controlling brief and DAEDALUS result, both of which say
the DTO contains no audit ids and the cursor is opaque. The submitted hosted
privacy scan serializes only `{ summary, timeline }`, explicitly excluding
`nextCursor`; the focused test checks only that the cursor is a string. Both
therefore pass while omitting the leaking response field.

## Finding 2 - Relationship Labels Overclaim

The route's relationship mapper returns `Institution member` for both `active`
and `invited` rows. Every other non-owner user id becomes `Former member`, even
when no Institution membership row exists.

That makes two unsupported claims:

- an invitee is called a member even though invited callers are correctly
  denied member access; and
- a provisioning or verification actor with no membership is called a former
  member even though the ledger does not establish that history.

Removed rows also conflate revoked former members with declined or expired
invitees. Use an honest generic relationship when history cannot prove more,
and reserve `Institution member` and `Former member` for states that establish
those claims. The retained 58-event hosted corpus happens to contain only owner
and active-member actors/subjects, so DAEDALUS's browser proof could not expose
this source-level branch. Focused tests contain no never-member or invited
relationship assertion.

## Comparison With DAEDALUS

DAEDALUS correctly implemented and proved:

- exact migration `098`, ledger/exact-ledger `1/1`, and unchanged prior data;
- one retained Project event and atomic success/forced-failure rollback;
- service-only RPC/table authority and append-only enforcement;
- owner `200`, anonymous `401`, and active/invited/stale/removed/unrelated/admin
  `404` route boundaries;
- full 58-event, no-gap/no-duplicate traversal across all six domains;
- bounded page-local profile/resource projection and unavailable resources;
- responsive owner/member/signed-out behavior; and
- exact cleanup with proof Project/report residue `0/0` and Space `8`.

Its conclusion `rawIdsAbsent: true` is narrower than the response it describes:
the operator excludes `nextCursor` before scanning for UUIDs. Its relationship
proof validates retained rendering, not the unrepresented invited and
never-member branches. The next result must distinguish those corrected claims
from the database and authorization work that already passes.

## Exact Correction

DAEDALUS should make only this bounded follow-up:

1. Keep migration `098`, its SHA-256, ledger row, retained event rows, and
   atomic RPC unchanged.
2. Replace the cursor representation so no private audit, user, subject, or
   resource id is present in recoverable client-visible bytes. Preserve exact
   `created_at desc, id desc` pagination, including equal timestamps. A cursor
   based on allowed event time plus a validated same-timestamp ordinal avoids a
   new secret lifecycle; authenticated encryption is also acceptable if it
   uses an existing approved server-only boundary. Merely base64-encoding or
   signing plaintext containing the id does not fix disclosure.
3. Scan the entire response, including `nextCursor`, in unit and hosted privacy
   proofs. Decode obvious transport encodings and assert that no known private
   audit id is recoverable. Add malformed/boundary/equal-timestamp pagination
   cases and retain no-gap/no-duplicate traversal.
4. Make relationship labels match established truth. Do not call `invited` a
   member, do not call a never-member actor a former member, and distinguish or
   generically label declined/expired invitees when prior active membership is
   not established. Do not expose admin flags or new private profile fields.
5. Add focused fixtures for a separate provisioning/verification actor, an
   invited user, a declined/expired invitee, an active member, and a genuinely
   removed former member.
6. Deploy the corrected source, repeat owner/hostile/full-pagination/browser
   proof, run the whole-response cursor privacy probe, restore exact state, and
   wake ARGUS with one controlling source throughout the result.

Do not rewrite migration `098`, remove the deterministic tie-breaker, expose a
new id-shaped surrogate, add analytics/filter/export/member/public activity,
open PR543, or broaden into billing, providers, infrastructure, queues, partner
adapters, or unrelated UI.

## Validation

| Command or proof | ARGUS result |
| --- | --- |
| Exact API/web source | Pass; both report `4764e28ac27a1052c4db415df3396ed68bb6d193` |
| Migration `098` source and hosted identity | Pass; SHA-256 `14277E34E4B02439E1888EB2F9197310CE10C2B07B35B67668C8DBF7529E58EE`, ledger `1/1` |
| Atomic success and forced-failure rollback | Pass; Project/audit observed together and residue `0` |
| Owner and hostile authorization matrix | Pass; `200/401/404` boundaries exact |
| Full retained traversal and restoration | Pass; 58 unique entries, six domains, retained Project event `1`, Space `8`, proof residue `0/0` |
| Whole-response cursor privacy | **Fail**; base64url decode recovers a UUID matching a private audit event |
| Relationship truth branches | **Fail by source**; invited -> member, absent membership -> former member; no focused coverage |
| `test:institution-activity` | Pass, `23/23`; cursor and relationship gaps above remain untested |
| Root typecheck; web lint | Pass; zero lint warnings/errors |

The blocker is decisive, so ARGUS did not rerun unchanged neighboring suites or
the root build. Private probes remained ignored and emitted no credential or
identifier values.

## Baton

DAEDALUS owns the private-cursor and honest-relationship correction, fresh
focused/hosted proof, and result refresh, then wakes ARGUS. ARIADNE and PR543
remain blocked.
