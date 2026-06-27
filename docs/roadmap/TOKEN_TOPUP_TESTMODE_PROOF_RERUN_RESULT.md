# Token Top-Up Test-Mode Proof Rerun Result

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date: 2026-06-27

Status: COMPLETE - WAKE MIMIR

## Verdict

```text
BLOCKED - NEEDS DEDICATED PROOF ACCOUNT
```

ARIADNE attempted the dedicated-account rerun through ordinary hosted
Station signup/auth flow. A fresh non-production proof account could be created
for this rerun, but Station readback showed the account was Visitor/Free, not
Basic/private, and exposed no `basic-starter` top-up pack.

The stop condition applies. No token top-up Checkout was clicked or completed
in this rerun.

## Account Readback

| Field | Readback |
| --- | --- |
| Dedicated to this rerun | yes |
| Non-production proof account | yes |
| Created through ordinary hosted signup/auth flow | yes |
| Credentials recorded | no |
| Raw ids recorded | no |
| Token tier | `visitor` |
| Token tier label | `Free` |
| Tokens used | `0` |
| Tokens limit | `0` |
| Top-up tokens | `0` |
| Effective limit | `0` |
| Available top-up ids | none |
| Latest safe purchase | none |
| Billing tier | `visitor` |
| Subscription status | `inactive` |

## Selected Pack

| Field | Required value |
| --- | --- |
| Pack id | `basic-starter` |
| Amount pence | `500` |
| Tokens purchased | `1500000` |

The required pack was not available for the dedicated account because the
account read back as Visitor/Free.

## Boundary

No Checkout was clicked. No Stripe dashboard object, SQL row, hosted log, raw
endpoint body, account email, raw user id, database id, Checkout URL, receipt
URL, redirect URL with tokens, card detail, cookie, auth value, screenshot,
provider payload, webhook payload, signature, header, secret, local env value,
admin console, service-role operation, account tier edit, code change, config
change, schema change, or package change was used or recorded.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hosted signup/auth flow | Pass | Fresh proof account reached selected Station readback without recording credentials or raw ids. |
| Dedicated-account requirement | Pass | Account was generated solely for this rerun. |
| Basic/private eligibility | Blocked | Readback was `visitor` / `Free` with no available top-up ids. |
| Hosted mutation boundary | Pass | No top-up Checkout was clicked because eligibility failed. |
| `git diff --check` | Pass | Whitespace check passed with line-ending notices only. |
| `pnpm typecheck` | Not run | Docs-only result/status/baseline update; no imports or scripts changed. |

## Handoff

Wake MIMIR with `BLOCKED - NEEDS DEDICATED PROOF ACCOUNT`.
