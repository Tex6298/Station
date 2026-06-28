# Feature Memory Continuity Archive Observability DAEDALUS Proof Result

Owner: DAEDALUS / A2

Date: 2026-06-28

Status: ready for ARIADNE rerun

Verdict: PROVED ON HOSTED WITH EXPECTED SESSION SURFACES

## Summary

DAEDALUS investigated ARIADNE's blocked hosted rehearsal for the
Memory/Continuity/Archive observability lane.

No product code repair was needed in this follow-up. The hosted web deployment
was already serving DAEDALUS' implementation commit, and a fresh browser proof
showed the owner route bodies, runtime provenance readback, and routeable
review links when the browser carried both Station auth surfaces:

- `station.auth.session.v1` in local storage;
- `station-auth` cookie for protected route middleware.

The earlier hosted failure was not reproduced by the sanitized proof. One
diagnostic gotcha found during DAEDALUS' proof is that browser `innerText`
reflects CSS-transformed section labels as uppercase, so exact-case text scans
can falsely report labels such as `Runtime Context` and `Runtime provenance` as
missing even when they are visible.

## Hosted Target

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`
- Hosted web deployment commit: `43e464e83809`
- Account: replay owner from ignored local env values.

Credentials, bearer tokens, cookies, raw persona ids, raw owner ids, source
bodies, prompts, completions, provider payloads, hosted logs, SQL, and private
payloads were not committed or summarized.

## Proof Result

The temporary browser proof signed in through the hosted API, verified
`/auth/me`, selected one owned persona through `/personas`, and opened the
owner Studio route family with the expected session local storage and auth
cookie.

All proof checks passed:

- Persona home loaded on desktop and mobile without redirecting to `/login`.
- Persona home exposed `Private Chat`, `Runtime Context`, and
  `Continuity loaded for the next response`.
- Continuity loaded on desktop and mobile without redirecting to `/login`.
- Continuity exposed `Runtime Continuity`,
  `Continuity records in runtime context`, `Runtime provenance`, and
  `Where selected context came from`.
- Continuity exposed routeable owner links for:
  - `Review in Canon`
  - `Review Integrity Session`
  - `Review Continuity record`
  - `Review in Memory`
  - `Review in Archive`
- Adjacent owner review surfaces loaded and exposed the expected route bodies:
  - Memory: `Memory Briefing`, `Runtime context`, `Observability handoff`,
    `Lifecycle review`
  - Canon: `Canonical Rules`
  - Integrity: `Integrity Overview`, `Session Timeline`
  - Archive: `Archive Trust`, `Storage and Quota`, `Import Pipeline`,
    `Archive Import Library`
- The checked route bodies did not expose UUID-shaped visible text.

## Boundaries

- No API routes changed.
- No web product code changed.
- No auth, schema, retrieval, archive import, continuity, Memory, Canon,
  Integrity, provider, hosted config, or public route behavior changed.
- No temporary proof runner was kept in the repo.

## Validation

- Hosted browser proof with local-only replay owner credentials: passed.
- Hosted web deployment identity: `43e464e83809`.
- `git diff --check`: passed with CRLF normalization warnings only.

## Handoff

ARIADNE should rerun the human-eye owner rehearsal against hosted web/API.

Rerun guardrails:

- Sign in through the product UI, or ensure both the Station local storage
  session and `station-auth` cookie are present before opening protected
  Studio routes.
- Treat CSS-transformed section labels as visible if the browser renders them
  in uppercase.
- Continue checking desktop/mobile route bodies, routeable review links,
  horizontal overflow, raw UUID-shaped values, secret-shaped values, and
  non-auth mutating browser requests.
