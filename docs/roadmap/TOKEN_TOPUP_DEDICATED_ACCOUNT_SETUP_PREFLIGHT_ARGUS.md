# Token Top-Up Dedicated Account Setup Preflight - ARGUS

Opened by: MIMIR / A1
Owner: ARGUS / A3
Date: 2026-06-27
Status: open

## Context

DAEDALUS completed the setup map:
`docs/roadmap/TOKEN_TOPUP_DEDICATED_ACCOUNT_SETUP_RESULT.md`.

DAEDALUS verdict:

```text
NEEDS USER-PROVIDED BASIC PROOF ACCOUNT
```

MIMIR is choosing not to hand account work to the user yet. Instead, MIMIR
opens this ARGUS preflight for the narrowest possible setup mutation, because
the user has already provided staging infrastructure/config and the proof lane
should keep moving if a safe setup can be defined.

This preflight does not authorize mutation.

## Proposed Setup Mutation

Target:

- exactly one fresh dedicated non-production proof account created for the
  dedicated-account rerun;
- current selected readback: Visitor/Free, no available top-up packs, no latest
  top-up purchase;
- no raw account email, raw user id, database id, or credential may be recorded
  in docs.

Mutation shape:

- update exactly one `profiles.tier` value from `visitor` to `private`;
- do not change `subscription_status`;
- do not change `stripe_customer_id`;
- do not change `stripe_subscription_id`;
- do not create subscription records;
- do not create top-up purchases;
- do not alter token usage, token transactions, storage, personas, Spaces,
  Developer Spaces, forum data, exports, provider config, Redis, Cloudflare,
  workers, queues, auth credentials, or billing prices.

Selected setup readback after mutation:

- token tier: `private`;
- token tier label: Basic/private label;
- billing tier: `private`;
- subscription status unchanged, expected `inactive`;
- available top-up ids include `basic-starter`;
- latest safe purchase remains none.

## ARGUS Task

Return one of:

```text
ACCEPT SETUP PREFLIGHT - OPEN DEDICATED ACCOUNT SETUP
REJECT - NEEDS USER-PROVIDED BASIC PROOF ACCOUNT
REJECT - NO SAFE SETUP MUTATION
NEEDS MIMIR DECISION
```

Review whether this setup mutation is acceptable as a non-production proof
fixture step outside the token top-up proof lane.

Check:

- whether a tier-only `visitor` to `private` mutation is acceptable for one
  dedicated non-production proof account;
- whether this avoids reopening PR181/subscription activation;
- whether setup can be evidenced by selected Station readback only;
- whether target identification can be performed without recording raw ids,
  emails, credentials, SQL rows, or logs in docs;
- whether a user-provided already-Basic account is safer and should be required
  instead;
- whether final token top-up proof must still rerun after setup and receive
  final ARGUS review.

## Forbidden Evidence

Do not authorize recording:

- account email;
- raw user id or database id;
- credentials;
- cookies or auth headers;
- service-role keys or local env values;
- SQL rows;
- hosted logs;
- raw endpoint bodies;
- Stripe object ids or dashboard objects;
- Checkout URLs, Portal URLs, receipt URLs, redirect URLs, card details,
  webhook payloads, signatures, provider payloads, screenshots, or secrets.

## Boundaries

Do not run the setup mutation in this preflight. Do not query hosted SQL, run
Checkout, inspect Stripe, change code/config/schema/packages, or ask the user
for credentials.

If accepted, wake MIMIR with the exact setup packet and required review path.
If rejected, wake MIMIR with the narrowest next action.
