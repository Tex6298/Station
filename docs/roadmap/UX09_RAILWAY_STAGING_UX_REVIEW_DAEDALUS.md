# UX-09 Railway Staging UX Review Prep

Owner: DAEDALUS
Reviewer: MIMIR, then ARGUS/ARIADNE as needed
Status: OPEN - WAKE DAEDALUS
Opened: 2026-06-27

## Why This Exists

UX-08A Persona Creation Provider Copy is accepted. The next roadmap lane is
UX-09 Railway Staging UX Review.

This is not a blind staging rerun. Prior staging evidence already exists and
must be reconciled before ARIADNE runs a fresh human-eye rehearsal:

- `docs/roadmap/PR351_UX09_RAILWAY_STAGING_SWEEP_PREP_RESULT.md`
- `docs/roadmap/PR352_UX09_RAILWAY_STAGING_SWEEP_RESULT.md`
- `docs/roadmap/PR408_STAGING_DEMO_BROWSER_REHEARSAL_RESULT.md`
- `docs/roadmap/STAGING_FINAL_REHEARSAL_SWEEP_MIMIR.md`

Product question:

```text
Is Railway staging ready for a fresh human-eye browser sweep, and what exact
routes, credential key names, mutation boundaries, and caveats should ARIADNE
use without mutating hosted data or leaking secrets?
```

## Known Targets

Start from the existing Railway targets:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Use credential key names only:

```text
STATION_REPLAY_OWNER_EMAIL
STATION_REPLAY_OWNER_PASSWORD
```

Never print, commit, or record credential values, cookies, bearer tokens, raw
owner identifiers, private source bodies, prompts, completions, provider
payloads, Stripe identifiers, hosted logs, SQL output, stack traces, or secret
material.

## Inputs

Read and reconcile:

- `docs/roadmap/STATION_UI_UX_ROADMAP.md`
- `docs/roadmap/PR351_UX09_RAILWAY_STAGING_SWEEP_PREP_RESULT.md`
- `docs/roadmap/PR352_UX09_RAILWAY_STAGING_SWEEP_RESULT.md`
- `docs/roadmap/PR408_STAGING_DEMO_BROWSER_REHEARSAL_RESULT.md`
- `docs/roadmap/STAGING_FINAL_REHEARSAL_SWEEP_MIMIR.md`
- `docs/roadmap/UX07A_SETTINGS_TIER_SNAPSHOT_READBACK_ARIADNE.md`
- `docs/roadmap/UX08_ONBOARDING_ASSISTANT_FEASIBILITY_RESULT.md`
- `docs/roadmap/UX08A_PERSONA_CREATION_PROVIDER_COPY_ARIADNE.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

## DAEDALUS Task

Create:

```text
docs/roadmap/UX09_RAILWAY_STAGING_UX_REVIEW_PACKET.md
```

The packet must include:

- current Railway web/API targets;
- safe health/deployment freshness checks, or a clear reason they were not run;
- credential key names only;
- route order for public, signed-in, and mobile sweep;
- mutation boundaries;
- caveats carried forward from PR351, PR352, and PR408;
- new caveats from UX-07A and UX-08A being local-only evidence unless staging
  freshness proves they are deployed;
- pass, pass-with-caveat, fail, and blocked criteria;
- exact next wakeup.

Next wakeup rules:

- Wake ARIADNE if the packet is ready for a human rehearsal.
- Wake ARGUS if there is a security, privacy, auth, deployment-freshness, or
  mutation-boundary concern.
- Wake MIMIR if blocked or if the packet shows the sweep should not run yet.

## Boundaries

Do not create, edit, publish, retract, delete, report, moderate, upload, import,
connect OAuth, create Spaces, create Developer Spaces, generate keys, send
Assistant messages, change visibility, or trigger billing flows.

Do not click Checkout, Portal, top-up, upgrade, subscription-management,
publish, import, upload, moderation, report, OAuth, key-generation, or
destructive controls on hosted staging.

Do not inspect or record hosted logs, SQL, private payloads, provider payloads,
or secret values.

Do not change schema, config, Redis, Cloudflare, Stripe, Supabase, provider,
deployment, package, or product code in this prep lane.

Do not reopen generic Discern parity. UX-09 is staging readiness and current
product truth only.

## Safe Checks

Safe checks are limited to public health/deployment endpoints and source/docs
reconciliation unless a later wakeup explicitly authorizes more.

If API or browser checks are run, record only safe readiness facts:

- route class;
- HTTP status;
- boolean pass/fail;
- short commit prefix if a safe deployment endpoint exposes one;
- visible caveat summary with no private data.

## ARGUS Gate Expectations

ARGUS should reject the packet if:

- it includes secrets, cookies, tokens, raw owner identifiers, private bodies, or
  provider payloads;
- mutation boundaries are vague;
- UX-07A or UX-08A local-only evidence is overclaimed as hosted evidence;
- deployment freshness is claimed without a safe source;
- the next wakeup is ambiguous.

## ARIADNE Rehearsal Shape

If DAEDALUS wakes ARIADNE, the human rehearsal should cover:

- public front door and Discover;
- public Space to document to linked forum discussion;
- Forums and replay Salon;
- public Developer Space and observatory;
- Studio home, onboarding/persona creation, Memory, Continuity, Archive,
  Integrity, Global Archive, Publishing, Billing, Settings, and observability;
- Space/new routeability;
- publish routeability without mutation;
- Assistant prompt prefill without sending;
- mobile subset for navigation, readability, overflow, and action affordance.

ARIADNE should classify each stop as pass, pass with caveat, fail, or blocked,
then wake ARGUS for review if the sweep ran, DAEDALUS if a scoped fix is needed,
or MIMIR if the rehearsal cannot proceed.

## Required Validation

DAEDALUS must run:

```text
git diff --check
```

and an added-line sensitive-pattern scan over the packet/docs changes. Any
matches should be explained as boundary wording or treated as blockers.

## Wakeup Contract

When complete, commit with either:

```text
WAKEUP A4:
Codename: ARIADNE
```

if the packet is ready, or:

```text
WAKEUP A1:
Codename: MIMIR
```

if blocked or if MIMIR needs to resequence.
