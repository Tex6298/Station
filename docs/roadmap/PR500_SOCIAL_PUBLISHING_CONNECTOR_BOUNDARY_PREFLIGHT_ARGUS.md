# PR500 - Social Publishing Connector Boundary Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-06

Status: Open

## Why This Lane

PR476A made Social Publishing honest and readback-only. The product surface is
customer-facing but intentionally paused:

`docs/roadmap/PR476A_OWNER_SOCIAL_PUBLISHING_READINESS_CLOSEOUT.md`

PR476A left live connectors blocked until Station has accepted contracts for:

- encrypted external credential storage;
- OAuth/connection callback boundaries;
- outbound payload sanitization;
- connector execution, retry, and failure readback.

Since then, PR484 built archive connector credential/OAuth primitives for
Reddit and Discord. Those are useful reference patterns, but they are
archive-connector-specific and must not be copied blindly into Social
Publishing:

- `docs/roadmap/PR484B_CONNECTOR_CREDENTIAL_STORAGE_CLOSEOUT.md`
- `docs/roadmap/PR484F_D_ARCHIVE_CONNECTOR_OAUTH_AUTHORIZATION_URL_CLOSEOUT.md`
- `docs/roadmap/PR484G_ARCHIVE_CONNECTOR_OAUTH_TOKEN_EXCHANGE_CLOSEOUT.md`
- `docs/roadmap/PR484I_ARCHIVE_CONNECTOR_CREDENTIAL_REVOKE_CLOSEOUT.md`

PR500 asks ARGUS to decide the smallest safe next implementation lane for
Social Publishing without enabling live posting prematurely.

## Product Question

What is the next safe Social Publishing slice that moves Station toward live
owner-controlled outbound publishing while preserving the PR476A fence?

ARGUS should decide whether PR500A should be:

- a generic encrypted social connector credential contract;
- a one-provider OAuth/account-link contract;
- an outbound payload sanitizer/readback contract;
- a fail-closed execution/retry contract;
- or a smaller blocker-removal lane before any of those.

If the correct answer is "do not implement yet," name the concrete blocker and
the smallest numbered lane that removes it.

## Context To Inspect

ARGUS should inspect:

- `apps/api/src/routes/social.ts`
- `apps/api/src/services/social.service.ts`
- `apps/api/src/routes/social.test.ts`
- `apps/web/app/settings/social/page.tsx`
- `apps/web/lib/social-publishing-readiness.test.ts`
- `apps/web/components/social/post-composer.tsx`
- `infra/supabase/migrations/005_social_publishing.sql`
- `packages/db/src/types.ts`
- PR476 and PR476A docs;
- relevant PR484 archive connector credential/OAuth docs.

ARGUS should also confirm whether current repo code still contains dormant live
posting/OAuth paths and whether PR476A fences still fail closed before token
storage, provider calls, dispatch, or DB writes.

## Preflight Guardrails

Do not accept a lane that:

- stores social access tokens, refresh tokens, app passwords, Ghost admin keys,
  OAuth codes, provider account ids, or webhook payloads in plaintext;
- starts OAuth redirects/callbacks without state, session, provider, expiry,
  and one-time-consume protections;
- calls external provider APIs;
- posts, cross-posts, schedules, deletes, retracts, or edits external content;
- imports comments/replies/follower metrics;
- creates queue/worker/retry/webhook infrastructure without an accepted
  execution contract;
- mutates billing, Stripe, plan entitlement, or public syndication metrics;
- exposes provider payloads, handles from untrusted inputs, env values,
  callback query values, tokens, account ids, SQL/table detail, stack traces,
  private document text, or secret-shaped values;
- re-enables the paused Settings social credential forms or live document
  composer without the accepted contracts.

## Preferred Shape

Prefer a narrow, testable first PR500A that:

- keeps `/settings/social` visibly paused unless the accepted contract genuinely
  enables a bounded next step;
- uses encrypted storage if any credential material is stored;
- treats PR484 archive connector work as a reference pattern, not a shared
  assumption;
- starts with the smallest provider set that proves the contract without
  requiring every social platform at once;
- returns status/readback categories instead of secret tails, raw provider
  payloads, or environment values;
- remains owner-only and fail-closed by default.

## Required ARGUS Output

Return one of:

```text
ACCEPT_PR500A_SOCIAL_CONNECTOR_CREDENTIAL_CONTRACT
ACCEPT_PR500A_SOCIAL_CONNECTOR_OAUTH_ACCOUNT_LINK
ACCEPT_PR500A_SOCIAL_OUTBOUND_PAYLOAD_SANITIZER
ACCEPT_PR500A_SOCIAL_EXECUTION_RETRY_GATE
BLOCKED_SOCIAL_CONNECTOR_CONFIG_OR_POLICY
REJECT_SOCIAL_CONNECTOR_EXPANSION
```

If accepted, provide:

- exact PR500A scope;
- allowed files;
- required tests and validation commands;
- explicit forbidden scope;
- whether hosted ARIADNE rehearsal is required after ARGUS review.

## Baseline Validation

Before returning a preflight verdict, ARGUS should run the focused baseline that
fits the chosen scope, starting with:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If ARGUS inspects archive connector reuse, include the relevant archive
connector credential/OAuth tests in the verdict.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- PR499/PR499A/PR499B seminar schedule metadata is closed after hosted proof.
- MIMIR is moving to a distinct customer-facing Phase 3 lane instead of extending seminars.
- Social Publishing is currently readback-only from PR476A; live connectors remain blocked by credential/OAuth/payload/execution contracts.
Task:
- Run the PR500 Social Publishing connector boundary preflight.
- Decide the smallest safe PR500A lane or name the concrete blocker.
```
