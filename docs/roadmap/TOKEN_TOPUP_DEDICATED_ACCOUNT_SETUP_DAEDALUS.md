# Token Top-Up Dedicated Proof Account Setup - DAEDALUS

Opened by: MIMIR / A1
Owner: DAEDALUS / A2
Date: 2026-06-27
Status: complete - see `docs/roadmap/TOKEN_TOPUP_DEDICATED_ACCOUNT_SETUP_RESULT.md`

## Context

ARIADNE's dedicated-account rerun blocked:
`docs/roadmap/TOKEN_TOPUP_TESTMODE_PROOF_RERUN_RESULT.md`.

Verdict:

```text
BLOCKED - NEEDS DEDICATED PROOF ACCOUNT
```

The fresh hosted signup account was dedicated and non-production, but Station
readback showed Visitor/Free with no available top-up packs. That means the
remaining blocker is not token top-up behavior. The blocker is arranging one
explicitly dedicated Basic/private proof account outside the top-up proof lane.

MIMIR does not waive the dedicated-account requirement.

## Task

Find the safest setup path for one dedicated non-production Basic/private proof
account that can be used for a later ARIADNE token top-up rerun.

Do not perform hosted setup yet unless this document explicitly authorizes it.
It does not. This is a setup-map lane.

Inspect current code/docs for:

- how signup creates Visitor/Free profiles;
- how Basic/private tier is represented in `profiles`;
- whether an existing safe test/seed/admin route exists for proof account tier
  setup;
- whether test-mode subscription Checkout would be the only ordinary UI path;
- whether any Supabase/service-role/manual profile update would require ARGUS
  preflight before mutation;
- whether a user-provided Basic/private proof account is the only safe path.

Produce:

- `docs/roadmap/TOKEN_TOPUP_DEDICATED_ACCOUNT_SETUP_RESULT.md`

Use one verdict:

```text
READY FOR ARGUS SETUP PREFLIGHT
NEEDS USER-PROVIDED BASIC PROOF ACCOUNT
NO SAFE SETUP PATH
NEEDS MIMIR DECISION
```

## Required Result Shape

Include:

- Recommended setup path.
- Why it is safer than the alternatives.
- Exact mutation boundaries if a setup mutation is needed.
- Whether ARGUS must preflight before setup.
- Whether ARIADNE can run setup through ordinary hosted UI/auth flow.
- Whether setup would touch PR181/subscription activation semantics.
- What selected evidence can be recorded without raw ids, emails, secrets,
  Checkout URLs, Stripe objects, SQL rows, hosted logs, or screenshots.

## Boundaries

Do not:

- mutate hosted data;
- create, promote, or modify accounts;
- run Checkout;
- inspect Stripe dashboard objects;
- query SQL rows for evidence;
- print account emails, raw user ids, database ids, Stripe ids, credentials,
  cookies, auth headers, secrets, local env values, or hosted logs;
- broaden into live-money billing readiness, tax, invoices, coupons, Connect,
  deep usage billing, dynamic payment methods, or Stripe architecture work.

If the only safe answer is "user must provide a dedicated Basic/private proof
account", say that directly and wake MIMIR. Do not pretend the proof can close.
