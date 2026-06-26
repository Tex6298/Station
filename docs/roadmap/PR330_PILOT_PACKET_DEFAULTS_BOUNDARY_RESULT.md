# PR330 - Pilot Packet Defaults Boundary Result

Owner: ARGUS

Date: 2026-06-26

Status: Complete

## Verdict

Classification:

```text
DEFAULTS ACCEPTED
```

Next owner:

```text
MIMIR
```

MIMIR can proceed after the three real signed-in tester account identities and
private feedback channel are supplied. No packet revision and no DAEDALUS
allowlist/access-control lane is required under the accepted first-wave
operational pilot constraints.

## Review Finding

ARGUS accepts the PR329 defaults filled by MIMIR:

- first wave is three trusted signed-in testers, not five;
- Tester 1 gets one public persona chat plus route navigation;
- Tester 2 gets one public persona report plus route navigation;
- Tester 3 gets read/navigation only;
- Tester 4 and Tester 5 are unused unless MIMIR explicitly expands the wave;
- route set stays on the hosted-proven replay public persona and
  Space/document/discussion chain;
- owner monitor defaults to the replay owner alias used in PR327;
- admin monitor defaults to the admin-capable replay alias used in PR327;
- monitoring cadence is pre-start, after each tester action, closeout, and
  immediate check on confusion, breakage, unsafe behavior, or leakage;
- the pilot starts only after tester account rows are filled and instructions
  are sent;
- the pilot stops after 60 minutes or earlier on any stop condition;
- early stop authority is MIMIR, Marty, owner monitor, or admin monitor;
- rollback is coordinated by MIMIR, with the owner monitor disabling public
  persona chat if needed;
- the private feedback channel remains a required real-world detail, not a repo
  default.

The three-tester split is safer than giving every tester chat and report. The
60-minute window is narrow enough for the first external signed-in pilot wave.
The monitor and rollback defaults are sufficient for operational invite-only
because PR327 already rehearsed owner/admin readback and because the packet does
not claim product-enforced named-user access.

## Remaining Required Details

Real tester contact remains blocked until MIMIR fills:

- Tester 1 name and signed-in account email or agreed alias;
- Tester 2 name and signed-in account email or agreed alias;
- Tester 3 name and signed-in account email or agreed alias;
- private feedback channel for tester replies and issue reports.

Tester 4 and Tester 5 should stay unused unless MIMIR explicitly expands the
first wave and records the same details for them.

## Route Review

The default tester-facing routes are acceptable once tester identities are
filled:

- `/personas/station-replay-alpha-persona`;
- `/space/station-replay-alpha`;
- `/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f`;
- `/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf`.

Before sending instructions, the owner monitor should confirm those public
document and forum routes still resolve on hosted web. If the hosted seed moved,
update the two route rows from the visible Space/document/discussion path before
tester instructions are sent.

## Allowlist Decision

DAEDALUS allowlist work is not required for this first wave.

This remains true only while the pilot is described honestly as operationally
invite-only. If MIMIR wants to claim software-enforced named-user access,
prevent uninvited signed-in accounts at the product level, expand beyond the
trusted first wave, or add per-tester permissions in product code, then MIMIR
should open a DAEDALUS allowlist/access-control lane before tester entry.

## Scope Boundaries

PR330 does not authorize:

- anonymous chat or reporting;
- public launch, production-readiness, commercial/customer, or partner claims;
- durable visitor transcripts;
- visitor identity analytics;
- moderation status changes or target actions during entry;
- billing, provider/model, deploy, key, infrastructure, Railway, Supabase,
  Stripe, Redis, Cloudflare, queue, worker, or database-admin changes;
- product-enforced named-user allowlisting;
- generalized all-users, all-personas, or production-readiness claims.

## Validation

PR330 is docs/boundary only. ARGUS validation:

- read PR330, revised PR329, PR328, PR327, and current `ACTIVE_STATUS`;
- confirmed the defaults do not contact testers, use real tester accounts, or
  authorize hosted mutations before entry;
- confirmed the defaults preserve operational invite-only without claiming a
  product allowlist;
- confirmed remaining details are real-person/account/channel details that
  should not be invented in repo docs;
- checked that scope stays out of anonymous/public-launch/commercial/partner/
  durable-transcript/visitor-analytics/infrastructure/provider/billing/deploy/
  key lanes;
- ran docs whitespace, staged whitespace, and added-line hygiene checks before
  commit.

## Wakeup

Wake MIMIR with `DEFAULTS ACCEPTED`.
