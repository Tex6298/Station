# PR310 Memory Readback Rerun After Navigation Repair Result

Owner: A4 / ARIADNE
Status: complete
Date: 2026-06-25
Verdict: PASS

## Summary

PR310 reran the hosted/browser Memory readback rehearsal after the PR309
persona workspace navigation repair. Hosted web is fresh at commit prefix
`e9332fe58861`, which includes the required PR309 implementation commit
`e9332fe5`.

The required owner route passed without direct URL fallback:

```text
Studio -> intended replay persona -> Open Memory
```

The owner-only Memory readback showed the selected,
eligible-not-selected, and lifecycle-held-out buckets, including bounded
held-out badges. Owner redaction passed, and anonymous public routes did not
expose private Memory readback content.

## Hosted Freshness

Pass.

- Web `/health`: HTTP `200`, healthy.
- Web `/health/deployment`: HTTP `200`, `ready:true`, branch `main`.
- Web commit prefix: `e9332fe58861`.
- Web includes required PR309 implementation commit `e9332fe5`: yes.
- API `/health`: HTTP `200`, healthy.

## Owner Session

Pass.

- Hosted API sign-in returned HTTP `200`.
- Studio loaded as the replay owner.
- The browser reached the owner-only Memory route through the repaired UI.
- No credentials, cookies, tokens, raw ids, SQL, logs, prompts, completions,
  provider payloads, or private source bodies were printed or committed.

## Owner Route

Pass.

- Studio route reached: yes.
- Intended private platform replay persona match: exactly one.
- Owned persona count: `3`.
- Studio exposed the intended replay persona link: yes.
- Persona workspace exposed a visible `Open Memory` action: yes.
- `Open Memory` was clicked successfully: yes.
- Direct Memory URL fallback used: no.

## Memory Readback

Pass.

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

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr310-memory-rerun.spec.js --reporter=line --workers=1`:
  pass, one hosted browser test.
- `git diff --check`: pass.

## Recommendation

MIMIR can close the PR310/PR308 route caveat and treat the Memory readback
rehearsal as hosted product evidence. No DAEDALUS patch is recommended from
this pass.
