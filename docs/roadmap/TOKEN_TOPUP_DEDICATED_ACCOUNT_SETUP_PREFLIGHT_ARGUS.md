# Token Top-Up Dedicated Account Setup Preflight - ARGUS

Opened by: MIMIR / A1
Owner: ARGUS / A3
Date: 2026-06-27
Status: complete - wake MIMIR

## Verdict

```text
REJECT - NEEDS USER-PROVIDED BASIC PROOF ACCOUNT
```

ARGUS rejects the proposed agent-run `visitor` to `private` setup mutation for
this lane. The narrow mutation is understandable as a fixture goal, but current
Station has no existing audited, narrow setup route for "make exactly this
dedicated non-production proof account Basic/private." Running the setup would
therefore require an out-of-band dashboard, SQL, service-role, or custom helper
mutation to an entitlement field.

That is too much hidden authority for a proof-account setup lane, especially
because it creates a paid-tier-looking profile without the normal subscription
path while PR181/subscription activation is supposed to stay closed. The safest
next action remains the DAEDALUS recommendation: use one already-eligible,
dedicated, non-production Basic/private proof account provided or arranged
outside the agents' hosted mutation flow.

If MIMIR still wants Station-side setup later, open a separate DAEDALUS lane to
design an audited, bounded setup tool or route, then return to ARGUS for a new
preflight. Do not perform a manual hosted tier edit under this packet.

## ARGUS Review

| Check | Result | Notes |
| --- | --- | --- |
| Ordinary signup path | Rejects setup mutation | Source and tests confirm signup creates Visitor/Free profiles, so ordinary hosted UI cannot create an eligible Basic/private account. |
| Existing setup route/tool | Not found | No current narrow admin/test route exists for exactly one proof-account tier setup; staging replay seed is broad and Canon-oriented. |
| Entitlement boundary | Unsafe for this lane | Directly mutating `profiles.tier` to `private` bypasses subscription activation and creates paid-tier readback without the normal billing path. |
| PR181 separation | Risky | The proposal avoids subscription Checkout, but the entitlement mutation itself is close enough to paid activation that it should not be hidden inside a proof fixture. |
| Evidence boundary | Insufficient | Targeting the correct hosted account would still require account identity handling outside committed docs; no approved target-identification mechanism is defined. |
| Safer alternative | Pass | A user-provided already-Basic/private dedicated proof account avoids agent-run entitlement mutation and lets ARIADNE record selected eligibility/readback only. |
| Future option | Decision for MIMIR | MIMIR may open a separate audited setup-tool design lane, but this preflight should not authorize manual SQL/service-role/dashboard mutation. |

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Source review | Pass | Reviewed auth signup/default tier, profile trigger/defaults, token-credit pack gating, billing/subscription boundaries, staging replay seed scope, and setup-map docs. |
| `npm exec --yes pnpm@10.32.1 -- run test:auth` | Pass | 20 tests passed, including signup returning Visitor. |
| `npm exec --yes pnpm@10.32.1 -- run test:token-credits` | Pass | 3 tests passed, including tier-gated top-up packs and grant idempotency. |
| `git diff a82a9e69^ a82a9e69 --check` | Pass | DAEDALUS setup-map commit whitespace check passed. |
| `git diff 2c9b5d71^ 2c9b5d71 --check` | Pass | MIMIR preflight-open commit whitespace check passed. |
| Added-line leak scans | Pass | Setup-map and preflight-open docs had no matches for full URLs, Stripe object-id prefixes, Stripe key/webhook-secret prefixes, bearer/JWT-looking tokens, UUID-like values, or credential assignment shapes. |

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
