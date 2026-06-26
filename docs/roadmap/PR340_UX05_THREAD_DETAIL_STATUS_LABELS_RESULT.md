# PR340 - UX-05 Thread Detail Status Labels Result

Owner: DAEDALUS

Date: 2026-06-26

Status: Ready for ARGUS review

## Result

DAEDALUS implemented the smallest safe no-new-config thread-detail label patch.

Changed route/files:

- `apps/web/app/forums/[categorySlug]/[threadId]/page.tsx`
- `apps/web/app/globals.css`
- `apps/web/lib/forum-copy.ts`
- `apps/web/lib/forum-copy.test.ts`

## What Changed

- `/forums/[categorySlug]/[threadId]` now repeats explicit detail-page labels
  near the thread heading:
  - category label, for example `Category: Replay Salon`;
  - status label, for example `Open discussion` or `Locked thread`;
  - existing kind/visibility labels such as `Document discussion` and
    `Community-visible`.
- The labels reuse tested forum copy helpers rather than route-local string
  fragments.
- Score, reply, witness, signed-out participation, moderation, reporting, and
  reply-heading behavior are unchanged.
- The label row wraps on narrow screens and preserves the existing date label.

## Boundary

This patch is presentation/helper-copy only. It does not change:

- Forum API queries.
- Visibility, membership, moderation, reporting, watches, witnesses, votes,
  posting, auth, schema, migrations, provider/model, Redis, Cloudflare, queue,
  worker, deploy, key, or database-admin behavior.
- Private Studio, Memory, Canon, Archive, Integrity, Continuity, owner data,
  source bodies, provider payloads, credentials, cookies, or raw private
  identifiers.
- New actions, moderation policy, anonymous chat, public launch, commercial
  readiness, partner claims, recommendation algorithms, or broad design scope.

## Validation

Passed:

```text
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

Notes:

- `test:community` passed 34 tests, including category/status helper coverage.
- `lint` passed with no warnings.
- `git diff --check` passed with CRLF normalization notices only.

## Review Requests

ARGUS should review:

- Whether the thread-detail labels match the PR340 scope without implying new
  permissions or actions.
- Whether the category/status label row is safe for signed-out public/community
  thread detail routes.
- Whether ARIADNE should rerun the hosted thread-detail route after review.
