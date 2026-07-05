# PR485A - Companion Home Shortcuts Closeout

Owner: MIMIR / A1

Date closed: 2026-07-05

Status: Closed

## Closeout

PR485A is closed as accepted and hosted-rehearsed.

DAEDALUS implemented the accepted first Discern companion UX translation slice:
a compact owner-visible `Companion workspace shortcuts` strip on the existing
owner persona home/chat route:

```text
/studio/personas/[personaId]
```

ARGUS accepted the implementation without a review patch, and ARIADNE completed
the hosted desktop, `375px`, and `390px` mobile rehearsal with:

```text
PASS_READY_TO_CLOSE
```

## Accepted Product Truth

The shortcut strip links only to existing Tex owner workspace routes:

- Memory -> `/studio/personas/[personaId]/memory`
- Timeline -> `/studio/personas/[personaId]/continuity`
- Profile -> `/studio/personas/[personaId]/edit`
- Integrity -> `/studio/personas/[personaId]/calibration`

It uses ordinary owner-route links, scoped Studio CSS, and no new fetch.

## Validation Evidence

Accepted evidence:

- `docs/roadmap/PR485A_COMPANION_HOME_SHORTCUTS_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR485A_COMPANION_HOME_SHORTCUTS_RESULT.md`
- `docs/roadmap/PR485A_COMPANION_HOME_SHORTCUTS_REVIEW_RESULT.md`
- `docs/roadmap/PR485A_COMPANION_HOME_SHORTCUTS_REHEARSAL_RESULT.md`

ARIADNE hosted proof confirmed:

- hosted web/API were ready at product commit `93716a5b`;
- shortcut visibility, readability, fit, and touch targets passed on desktop,
  `375px`, and `390px`;
- all four shortcut targets loaded accepted existing owner routes;
- private chat and existing persona panels still rendered;
- no private ids, source bodies, prompt/provider payloads, tokens, cookies,
  SQL details, stack traces, hosted logs, or secret-shaped values rendered;
- no Archive Connector behavior, Memory inbox, return-to-thread behavior,
  companion presence prompt context, billing, queue/worker, Cloudflare/Redis,
  social connector, public write, broad shell work, or Discern CSS drift entered
  PR485A.

## Explicitly Deferred

The rest of the Discern companion UX translation remains separate:

- PR485B: Memory inbox / continuity candidate inbox.
- Later slice: return-to-thread readback.
- Later slice: companion capability/presence prompt context.
- Later slice: local chat surface polish if it improves Tex without importing
  Discern's skin.

## Next Baton

MIMIR opens PR485B to ARGUS as a hostile preflight before DAEDALUS builds,
because candidate inbox work touches owner-only continuity candidate readback,
source filtering, and promotion/rejection behavior.

