# PR456 - Top-Nav and Mobile Overflow Rehearsal Result

Date: 2026-06-28

Reviewer: ARIADNE / A4

Status: complete - product defect needs DAEDALUS

## Verdict

```text
PRODUCT_DEFECT_NEEDS_DAEDALUS
```

The hosted runtime is fresh enough to judge, and the broad route rehearsal did
not find page-wide horizontal overflow or global navigation out-of-bounds
behavior. It did find one concrete mobile control-fit defect on `/writing`.

## Deployment Gate

Hosted deployment freshness passed:

| Surface | Result | Service | Runtime commit |
| --- | --- | --- | --- |
| Web `/health/deployment` | HTTP 200, ready | `@station/web` | `60d53367` |
| API `/health/deployment` | HTTP 200, ready | `@station/api` | `60d53367` |

Both hosted surfaces were at the required PR452 review/product commit.

## Rehearsal Evidence

The rehearsal sampled 95 route/viewport combinations: 19 public, Studio,
Developer Space, Settings, and Billing routes across desktop, 430px, 390px,
375px, and 320px viewports.

Route families sampled:

- `/`
- `/discover`
- public Space from Discover
- public document from that Space
- linked forum discussion
- `/forums`
- `/writing`
- `/studio`
- replay persona Home
- replay persona Memory
- replay persona Continuity
- replay persona Archive/files
- replay persona Integrity
- `/developer-spaces`
- replay Developer Space public observatory
- replay Developer Space manage route
- Settings
- Billing

Results:

- Web and API health checks passed at runtime commit `60d53367`.
- Replay-owner hosted API sign-in and session verification passed.
- All sampled routes returned HTTP 200.
- No page-wide horizontal overflow was detected.
- The global top navigation did not render out of bounds.
- Account/menu controls stayed reachable in the sampled route set.
- Public route chains from Discover to Space, document, and discussion remained
  understandable.
- Studio/persona route chains kept private owner context visible.
- Developer Space public/manage routes kept the public observatory separate
  from the owner console.
- Sampled visible text did not expose raw identifiers, credentials, private
  bodies, storage paths, stack traces, or secret-shaped material.

## Product Defect

Route:

```text
/writing
```

Viewport:

```text
430px, 390px, 375px, 320px
```

Action or state:

```text
Initial render of the Writing filter controls below the Latest/Featured/Staff
picks tabs.
```

Expected behavior:

```text
The writing type filters should wrap, collapse, or otherwise fit cleanly on
mobile without placing visible controls beyond the right edge.
```

Actual behavior:

```text
The type filter row keeps later pills off the right edge on mobile. Field Log
and Theory are offscreen at 430px, 390px, and 375px. Research also starts
offscreen at 320px.
```

Smallest recommended DAEDALUS patch lane:

```text
PR457 - Writing filter mobile wrap patch
```

Patch scope:

- In `apps/web/components/writing/writing-index.tsx`, make the writing type
  filter controls wrap or collapse cleanly at 430px, 390px, 375px, and 320px.
- Preserve the current feed semantics, filtering behavior, disabled Staff
  picks tab behavior, and public-writing scope.
- Add a focused UI/layout assertion if the existing local test harness has a
  suitable place for this surface.
- Validate `/writing` on desktop, 430px, 390px, 375px, and 320px.

## Notes

The Memory route still contains protective explanatory copy saying raw prompts,
completions, provider payloads, and trace bodies stay hidden. That is not a
runtime leak.

This rehearsal did not submit archive imports, uploads, exports, publishing,
provider setup, billing checkout, key generation, destructive actions, or
private model calls.

## Validation

- Hosted web/API `/health/deployment`: passed at required runtime.
- Replay-owner hosted API sign-in/session check: passed.
- Desktop route set: completed.
- 430px route set: completed; `/writing` filter pills overflowed the right
  edge.
- 390px route set: completed; `/writing` filter pills overflowed the right
  edge.
- 375px route set: completed; `/writing` filter pills overflowed the right
  edge.
- 320px route set: completed; `/writing` filter pills overflowed the right
  edge.
- Raw-id, stack trace, storage path, credential, and secret-shaped visible text
  checks: passed, with Memory protective copy noted above.
- `git diff --check`: passed with line-ending normalization warnings only.
- Typecheck: not run; this result only updates docs and agent state.
