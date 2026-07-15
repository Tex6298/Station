# PR527B Space Entitlement And Visibility Repair - Hosted Rehearsal Result

Date: 2026-07-15

Owner: ARIADNE / A4

Accepted review SHA: `a36f55d0ecd4c7c5ecaaaaaf295a77cff9842810`

State:

```text
PASS_PR527B_SPACE_ENTITLEMENT_VISIBILITY_REPAIR_HOSTED_REHEARSAL
```

## Verdict

PR527B passes its locked exact-SHA, negative, no-write hosted rehearsal.

The current replay owner is still on the Private tier. `/space/new` truthfully
withholds the builder and Create command, explains that the verified tier does
not permit Space creation, and offers only the two accepted owner-safe
destinations. No Space or other product record was created or changed.

This verdict does not prove entitled Space creation, editing, public readback,
or cleanup. J07 remains `BLOCKED_HOSTED_DEPENDENCY` on a separately accepted
entitled disposable Space lifecycle and cleanup contract.

## Exact Hosted Truth

The web and API deployment identities matched the accepted review SHA before
and after the browser matrix.

| Service | HTTP | Ready | Railway service | Branch | Exact SHA |
| --- | ---: | --- | --- | --- | --- |
| Web | `200` | `ok: true`, `ready: true` | `@station/web` | `main` | `a36f55d0ecd4c7c5ecaaaaaf295a77cff9842810` |
| API | `200` | `ok: true`, `ready: true` | `@station/api` | `main` | `a36f55d0ecd4c7c5ecaaaaaf295a77cff9842810` |

## Signed-Out Boundary

A fresh signed-out visit to `/space/new` redirected to:

```text
/login?redirect=%2Fspace%2Fnew
```

The login route disclosed no owner tier, Space count, builder field, Theme,
Layout, Visibility, preview, or `Create Space` command. It emitted no product
write, page error, or console error.

## Replay-Owner Truth

Fresh authenticated reads agreed that the replay owner and billing status were
both Private tier. Every matrix case rendered the exact accepted heading and
body:

```text
Creator tier required

Space creation is not available for this account at its currently verified tier. No Space was created. Review plan details or return to your existing Spaces.
```

The notice exposed exactly two product commands:

| Command | Exact destination | Hosted readback |
| --- | --- | --- |
| `Review plan details` | `/billing` | Reached the authenticated Billing route and loaded current-plan truth without entering Checkout or changing subscription state. |
| `View My Spaces` | `/space` | Reached the authenticated My Spaces route without creating, editing, publishing, or deleting a Space. |

There was no `form`, editable field, Theme/Layout/Visibility control, miniature
preview, builder panel, or `Create Space` command. Refresh preserved the same
authoritative unavailable state in all nine cases.

## Locked Matrix

System used dark media with no stored explicit preference. Explicit Light and
Dark persisted through refresh.

| Preference | `1440x900` | `390x844` | `375x812` |
| --- | --- | --- | --- |
| System -> Dark | Pass | Pass | Pass |
| Light | Pass | Pass | Pass |
| Dark | Pass | Pass | Pass |

Every case proved:

- preference and resolved-theme attributes matched the selected treatment;
- semantic page canvas, text, action, and focus treatment changed correctly
  between Light and Dark with no fixed-dark residue;
- exact copy and both commands fit without clipping or overlap;
- both links retained exact accessible names;
- keyboard traversal reached `Review plan details` with a visible `2px`
  focus-visible outline;
- document-level horizontal overflow was zero;
- page errors and unclassified console errors were zero.

## Visual Review

Human inspection covered desktop Light, desktop System-resolved Dark, `390px`
Light, and `375px` Dark. All four showed a coherent unavailable-state layout,
readable line lengths, stable Station navigation, visible keyboard focus, and
commands that remained legible and separate.

| Pair | Minimum measured contrast |
| --- | ---: |
| Heading / page canvas | `13.96:1` |
| Body / page canvas | `13.96:1` |
| Action / action background | `5.55:1` |

Temporary captures included the private owner shell and remain uncommitted.

## Mutation And Privacy Boundary

- Browser traffic contained zero `POST /spaces` requests and zero product/API
  writes.
- The accepted run emitted zero `/auth/refresh` requests. Two replay-owner
  `/auth/signin` requests occurred across harness setup and its assertion-only
  retry; both were authentication operations and carried no Space action.
- Before/after Billing and owner-Space readback remained byte-for-byte stable
  under canonical comparison.
- No checkout, portal, subscription, billing, Space, page, document, profile,
  entitlement, or other product mutation was attempted.
- No cleanup is required because no product state was created.
- The accepted matrix emitted zero page errors, zero classified console errors,
  and zero unclassified console errors.
- No credential, cookie, token, owner id, private content, response payload,
  checkout URL, browser storage, or screenshot is included in this result.

## Product Classification

PR527B closes the specific hosted entitlement-truth check for the current
Private-tier owner. It does not reclassify the wider Space journey as passed or
truthfully unavailable.

```text
J07: BLOCKED_HOSTED_DEPENDENCY
```

The remaining dependency is a separately authorized Creator-or-higher,
disposable, no-private-data fixture with a locked create, edit, public readback,
and cleanup contract.

## Validation

| Check | Result |
| --- | --- |
| Exact web/API deployment identity before and after | Pass |
| Signed-out direct-route redirect and non-disclosure | Pass |
| Replay-owner Private-tier agreement | Pass |
| Exact unavailable copy and two destinations | Pass |
| Builder, form, visibility, preview, and Create command absent | Pass |
| Billing and My Spaces route readback | Pass |
| System/Light/Dark by `1440`, `390`, and `375` | Pass, `9/9` |
| Refresh, focus, contrast, clipping, overlap, and overflow | Pass |
| Human inspection of four required representative views | Pass |
| `POST /spaces` / product writes | Pass, zero / zero |
| Billing and Space state after rehearsal | Pass, unchanged |
| Page errors / unclassified console errors | Pass, zero / zero |

PR527B is ready for MIMIR closeout. The wider PR527 product-completeness
programme remains open.
