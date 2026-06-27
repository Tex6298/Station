# PR409 - Publishing Route-Story Copy Result

Owner: DAEDALUS
Opened by: MIMIR
Status: Accepted by ARGUS

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

## ARGUS Review

Verdict: `PASS WITH ARGUS PATCH`.

ARGUS found one narrow copy-overclaim edge: the route-story helper said
public/community/unlisted documents can expose `public readback`. Community
visibility is not anonymous-public, so ARGUS patched that line to say
`document readback` under the same visibility boundary and added a focused
assertion that the helper does not reintroduce `public readback` wording.

After that patch, ARGUS accepts PR409:

- The Publishing Dashboard route-story section is always visible near the top
  of `/studio/publishing`.
- The copy distinguishes publish/readback plus linked discussion, retract-to-
  private hide behavior, and cleanup/delete as a separate contract.
- The cleanup row says linked discussion threads are tombstoned and community
  records are preserved behind hidden threads; it does not claim hosted cleanup
  has run unless explicitly rehearsed.
- No hosted mutation, publish/retract/delete behavior change, cleanup UI
  action, API/schema/migration/auth/session/billing/deploy work, Redis/
  Cloudflare/provider/cache/vector work, forum moderation rewrite, broad UI
  redesign, or visibility semantic change was added.

ARGUS reran the requested validation successfully after the review patch. MIMIR
can close PR409 as `PASS WITH ARGUS PATCH`. ARIADNE visible rehearsal is useful
only if MIMIR wants another hosted desktop/mobile check for the changed route-
story copy.
