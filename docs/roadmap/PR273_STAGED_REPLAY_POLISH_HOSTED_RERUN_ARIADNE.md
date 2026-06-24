# PR273 - Staged Replay Polish Hosted Rerun

Owner: A4 / ARIADNE
Status: open
Opened: 2026-06-24

## Purpose

Verify the three PR271 visible caveats on the hosted staging app after PR272's
polish patch, before MIMIR closes the caveats from product evidence.

ARGUS accepted PR272 from code/test evidence. This rerun asks whether the
deployed human-eye experience now matches that evidence.

## Freshness Gate

Start with hosted freshness:

- Web `/health` returns `ok:true`.
- API `/health` returns `ok:true`.
- Web `/health/deployment` is ready and points at `main`.
- API `/health/deployment` is ready and points at `main`.
- The deployed web commit is fresh enough to include the PR272 implementation
  commit `454f3ec` or a later `main` commit.

If Railway is still deploying, wait and rerun. If freshness cannot be proven
after a reasonable retry window, report `BLOCKED - deploy freshness` to MIMIR.

## Human Rehearsal Scope

Use a human-eye hosted run. Desktop and mobile are enough; no private payloads,
secrets, raw ids, screenshots, cookies, bearer tokens, prompts, provider
payloads, hosted logs, or database values should be committed.

Check only:

1. Public Discover right rail.
   - Route: `/discover`.
   - Condition: anonymous or signed-in public view is acceptable.
   - Pass: the right rail does not remain in an endless
     `Persona Roulette / Drawing...` state after page readiness.
   - Pass: it resolves to a public item, an honest empty state, or an honest
     unavailable/retry state.
2. Public Developer Space status.
   - Route: `/developer-spaces/station-replay-dev-alpha`.
   - Condition: anonymous public view preferred; signed-in public view is
     acceptable only if owner controls do not confuse the observation.
   - Pass: data-backed readback does not sit beside an overclaiming
     `Connecting` badge.
   - Pass: visible status copy clearly distinguishes live updates from latest
     readback or unavailable live updates.
3. Public forum category copy.
   - Route: `/forums`, plus the provider/category page if routeable.
   - Pass: the provider-list dash text is readable and does not show mojibake
     such as `â`, `Ã`, or `Â`.

## Non-Scope

Do not open a new full-site UI audit here. Do not mutate:

- imports;
- exports;
- billing or Stripe Checkout;
- posting, reporting, voting, or moderation;
- ingestion keys;
- Developer Space configuration;
- persona memory, canon, archive, or continuity state.

Do not relitigate broader known staging caveats such as global Archive/Export
shells, downloadable bundles/workers, or richer public story density unless one
of the three scoped checks directly exposes them.

## Result Shape

Create:

```text
docs/roadmap/PR273_STAGED_REPLAY_POLISH_HOSTED_RERUN_RESULT.md
```

Record:

- verdict: `PASS`, `PASS WITH CAVEATS`, `FAIL`, or `BLOCKED`;
- hosted freshness result;
- desktop and mobile viewport conditions;
- each of the three scoped checks and observed outcome;
- exact next-owner recommendation.

Use sanitized descriptions only. Do not commit screenshots unless they are
already sanitized and genuinely necessary.

## Handoff

Wake MIMIR with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR273 hosted rerun for the three PR271/PR272 visible caveats.
- [PASS / PASS WITH CAVEATS / FAIL / BLOCKED and one-line reason]
Validation:
- [hosted freshness result]
- [desktop/mobile result]
- [three scoped check results]
Recommendation:
- [close caveats / send DAEDALUS another tiny patch / wait for deploy freshness / other exact next owner]
```
