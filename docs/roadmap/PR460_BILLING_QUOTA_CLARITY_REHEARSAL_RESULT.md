# PR460 - Billing and Quota Clarity Rehearsal Result

Date: 2026-06-28

Reviewer: ARIADNE / A4

Status: complete - product defect needs DAEDALUS

## Verdict

```text
PRODUCT_DEFECT_NEEDS_DAEDALUS
```

Billing, Settings, signed-out Pricing, and Archive quota readbacks are clear
enough in the sampled hosted surfaces. The Studio dashboard still contains one
quota-like readback that is not server-authoritative and should be fixed before
this lane closes cleanly.

## Deployment Gate

Hosted deployment freshness passed:

| Surface | Result | Service | Runtime commit |
| --- | --- | --- | --- |
| Web `/health/deployment` | HTTP 200, ready | `@station/web` | `e3809f0a` |
| API `/health/deployment` | HTTP 200, ready | `@station/api` | `e3809f0a` |

Both hosted surfaces were at the required PR457 product commit.

## Rehearsal Evidence

The rehearsal used the replay-owner account and sampled 10 route/viewport
combinations across desktop and 390px mobile.

Routes sampled:

- signed-out `/pricing`
- `/settings`
- `/billing`
- `/studio`
- replay persona Archive/files

API readbacks sampled:

- `/billing/me`
- `/storage/me`
- `/token-credits/me`

Results:

- Replay-owner hosted API sign-in and session verification passed.
- Billing, storage, and token-credit API readbacks returned HTTP 200.
- Signed-out Pricing explained start/upgrade paths and Stripe-hosted plan-change
  boundaries without layout overflow.
- Settings exposed Billing & plan, Usage and Credits, Storage, and Profile
  Snapshot in a readable account surface.
- Billing showed current plan, available plans, disabled current/included plan
  buttons, Stripe subscription boundary copy, and the separate entitlement vs
  token-credit explanation.
- Persona Archive/files showed Storage and Quota with server-reported usage.
- Desktop and 390px mobile layouts had no horizontal overflow, clipped
  controls, overlapping labels, or hidden prices in the sampled route set.
- Visible text did not expose raw identifiers, customer ids, subscription ids,
  payment secrets, provider payloads, credentials, storage paths, stack traces,
  or secret-shaped material.

## Product Defect

Route:

```text
/studio
```

Viewport:

```text
desktop and 390px
```

Action or state:

```text
Read the Studio dashboard Usage Stats This Month panel.
```

Expected behavior:

```text
Quota or entitlement readbacks on Studio should either come from server-backed
Billing, Storage, or token-credit data, or clearly route the user to those
authoritative surfaces.
```

Actual behavior:

```text
The Studio dashboard shows a quota-like Tier allocation percentage that is
derived locally from persona count rather than server billing/quota state. On
390px mobile, the dashboard does not show an equivalent storage or token usage
readback, so the visible quota language can feel invented and inconsistent with
Billing, Settings, and Archive.
```

Smallest recommended DAEDALUS patch lane:

```text
PR461 - Studio dashboard quota readback de-fake
```

Patch scope:

- In `apps/web/components/studio/studio-dashboard.tsx`, remove or replace the
  synthetic Tier allocation metric.
- Prefer a clear route to authoritative Settings/Billing/Storage readbacks, or
  reuse existing server-backed token/storage readback components if the current
  Studio layout supports them safely.
- Preserve the existing Billing page, Settings page, Archive/files quota panel,
  auth/session behavior, Stripe checkout/portal behavior, and API semantics.
- Validate desktop and 390px mobile Studio dashboard layout after the change.

## Notes

This rehearsal did not open Stripe Checkout, customer portal, payment links,
provider setup, exports, imports, uploads, publishing, destructive actions, or
private model flows.

No screenshots, cookies, session values, raw owner ids, customer ids,
subscription ids, payment secrets, private source bodies, prompts, completions,
provider keys, stack traces, or raw network payloads were committed.

## Validation

- Hosted web/API `/health/deployment`: passed at required runtime.
- Replay-owner hosted API sign-in/session check: passed.
- Billing/storage/token-credit API readback checks: passed.
- Signed-out Pricing desktop/mobile check: passed.
- Settings desktop/mobile check: passed.
- Billing desktop/mobile check: passed.
- Persona Archive/files quota desktop/mobile check: passed.
- Studio dashboard quota clarity check: product defect found.
- Layout overflow/control clipping checks: passed.
- Raw-id, billing-id, stack trace, storage path, credential, payment-secret, and
  secret-shaped visible text checks: passed.
- `git diff --check`: passed with line-ending normalization warnings only.
- Typecheck: not run; this result only updates docs and agent state.
