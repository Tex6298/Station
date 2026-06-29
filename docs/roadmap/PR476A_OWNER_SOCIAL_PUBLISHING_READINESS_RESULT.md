# PR476A - Owner Social Publishing Readiness Result

Owner: DAEDALUS / A2

Date: 2026-06-29

State: `READY_FOR_ARGUS_REVIEW`

## Summary

DAEDALUS implemented PR476A as a readback-only social publishing fence.

What changed:

- Added authenticated `GET /social/readiness`.
- Replaced the live-looking social action routes with a bounded paused response
  before social table writes or provider calls.
- Replaced `/settings/social` with owner readiness/readback cards.
- Removed the public document owner page's live social composer entrypoint.
- Added focused API and web tests for the readiness fence.

## Boundaries Preserved

PR476A does not add:

- live posting or syndication;
- OAuth initiation or callback token exchange;
- credential or token storage;
- provider API calls;
- queue, worker, webhook, or retry behavior;
- billing changes;
- migrations or new social tables;
- real provider account setup.

The old `PostComposer` component still exists as an unused component file, but
the public document owner route no longer imports or renders it. The live API
routes it called now fail closed with the paused connector response.

## Readiness Contract

`GET /social/readiness` requires auth and returns only readback categories:

- supported providers: Bluesky, Mastodon, Tumblr, LinkedIn, Reddit, WordPress,
  and Ghost;
- provider labels, coarse auth contract category, character limit readback, and
  paused status;
- OAuth app readiness as booleans/status labels only;
- `credentialStorageAccepted: false`;
- `postingEnabled: false`;
- `connectionActionsEnabled: false`;
- `teaserGenerationEnabled: false`.

It does not query social connection rows, social post rows, provider account
records, document bodies, or token columns.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/social.test.ts` | Pass | 3 tests passed; signed-out rejection, signed-in readback, and legacy action route fail-closed coverage. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/social-publishing-readiness.test.ts` | Pass | 4 tests passed; helper, Settings source, document source, and route-source guard coverage. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/publishing-ui.test.ts` | Pass | 12 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/publishing-approvals.test.ts` | Pass | 5 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/auth-routes.test.ts` | Pass | 6 tests passed; `/settings/social` remains protected. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| Diff-only sensitive/scope scan | Pass | Expected test/doc/env-key terms only; no credential values, provider account ids, provider payloads, external post URLs, SQL/table output, stack traces, queues/workers, webhooks, billing path, or live-posting claim introduced. |

## ARGUS Review Ask

Review the PR476A fence for:

- whether `GET /social/readiness` stays readback-only and authenticated;
- whether legacy social mutation routes fail closed before DB writes/provider
  calls;
- whether the Settings and document owner surfaces no longer expose active
  connect/OAuth/post controls;
- whether any sensitive social credential or provider-account detail leaks in
  API/UI readback.

If accepted, wake MIMIR for PR476A closeout and ARIADNE hosted read-only proof.
If fixes are needed, wake DAEDALUS with the exact failing route, source, or
test expectation.
