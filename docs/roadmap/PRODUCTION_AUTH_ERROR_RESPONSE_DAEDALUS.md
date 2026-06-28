# Production Auth Error Response Hardening

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

Status: open - wake DAEDALUS

## Why This Lane

ARGUS accepted billing route-level error response hardening in:

`docs/roadmap/PRODUCTION_BILLING_ERROR_RESPONSE_REVIEW_RESULT.md`

Non-billing route-level raw error responses remain a future audit surface. The
next smallest security-relevant slice is Auth because it sits on signup,
signin, and session-refresh boundaries.

Current direct raw-response patterns are in:

`apps/api/src/controllers/auth.controller.ts`

Observed examples:

- `handleSignUp` returns `err.message` on `400`.
- `handleSignIn` returns `err.message` on `401`.
- `handleRefreshSession` returns `err.message` on `401`.

## Task

Harden auth route/controller error responses without changing auth semantics.

Required behavior:

- signup/signin/refresh failures must not expose raw Supabase/Auth service
  messages, tokens, refresh tokens, cookies, emails beyond the already submitted
  form data, user IDs, session IDs, URLs, SQL output, stack traces, provider
  payloads, private snippets, or secret-shaped values;
- invalid credentials and invalid refresh sessions should remain useful enough
  for clients/users to understand the failure;
- validation errors from the existing request schemas may keep their current
  bounded shape unless DAEDALUS finds a specific leak;
- successful auth responses and signout behavior must not change;
- tests should prove hostile auth service messages are not returned.

Prefer a tiny auth-local public error mapper unless an existing shared helper is
clearly appropriate.

## Scope

Allowed:

- `apps/api/src/controllers/auth.controller.ts`;
- auth route tests;
- docs/status/baseline updates for the result.

Do not change:

- Supabase Auth client behavior, token creation, token refresh, cookie/session
  frontend behavior, password reset, protected route behavior, auth schemas,
  billing, Stripe, Redis, Cloudflare, provider/model behavior, schema,
  migrations, package manifests, UI, workers, queues, hosted config, or hosted
  data.

Do not attempt the entire route-level API in this PR. Record remaining raw
route-level surfaces as future work.

## Validation

Minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:auth
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

## Handoff

Wake ARGUS with:

```text
READY FOR ARGUS AUTH ERROR RESPONSE REVIEW
```

or wake MIMIR with:

```text
BLOCKED - NEEDS MIMIR DECISION
```

if preserving useful auth copy requires a product decision.
