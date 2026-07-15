# PR527D1 - Forum Reply Composer Contrast Repair DAEDALUS Result

Owner: DAEDALUS / A2

Date: 2026-07-15

Result:

```text
READY_PR527D1_FORUM_REPLY_COMPOSER_CONTRAST_REPAIR_FOR_ARGUS
```

## Scope

Changed files:

- `apps/web/app/forums/[categorySlug]/[threadId]/page.tsx`
- `apps/web/app/globals.css`
- `apps/web/lib/forum-copy.test.ts`

The repair is limited to the signed-in Forum thread reply textarea. It does not
change Forum routes, queries, reply creation/deletion, thread cleanup, counts,
Watch, vote, report, witness, moderation, source links, lock semantics, auth,
tier, API, database, migrations, fixtures, global theme preference, or generic
`.textarea` behavior outside this route.

## Implementation

The reply textarea now keeps the generic `textarea` class but adds a dedicated
route-scoped class:

```text
forum-thread-detail-composer
```

Scoped CSS maps it to existing semantic tokens:

- resting boundary: `--station-page-muted`
- background: `--station-page-surface`
- input text and caret: `--station-page-text`
- placeholder: `--station-page-muted`
- placeholder opacity: `1`
- focus border and outline: `--station-page-accent`

This preserves textarea geometry, keyboard behavior, wrapping, submit behavior,
and generic textarea styling for unrelated routes.

## Validation

| Command | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `50/50` |
| `npx --yes pnpm@10.32.1 test:studio-ui` | Pass, `263/263` |
| `npx --yes pnpm@10.32.1 --filter @station/web typecheck` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/web lint` | Pass |
| `git diff --check` | Pass |

Focused source-contract coverage now proves:

- the route uses `textarea forum-thread-detail-composer`;
- the scoped composer uses the semantic boundary token;
- the scoped placeholder uses the semantic placeholder token;
- placeholder opacity is explicit; and
- focus uses the scoped accent border/outline.

## Local Rendered Proof

Temporary intercepted Playwright harness only. No hosted service or product
mutation was touched. The harness served local Next at `127.0.0.1:3157` and
intercepted only `http://localhost:4000` API calls.

Signed-in populated thread, empty enabled reply textarea:

| Viewport | Theme | Resolved | Boundary | Placeholder | Input text | Focus | Overflow |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `1440x900` | System | Dark | `7.61` | `7.61` | `13.55` | `6.84` | `0` |
| `1440x900` | Light | Light | `5.03` | `5.03` | `15.50` | `6.93` | `0` |
| `1440x900` | Dark | Dark | `7.61` | `7.61` | `13.55` | `6.84` | `0` |
| `390x844` | System | Dark | `7.61` | `7.61` | `13.55` | `6.84` | `0` |
| `390x844` | Light | Light | `5.03` | `5.03` | `15.50` | `6.93` | `0` |
| `390x844` | Dark | Dark | `7.61` | `7.61` | `13.55` | `6.84` | `0` |
| `375x812` | System | Dark | `7.61` | `7.61` | `13.55` | `6.84` | `0` |
| `375x812` | Light | Light | `5.03` | `5.03` | `15.50` | `6.93` | `0` |
| `375x812` | Dark | Dark | `7.61` | `7.61` | `13.55` | `6.84` | `0` |

Minimums:

- resting textarea boundary: `5.03:1`
- placeholder: `5.03:1`
- input text: `13.55:1`
- focus outline: `6.84:1`

Page errors: `0`

Unclassified console errors: `0`

Horizontal overflow, clipping, and overlap: `0` observed.

The hosted `1 reply` versus two rendered replies discrepancy remains frozen as
a separate count/data truth caveat and was not touched.

ARGUS should hostile-review class/token scope, contrast gates, frozen Forum
behavior, tests, and independent nine-case rendered proof before waking MIMIR.
