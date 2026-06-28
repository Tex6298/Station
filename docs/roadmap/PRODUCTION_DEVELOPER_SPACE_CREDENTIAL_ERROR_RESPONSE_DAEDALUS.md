# Production Developer Space Credential Error Response Hardening

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

Status: open - wake DAEDALUS

## Why This Lane

ARGUS accepted auth route-level error response hardening in:

`docs/roadmap/PRODUCTION_AUTH_ERROR_RESPONSE_REVIEW_RESULT.md`

Non-auth and non-billing route-level raw error responses remain a future audit
surface. The next narrow high-risk slice is Developer Space credential
lifecycle routes because they create, rotate, revoke, list, or display
credential-adjacent material.

Current direct raw-response patterns are in:

`apps/api/src/routes/developer-spaces.ts`

Observed credential-boundary examples:

- legacy `/:id/api-key` rotate path returns raw `keyError.message` and
  `error?.message`;
- `/:id/ingestion-keys` list/create returns raw Supabase errors;
- `/:id/ingestion-keys/:keyId/revoke` returns raw Supabase errors;
- `/:id/api-key/revoke` returns raw Supabase errors;
- `/:id/observed-runtime-signing-secret` create returns raw Supabase errors.

Include signing-secret revoke if the same direct raw pattern is present near
the create route.

## Task

Harden Developer Space credential route error responses without changing
credential lifecycle semantics.

Required behavior:

- credential route failures must not expose raw ingestion keys, signing
  secrets, hashes, fingerprints, storage/encryption details, table names, SQL
  output, owner IDs, Developer Space IDs, webhook/signature material, URLs,
  tokens, stack traces, cookies, provider payloads, private snippets, or
  secret-shaped values;
- successful create/rotate responses may continue to display the intended
  one-time credential values exactly as current product behavior requires;
- existing owner/admin authorization, not-found behavior, encryption-config
  `503` response, and status/readback semantics must not change;
- tests should prove hostile credential-route service messages are not
  returned.

Prefer a tiny local mapper for this route family unless an existing helper
clearly fits. Do not turn this into a whole-file cleanup of Developer Spaces.

## Scope

Allowed:

- credential-boundary handlers in `apps/api/src/routes/developer-spaces.ts`;
- focused Developer Space route tests for these handlers;
- docs/status/baseline updates for the result.

Do not change:

- ingestion key generation/hash format, signing-secret generation/encryption/
  hash/fingerprint format, authorization semantics, Developer Space visibility,
  observed-runtime ingestion behavior, schema, migrations, package manifests,
  Redis, Cloudflare, provider/model behavior, billing, auth/session semantics,
  UI, workers, queues, hosted config, or hosted data.

Do not attempt every Developer Space route in this PR. Record remaining raw
Developer Space route-level surfaces as future work if you see them.

## Validation

Minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

## Handoff

Wake ARGUS with:

```text
READY FOR ARGUS DEVELOPER SPACE CREDENTIAL ERROR RESPONSE REVIEW
```

or wake MIMIR with:

```text
BLOCKED - NEEDS MIMIR DECISION
```

if safe public error copy cannot be preserved without changing credential
lifecycle behavior.
