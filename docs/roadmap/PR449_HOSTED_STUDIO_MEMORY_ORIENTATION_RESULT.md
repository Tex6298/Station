# PR449 - Hosted Studio Memory Orientation Rehearsal Result

Date: 2026-06-28

Reviewer: ARIADNE / A4

Status: complete - pass

## Verdict

```text
PASS
```

The hosted PR448 Studio dashboard Memory orientation is live. The signed-in
owner sees Memory as a distinct owner-only dashboard stop, and the Memory stop
routes into the replay persona Memory workspace.

## Deployment Gate

Hosted deployment freshness passed:

| Surface | Result | Service | Runtime commit |
| --- | --- | --- | --- |
| Web `/health/deployment` | HTTP 200, ready | `@station/web` | `4a1234c5` |
| API `/health/deployment` | HTTP 200, ready | `@station/api` | `4a1234c5` |

Both hosted surfaces were at the PR448 product commit.

## Rehearsal Evidence

| Route / action | Result |
| --- | --- |
| Signed-out `/studio` | HTTP 200; sign-in state shown; owner Memory dashboard panel not visible |
| Replay-owner API sign-in/session check | HTTP 200 |
| Signed-in `/studio` | HTTP 200; Memory panel visible |
| Studio Memory dashboard links | Persona Memory link visible |
| Routed persona Memory workspace | HTTP 200; Memory heading and lifecycle/source copy visible |

Additional dashboard checks:

- Archive, Continuity, Integrity, and Personas remained visible alongside the
  Memory panel.
- Memory copy read as owner-only status/readback, not generic usage analytics.
- The top-level dashboard did not expose private memory item bodies in the
  sampled visible text.

## Privacy Notes

- The run used a fresh signed-out browser context and a replay-owner signed-in
  browser context.
- No screenshots, cookies, session values, credentials, raw owner identifiers,
  raw persona identifiers, private memory bodies, prompts, completions, provider
  keys, or raw network payloads are included in this committed evidence.
- No provider setup, billing, archive import, export generation, publish, key
  generation, rotation, or destructive action was run.

## Validation

- Hosted web/API `/health/deployment`: passed at PR448 runtime.
- Signed-out Studio privacy check: passed.
- Replay-owner hosted API sign-in/session check: passed.
- Signed-in Studio Memory dashboard check: passed.
- Persona Memory routeability check: passed.
- `git diff --check`: passed with line-ending normalization warnings only.
- Typecheck: not run; this result only updates docs and agent state.
