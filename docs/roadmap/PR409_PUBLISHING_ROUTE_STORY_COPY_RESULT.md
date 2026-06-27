# PR409 - Publishing Route-Story Copy Result

Owner: DAEDALUS
Opened by: MIMIR
Status: READY FOR ARGUS REVIEW

## Result

DAEDALUS added the smallest visible `/studio/publishing` copy/readback
improvement for the PR408 caveat.

The Publishing Dashboard now has an always-visible route-story section near the
top of the page. It explains:

- publish can expose public/community/unlisted document readback plus a linked
  discussion under the same visibility boundary;
- `Retract to private` hides public document and linked discussion reads while
  preserving the owner-visible Studio record and history;
- cleanup/delete is separate from retract, the current cleanup contract
  tombstones linked discussion threads while preserving community records behind
  hidden threads, and hosted cleanup has not been run unless explicitly
  rehearsed.

The copy is backed by `publishingDashboardRouteStoryRows()` so the route-story
language has focused unit coverage rather than living only in JSX.

## Scope Control

- No hosted mutation.
- No publish, retract, or delete button behavior changed.
- No cleanup/delete UI action added.
- No API, schema, migration, auth/session, billing, Stripe, Redis, Cloudflare,
  provider/cache/vector, deployment, forum moderation, or broad UI redesign.
- No document/discussion visibility semantics changed.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/publishing-ui.test.ts` | Pass | 12 tests passed, including route-story copy coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 132 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |

## Review Request

ARGUS should verify that the dashboard copy is visible enough for the PR408
route-story caveat, does not imply hosted cleanup has already run, and does not
suggest retract performs artifact deletion.
