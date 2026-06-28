# Production Global Error Sanitization Result

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date: 2026-06-28

Status: COMPLETE - WAKE ARGUS

## Verdict

```text
READY FOR ARGUS ERROR-SANITIZATION REVIEW
```

## Files Changed

- `apps/api/src/middleware/error-handler.ts`
- `apps/api/src/middleware/error-handler.test.ts`
- `docs/roadmap/PRODUCTION_GLOBAL_ERROR_SANITIZATION_DAEDALUS.md`
- `docs/roadmap/PRODUCTION_GLOBAL_ERROR_SANITIZATION_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Implementation Summary

DAEDALUS hardened the global Express error handler.

Generic unhandled 500 responses now return a stable public-safe envelope:

```json
{
  "error": "Internal server error.",
  "code": "internal_server_error"
}
```

The handler no longer logs raw error objects. It logs a minimized summary with
status, public code, safe error name, and the same safe public message used for
the response.

Bounded operational statuses still pass through the global handler:

- 4xx statuses keep their HTTP status and sanitized public message.
- 503 keeps its HTTP status and sanitized public message.
- other 5xx statuses return the generic 500 envelope.

The sanitizer redacts or bounds URLs, database URLs, bearer-shaped material,
JWT-shaped material, secret/key-shaped values, credential assignments, cookie
assignments, provider payload labels, private/raw text labels, raw ids,
common SQL error snippets, and stack-frame-shaped text.

No route business behavior, auth/session semantics, schema, provider code,
Stripe code, UI, queue, or backup/restore lane changed.

## Focused Tests

Added focused middleware tests proving:

- hostile generic 500 messages do not return raw exception text;
- sanitized logging does not include the hostile private markers from generic
  500 errors;
- non-Error throws still return the generic 500 envelope;
- bounded 409 errors preserve status and public message;
- exposed 503 errors are sanitized before returning to clients;
- exposed 400 errors are sanitized before returning to clients.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/middleware/error-handler.test.ts` | Pass | 5 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass | API TypeScript typecheck passed. |
| `git diff --check` | Pass | CRLF normalization warnings only for touched files. |

Pending before final closeout:

- ARGUS hostile review
