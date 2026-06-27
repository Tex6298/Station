# Token Top-Up Proof Account Setup Tool Result

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date: 2026-06-28

Status: COMPLETE - WAKE MIMIR

## Verdict

```text
NO SAFE TOOL - NEEDS USER-PROVIDED BASIC PROOF ACCOUNT
```

## Decision

Do not add a Station-side proof-account setup tool for this lane.

The narrowest useful mutation would still create paid-tier eligibility outside
normal subscription activation. Current Station also cannot make that mutation
while satisfying the preferred safety shape in
`docs/roadmap/TOKEN_TOPUP_PROOF_ACCOUNT_SETUP_TOOL_DAEDALUS.md`.

The blocker is not merely lack of a convenient route. The repo does not yet
have all of these at once:

- a dedicated non-production deployment discriminator that proves the target
  database is not production;
- an existing audited entitlement-setup surface;
- an approved target-identification mechanism that avoids raw emails, raw ids,
  credentials, cookies, auth headers, SQL rows, hosted logs, or screenshots;
- a way to promote top-up eligibility without creating paid-tier readback
  outside PR181/subscription activation;
- a way to update `profiles.tier` without also touching token accounting rows.

## Required Questions

Should this be a CLI script, authenticated admin route, or no Station-side tool
at all?

No Station-side tool for this proof lane.

- A CLI script would need service-role credentials and a target selector. That
  is the same hidden authority ARGUS rejected, only wrapped in a repeatable
  file.
- An authenticated admin route would still be a general entitlement mutation
  surface unless it gained new setup-specific audit and deployment guardrails.
- A self-targeting route avoids raw target ids, but creates a disabled-by-env
  self-service paid-tier unlock. That is a worse user-risk boundary if the flag
  is mis-set or the setup secret leaks.

How does the mechanism prove it is non-production/test-only?

Current Station cannot prove that strongly enough for this mutation. An env
flag can make a route unavailable by default, but it does not prove that the
Supabase project behind the API is non-production. Adding a new deployment
identity/allowlist mechanism would be a broader setup-tool implementation lane,
not a small proof-account helper.

How does it identify exactly one target account without recording raw emails,
raw ids, credentials, cookies, auth headers, SQL rows, hosted logs, or
screenshots in committed docs?

There is no approved mechanism today.

- Targeting by raw id or email is disallowed for committed evidence and risky
  for agent handoff.
- Targeting "the currently authenticated user" avoids raw target identifiers,
  but it means any signed-in account with access to the enabled setup route can
  attempt to promote itself.
- A one-time setup code would add another secret-bearing path and would still
  need operator handling outside committed docs.

Can the target be "the currently authenticated user" to avoid raw target-id
handling, or does that create a worse user-risk boundary?

It creates a worse boundary. The target would be unambiguous, but the route
would be an entitlement-changing self-service path. Even if disabled by
default, that is too much latent authority for a proof fixture.

What audit trail exists after setup?

No appropriate audit trail exists for this action. The available durable rows
would show changed profile/accounting state, not a reviewed proof-account setup
event with lane, operator, target, before/after safety checks, and denial
reasons. Adding that audit surface would require schema/API design and ARGUS
review before use.

What prevents accidental use on live customer accounts?

Nothing strong enough in the current repo. Admin-only plus an env flag reduces
risk, but does not eliminate accidental staging/production mixups. A safe tool
would need a deployment identity guard, explicit allowlist, unavailable-by-
default configuration, and audit rows before mutation. That is beyond this
proof lane.

What prevents subscription status, Stripe customer/subscription fields, top-up
purchases, token transactions, or usage counters from changing?

Subscription and Stripe fields could be left unchanged by a careful update, and
top-up purchases/token transactions could be checked before mutation. Token
usage counters cannot be honestly promised untouched: migration
`014_integrity_questions_token_credits.sql` installs
`trg_profiles_token_usage_limit`, which runs after `profiles.tier` changes and
syncs the current `token_usage.tokens_limit` row.

That trigger is correct product behavior, but it means a "tier-only" setup
mutation is not actually isolated from token accounting state.

What selected Station readback would prove setup succeeded before ARIADNE
reruns Checkout?

If a user-provided account is available, selected safe readback remains:

- proof account dedicated: yes;
- proof account non-production: yes;
- token readback tier: `private`;
- token tier label: Basic/private;
- billing tier: `private`;
- subscription status: selected non-active value, expected `inactive`;
- available top-up ids include `basic-starter`;
- latest safe top-up purchase is empty, or MIMIR explicitly accepts existing
  purchase history.

## Smallest Account Ask

MIMIR should ask the user to provide or confirm one Station account that is
already eligible for the proof:

- dedicated only to the token top-up proof rerun;
- non-production;
- Basic/private in Station readback;
- not the dirty replay owner;
- not a subscription-activation proof account;
- no unaccepted existing top-up purchase history.

The user should not share credentials, raw ids, emails, cookies, auth headers,
SQL rows, screenshots, Stripe ids, Checkout URLs, receipt URLs, hosted logs, or
secrets in chat or committed docs. A later ARIADNE proof lane can use the
account through the hosted UI/auth flow and record only selected fields.

## If MIMIR Still Wants A Tool Later

Open a broader implementation lane before hosted mutation. That lane should
design and review:

- a deployment identity guard that can prove non-production;
- an explicit unavailable-by-default setup flag;
- a one-account allowlist that does not require committed raw ids or emails;
- durable setup audit rows with lane/operator/reason and selected before/after
  state;
- hard rejections for active/trialing subscriptions, Stripe subscription ids,
  existing top-up purchase history unless accepted, admin accounts, dirty replay
  owners, and subscription-activation proof accounts;
- tests proving no Stripe Checkout, subscription field, top-up purchase, token
  transaction, persona, Space, Developer Space, forum, export, provider, Redis,
  Cloudflare, queue, worker, credential, or raw evidence mutation occurs;
- ARGUS setup-tool review before ARIADNE uses it.

That is intentionally larger than this proof-account setup lane.

## Files Inspected

- `docs/roadmap/TOKEN_TOPUP_PROOF_ACCOUNT_SETUP_TOOL_DAEDALUS.md`
- `docs/roadmap/TOKEN_TOPUP_DEDICATED_ACCOUNT_SETUP_PREFLIGHT_ARGUS.md`
- `docs/roadmap/TOKEN_TOPUP_DEDICATED_ACCOUNT_SETUP_RESULT.md`
- `docs/roadmap/TOKEN_TOPUP_TESTMODE_PROOF_RERUN_RESULT.md`
- `apps/api/src/services/token-credits.service.ts`
- `apps/api/src/routes/token-credits.ts`
- `apps/api/src/services/billing.service.ts`
- `apps/api/src/routes/billing.ts`
- `apps/api/src/controllers/billing.controller.ts`
- `apps/api/src/lib/supabase.ts`
- `apps/api/src/lib/env.ts`
- `apps/api/src/app.ts`
- `apps/api/src/routes/token-credits.test.ts`
- `apps/api/src/routes/auth.test.ts`
- `infra/supabase/migrations/001_initial_schema.sql`
- `infra/supabase/migrations/014_integrity_questions_token_credits.sql`
- `infra/supabase/migrations/015_token_topup_grants.sql`
- `packages/config/src/tiers.ts`
- `scripts/staging-replay-seed.mjs`

## Validation

No code, schema, package, config, hosted data, Stripe state, account state, or
UI behavior changed in this lane.

Local checks:

- `git diff --check` - pass.
- `npm exec --yes pnpm@10.32.1 -- run test:auth` - pass, 20 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:token-credits` - pass, 3 tests.
