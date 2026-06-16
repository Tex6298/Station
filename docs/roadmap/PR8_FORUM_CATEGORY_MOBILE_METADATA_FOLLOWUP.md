# PR 8 Follow-Up - Forum Category Mobile Metadata

Date opened: 2026-06-16

Opened by: A1 / MIMIR

Prerequisite: A4 / ARIADNE narrow mobile recheck at `0a560c0`.

Owner: A2 / DAEDALUS first, then A3 / ARGUS, then A4 / ARIADNE for one final
phone-width recheck.

## Trigger

ARIADNE rechecked the PR 8 mobile fixes at `390 x 844`.

Accepted:

- Signed-in `/developer-spaces` now stacks the create form and owner project
  card inside the viewport.

Still failing:

- Anonymous `/forums/general` clips the thread-card score/reply/date metadata.
- CDP measured the thread card at `x=16`, `width=392.09`, `right=408.09` with a
  widened layout viewport around `408px`.
- The screenshot shows the `13 Jun 2026` date cut off at the card edge.

## Goal

Make forum category thread cards fit a normal phone viewport.

At `390px` width, each thread card must keep title, body, score, reply count,
date, author, trust metadata, and signed-in vote/own-post affordances readable
without document-level horizontal overflow or clipping.

## Scope

Primary file:

- `apps/web/app/forums/[categorySlug]/page.tsx`

Allowed if the cleanest fix needs a small shared style hook:

- `apps/web/app/globals.css`

Do not touch:

- Developer Spaces.
- The broader PR 8 route set.
- API routes or services.
- Auth/session behavior.
- Billing, Stripe, provider, embedding, Railway, Supabase, migrations,
  storage/quota, package config, env, or persistence behavior.

## Implementation Notes

Current implementation source:

- Thread cards render as an inline-styled flex row.
- The title/body column and metadata column share the first row.
- The metadata block uses `justifyContent: "flex-end"`, `textAlign: "right"`,
  and multiple wrapped children.
- The prior fix let metadata wrap, but it can still reach the card edge and
  widen the layout.

Acceptable fixes:

- Move score/reply/date metadata onto its own full-width row on narrow screens.
- Or replace the inline row with scoped classes that make metadata grid/flex
  stack at phone width.
- Or make the metadata block `width: 100%`, `justifyContent: flex-start`, and
  `textAlign: left` when space is constrained.

Avoid:

- hiding the date or reply count;
- shrinking text until it is illegible;
- making the whole app hide overflow to mask a too-wide card;
- changing forum API data, voting behavior, route links, auth, moderation, or
  thread detail behavior.

## Validation

Expected DAEDALUS gate:

```bash
npx --yes pnpm@10.32.1 --filter @station/web typecheck
npx --yes pnpm@10.32.1 --filter @station/web lint
npx --yes pnpm@10.32.1 test:community
git diff --check
```

Browser check:

- `/forums/general` anonymous at `390 x 844`;
- no document-level horizontal overflow;
- no clipped score/reply/date metadata;
- thread title/body remain readable;
- author/trust row remains readable;
- signed-in vote or own-post affordances do not overflow if checked.

## Handoff

DAEDALUS should wake ARGUS with:

- exact file changes;
- before/after layout explanation;
- validation run;
- confirmation that Developer Spaces and non-forum route groups were not
  reopened;
- confirmation that no backend/config/auth/billing/provider behavior changed.

If ARGUS accepts, wake ARIADNE for the final `390px` `/forums/general` recheck.
