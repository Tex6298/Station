# PR265 - Archive Trust Rehearsal

Owner: A4 / ARIADNE
Status: open
Opened by: A1 / MIMIR
Date: 2026-06-24

## Why

DAEDALUS implemented PR264 Per-Persona Archive Trust States and ARGUS accepted
it with a narrow review patch. Because PR264 changes visible owner Studio
behavior on the per-persona Archive route, ARIADNE should run a hosted
human-eye rehearsal before MIMIR closes UX-02A.

## Hosted Freshness Gate

Before judging the route, verify hosted Railway freshness:

- Web `/health/deployment` is healthy and ready.
- Web deployment is on `main` at or beyond ARGUS review patch commit `38ad00e`.
- API `/health/deployment` is healthy and ready if sign-in or route data needs
  API confirmation.
- If hosted is older or still deploying, wait and retry. If it remains old,
  return `BLOCKED`, not `FAIL`.

Do not print credentials, cookies, tokens, env values, service keys, or secrets.

## Route

Rehearse the owner Archive route on the hosted Railway web app:

- Sign in as the replay owner.
- Visit `/studio/personas/:personaId/files`.
- If the persona id is easier through UI, navigate Studio -> replay persona ->
  Archive.
- Check desktop.
- Check `375px` or `390px` mobile.

## Pass Criteria

ARIADNE should pass only if all of this holds:

- The Archive tab visibly explains owner-only source material, readiness for
  Continuity, needs-review/failed states, and queued/processing states.
- Uploaded files are not double-counted as separate source material just
  because they also have file import jobs.
- Failed imports remain visible and specific through sanitized error readback.
- Storage/quota remains server-reported and does not look like a frontend-only
  invented limit.
- Empty/thin states are honest and do not imply fake archive activity.
- Every visible action is wired, disabled, or clearly preview-only.
- The route does not imply global Archive/Export implementation, downloadable
  bundles, workers, external connector imports, private search UI, Redis,
  Cloudflare, provider, embedding, billing, auth/session, deployment, public
  routes, backend API, schema, or migration changes.
- Desktop and mobile have no horizontal overflow, clipped controls, incoherent
  overlap, cramped trust rows, or unreadable text.
- No raw ids, bearer tokens, secrets, SQL, stack traces, hosted logs, raw route
  bodies, or unsanitized private payloads render.

## Non-Scope

Do not mutate archive/import/export data during this rehearsal unless the UI
already has a harmless seeded owner action that is part of the intended route
flow. Do not create screenshots in the repo.

## If It Fails

Return the exact route, viewport, visible defect, and defect category:

- `comprehension`
- `privacy`
- `action wiring`
- `layout`
- `hosted freshness`

## Wake MIMIR

When done, wake MIMIR with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR265 Archive Trust Rehearsal.
- Verdict: PASS/FAIL/BLOCKED.
- Routes/viewports checked: ...
Findings:
- ...
Validation:
- ...
Task:
- Close PR264/PR265 or open the smallest DAEDALUS repair.
```
