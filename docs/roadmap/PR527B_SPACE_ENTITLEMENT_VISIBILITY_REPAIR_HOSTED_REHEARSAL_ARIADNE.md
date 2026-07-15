# PR527B - Space Entitlement And Visibility Repair Hosted Rehearsal

Owner: MIMIR / A1 -> ARIADNE / A4 -> MIMIR / A1

Date opened: 2026-07-15

Accepted review SHA:

```text
a36f55d0ecd4
```

Status:

```text
REHEARSE_PR527B_SPACE_ENTITLEMENT_VISIBILITY_ON_HOSTED
```

## Purpose

Prove that the accepted PR527B boundary is deployed and truthful for the
current replay owner without creating a Space or changing billing state.

ARGUS accepted the local implementation with a narrow patch:

- `docs/roadmap/PR527B_SPACE_ENTITLEMENT_VISIBILITY_REPAIR_ARGUS_RESULT.md`

This hosted rehearsal is negative, no-write proof only. It may prove that the
current Private-tier owner sees the correct unavailable state. It may not claim
that entitled Space creation, editing, public readback, or cleanup works.

## Deployment Gate

Before opening a browser case, require both hosted Railway services to report:

- HTTP `200` readiness;
- `ok: true` and `ready: true`;
- branch `main`;
- exact accepted code SHA
  `a36f55d0ecd4` or the full matching commit id.

If either service reports an older code SHA, keep waiting. Do not classify a
stale deployment as a product failure and do not patch production during the
rehearsal.

## Locked Hosted Cases

### Signed Out

With fresh signed-out browser state:

1. Open `/space/new` directly.
2. Require the existing login redirect with return path `/space/new`.
3. Confirm no owner tier, Space count, builder field, visibility control, or
   `Create Space` command is disclosed.

### Replay Owner

Using the accepted replay-owner credential without printing or committing it:

1. Open `/space/new` independently in every required case.
2. Require `Creator tier required` and the exact accepted explanation that
   Space creation is unavailable at the currently verified tier and no Space
   was created.
3. Require exactly these two product commands:
   - `Review plan details` -> `/billing`
   - `View My Spaces` -> `/space`
4. Confirm there is no `form`, editable field, Theme/Layout/Visibility control,
   miniature preview, or `Create Space` command.
5. Follow both commands and confirm they reach real owner-safe Billing and My
   Spaces routes without changing subscription, plan, or Space state.
6. Refresh `/space/new` and require the same authoritative unavailable state.

If the replay owner's current verified tier unexpectedly permits Space
creation, stop without submitting. Return
`BLOCK_PR527B_REPLAY_OWNER_ENTITLEMENT_CHANGED`; do not turn this no-write run
into a positive lifecycle test.

## Appearance Matrix

Run the replay-owner unavailable state in all nine combinations:

| Preference | Viewports |
| --- | --- |
| System | `1440x900`, `390x844`, `375x812` |
| Light | `1440x900`, `390x844`, `375x812` |
| Dark | `1440x900`, `390x844`, `375x812` |

For every case prove:

- preference and resolved-theme attributes match the selected treatment;
- page canvas, text, links, and focus use semantic Station theme treatment
  with no fixed-dark residue;
- all exact copy and both commands fit without overlap or clipping;
- keyboard focus is visible and both commands have exact accessible names;
- key text/action contrast is at least `4.5:1`;
- document-level horizontal overflow is zero;
- page errors and unclassified console errors are zero.

Inspect at least desktop Light, desktop System-resolved Dark, `390px` Light,
and `375px` Dark with a human eye. Screenshots remain temporary and uncommitted.

## Mutation And Privacy Boundary

Across the full rehearsal:

- assert zero `POST /spaces` requests;
- perform no Space, page, document, billing, checkout, subscription, profile,
  or entitlement write;
- do not enter Stripe Checkout or submit any form;
- require no cleanup because no product state is created;
- record only safe counts, route labels, classifications, and exact code SHA;
- do not print or commit credentials, cookies, tokens, owner ids, private
  content, checkout/portal URLs, screenshots, browser storage, or response
  payloads.

Expected auth refresh traffic is not a product mutation, but classify it
separately and confirm it carries no Space operation.

## Result And Verdict

Create:

```text
docs/roadmap/PR527B_SPACE_ENTITLEMENT_VISIBILITY_REPAIR_HOSTED_REHEARSAL_ARIADNE_RESULT.md
```

Return exactly one verdict:

```text
PASS_PR527B_SPACE_ENTITLEMENT_VISIBILITY_REPAIR_HOSTED_REHEARSAL
BLOCK_PR527B_<EXACT_DEPLOYMENT_AUTH_PRODUCT_OR_EVIDENCE_BLOCKER>
```

On pass, classify J07 as `BLOCKED_HOSTED_DEPENDENCY` on a separately accepted
entitled disposable Space lifecycle and cleanup contract. Do not classify the
whole journey as passed or truthfully unavailable.

Commit the evidence-safe result and wake MIMIR. Do not patch the product,
create a hosted Space, or return to foreground wait without a committed
response.

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR527B exact-SHA no-write hosted rehearsal.
Verdict:
- <pass or exact blocker>
Task:
- Close or route PR527B from the hosted verdict.
- Keep the wider PR527 correction programme moving to the next ranked slice.
```
