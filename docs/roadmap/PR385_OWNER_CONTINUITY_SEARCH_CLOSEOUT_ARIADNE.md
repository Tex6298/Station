# PR385 - Owner Continuity Search Closeout

Opened: 2026-06-27
Owner: ARIADNE
Status: open

## Purpose

Run one integrated hosted owner closeout after PR384 so the PR381/PR383/PR384
chain does not leave a loose AI Activity caveat.

This should prove the replay owner route is safe and coherent enough across
Memory, Archive/File, Continuity, Global Archive search, runtime readback, and
Settings AI Activity empty-state/readback.

## Freshness Gate

Target:

- `https://stationweb-production.up.railway.app`

Hosted web/API must be at or after:

- `ce01d605`

If Railway is stale or unavailable, return `BLOCKED` with the observed prefix or
failure.

## Human Route

Use replay-owner credentials from ignored local environment only. Do not paste
credentials, cookies, raw owner identifiers, raw persona identifiers, raw source
bodies, raw API bodies, screenshots, SQL, stack traces, or hosted logs into the
result.

Follow the hosted UI route:

1. Sign in as the replay owner.
2. Open `/studio`.
3. Navigate to the replay persona workspace.
4. Check the persona Memory stop.
5. Check the persona Archive/File stop.
6. Check the persona Continuity stop.
7. Check `/studio/archive` with a replay/private search.
8. Open `/settings` and check AI Activity.
9. If trace rows are present, open one trace detail and verify sanitized
   readback.
10. If no trace rows are present, verify the PR384 empty-state copy explains why
    read-only replay surfaces do not create trace rows.

Do not send a new chat prompt for this pass. PR384 established that read-only
replay should not create trace rows, and this closeout should avoid avoidable
mutation.

## Required Checks

Confirm:

- Memory still does not render raw JSON-shaped/fenced JSON source material.
- Normal memory/shared-memory prose remains visible.
- Runtime-context readback does not dump raw structured source content.
- Archive/File and Continuity stops remain reachable and safe.
- Global Archive redaction from PR379 still holds.
- AI Activity either shows openable sanitized trace detail rows, or shows the
  new honest empty state that distinguishes provider-backed trace writers from
  read-only replay surfaces.
- No raw private material, raw ids, provider payloads, prompts, completions,
  vectors, source bodies, SQL, stack traces, or secret-shaped values are visible.

## Pass Criteria

Return `PASS` if:

- Hosted freshness is at or after `ce01d605`.
- The owner continuity/search route is safe and coherent.
- AI Activity readback is honest whether trace rows are present or absent.
- No privacy/safety regression appears.

Return `PASS WITH CAVEAT` if:

- The route is safe, but source-category storytelling remains thin enough for a
  later UX/narrative lane.

Return `FAIL` if:

- Memory or runtime readback regresses to raw structured source text.
- Global Archive redaction regresses.
- AI Activity empty-state/readback is absent, misleading, or leaks private
  material.
- Existing trace rows are present but cannot be opened safely.

Return `BLOCKED` only for stale deploy, unavailable staging, missing credentials,
or auth/session breakage.

## Handoff Back To MIMIR

Wake MIMIR with:

- Verdict: `PASS`, `PASS WITH CAVEAT`, `FAIL`, or `BLOCKED`.
- Hosted freshness prefix observed.
- Routes checked.
- Whether AI Activity had trace rows or the empty-state path.
- Whether the PR381/PR383/PR384 chain can be closed.
- Exact defects and recommended next owner if repair is needed.
