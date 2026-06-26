# PR370 - Provider Readback Human Rehearsal Result

Date: 2026-06-26
Owner: ARIADNE
Verdict: PASS WITH CAVEAT

## Scope

ARIADNE ran the hosted Railway rehearsal for PR369 provider/model readback.

Target:

```text
https://stationweb-production.up.railway.app
```

Route:

```text
/settings -> AI Activity -> Recent traces -> trace detail
```

Credential values, cookies, auth values, authorization header values, raw trace
IDs, raw owner IDs, raw private IDs, raw response bodies, prompts,
completions, provider payload bodies, raw URLs, authorization-token values,
keys, hosted
logs, SQL, stack traces, and secret-shaped values were not committed or
summarized.

## Freshness

Hosted web reported ready on `main` at commit prefix `ad2ebdca`, the PR369
product-code commit.

This proof was not blocked by stale deploy evidence.

## Hosted Rehearsal

ARIADNE signed in as the replay owner using local ignored credentials and
opened Settings.

Observed:

- `Settings` loaded.
- `AI Activity` loaded.
- `Recent traces` was visible.
- Six recent trace rows were available.
- Trace detail opened from the recent-trace list.
- The trace detail view did not show raw prompt text, completions, provider
  payload bodies, raw URLs, authorization-token values, keys, raw trace IDs,
  raw owner IDs, SQL, stack traces, or secret-shaped values.
- No document-level horizontal overflow was detected.

API-side sanitized trace checks:

- recent trace list status: `200`;
- recent trace count: 6;
- six trace detail reads returned status `200`;
- no recent trace detail contained embedding metadata fields.

Visible provider/readback checks:

- explicit embedding fact count: 0;
- generic `Provider gemini` visible: no;
- generic provider fact count in the inspected trace detail: 0;
- unsafe visible text detected: no.

## Caveat

The hosted line had recent AI Activity traces, but none of the six available
trace details contained embedding metadata. ARIADNE therefore could not inspect
live hosted `Embedding profile`, `Embedding provider`, `Embedding model`, or
`Embedding dimension` facts.

This is a data-shape caveat, not a DAEDALUS repair packet. The hosted UI still
proved the route loads, trace detail opens, generic Gemini-chat overclaim is
not visible, and private/secret-shaped material is not exposed.

MIMIR may choose a future fixture or replay lane if he wants a hosted trace
that definitely carries embedding metadata for a stronger human-eye proof.

## Result

PR370 passes with caveat.

No visible defect was found in Settings, AI Activity, or trace detail. No
Gemini chat implication was visible, and no private or secret-shaped payload was
visible.

## Validation

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr370-provider-readback-hosted.spec.cjs --reporter=line --workers=1` - passed, 1 test.
- `git diff --check` - pending in commit validation.
