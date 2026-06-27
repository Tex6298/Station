# Token Top-Up Dedicated Proof Account Setup Result

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date: 2026-06-27

Status: COMPLETE - WAKE MIMIR

## Verdict

NEEDS USER-PROVIDED BASIC PROOF ACCOUNT

## Recommended Setup Path

Use one already-eligible, dedicated, non-production Basic/private proof account
provided outside the proof lane.

The account should be confirmed only by selected Station readback:

- dedicated to the token top-up proof;
- non-production;
- `tier: private` from `/auth/me` or `/token-credits/me`;
- Basic/private label from Settings/token-usage readback;
- `/billing/me.tier: private`;
- `/billing/me.subscriptionStatus: inactive` or another non-active value that
  MIMIR explicitly accepts;
- `/token-credits/me.availableTopups` includes `basic-starter`;
- latest safe purchase is empty, or MIMIR explicitly accepts existing purchase
  history for the rerun.

Do not create or promote the account in this setup-map lane. Do not ask Codex to
receive or print credentials. If the user has such an account, ARIADNE can use
the browser/auth flow in a later proof lane while recording only selected
fields.

## Why This Is Safer Than The Alternatives

Ordinary hosted signup is safe but insufficient:

- `apps/api/src/services/auth.service.ts` creates a Supabase auth user and then
  signs in.
- `infra/supabase/migrations/001_initial_schema.sql` defines
  `profiles.tier` with default `visitor`.
- `handle_new_user()` inserts the profile without a tier override, so the
  default Visitor/Free tier applies.
- ARIADNE already proved the consequence in
  `docs/roadmap/TOKEN_TOPUP_TESTMODE_PROOF_RERUN_RESULT.md`: fresh signup
  produced Visitor/Free with no available top-up packs.

Subscription Checkout is an ordinary UI path, but it is the wrong setup tool:

- `/billing/checkout` creates Stripe Checkout with `mode: "subscription"`.
- Successful subscription activation mutates subscription entitlement through
  the Stripe webhook path.
- PR181/subscription activation is already closed and must not be reopened just
  to manufacture a token top-up proof account.
- Running subscription Checkout would add paid-activation proof noise before
  the token top-up rerun and would violate this lane's boundary.

Manual profile tier mutation is possible in principle, but not safe here:

- A Supabase dashboard edit, SQL update, service-role script, or one-off admin
  helper would mutate hosted account state.
- No current Station API route exposes a narrow, audited, admin-only
  "make this proof account Basic/private" setup action.
- Any service-role or SQL path would need a separate ARGUS setup preflight with
  exact mutation boundaries before use.

The existing replay seed helper is not the right tool:

- `scripts/staging-replay-seed.mjs` is a broad staging replay corpus helper.
- It assigns `canon`, not Basic/private.
- It creates or updates replay owner state and seeds many product records.
- Reusing it for token top-up setup would broaden the proof and contaminate the
  dedicated-account requirement.

## Mutation Boundaries If MIMIR Opens Setup Later

Preferred path: no Station-side setup mutation.

If MIMIR rejects the user-provided-account path and wants Station-side setup,
ARGUS should preflight a separate setup mutation before it happens. The narrowest
conceivable mutation would be:

- exactly one dedicated non-production account;
- profile tier only, from `visitor` to `private`;
- no Stripe Checkout;
- no subscription activation;
- no `stripe_customer_id`, `stripe_subscription_id`, or
  `subscription_status` mutation;
- no token usage, top-up purchase, token transaction, storage, persona, Space,
  Developer Space, forum, export, provider, Redis, Cloudflare, or worker/queue
  mutation;
- selected evidence only after setup.

This result does not authorize that mutation.

## ARGUS Preflight Requirement

ARGUS preflight is required before any hosted setup mutation.

If the user supplies an already Basic/private dedicated account, ARGUS does not
need to preflight an account-setup mutation because there is no setup mutation
for the agents to run. ARGUS should still preflight the later hosted token
top-up proof/rerun packet before Checkout is clicked.

## ARIADNE Hosted UI/Auth Setup Viability

ARIADNE cannot create an eligible Basic/private proof account through ordinary
hosted signup alone. Signup creates Visitor/Free, and current top-up packs are
not exposed to Visitor/Free accounts.

ARIADNE can safely use ordinary hosted UI/auth flow only after the user provides
or confirms an already eligible Basic/private dedicated proof account. In that
later proof lane, ARIADNE should:

- sign in through hosted UI/auth;
- record selected eligibility/readback fields only;
- stop before Checkout if `basic-starter` is not available;
- avoid all admin consoles, SQL, service-role paths, Stripe dashboard objects,
  hosted logs, raw endpoint bodies, screenshots, raw ids, emails, credentials,
  cookies, and auth headers.

## PR181 / Subscription Activation Boundary

This setup path should not touch PR181/subscription activation semantics.

Do not use subscription Checkout to prepare the top-up proof account unless
MIMIR explicitly opens a new subscription setup lane. The token top-up rerun
should start with an already eligible Basic/private account and should prove
only payment-mode top-up Checkout plus Station readback.

## Selected Evidence Allowed

Allowed selected fields:

- proof account is dedicated: yes/no;
- proof account is non-production: yes/no;
- token readback tier: `private`;
- token tier label: Basic/private label;
- billing tier: `private`;
- subscription status: selected status only;
- available top-up ids: includes `basic-starter`;
- latest safe purchase: none, or selected safe summary if MIMIR accepts existing
  purchase history;
- no subscription Checkout/Portal/setup mutation run in this lane.

Forbidden evidence:

- account email;
- raw user id or database id;
- credentials or local env values;
- cookies or auth headers;
- Stripe ids or Dashboard objects;
- Checkout URLs, Portal URLs, receipt URLs, or redirect URLs;
- SQL rows, hosted logs, raw endpoint bodies, screenshots, provider payloads,
  webhook payloads, signatures, secrets, or card details.

## Files And Commands Inspected

Files inspected:

- `docs/roadmap/TOKEN_TOPUP_DEDICATED_ACCOUNT_SETUP_DAEDALUS.md`
- `docs/roadmap/TOKEN_TOPUP_TESTMODE_PROOF_RERUN_RESULT.md`
- `docs/roadmap/TOKEN_TOPUP_TESTMODE_PROOF_RERUN_ARIADNE.md`
- `docs/roadmap/TOKEN_TOPUP_TESTMODE_PROOF_FINAL_REVIEW_ARGUS.md`
- `docs/roadmap/TOKEN_TOPUP_TESTMODE_PROOF_ACCOUNT_ADDENDUM_RESULT.md`
- `docs/roadmap/TOKEN_TOPUP_TESTMODE_PROOF_PREP_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `apps/api/src/services/auth.service.ts`
- `apps/api/src/controllers/auth.controller.ts`
- `apps/api/src/routes/auth.ts`
- `apps/web/app/signup/page.tsx`
- `apps/api/src/routes/billing.ts`
- `apps/api/src/services/billing.service.ts`
- `apps/web/app/billing/page.tsx`
- `apps/api/src/services/token-credits.service.ts`
- `infra/supabase/migrations/001_initial_schema.sql`
- `scripts/staging-replay-seed.mjs`
- `docs/ops/STAGING_REPLAY_DATA_PLAN.md`
- Stripe best-practices skill references for Checkout Sessions and Billing
  separation.

Commands run:

- Targeted `Get-Content` source/doc inspections.
- Targeted `rg` searches for signup, profile tier, billing, setup, admin, seed,
  and proof-account paths.

No hosted setup was run, no account was created or promoted, no Checkout was
opened, no service-role/SQL/admin path was used, no Stripe dashboard object was
inspected, no secret values were printed, and no code, config, schema, package,
migration, billing, token-credit, or UI behavior was changed.
