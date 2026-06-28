# PR462 - Hosted Studio Quota Readback Confirmation Result

Date: 2026-06-28

Reviewer: ARIADNE / A4

Status: complete - pass

## Verdict

```text
PASS
```

Hosted `/studio` no longer shows the synthetic Studio dashboard quota-like
metric from PR460. The replacement panel routes owners to authoritative usage
surfaces without computing quota, token, storage, or entitlement state locally.

## Deployment Gate

Hosted deployment freshness passed:

| Surface | Result | Service | Runtime commit |
| --- | --- | --- | --- |
| Web `/health/deployment` | HTTP 200, ready | `@station/web` | `187996cd` |
| API `/health/deployment` | HTTP 200, ready | `@station/api` | `187996cd` |

The web runtime is at the required PR461 product/review commit. API health was
recorded as a cheap companion check.

## Rehearsal Evidence

The rehearsal used the replay-owner account and sampled hosted `/studio` on
desktop and 390px mobile.

Results:

- Replay-owner hosted API sign-in and session verification passed.
- `/studio` returned HTTP 200 on desktop and 390px mobile.
- The dashboard shows the replacement `Authoritative Usage` panel.
- The replacement panel includes Billing, Settings, and Archive route cards.
- The Billing card routes to `/billing` for plan, subscription, entitlement
  limits, and token-credit separation.
- The Settings card routes to `/settings` for token-credit and storage usage
  readbacks.
- The Archive card routes to `/studio/archive` as the owner-wide Archive source
  surface, not as the storage meter.
- `/studio` no longer shows `Tier allocation`.
- `/studio` no longer shows the former `Usage Stats This Month` block.
- `/studio` no longer shows the synthetic monthly counters for conversations,
  archive items, published posts, or a local quota percentage.
- `/billing`, `/settings`, and `/studio/archive` opened successfully from the
  replacement route targets on desktop and 390px mobile.
- Desktop and 390px mobile layouts had no horizontal overflow, clipped controls,
  or overlapping labels in the sampled route set.
- Visible text did not expose raw identifiers, customer ids, subscription ids,
  payment secrets, provider payloads, credentials, storage paths, stack traces,
  or secret-shaped material.

## Notes

This was a read-only hosted visual confirmation. It did not open Stripe
Checkout, customer portal, payment links, provider setup, exports, imports,
uploads, publishing, destructive actions, or private model flows.

No screenshots, cookies, session values, raw owner ids, customer ids,
subscription ids, payment secrets, private source bodies, prompts, completions,
provider keys, stack traces, or raw network payloads were committed.

## Validation

- Hosted web `/health/deployment`: passed at required runtime.
- Hosted API `/health/deployment`: passed as companion health check.
- Replay-owner hosted API sign-in/session check: passed.
- Desktop `/studio` replacement panel check: passed.
- 390px `/studio` replacement panel check: passed.
- Billing, Settings, and Archive replacement route checks: passed.
- Synthetic Tier allocation absence check: passed.
- Synthetic monthly usage counter absence check: passed.
- Layout overflow/control clipping checks: passed.
- Raw-id, billing-id, stack trace, storage path, credential, payment-secret, and
  secret-shaped visible text checks: passed.
- `git diff --check`: passed with line-ending normalization warnings only.
- Typecheck: not run; this result only updates docs and agent state.
