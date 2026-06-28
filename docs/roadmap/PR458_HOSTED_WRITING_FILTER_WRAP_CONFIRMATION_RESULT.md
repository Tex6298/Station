# PR458 - Hosted Writing Filter Wrap Confirmation Result

Date: 2026-06-28

Reviewer: ARIADNE / A4

Status: complete - pass

## Verdict

```text
PASS
```

Hosted `/writing` now keeps the type filter controls inside the panel at the
mobile widths that failed in PR456.

## Deployment Gate

Hosted deployment freshness passed:

| Surface | Result | Service | Runtime commit |
| --- | --- | --- | --- |
| Web `/health/deployment` | HTTP 200, ready | `@station/web` | `e3809f0a` |
| API `/health/deployment` | HTTP 200, ready | `@station/api` | `e3809f0a` |

The web runtime is at the required PR457 product commit. API health was recorded
as a cheap companion check; the behavior gate for this CSS-only fix is the web
surface.

## Rehearsal Evidence

Route sampled:

```text
/writing
```

Viewport set:

- desktop
- 430px
- 390px
- 375px
- 320px

Results:

- `/writing` returned HTTP 200 at all sampled widths.
- No page-wide horizontal overflow appeared before or after interacting with a
  type filter.
- All writing type filters were present, visible, and within the viewport at
  desktop, 430px, 390px, 375px, and 320px.
- Field Log, Theory, and Research were visible inside the panel at the widths
  where PR456 found them offscreen.
- Clicking Research updated the active filter state without introducing layout
  overflow.
- Latest, Featured, and Staff picks remained present.
- Staff picks remained visibly disabled on hosted.
- The search field remained reachable and readable at all sampled widths.
- Visible text did not expose raw identifiers, prompts, private bodies,
  provider payloads, credentials, storage paths, stack traces, or secret-shaped
  material.

## Notes

This was a read-only hosted visual confirmation. It did not publish, edit,
delete, upload, run provider setup, run billing checkout, or call private model
flows.

No screenshots, cookies, session values, raw ids, private source bodies,
prompts, completions, provider keys, stack traces, or raw network payloads were
committed.

## Validation

- Hosted web `/health/deployment`: passed at required runtime.
- Hosted API `/health/deployment`: passed as companion health check.
- Desktop `/writing` layout check: passed.
- 430px `/writing` layout check: passed.
- 390px `/writing` layout check: passed.
- 375px `/writing` layout check: passed.
- 320px `/writing` layout check: passed.
- Type filter click check: passed with Research active-state update.
- Staff picks disabled-state check: passed.
- Raw-id, stack trace, storage path, credential, and secret-shaped visible text
  checks: passed.
- `git diff --check`: passed with line-ending normalization warnings only.
- Typecheck: not run; this result only updates docs and agent state.
