# UX-03A - Continuity Review Target Links ARIADNE Review

Date: 2026-06-27

Reviewer: ARIADNE / A4

Status: ARGUS accepted visible fix - wake MIMIR

## Scope

ARIADNE rehearsed the owner-only Continuity review target links on
`/studio/personas/[personaId]/continuity`.

Checked:

- Desktop Continuity route.
- 375px Continuity route.
- 390px Continuity route.
- Review target links to Memory, Canon, Integrity, Archive, Continuity, and
  owner publishing review surfaces.
- Linked conversation review target remaining plain text.
- Runtime provenance redaction: compiled prompt and source bodies stay hidden.
- Mobile clipping and horizontal overflow.

Out of scope:

- Backend routes, writes, runtime selection, Integrity engine behavior,
  Memory/Canon lifecycle behavior, Archive mutation, publication visibility,
  auth/session, provider/model, config, schema, migrations, workers, queues,
  Railway, Cloudflare, Supabase, Redis, or staging behavior.

## Finding

Initial browser rehearsal found a visible issue in the `Review clarity` rows:
the row title/body/link styles were inherited from darker continuity cards and
rendered too pale on the light timeline panel, especially on 375px and 390px.

This made the key owner question harder to answer:

```text
What changed, why was it recorded, and where should I review next?
```

## Fix

ARIADNE made a scoped UI fix:

- Added explicit `studio-continuity-review-*` classes for the Review clarity
  row, title, body, metadata, link, and plain-text target states.
- Moved the row from inline contrast styling to light-surface text colors.
- Kept route targets unchanged.
- Kept unsupported linked-conversation targets as plain text.
- Stacked Review clarity rows to one column on mobile.

Touched product files:

- `apps/web/components/studio/continuity-timeline.tsx`
- `apps/web/app/globals.css`

## Result

Verdict: `VISIBLE FIX - WAKE ARGUS`.

- Memory, Canon, Integrity, Archive, Continuity, candidate, and owner
  publishing review links all point to existing owner Studio routes.
- Linked conversation targets remain plain text.
- Link labels read as review paths, not proof, exact source routing, or public
  publication actions.
- Runtime provenance still says source bodies and compiled prompts stay hidden,
  and the local probe confirmed hidden prompt/source text was not rendered.
- Desktop, 375px, and 390px layouts passed without document-level or
  element-level horizontal overflow.
- Screenshots were inspected locally and not committed.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| Local Playwright route matrix | Pass | Desktop, 375px, and 390px Continuity route checks passed after the visible fix. |
| Link map | Pass | Memory, Canon, Integrity, Archive, Continuity, candidate, and owner publishing review targets route to existing owner Studio surfaces. |
| Unsupported target check | Pass | Linked conversation review target remained plain text. |
| Hidden prompt/source check | Pass | Mock compiled prompt and source bodies were not visible. |
| Overflow scan | Pass | No document-level or element-level horizontal overflow found. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization notices only. |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity` | Pass | 12 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 134 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo typecheck passed for API and web. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | No ESLint warnings or errors. |

Residual risk: This was a local mocked browser review. It does not revalidate
hosted runtime, real auth/session behavior, staging, or real owner data.

## ARGUS Review

Verdict: `ACCEPTED VISIBLE FIX - WAKE MIMIR`.

ARGUS accepts ARIADNE's scoped visible fix. The patch only changes Review
clarity row presentation and mobile stacking; route targets, route-helper
behavior, redaction behavior, and backend behavior did not change.

ARGUS validation:

| Check | Result | Notes |
| --- | --- | --- |
| `git diff HEAD^ HEAD --check` | Pass | ARIADNE visible-fix commit whitespace check passed. |
| Added-line sensitive-pattern scan | Pass | No matches. |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity` | Pass | 12 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 134 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo typecheck passed for API and web. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Next lint reported no warnings or errors. |

## Recommendation

Wake MIMIR to close UX-03A or choose the next lane.
