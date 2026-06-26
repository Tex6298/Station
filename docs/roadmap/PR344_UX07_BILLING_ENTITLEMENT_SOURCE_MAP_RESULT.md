# PR344 - UX-07 Billing Entitlement Source Map Result

Owner: DAEDALUS

Date: 2026-06-26

Status: Ready for ARGUS review

## Result

DAEDALUS mapped the current billing, entitlement, quota, token-credit, and
frontend state sources before opening any broader UX-07 billing work.

One low-risk copy patch landed:

- `apps/web/app/(marketing)/pricing/page.tsx`

The public pricing page now matches server-authoritative storage limits from
`packages/config/src/tiers.ts`:

- Basic/private: `5 GB`
- Creator: `50 GB`
- Canon / Developer: `200 GB`

The pricing FAQ also no longer claims that upgrades are immediate or that
downgrades occur at the end of the billing period. It now says plan changes
start from Billing and Stripe-hosted test-mode handoff in this build, and that
Station reflects changes only after verified server subscription state updates.

## Source Map

### Server Billing And Entitlement

- `apps/api/src/routes/billing.ts`
  - `/billing/webhook` is unauthenticated because Stripe signs the payload.
  - `/billing/me`, `/billing/checkout`, and `/billing/portal` all require
    Station auth.
- `apps/api/src/controllers/billing.controller.ts`
  - Converts API calls into billing service operations.
  - Supplies default return URLs from `NEXT_PUBLIC_APP_URL`.
- `apps/api/src/services/billing.service.ts`
  - Reads current tier, Stripe customer id, subscription id, and subscription
    status from `profiles`.
  - Returns `limits` from shared `TIER_LIMITS`.
  - Blocks Checkout when an active or trialing subscription is already recorded.
  - Creates subscription-mode Checkout sessions with server-selected Price IDs.
  - Creates Stripe Billing Portal sessions from the server-side customer id.
  - Mutates profile tier only through verified Stripe webhook handling.
  - Downgrades canceled/deleted subscriptions to `visitor`.
  - Rejects unknown active Price IDs and customer/profile mismatches.
- `apps/api/src/schemas/billing.schema.ts`
  - Allows paid subscription Checkout only for `private`, `creator`, and
    `canon`.

### Tier Config And Permissions

- `packages/config/src/tiers.ts`
  - Canonical tier labels, monthly/yearly prices, paid tier list, Stripe Price
    env var names, and tier limits.
  - Current storage limits are `5 GB`, `50 GB`, and `200 GB` for
    private/creator/canon.
  - `-1` remains the unlimited sentinel.
- `packages/auth/src/permissions.ts`
  - Uses `TIER_LIMITS` for persona, public persona, Space, Developer Space,
    thread, and document-publishing permission helpers.
  - Admin users bypass create limits.

### Frontend Billing And Pricing

- `apps/web/app/billing/page.tsx`
  - Restores the session with `getSession`.
  - Fetches `/billing/me` with `Authorization: Bearer <token>`.
  - Shows server-returned tier, subscription status, and `limits`.
  - Sends subscription Checkout requests to `/billing/checkout`.
  - Sends portal requests to `/billing/portal`.
  - Separates entitlements from token credits in visible copy.
  - Uses `billingPlanAction` to avoid lower-tier upgrade copy for higher-tier
    users and to show same-tier inactive activation copy.
- `apps/web/lib/billing-plan-actions.ts`
  - Defines active subscription statuses as `active` and `trialing`.
  - Decides `current`, `activate`, `upgrade`, `included`, and `lower-tier`
    card states.
- `apps/web/app/(marketing)/pricing/page.tsx`
  - Public pricing copy. PR344 patched storage limits and switch-plan FAQ copy.
- `apps/web/app/settings/page.tsx`
  - Links to Billing.
  - Shows token usage, storage usage, and AI activity panels.
- `apps/web/components/studio/studio-sidebar.tsx`
  - Shows compact token and storage usage panels in Studio.
- `apps/web/app/studio/personas/[personaId]/files/page.tsx`
  - Shows the full storage usage panel in the archive/files context.

### Token Credits And Top-Ups

- `apps/api/src/routes/token-credits.ts`
  - Authenticated `/token-credits/me`.
  - Authenticated payment-mode top-up Checkout at
    `/token-credits/topups/checkout`.
  - Admin-only monthly reset endpoint.
- `apps/api/src/services/token-credits.service.ts`
  - Token limits are separate from subscription tier limits.
  - Token usage comes from `ensure_current_token_usage`.
  - LLM spend is recorded through `record_token_usage`.
  - Top-up grants come from verified Stripe metadata via billing webhook paths.
  - Top-up packs are server-selected by tier and model tier.
  - Developer/canon/institutional tiers use soft-cap review behavior.
- `apps/web/components/settings/token-usage-panel.tsx`
  - Fetches `/token-credits/me`.
  - Starts top-up Checkout from the selected server-returned pack.
  - Shows monthly allocation, top-up balance, warning state, reset date, and
    purchase history.

### Storage And Quota

- `apps/api/src/routes/storage.ts`
  - Authenticated `/storage/me`.
- `apps/api/src/services/storage.service.ts`
  - Computes fallback storage limit from `TIER_LIMITS`.
  - Reads durable `storage_usage` for bytes used and bytes limit.
  - Uses RPCs for reserve/release.
  - Returns category estimates for uploaded files, imports, memory, canon,
    integrity sessions, published documents, and archived chats.
- `apps/web/components/settings/storage-usage-panel.tsx`
  - Fetches `/storage/me`.
  - Shows bytes used, bytes limit, percent used, warning copy, and category
    estimates.

### Developer Space Usage

- `apps/api/src/services/developer-space-usage.service.ts`
  - Uses Developer Space-specific quota limits, not Stripe Price IDs.
  - Limits are tier-aware: canon has bounded node/event/snapshot/storage/read/
    export limits; institutional uses `-1` unlimited sentinels.
  - Usage is stored in `developer_space_usage`.
  - Quota errors are routed through `operational-quota.service.ts`.
- `apps/api/src/routes/developer-spaces.ts`
  - Owner-only `/developer-spaces/:id/usage`.
  - Ingestion paths enforce quota before recording usage.

## Current Visible States

- Signed-out users are redirected away from protected billing routes by the web
  auth route guard and cannot call authenticated billing APIs.
- Billing shows loading, error, success, cancellation, current tier,
  subscription status, active portal action, inactive same-tier activation, plan
  cards, and server-returned limits.
- Settings and Studio show token-credit and storage panels separately from
  subscription entitlement.
- Token top-ups add model-usage credit and do not change subscription tier.
- Checkout creation alone does not grant entitlement; verified webhook/server
  state is the entitlement source.

## Risks And Stale Truth Found

- Public pricing storage copy had drifted from server limits. PR344 corrected
  it.
- Public pricing FAQ implied immediate upgrade/downgrade timing. PR344 narrowed
  it to verified server state and test-mode handoff.
- Pricing and Billing still duplicate some tier labels, prices, features, and
  limits instead of deriving visible plan copy from one shared display source.
- Billing status exposes `customerId` through `/billing/me` and the web client
  type, but current UI does not render it. Future UX should avoid rendering raw
  Stripe identifiers.
- Token-credit limits live in `token-credits.service.ts`, separate from
  `TIER_LIMITS`; that is intentional for now but should stay explicit in UX
  copy.
- Developer Space quota limits live in `developer-space-usage.service.ts`,
  separate from billing Price IDs and subscription copy.

## Recommended PR345 Packet

Open PR345 as a narrow UX-07 implementation lane:

```text
PR345 - Billing tier display source of truth

Goal:
Make visible billing/pricing tier copy derive from one tested display helper so
public Pricing, authenticated Billing, and server limits cannot drift again.

Scope:
- Add a small web billing display helper that reads/normalizes shared tier
  labels, prices, yearly prices, and tier limits from `@station/config`.
- Use it in `/pricing` and `/billing` for storage, Spaces, Developer Spaces,
  and paid-tier labels.
- Add focused tests proving Pricing/Billing display helpers match
  `TIER_LIMITS`, `TIER_PRICES_GBP`, and yearly prices.
- Keep token-credit and Developer Space usage copy separate from subscription
  entitlement copy.

Non-scope:
- No Stripe product/price creation.
- No Checkout, Portal, webhook, schema, migration, entitlement enforcement, tax,
  invoices, usage billing, Connect, marketplace, token-top-up behavior, or
  live-money work.
- No secrets, Stripe URLs, customer IDs, subscription IDs, payment IDs, cookies,
  or tokens in docs/tests.

Validation:
- `npm exec --yes pnpm@10.32.1 -- run test:billing`
- `npm exec --yes pnpm@10.32.1 -- run test:token-credits`
- `npm exec --yes pnpm@10.32.1 -- run test:storage`
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck`
- `npm exec --yes pnpm@10.32.1 -- run lint`
- `git diff --check`
```

## Validation

Passed:

```text
npm exec --yes pnpm@10.32.1 -- run test:billing
npm exec --yes pnpm@10.32.1 -- run test:token-credits
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

Notes:

- `test:billing` passed 11 tests.
- `test:token-credits` passed 3 tests.
- `test:storage` passed 16 tests.
- Web typecheck passed.
- `lint` passed with no warnings.
- `git diff --check` passed with CRLF normalization notices only.

## Review Requests

ARGUS should review:

- Whether the pricing copy patch now matches server-authoritative limits.
- Whether the FAQ avoids claiming entitlement before verified server state.
- Whether PR345 should be opened as the shared display-helper lane above or
  narrowed further.
