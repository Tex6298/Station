# PR328 - Post-PR327 Pilot Entry Boundary Result

Owner: ARGUS

Date: 2026-06-26

Status: Complete

## Verdict

Classification:

```text
PILOT ENTRY READY AFTER MARTY DETAILS
```

Next owner:

```text
MIMIR
```

MIMIR should collect the missing real-pilot details before any external tester
entry. No DAEDALUS allowlist lane is required for the first 3-5 trusted
named signed-in testers if MIMIR keeps the invite-only boundary operational and
does not claim product-enforced allowlisting.

## Boundary Finding

PR327 passed the hosted rehearsal with internal/replay aliases only:

- hosted web/API were fresh at `f89dd2b921c9` and included PR318 plus PR323;
- signed-out users could read the public persona route but could not chat or
  report;
- one signed-in replay chat and one persona report completed under mutation
  caps;
- owner readback stayed aggregate/status-only;
- admin persona moderation readback stayed safe;
- the public Space/document/discussion chain passed on desktop and mobile;
- no real tester entry, moderation mutation, billing/provider/deploy/key/infra
  mutation, leakage, or launch/commercial/partner overclaim occurred.

That is enough to move to real pilot entry after details are supplied. The
pilot remains a controlled operational pilot, not a general public feature.

## Operational Invite-Only

Operational invite-only is sufficient for this first pilot only if all of these
remain true:

- the cohort is 3-5 trusted named testers;
- every tester is signed in;
- testers receive only the named in-scope routes and pilot instructions;
- MIMIR/Marty own the list and can remove access by stopping the pilot,
  removing/shutting off shared instructions, or disabling the public persona
  chat surface;
- the repo/docs do not claim that Station enforces a named-user allowlist in
  product code.

If MIMIR wants product-enforced tester access, or if the cohort grows beyond
the trusted 3-5 signed-in shape, open a DAEDALUS allowlist/access-control lane
before tester entry.

## DAEDALUS Allowlist

No DAEDALUS allowlist lane is required before the first pilot entry under the
accepted PR326/PR327 constraints.

Wake DAEDALUS only if MIMIR changes the promise to require software-enforced
named tester access, broader self-serve signup gating, per-tester permissions,
or a public claim that uninvited signed-in accounts cannot reach the surfaces.

## Details MIMIR Must Collect

Before real tester entry, MIMIR must record:

- the 3-5 tester names and signed-in account emails or aliases;
- which route(s) each tester may use:
  - public persona chat;
  - public persona report;
  - public Space/document/discussion navigation;
  - read-only navigation if applicable;
- pilot start time, stop time, and who can stop it early;
- owner monitor and admin monitor;
- expected monitoring cadence during the window;
- exact public persona slug and public Space/document/discussion route;
- whether testers may submit one chat, one report, both, or neither;
- what instructions testers receive about not pasting private data,
  credentials, secrets, personal data, or third-party confidential material;
- rollback action: disable public persona chat, stop sharing the route, pause
  tester instructions, and wake MIMIR/ARGUS/DAEDALUS according to the failure.

These details are required before tester entry, but they are not required for
ARGUS to classify the boundary because the accepted cohort and route shape is
already narrow enough.

## Internal Work While Waiting

MIMIR should not open unrelated implementation work merely because tester
details are pending. The next correct action is to collect the missing details
or record a pause.

If tester details are expected to take a long time, MIMIR may open a separate
bounded lane only from fresh roadmap evidence, not as hidden PR328 cleanup and
not in any external/public/commercial/partner/anonymous/durable-transcript/
visitor-analytics/launch scope.

## Stop Conditions

Do not start, or stop immediately and wake the right owner, if any of these are
true:

- no named tester list exists;
- tester actions are not specified;
- owner/admin monitoring is unassigned;
- no pilot stop window or rollback owner is named;
- anonymous users can chat or report;
- owner readback exposes reporter identity, report bodies, visitor identity,
  transcript text, raw event rows, or raw ids;
- admin persona queue is unavailable or leaks private persona/source material;
- public persona chat stores transcripts or durable visitor identity;
- hosted web/API freshness is stale for a relevant runtime repair;
- MIMIR wants to claim product-enforced named-user allowlisting without a
  DAEDALUS allowlist lane.

## Rejected Classifications

`DAEDALUS ALLOWLIST REQUIRED BEFORE TESTERS` is not right for the first 3-5
trusted signed-in pilot because PR326 explicitly allowed invite-only as an
operational gate, PR327 passed the signed-in/signed-out rehearsal, and no
public product allowlist claim is being made.

`MARTY DETAILS REQUIRED BEFORE CLASSIFICATION` is not right because the missing
details are known and bounded: tester identities/accounts, allowed actions,
monitors, and pilot window. They are required before entry, not before ARGUS
can classify.

`RETURN TO INTERNAL LANE WHILE WAITING` is not the default. There is no current
fresh internal defect or implementation blocker named by PR327. If the tester
details are delayed, MIMIR should record the pause or open a separately
justified lane.

`BLOCKED ON SAFETY` is not right because PR327 passed the hosted privacy,
freshness, signed-in-only, owner/admin readback, and desktop/mobile route
checks.

## Validation

PR328 is docs/boundary only. ARGUS validation:

- read PR328, PR327, PR326, and current `ACTIVE_STATUS`;
- confirmed PR327 did not involve real tester entry or forbidden mutations;
- confirmed the result does not widen scope into anonymous chat, public launch,
  commercial/customer/partner packaging, durable visitor transcripts, visitor
  identity analytics, Cloudflare, Redis/queue/worker execution, provider/model
  work, billing, repo/deploy, key rotation, or signing-secret creation;
- ran docs whitespace, staged whitespace, and added-line hygiene checks before
  commit.

## Wakeup

Wake MIMIR with `PILOT ENTRY READY AFTER MARTY DETAILS`.
