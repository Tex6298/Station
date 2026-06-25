# PR308 Memory Readback Human Rehearsal Result

Owner: A4 / ARIADNE
Status: complete
Date: 2026-06-25
Verdict: FAIL

## Summary

PR308 ran the hosted/browser Memory readback rehearsal after PR307 deployed.
Hosted web freshness passed at commit prefix `e63ac9d28e57`, which includes the
required PR307 implementation commit `e63ac9d2`.

The owner-only Memory page itself passed after direct-route fallback: it showed
the selected, eligible-not-selected, and lifecycle-held-out buckets; showed
held-out status badges; preserved redaction; and did not leak Memory readback
to public routes.

The failure is the actual owner route requested by MIMIR. Studio exposed the
intended replay persona link, but the persona workspace did not expose a visible
Memory tab/link in the hosted browser rehearsal. The rehearsal had to fall back
to the direct owner-only Memory URL to inspect the readback. That makes this a
route/navigation defect, not a Memory readback data defect.

## Hosted Freshness

Pass.

- Web `/health`: HTTP `200`, healthy.
- Web `/health/deployment`: HTTP `200`, `ready:true`, branch `main`.
- Web commit prefix: `e63ac9d28e57`.
- Web includes required PR307 implementation commit `e63ac9d2`: yes.
- API `/health`: HTTP `200`, healthy.

## Owner Session

Pass with harness caveat.

- Hosted API sign-in returned HTTP `200`.
- The browser used the API-issued replay-owner session in local browser storage
  and protected-route cookie state.
- Studio loaded as the replay owner.
- No credentials, cookies, tokens, raw ids, SQL, logs, prompts, completions,
  provider payloads, or private source bodies were printed or committed.

## Owner Route

Fail.

- Studio route reached: yes.
- Intended private platform replay persona match: exactly one.
- Studio exposed the intended replay persona link: yes.
- Persona workspace exposed a visible Memory tab/link: no.
- Direct Memory URL fallback used for readback inspection: yes.

## Memory Readback

Pass after direct-route fallback.

- Memory items counted: `16`.
- Selected for runtime preview: `3`.
- Eligible active memory not selected: `7`.
- Lifecycle-held-out memory: `6`.
- Held-out badges/counts visible:
  - `Quarantined 5`
  - `Rejected 1`
- Runtime preview readback showed:
  - selected bucket,
  - eligible-not-selected bucket,
  - lifecycle-held-out bucket,
  - owner-facing summary copy for selected, eligible, and held-out state.

## Redaction

Pass.

The owner Memory page did not expose raw ids, secret-shaped values, hidden
prompts, provider payload markers, credentials, or the known raw private source
body markers checked by the rehearsal.

## Public Boundary

Pass.

Anonymous public routes checked:

- Discover.
- Public Space.
- Public document opened from the public Space.
- Forums.
- Public Developer Space.

None exposed the private Memory readback labels, selected/eligible/held-out
runtime explanation, raw ids, hidden prompts, provider payload markers,
credentials, or raw private source body markers checked by the rehearsal.

## Validation

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr308-memory-rehearsal.spec.js --reporter=line --workers=1`:
  failed intentionally after producing sanitized evidence because the actual
  owner route did not expose a visible Memory tab/link.
- `git diff --check`: pending final validation before commit.

## Recommendation

DAEDALUS should inspect the hosted persona workspace navigation and repair why
the Memory tab/link is not visible/clickable in the actual Studio -> replay
persona -> Memory route. After that, rerun this same ARIADNE rehearsal. The
Memory readback surface itself looks bounded once reached.
