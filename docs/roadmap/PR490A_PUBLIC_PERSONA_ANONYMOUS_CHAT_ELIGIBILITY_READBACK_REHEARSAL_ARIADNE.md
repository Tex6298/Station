# PR490A - Public Persona Anonymous Chat Eligibility Readback Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - hosted human-eye rehearsal

## Why This Rehearsal

ARGUS accepted DAEDALUS' PR490A implementation with a narrow source-scope
honesty patch:

`docs/roadmap/PR490A_PUBLIC_PERSONA_ANONYMOUS_CHAT_ELIGIBILITY_READBACK_REVIEW_RESULT.md`

PR490A is a visible owner/admin readback change. It does not expand anonymous
public persona chat runtime behavior. It makes the existing owner/admin public
interaction readback state the current truth:

- `station-replay-alpha-persona` is the only anonymous alpha slug;
- ordinary public personas remain signed-in alpha;
- anonymous eligibility readback is owner/admin-only;
- public-source-only scope means public profile, published public documents,
  and linked public discussions only;
- no visitor transcript, visitor identity, or raw event storage is promised;
- owner rollback and fail-closed rate-limit/provider blocker copy stay visible.

Because this changes hosted visible readback, MIMIR routes ARIADNE for desktop
and mobile human-eye proof before closeout.

## Hosted Target

Use hosted Railway Station:

```text
https://stationweb-production.up.railway.app
```

Use a signed-in staging owner. Prefer the existing replay owner if available.

Freshness target:

```text
ffb96b0d review: accept PR490A anonymous eligibility readback
```

Hosted web/API should be at `ffb96b0d` or later, or at a deploy-equivalent app
commit if later commits are docs/state-only. If freshness is not deployed,
return `DEPLOYMENT_WAITING` with the concrete served commit and stop.

## Required Checks

ARIADNE should verify only the accepted PR490A visible/readback boundary.

1. Hosted health and freshness:
   - web health is ready;
   - API health is ready;
   - served web/app commit is `ffb96b0d` or later, or a clearly
     deploy-equivalent app-code commit.
2. Owner Studio replay-alpha readback:
   - signed-in owner can open the hosted owner Studio persona route for the
     replay alpha persona if the hosted seed exposes it;
   - the public interaction readback shows anonymous alpha availability only for
     the replay alpha persona;
   - copy names replay-only policy, owner rollback, fail-closed rate-limit/
     provider readiness, no visitor transcript/identity/raw event storage, and
     aggregate-only counters;
   - public-source-only copy does not mention public Salon threads as chat
     prompt sources.
3. Ordinary public persona readback:
   - if a second ordinary public persona exists, owner readback shows
     signed-in-alpha only and no anonymous-alpha availability;
   - if no second public persona exists, record the fixture gap explicitly
     instead of treating it as broad proof.
4. Public persona page no-drift:
   - signed-out `/personas/station-replay-alpha-persona` remains usable and
     anonymous chat remains bounded to the replay slug;
   - ordinary public persona pages, if visible, do not show broad anonymous
     claims;
   - signed-in public persona state does not expose owner/admin readback.
5. Mobile fit:
   - desktop, `375px`, and `390px` checks show no horizontal overflow,
     clipping, overlapping controls, unreadable wrapping, or undersized
     touch targets on the readback surfaces.
6. Scope and privacy:
   - no private source bodies, prompts, completions, transcripts, raw ids,
     storage paths, signed URLs, provider payloads, stack traces,
     bearer/JWT-shaped values, secret-shaped values, token/cookie/header/IP/
     user-agent readback, public launch/commercial claims, live connector/OAuth
     claims, worker/queue claims, placeholder controls, runtime expansion
     claims, or broad anonymous-chat availability claims appear.

## Verdicts

Return one of:

```text
PASS_READY_TO_CLOSE
PASS_READY_TO_CLOSE_WITH_FIXTURE_GAP
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_OR_SCOPE_FAIL
```

Use `PASS_READY_TO_CLOSE` only if hosted desktop/mobile owner readback, public
persona no-drift, mobile fit, privacy/scope checks, and available ordinary
public persona proof pass.

Use `PASS_READY_TO_CLOSE_WITH_FIXTURE_GAP` if everything available passes but
hosted lacks a second ordinary public persona for signed-in-only readback proof.

Use `PRODUCT_DEFECT_NEEDS_DAEDALUS` for visible defects such as missing owner
readback, overclaiming anonymous availability, mentioning public Salon threads
as anonymous chat prompt sources, mobile layout breakage, broad public persona
runtime claims, broken replay anonymous route, broken signed-in public persona
state, or placeholder/unwired controls.

Use `PRIVACY_OR_SCOPE_FAIL` if private material leaks or PR490A visibly drifts
into runtime expansion, private context, public reporting, moderation action,
provider/model routing, prompt/retrieval changes, billing, workers, queues,
Redis, Cloudflare, connector/OAuth, social dispatch, public launch claims, or
broad public persona redesign.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR490A anonymous chat eligibility readback hosted rehearsal.
Verdict:
- PASS_READY_TO_CLOSE | PASS_READY_TO_CLOSE_WITH_FIXTURE_GAP | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_OR_SCOPE_FAIL
Task:
- Close PR490A, record fixture caveat, wait for deploy, route the smallest DAEDALUS repair, or handle the privacy/scope failure.
```

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR490A Public Persona Anonymous Chat Eligibility Readback after DAEDALUS added owner/admin readback and ARGUS patched source-scope honesty.
- Runtime remains one anonymous alpha slug only; PR490A is visible readback, not runtime expansion.
Task:
- Rehearse hosted owner Studio persona public-interaction readback and public persona no-drift at app commit ffb96b0d or later.
- Check desktop, 375px, and 390px; replay alpha anonymous eligibility if seeded; ordinary public persona signed-in-only readback if available; public persona page no-drift; mobile fit; no broad anonymous claims; no public Salon thread prompt-source overclaim; no private/raw/secret/provider/token/cookie/header/IP/user-agent readback; and no runtime expansion claims.
- Wake MIMIR with PASS_READY_TO_CLOSE, PASS_READY_TO_CLOSE_WITH_FIXTURE_GAP, PRODUCT_DEFECT_NEEDS_DAEDALUS, DEPLOYMENT_WAITING, or PRIVACY_OR_SCOPE_FAIL.
Guardrails:
- Record fixture gaps explicitly. Do not turn a missing second public persona into a broad pass. Do not widen into runtime eligibility, private context, provider routing, prompt/retrieval changes, reporting/moderation, billing, workers, queues, Redis, Cloudflare, connectors, OAuth, social dispatch, public launch claims, or broad public persona redesign.
```
