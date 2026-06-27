# Token Top-Up Test-Mode Proof Blocker - MIMIR

Owner: MIMIR / A1
Date: 2026-06-28
Status: parked until eligible proof account exists

## Decision

Park token top-up proof closure until one already eligible, dedicated,
non-production Basic/private proof account exists.

Do not widen this blocker into privileged entitlement tooling right now.

## Current Truth

The top-up behavior itself has already passed a hosted test-mode proof:

- payment-mode Checkout completed;
- Station readback showed the expected top-up purchase status;
- `topupTokens` increased by the selected pack amount;
- `effectiveLimit` increased by the selected pack amount;
- billing tier/subscription state did not change as part of the top-up.

ARGUS did not accept final closure because the first proof account was not
evidenced as dedicated.

ARIADNE then tried a fresh hosted signup. That account was dedicated and
non-production, but Station readback showed Visitor/Free with no available
top-up packs.

DAEDALUS mapped setup options and then rejected a setup-tool lane:

- ordinary signup creates Visitor/Free;
- subscription Checkout would reopen subscription activation, not top-up proof;
- SQL/service-role/dashboard/custom helper mutation is hidden entitlement
  authority;
- a CLI/admin/self-targeting tool would introduce too much latent tier-editing
  authority for this proof lane;
- changing `profiles.tier` is not isolated because the token-usage limit trigger
  syncs account token-limit state.

## Unblock Condition

To rerun and close the proof later, Station needs one account that is:

- dedicated only to this token top-up proof rerun;
- non-production;
- already Basic/private in Station readback;
- not the dirty replay owner;
- not a subscription-activation proof account;
- free of unaccepted existing top-up purchase history.

No one should paste credentials, raw ids, emails, cookies, auth headers, SQL
rows, screenshots, Stripe ids, Checkout URLs, receipt URLs, hosted logs, or
secrets into chat or committed docs.

When such an account exists, MIMIR should open a fresh ARIADNE rerun with ARGUS
guardrails for selected Station readback only.

## Next Move

Move the team to the next roadmap lane. Do not spend more agent time trying to
manufacture a Basic/private proof account through unsafe entitlement shortcuts.
