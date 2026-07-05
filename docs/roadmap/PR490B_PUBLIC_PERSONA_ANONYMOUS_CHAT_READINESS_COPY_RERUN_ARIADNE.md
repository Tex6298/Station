# PR490B - Public Persona Anonymous Chat Readiness Copy Hosted Rerun

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - hosted rerun after PR490B repair

## Why This Exists

ARIADNE's first PR490A hosted rehearsal found one narrow product defect: the
owner-visible public-interaction readback did not name fail-closed rate-limit
readiness or provider readiness/blocker state when anonymous alpha chat was
available.

DAEDALUS repaired that copy in PR490B, and ARGUS accepted the repair without a
review patch:

- `docs/roadmap/PR490B_PUBLIC_PERSONA_ANONYMOUS_CHAT_READINESS_COPY_REPAIR_RESULT.md`
- `docs/roadmap/PR490B_PUBLIC_PERSONA_ANONYMOUS_CHAT_READINESS_COPY_REPAIR_REVIEW_RESULT.md`

This rerun is a hosted human-eye proof only. It does not reopen runtime
eligibility, provider routing, rate-limit behavior, prompt sources, public
reporting, moderation, billing, queues, Redis, Cloudflare, connectors, OAuth,
social dispatch, or broad public persona redesign.

## Hosted Target

- Web: `https://stationweb-production.up.railway.app`
- Required deployed app freshness: `890f9692 web: repair anonymous chat readiness copy` or later/deploy-equivalent.

If hosted web/API has not deployed the repair yet, return:

```text
DEPLOYMENT_WAITING
```

## Required Checks

ARIADNE should run this as a hosted human rehearsal on desktop, `375px`, and
`390px`.

Required proof:

- hosted web/API health and deployed commit freshness;
- replay-alpha owner Studio public-interaction readback;
- visible anonymous alpha availability remains replay-only;
- visible owner copy names fail-closed rate-limit posture;
- visible owner copy names rate-limit backing ready/not-ready state;
- visible owner copy names provider route ready/blocked state;
- visible copy still names public-source-only anonymous chat scope;
- visible copy still says no visitor transcript, identity, or raw event storage
  and aggregate counters only;
- owner rollback remains visible;
- public persona page has no signed-out or signed-in drift;
- desktop, `375px`, and `390px` fit without clipped critical copy or broken
  touch targets;
- no broad anonymous eligibility claim appears;
- no public Salon thread prompt-source overclaim appears;
- no runtime expansion claim appears;
- no private/raw/secret/provider/token/cookie/header/IP/user-agent readback
  appears;
- no live connector/OAuth, worker/queue, Redis, Cloudflare, billing, or social
  dispatch claim appears.

If a second ordinary public persona fixture exists, verify its owner readback
still presents signed-in-only anonymous status. If hosted still lacks that
fixture, record the fixture gap explicitly and do not turn that absence into a
broad pass.

## Verdicts

Use exactly one:

```text
PASS_READY_TO_CLOSE
PASS_READY_TO_CLOSE_WITH_FIXTURE_GAP
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_OR_SCOPE_FAIL
```

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR490B readiness-copy repair after DAEDALUS made owner-visible anonymous eligibility copy name fail-closed rate-limit posture and provider readiness/blocker state.
- Runtime remains one anonymous alpha slug only; PR490B is copy/readback repair, not runtime expansion.
Task:
- Rerun hosted /studio/personas/[personaId] owner public-interaction readback and public persona no-drift at app commit 890f9692 or later.
- Verify desktop, 375px, and 390px; visible rate-limit fail-closed and readiness state; visible provider ready/blocked state; replay-only anonymous availability; ordinary public persona signed-in-only readback if available; mobile fit; no broad anonymous claims; no public Salon prompt-source overclaim; no private/raw/secret/provider/token/cookie/header/IP/user-agent readback; and no runtime expansion claims.
- Wake MIMIR with PASS_READY_TO_CLOSE, PASS_READY_TO_CLOSE_WITH_FIXTURE_GAP, PRODUCT_DEFECT_NEEDS_DAEDALUS, DEPLOYMENT_WAITING, or PRIVACY_OR_SCOPE_FAIL.
Guardrails:
- Record fixture gaps explicitly. Do not turn missing second public persona into broad pass. Do not widen into runtime eligibility, private context, provider routing, prompt/retrieval changes, reporting/moderation, billing, workers, queues, Redis, Cloudflare, connectors, OAuth, social dispatch, public launch claims, or broad public persona redesign.
```
