# PR527A Notes Truth Repair - Hosted Rehearsal Result

Date: 2026-07-15

Owner: ARIADNE / A4

Accepted review SHA: `77c66f9166d324d99804dde739a7487d3ad10173`

State:

```text
PASS_PR527A_NOTES_TRUTH_REPAIR_HOSTED_REHEARSAL
```

## Verdict

PR527A passes its locked hosted rehearsal.

`/studio/notes` is now `TRUTHFULLY_UNAVAILABLE`. It is not a working Notes
feature. Hosted Station no longer presents seeded faux notes, a local-only
editor, non-filtering search, or inert note/workflow commands. The direct route
instead explains exactly why Notes is unavailable and offers two real owner
destinations without carrying text or creating a data record.

## Exact Hosted Truth

The web and API deployment identities matched the accepted review SHA before
and after the browser matrix.

| Service | HTTP | Ready | Railway service | Branch | Exact SHA |
| --- | ---: | --- | --- | --- | --- |
| Web | `200` | `ok: true`, `ready: true` | `@station/web` | `main` | `77c66f9166d324d99804dde739a7487d3ad10173` |
| API | `200` | `ok: true`, `ready: true` | `@station/api` | `main` | `77c66f9166d324d99804dde739a7487d3ad10173` |

## Signed-Out Boundary

A fresh signed-out visit to `/studio/notes` redirected to:

```text
/login?redirect=%2Fstudio%2Fnotes
```

The login page rendered none of the Notes unavailable heading or route copy.
The redirect produced zero page errors. No public Notes alias or content path
was exposed.

## Locked Matrix

The replay owner opened the direct deep link independently in all nine required
cases. System used dark media and retained no explicit preference; explicit
Light and Dark persisted through refresh.

| Preference | `1440x900` | `390x844` | `375x812` |
| --- | --- | --- | --- |
| System -> Dark | Pass | Pass | Pass |
| Light | Pass | Pass | Pass |
| Dark | Pass | Pass | Pass |

Every case proved:

- preference and resolved-theme attributes matched the selected treatment;
- the fixed heading size was exactly `32px`;
- exact unavailable and Archive-separation copy survived refresh;
- the owner-only route context named `Notes unavailable`, no durable Notes
  storage, the former page-memory behavior, and `Open Global Archive`;
- the page contained exactly `Open Global Archive` and `Back to Studio`;
- no former seed title, editor, search field, form, button, content-editable
  region, formatting control, word count, `Pin`, `Archive`, `Draft post`, or
  `Attach` command appeared;
- neither desktop nor mobile general Studio inventory linked to Notes;
- keyboard-origin focus produced the visible `2px` action outline;
- action text fit, the two actions did not overlap, and key content remained
  inside the viewport;
- document-level horizontal overflow was zero.

## Destination Truth

| Command | Hosted readback |
| --- | --- |
| `Open Global Archive` | Reached `/studio/archive`. Global Archive remained a separate owner-only preserved-source view and contained none of the Notes route copy. |
| `Back to Studio` | Reached `/studio`. The desktop Studio destination inventory contained no Notes link or Notes label. |

No text field exists on the unavailable route, so neither destination received
or inferred route text.

## Visual Review

System-dark, explicit Light, and explicit Dark used the accepted semantic
Station frame colours. No fixed-dark Notes residue remained in Light.

| Pair | Minimum measured contrast |
| --- | ---: |
| Heading / page canvas | `15.16:1` |
| Paragraph / page canvas | `4.87:1` |
| Action / action background | `5.55:1` |

Human inspection of desktop Light, desktop System-dark, `390px` Light, and
`375px` Dark confirmed a coherent unframed status layout, readable line lengths,
stable actions, and no clipping or overlap. Temporary screenshots contain the
private owner shell and were not committed.

## Mutation And Diagnostics

- The Notes matrix emitted zero product/data write requests.
- Existing session maintenance emitted `25` `/auth/refresh` requests across
  repeated full-page owner transitions. These carried no Notes operation and
  did not create or alter a Notes, Archive, persona, document, or other product
  record.
- All nine cases had zero page errors and zero unclassified console errors.
- The scripted full-page transitions emitted `30` caught Next.js RSC-payload
  fallback diagnostics. Every destination completed normally. This is the same
  classified hosted navigation diagnostic accepted in PR525H, not a route,
  render, auth, or data failure.
- No cookie, token, credential, owner identifier, private persona/archive text,
  screenshot, or browser storage state is included in this result.

## Product Classification

The PR527 Notes route-family finding changes from `FAIL_PRODUCT` to:

```text
TRUTHFULLY_UNAVAILABLE
```

This closes the deceptive UI and silent-loss defect only. It does not claim
durable Notes storage, migration, deletion, recovery, retention, search,
formatting, Archive intake, or future Notes delivery. Global Archive remains
trust infrastructure separate from Notes.

## Validation

| Check | Result |
| --- | --- |
| Exact web/API deployment identity before and after | Pass |
| Signed-out direct-route redirect and no route content | Pass |
| Owner direct deep link | Pass |
| System/Light/Dark by `1440`, `390`, and `375` | Pass, `9/9` |
| Exact copy, route context, two destinations | Pass |
| Former seeds/editor/dead controls absent | Pass |
| Desktop and mobile Studio inventory removal | Pass |
| Destination navigation and Archive separation | Pass |
| Refresh, theme persistence, focus, contrast, clipping, overlap, overflow | Pass |
| Product/data writes | Pass, zero |
| Page errors / unclassified console errors | Pass, zero / zero |

PR527A is ready for MIMIR closeout. The wider PR527 product-completeness
programme remains open.
