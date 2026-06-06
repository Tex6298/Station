# Stripe Setup

Station's PR-17 billing foundation uses Stripe Billing subscriptions through
Checkout Sessions. Entitlement changes happen only after a Stripe-signed webhook
is verified by the API.

## 1. Create Products in the Stripe Dashboard

Go to https://dashboard.stripe.com/products and create three products:

| Product     | Price       | Billing    | Env var                        |
|-------------|-------------|------------|-------------------------------|
| Basic      | GBP 10.00      | Monthly    | `STRIPE_PRICE_BASIC_MONTHLY` |
| Basic      | GBP 100.00     | Yearly     | `STRIPE_PRICE_BASIC_YEARLY`  |
| Creator      | GBP 100.00     | Monthly    | `STRIPE_PRICE_CREATOR_MONTHLY` |
| Creator      | GBP 1,000.00   | Yearly     | `STRIPE_PRICE_CREATOR_YEARLY`  |
| Canon       | GBP 250.00     | Monthly    | `STRIPE_PRICE_CANON_MONTHLY`  |
| Canon       | GBP 2,500.00   | Yearly     | `STRIPE_PRICE_CANON_YEARLY`   |

Copy each Price ID (starts with `price_`) into your `.env` file.

The API runs on `stripe@22.2.0` with Stripe API version `2026-05-27.dahlia`.

## 2. Configure the Webhook

### Local development (Stripe CLI)
```bash
stripe listen --forward-to localhost:4000/billing/webhook
```
This prints a webhook signing secret - set it as `STRIPE_WEBHOOK_SECRET`.

### Production
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-api-domain.com/billing/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the signing secret -> `STRIPE_WEBHOOK_SECRET`

## 3. Enable the Customer Portal

Go to https://dashboard.stripe.com/settings/billing/portal and enable it.
This is required for the "Manage subscription" button to work.

## 4. Environment Variables

```
STRIPE_SECRET_KEY=sk_live_...          # or sk_test_... for dev
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

STRIPE_PRICE_BASIC_MONTHLY=price_...
STRIPE_PRICE_BASIC_YEARLY=price_...
STRIPE_PRICE_CREATOR_MONTHLY=price_...
STRIPE_PRICE_CREATOR_YEARLY=price_...
STRIPE_PRICE_CANON_MONTHLY=price_...
STRIPE_PRICE_CANON_YEARLY=price_...
```

## How it works

1. User clicks upgrade on `/billing` or `/pricing`
2. Frontend calls `POST /billing/checkout` -> API creates a Stripe Checkout session -> returns URL
3. User completes payment on Stripe's hosted page
4. Stripe sends `checkout.session.completed` to `/billing/webhook`
5. Webhook handler calls `syncSubscriptionToProfile` -> updates `profiles.tier` in Supabase
6. User is redirected back to `/billing?success=1`
7. On cancellation: `customer.subscription.deleted` fires -> tier downgraded to `visitor`

## Local validation

```bash
npx --yes pnpm@10.32.1 test:billing
```

The billing test covers Checkout metadata, portal customer reuse, webhook
signature verification before entitlement writes, cancellation downgrade, and
unknown active Price rejection.
