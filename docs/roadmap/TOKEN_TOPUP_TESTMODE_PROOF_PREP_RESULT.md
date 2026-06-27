# Token Top-Up Test-Mode Proof Prep Result

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date: 2026-06-27

Status: COMPLETE - WAKE MIMIR

## Verdict

READY FOR ARGUS PREFLIGHT

## Current Contract

Authenticated route:

- `POST /token-credits/topups/checkout`
- Route file: `apps/api/src/routes/token-credits.ts`
- Auth: `requireAuth` on the whole `tokenCreditsRouter`
- Request body: `packId`, optional `successUrl`, optional `cancelUrl`
- Default success return: `/settings?topup=success`
- Default cancel return: `/settings?topup=cancelled`
- Response: `{ url }`, where `url` is the Stripe Checkout URL. Proof docs must
  not record that URL.

Available pack and tier rules:

- Basic/private tiers:
  - `basic-starter`: GBP 5, 1,500,000 Haiku-tier tokens
  - `basic-standard`: GBP 10, 3,500,000 Haiku-tier tokens
- Creator tier:
  - `creator-starter`: GBP 10, 500,000 Sonnet-tier tokens
  - `creator-standard`: GBP 25, 1,500,000 Sonnet-tier tokens
  - `creator-large`: GBP 50, 3,500,000 Sonnet-tier tokens
- Developer, Canon, Institutional, Visitor, and unknown tiers expose no
  standard top-up packs in the current code.

Checkout mode and metadata field names only:

- One-time top-ups use Stripe Checkout Sessions with `mode: "payment"`.
- Current implementation also sets `payment_method_types: ["card"]`.
- Top-up metadata is written to both the Checkout Session and
  `payment_intent_data`.
- Metadata field names:
  - `station_kind`
  - `station_user_id`
  - `station_pack_id`
  - `station_tokens`
  - `station_model_tier`
  - `station_amount_pence`
- The expected `station_kind` value for a top-up is `token_topup`.
- Do not record metadata values during hosted proof except safe pack name/id,
  token amount, and amount-pence fields selected below.

Webhook event paths that grant top-up balance:

- Stripe webhooks enter through `POST /billing/webhook`.
- `apps/api/src/app.ts` registers `express.raw()` for `/billing/webhook`
  before JSON parsing so Stripe signature verification can use the raw body.
- `apps/api/src/controllers/billing.controller.ts` requires the
  `stripe-signature` header and delegates to `handleWebhookEvent`.
- `apps/api/src/services/billing.service.ts` grants token top-ups for:
  - `checkout.session.completed` when `session.mode === "payment"`
  - `payment_intent.succeeded`
- Subscription events stay separate:
  - subscription Checkout uses `mode: "subscription"`
  - subscription grants update profile tier only through subscription webhook
    paths
  - top-up proof must not change subscription tier or subscription status

Grant validation and idempotency:

- `grantTopupFromStripeMetadata()` ignores non-top-up metadata.
- The grant path rejects incomplete metadata, non-positive token/amount values,
  unsupported model tiers, unavailable packs for the user's current tier, and
  metadata that does not match current server pack configuration.
- SQL RPC: `public.grant_topup_purchase`
- Idempotency: `topup_purchases.stripe_payment_id` is unique, and the RPC uses
  `on conflict (stripe_payment_id) do nothing`; `token_usage.topup_tokens` and
  `token_transactions` are updated only when a new purchase row is inserted.
- Local tests prove duplicate grant calls with the same payment id do not add
  tokens twice.

`/token-credits/me` readback:

- `GET /token-credits/me` is authenticated.
- It returns `usage` with:
  - `tier`
  - `tierLabel`
  - `periodStart`
  - `resetDate`
  - `tokensUsed`
  - `tokensLimit`
  - `topupTokens`
  - `effectiveLimit`
  - `percentUsed`
  - `subscriptionPercent`
  - `warningLevel`
  - `modelExperience`
  - `availableTopups`
  - `purchaseHistory`
- `purchaseHistory` is newest first, capped at 8 rows, and includes:
  - `id`
  - `packId`
  - `amountPence`
  - `tokensPurchased`
  - `expiresAt`
  - `status`
  - `createdAt`

Settings UI purchase-history behavior:

- `apps/web/components/settings/token-usage-panel.tsx` restores the browser
  session, fetches `/token-credits/me`, shows monthly allocation, top-up
  balance, available top-up packs, and purchase history.
- The Buy button posts to `/token-credits/topups/checkout` and redirects the
  browser to Stripe Checkout.
- After return to `/settings?topup=success`, the Settings page remounts and the
  panel fetches fresh `/token-credits/me` state.
- There is no dedicated top-up success/cancel banner today. The proof should
  rely on token-usage readback, top-up balance, and purchase-history readback,
  not on a visible success notice.

Separation from subscription entitlement:

- Top-up Checkout is a payment-mode session under `/token-credits`.
- Subscription Checkout is a subscription-mode session under `/billing`.
- Subscription entitlement is updated by subscription webhook paths and profile
  tier fields.
- Token top-ups update token usage and purchase-history tables only.
- The proof must compare subscription tier/status before and after and record
  that they did not change.

## Proof Packet Draft

Exact safe human/browser path if ARGUS accepts preflight:

1. Confirm this remains Stripe test mode by configuration/readiness status only.
   Do not print key values, Checkout URLs, object ids, webhook payloads, or
   dashboard raw data.
2. Sign in with the selected top-up proof account.
3. Open `/settings`.
4. Record selected before fields from `/token-credits/me` or visible Settings
   readback:
   - `tier`
   - `tokensUsed`
   - `tokensLimit`
   - `topupTokens`
   - `effectiveLimit`
   - `availableTopups` ids only
   - latest `purchaseHistory` safe fields if present
5. Record selected before fields from `/billing/me`:
   - `tier`
   - `subscriptionStatus`
6. Click exactly one top-up Buy button for the selected pack.
7. Complete the Stripe-hosted test-mode payment without recording the card,
   Checkout URL, session id, payment id, customer id, receipt URL, or raw
   Stripe response.
8. Return to `/settings?topup=success`.
9. Wait for webhook completion by polling only Station readback until the new
   purchase row appears or the proof times out.
10. Record selected after fields from `/token-credits/me`:
    - `tier`
    - `tokensUsed`
    - `tokensLimit`
    - `topupTokens`
    - `effectiveLimit`
    - latest `purchaseHistory.packId`
    - latest `purchaseHistory.amountPence`
    - latest `purchaseHistory.tokensPurchased`
    - latest `purchaseHistory.status`
11. Record selected after fields from `/billing/me`:
    - `tier`
    - `subscriptionStatus`
12. Confirm `billing.me.tier` and `billing.me.subscriptionStatus` did not
    change, while `topupTokens`, `effectiveLimit`, and latest purchase-history
    readback reflect the selected top-up.

Lowest-risk account and pack recommendation:

- Use a dedicated Basic/private top-up proof account if one exists.
- If the only available replay owner is Canon/developer/institutional, do not
  use that account for this proof because current code exposes no standard
  top-up packs for soft-cap tiers.
- Preferred pack: `basic-starter`, because it is the lowest-price current pack
  and grants a small, easy-to-read Haiku-tier top-up.
- If no Basic/private account exists, use a Creator proof account with
  `creator-starter`. Do not change a user's tier as part of this proof unless
  MIMIR opens that separate setup step.

Webhook completion signal to wait for:

- Primary signal: `/token-credits/me.purchaseHistory[0].status === "completed"`
  with the selected pack id and selected token/amount fields.
- Secondary signal: `topupTokens` and `effectiveLimit` increase by exactly the
  selected pack's token amount.
- Do not use raw Stripe event ids, PaymentIntent ids, Session ids, Dashboard
  payloads, hosted logs, or SQL rows as the recorded proof artifact.

Subscription entitlement confirmation:

- `/billing/me.tier` must match the before value.
- `/billing/me.subscriptionStatus` must match the before value.
- No subscription Checkout, Portal, Customer Portal, plan card, or `/billing`
  upgrade action is part of this proof.

## Safety And Redaction Rules

Forbidden outputs:

- Stripe secret keys, publishable keys, webhook secrets, API tokens, cookies,
  auth headers, bearer tokens, local env values, or replay credentials
- Checkout URLs, Portal URLs, receipt URLs, redirect URLs with tokens, or raw
  hosted endpoint bodies
- Stripe Session ids, PaymentIntent ids, customer ids, subscription ids, event
  ids, charge ids, invoice ids, payment method ids, or raw Dashboard objects
- Test card numbers or card fixture details
- Raw webhook payloads, signatures, request headers, stack traces, SQL rows,
  hosted logs, provider payloads, private documents, prompts, completions, or
  raw user ids

Allowed selected fields:

- HTTP status class, not raw body, for route health if needed
- Station route name and page name
- Pack id from the allowlist
- Pack amount pence
- Pack tokens purchased
- `tier`
- `subscriptionStatus`
- `tokensUsed`
- `tokensLimit`
- `topupTokens`
- `effectiveLimit`
- latest purchase `status`
- pass/fail statement for whether subscription tier/status changed

ARGUS preflight is required before any hosted mutation. This prep result does
not authorize clicking Checkout, entering Stripe test payment details, replaying
webhooks, mutating hosted data, changing account tiers, or printing Stripe
objects.

## Files And Commands Inspected

Files inspected:

- `docs/roadmap/TOKEN_TOPUP_TESTMODE_PROOF_PREP_DAEDALUS.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/UX07_BILLING_ENTITLEMENT_FEASIBILITY_RESULT.md`
- `apps/api/src/routes/token-credits.ts`
- `apps/api/src/services/token-credits.service.ts`
- `apps/api/src/services/billing.service.ts`
- `apps/api/src/controllers/billing.controller.ts`
- `apps/api/src/app.ts`
- `apps/api/src/lib/stripe.ts`
- `apps/api/src/routes/token-credits.test.ts`
- `apps/api/src/routes/billing.test.ts`
- `apps/web/components/settings/token-usage-panel.tsx`
- `apps/web/app/settings/page.tsx`
- `infra/supabase/migrations/014_integrity_questions_token_credits.sql`
- `infra/supabase/migrations/015_token_topup_grants.sql`
- `package.json`
- Stripe best-practices skill: Checkout Sessions for one-time payments,
  Billing APIs plus Checkout Sessions for subscriptions, and no Charges API.

Commands run:

- `npm exec --yes pnpm@10.32.1 -- run test:token-credits`
  - Pass: 3 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:billing`
  - Pass: 15 tests.
- Targeted `Get-Content` and `rg` source inspections.

No hosted Checkout was run, no Stripe mutation was attempted, no webhook was
replayed, no secret values were printed, and no code, config, schema, package,
migration, provider, UI, billing, or token-credit behavior was changed.
