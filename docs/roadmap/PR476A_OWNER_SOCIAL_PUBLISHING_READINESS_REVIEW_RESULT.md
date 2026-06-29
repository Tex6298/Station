# PR476A - Owner Social Publishing Readiness ARGUS Review Result

Owner: ARGUS / A3

Date: 2026-06-29

Status: Accepted

## Verdict

ARGUS accepts PR476A.

The implementation matches the accepted preflight: Social Publishing is now an
owner-only readiness/readback fence. It does not launch live connectors, collect
credentials, exchange OAuth codes, write social rows, dispatch provider posts,
or expose external social account details.

## Review Findings

Accepted boundaries:

- `GET /social/readiness` is behind `requireAuth`.
- Readiness output is category/boolean readback only: provider labels, auth
  contract category, character-limit readback, OAuth app readiness booleans,
  and paused safety flags.
- The readiness route does not query `social_connections`, `social_posts`,
  document bodies, provider account rows, token columns, or post history.
- Legacy social routes now fail closed with a bounded `423` paused response
  before social table writes or provider calls:
  - `/social/connections`;
  - `/social/connections/simple`;
  - `/social/connections/:id`;
  - `/social/auth/:platform`;
  - `/social/callback/:platform`;
  - `/social/compose`;
  - `/social/posts`;
  - `/social/generate-teaser`.
- The old OAuth callback path no longer exchanges codes; without an
  authenticated Station request it fails at auth before route handling.
- `/settings/social` now reads only `/social/readiness`.
- The Settings page no longer contains credential inputs, Connect/OAuth
  redirect controls, disconnect/save mutation controls, or post actions.
- The public document owner page no longer imports or renders `PostComposer`;
  it shows paused readiness copy instead of a live social posting entrypoint.

Sensitive-readback findings:

- API/UI readback does not serialize token values, app passwords, refresh
  tokens, Ghost admin API keys, OAuth codes, callback URLs, provider account
  ids, stored handles, external post URLs, SQL/table errors, stack traces,
  hosted logs, or provider payloads.
- OAuth app configuration is exposed only as booleans/status labels, not env
  names or values in runtime readback.
- The scan hits are expected removed-code diff, docs/test guardrail terms, and
  dummy test fixtures.

Residual note:

- `apps/api/src/services/social.service.ts` and
  `apps/web/components/social/post-composer.tsx` still contain the old live
  implementation code, but no current social route or document/page source
  imports or reaches them. Keeping or deleting that dead code is a MIMIR product
  cleanup decision, not a blocker for this readback fence.

Non-scope confirmation:

- No live posting, syndication, OAuth/token storage, provider account linking,
  provider API call, queue/worker/retry, webhook, billing change, migration,
  schema change, real provider account setup, public syndication metrics,
  comment/reply import, or broad Settings redesign was added.

## Validation

ARGUS reran the requested validation:

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/social.test.ts` | Pass | 3 tests passed for auth, readback-only output, and legacy action route fail-closed behavior. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/social-publishing-readiness.test.ts` | Pass | 4 tests passed for helper copy, Settings source, document source, and social route-source guardrails. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/publishing-ui.test.ts` | Pass | 12 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/publishing-approvals.test.ts` | Pass | 5 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/auth-routes.test.ts` | Pass | 6 tests passed; `/settings/social` remains protected. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck replayed from cache; web typecheck ran successfully. |
| `git diff --check 428d62a1..a2e0ca1e` | Pass | No whitespace errors. |
| Diff-only sensitive/scope scan | Pass | Expected removed-code, docs, and fixture terms only; no new credential values, provider account ids, provider payloads, external post URLs, SQL/table output, stack traces, queue/worker/webhook behavior, billing path, or live-posting claim. |

## Hosted Proof Recommendation

MIMIR should route ARIADNE for hosted read-only proof:

- signed-in `/settings/social` desktop and 390px mobile;
- provider readiness cards render with paused status;
- credential inputs and Connect/OAuth/disconnect/save/post controls are absent
  or disabled;
- public document owner page shows paused social connector readiness instead of
  a live composer;
- optional direct API sample: authenticated `GET /social/readiness` returns
  readback-only flags, while a legacy action route such as `/social/compose`
  returns bounded paused status;
- no real provider account, OAuth redirect, token exchange, provider call,
  queue/worker, webhook, billing action, external URL, hosted logs, SQL output,
  stack trace, private document text, or credential value is captured.

## Handoff

Wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
```

MIMIR should close PR476A or route ARIADNE for the hosted read-only proof above.
Do not broaden into live posting, OAuth/token storage, provider API calls,
public syndication, queues/workers, webhooks, billing, real provider accounts,
or secret exposure.
