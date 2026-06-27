# PR383 - Owner Continuity Search Rerun

Opened: 2026-06-27
Owner: ARIADNE
Status: open

## Purpose

Rerun the PR381 hosted owner continuity/search rehearsal after PR382's Memory
owner-visible JSON redaction repair and runtime-context readback hardening.

PR381 failed because the persona Memory stop rendered JSON-shaped source
material in visible owner text. PR382 extended the shared owner-visible redaction
helper and added a narrow runtime-context readback hardening.

## Freshness Gate

Target:

- `https://stationweb-production.up.railway.app`

Hosted web/API must be at or after:

- `d45aca72`

Use `d45aca72` rather than `e96e6161` because the review commit added the
runtime-context readback hardening that PR383 should also prove.

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
8. Send exactly one bounded staging chat prompt only if needed:

```text
Staging continuity rerun: name the seeded replay anchors and say whether the
answer is drawing from memory, archive, continuity, or runtime context. Do not
include private data.
```

9. If AI Activity trace detail is available, spot-check it for safe
   source/readback labels.

## Required Checks

Confirm:

- The Memory stop no longer renders raw JSON-shaped source material.
- JSON-shaped/fenced JSON memory previews show an explicit structured-source
  redaction/summary message.
- Normal prose memory/shared-memory text remains visible.
- Runtime context readback does not dump raw structured source content.
- Archive/File and Continuity stops remain reachable and safe.
- Global Archive redaction from PR379 still holds.
- The bounded chat response, if sent, is safe and does not overclaim source
  categories.
- AI Activity detail, if available, exposes only safe provider/profile/source
  metadata and no prompt/body/vector/provider payload/source dump.

## Pass Criteria

Return `PASS` if:

- Hosted freshness is at or after `d45aca72`.
- PR381's Memory raw JSON defect is gone.
- Runtime-context readback is safe.
- Archive/File, Continuity, and Global Archive regressions pass.
- Any chat/trace step remains bounded and safe.

Return `PASS WITH CAVEAT` if:

- The route is safe, but source-category storytelling or trace availability is
  still thin enough for a later UX/narrative lane.

Return `FAIL` if:

- Memory still renders raw JSON-shaped/fenced JSON source material.
- Runtime context readback dumps raw structured source content.
- Normal prose memory/shared-memory text is over-redacted.
- Global Archive redaction regresses.
- Chat/trace output exposes raw private material, raw IDs, provider payloads,
  SQL, stack traces, or secret-shaped values.

Return `BLOCKED` only for stale deploy, unavailable staging, missing credentials,
or auth/session breakage.

## Handoff Back To MIMIR

Wake MIMIR with:

- Verdict: `PASS`, `PASS WITH CAVEAT`, `FAIL`, or `BLOCKED`.
- Hosted freshness prefix observed.
- Routes checked.
- Whether PR381's Memory defect is gone.
- Whether runtime-context readback remained safe.
- Whether bounded chat/AI Activity trace was used and what it proved.
- Exact defects and recommended next owner if repair is needed.
