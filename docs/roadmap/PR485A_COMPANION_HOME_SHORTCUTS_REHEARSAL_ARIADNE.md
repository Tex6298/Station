# PR485A - Companion Home Shortcuts Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - hosted human-eye rehearsal

## Why This Rehearsal

ARGUS accepted DAEDALUS' PR485A implementation without a review patch:

`docs/roadmap/PR485A_COMPANION_HOME_SHORTCUTS_REVIEW_RESULT.md`

PR485A is intentionally small and web-only. It adds a compact owner-visible
`Companion workspace shortcuts` strip above private chat on the existing owner
persona home route:

```text
/studio/personas/[personaId]
```

The strip links to existing Tex owner routes:

- Memory -> `/studio/personas/[personaId]/memory`
- Timeline -> `/studio/personas/[personaId]/continuity`
- Profile -> `/studio/personas/[personaId]/edit`
- Integrity -> `/studio/personas/[personaId]/calibration`

Because this changed a hosted owner-visible persona surface, MIMIR routes
ARIADNE for desktop and mobile human-eye proof before closeout.

## Hosted Target

Use hosted Railway Station:

```text
https://stationweb-production.up.railway.app
```

Use a signed-in staging owner persona route. Prefer the existing replay owner
persona if available, but any owner persona route is acceptable if it exercises
the same `/studio/personas/[personaId]` surface.

Freshness target:

```text
93716a5b web: add persona companion shortcuts
```

Hosted web/API should be at `93716a5b` or later, or at a deploy-equivalent app
commit if later commits are docs/state only. If freshness is not deployed,
return a concrete deployment/freshness blocker and do not widen scope.

## Required Checks

ARIADNE should verify only the accepted PR485A visible boundary:

1. Desktop route:
   - signed-in owner can open `/studio/personas/[personaId]`;
   - `Companion workspace shortcuts` is visible above private chat;
   - the strip is readable, compact, and aligned with Tex's current Studio
     visual language;
   - no unrelated global shell, public page, billing, Developer Space, Archive
     connector, or Discern CSS/reskin drift appears.
2. Mobile fit:
   - repeat at `375px` and `390px`;
   - the shortcut strip wraps/stacks cleanly;
   - no horizontal overflow, clipped labels, overlapping text, broken touch
     targets, or inaccessible links.
3. Link routing:
   - Memory routes to `/studio/personas/[personaId]/memory`;
   - Timeline routes to `/studio/personas/[personaId]/continuity`;
   - Profile routes to `/studio/personas/[personaId]/edit`;
   - Integrity routes to `/studio/personas/[personaId]/calibration`;
   - each target is an existing owner workspace surface, not a new public route.
4. Chat and existing panels:
   - private chat still renders in the same page;
   - if a safe no-secret chat smoke is possible, verify streaming/status/error
     behavior was not visibly broken;
   - runtime context preview, archive export status, published continuity
     history, public interaction readback, voice/avatar readiness, and encounter
     panels still render or remain in their prior accepted states.
5. Scope and privacy:
   - no Memory inbox/candidate inbox, return-to-thread behavior, companion
     presence prompt context, prompt/retrieval/provider changes, API behavior,
     archive connector behavior, billing, queues/workers, Cloudflare/Redis,
     social connectors, or public writes appear in PR485A;
   - no private ids, owner ids, raw source/candidate bodies, compiled prompts,
     provider payloads, tokens, cookies, SQL/table details, stack traces,
     hosted logs, or secret-shaped values render.

## Verdicts

Return one of:

```text
PASS_READY_TO_CLOSE
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_OR_SCOPE_FAIL
```

Use `PASS_READY_TO_CLOSE` only if the hosted desktop/mobile visual fit,
shortcut routing, existing chat/panel continuity, and privacy/scope checks pass.

Use `PRODUCT_DEFECT_NEEDS_DAEDALUS` for visible defects such as missing strip,
wrong route, broken mobile layout, clipped controls, confusing copy, or visible
regression to private chat or existing persona panels.

Use `PRIVACY_OR_SCOPE_FAIL` if private material leaks or if PR485A visibly
drifts into forbidden Memory inbox, prompt/runtime, archive connector,
billing/infra, public-write, broad reskin, or Discern CSS behavior.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR485A Companion Home Shortcuts hosted rehearsal.
Verdict:
- PASS_READY_TO_CLOSE | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_OR_SCOPE_FAIL
Task:
- Close PR485A, wait for deploy, route the smallest DAEDALUS repair, or handle the privacy/scope failure.
```

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR485A Companion Home Shortcuts after DAEDALUS added the compact owner shortcut strip on `/studio/personas/[personaId]`.
- This is a visible owner persona home change and needs hosted desktop plus 375px/390px mobile rehearsal before MIMIR closes it.
Task:
- Rehearse the hosted owner persona page at app commit `93716a5b` or later.
- Verify the shortcut strip is visible, readable, fitted, and routes Memory, Timeline, Profile, and Integrity to the existing Tex owner routes.
- Confirm private chat and existing persona panels still render, no unrelated reskin/global shell drift appears, and no private/secret-shaped material leaks.
- Wake MIMIR with PASS_READY_TO_CLOSE, PRODUCT_DEFECT_NEEDS_DAEDALUS, DEPLOYMENT_WAITING, or PRIVACY_OR_SCOPE_FAIL.
```
