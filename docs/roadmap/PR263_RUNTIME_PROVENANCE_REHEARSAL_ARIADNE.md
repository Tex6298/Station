# PR263 - Runtime Provenance Rehearsal

Owner: A4 / ARIADNE
Status: open
Opened by: A1 / MIMIR
Date: 2026-06-24

## Why

ARGUS accepted PR262 Owner Runtime Provenance Stitching Readback with no review
patch. Because PR262 changes visible owner Studio behavior on the Continuity
route, it needs hosted human-eye rehearsal before MIMIR closes the slice.

## Hosted Freshness Gate

Before judging the route, verify hosted Railway freshness:

- Web `/health/deployment` is healthy and ready.
- Web deployment is on `main` at or beyond PR262 implementation commit
  `bb40318`.
- API `/health/deployment` is healthy and ready if sign-in or route data needs
  API confirmation.
- If hosted is older or still deploying, wait and retry. If it remains old,
  return `BLOCKED`, not `FAIL`.

Do not print credentials, cookies, tokens, env values, service keys, or secrets.

## Route

Rehearse the owner Continuity route on the hosted Railway web app:

- Sign in as the replay owner.
- Visit `/studio/personas/:personaId/continuity`.
- If the persona id is easier through UI, navigate Studio -> replay persona ->
  Continuity.
- Check desktop.
- Check `375px` or `390px` mobile.

## Pass Criteria

ARIADNE should pass only if all of this holds:

- Runtime provenance is visible near runtime context and reads as owner-only
  readback, not a raw or debug trace.
- The owner can tell whether to review Memory, Archive, Continuity record,
  Canon, or Integrity when a source looks wrong.
- Canon, Integrity, Continuity, Memory, and Archive groups/counts are
  understandable, including honest empty or thin states.
- Review-target copy is helpful without introducing mutation controls.
- Existing runtime preview still does not show compiled prompts or source body
  content.
- The page does not render raw prompts, completions, trace bodies, provider
  payloads, private archive excerpts, source bodies, raw source ids, raw link
  ids, owner ids, bearer tokens, secrets, SQL, stack traces, hosted logs, URLs,
  or private route bodies.
- The route does not imply retrieval ranking, embeddings, memory truth, source
  serialization, visibility, provider behavior, Redis/Cloudflare, schema,
  workers, billing, auth/session, deployment, public memory, public
  observability, graph canvas, richer trace detail, broad Studio, or Developer
  Space behavior changed.
- Desktop and mobile have no horizontal overflow, cramped chips, clipped
  controls, incoherent overlap, or unreadable text.

## Non-Scope

Do not mutate or broaden:

- Memory, Archive, Continuity, Canon, Integrity, exports, billing, providers,
  Redis, Cloudflare, auth, deployment, or hosted config.
- Unrelated Studio routes except for basic navigation into the target route.
- Screenshots committed to the repo.

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
- ARIADNE completed PR263 Runtime Provenance Rehearsal.
- Verdict: PASS/FAIL/BLOCKED.
- Routes/viewports checked: ...
Findings:
- ...
Validation:
- ...
Task:
- Close PR262/PR263 or open the smallest DAEDALUS repair.
```
