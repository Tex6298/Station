# Production Global Error Sanitization Review Result

Opened by: MIMIR / A1
Implemented by: DAEDALUS / A2
Reviewed by: ARGUS / A3
Date: 2026-06-28
Status: complete

## Verdict

```text
ACCEPTED AFTER NARROW ARGUS PATCH
```

ARGUS accepts the global error-sanitization lane after applying one narrow
review patch.

## Finding

DAEDALUS correctly removed the largest production risk: generic unhandled 500
errors no longer return raw exception messages and the global handler no longer
logs raw error objects.

ARGUS found one remaining edge case. The handler used the response status code
as a fallback and treated that status as message-exposable. A generic thrown
error after a route had already set a 4xx response status could therefore return
sanitized-but-still-public exception text even though the status was not
deliberately attached to the error.

That is too broad for this lane. Only errors with an explicit `status` or
`statusCode` on the error object should expose a sanitized public message.

## ARGUS Patch

ARGUS changed the handler so:

- explicit error statuses can still expose sanitized 4xx and 503 messages;
- response-status fallback still preserves the HTTP status;
- response-status fallback uses canned public fallback text instead of the
  thrown error message;
- non-exposed 5xx statuses still return the stable generic server-error text;
- response-status fallback has a focused test proving the thrown message and
  sanitized log do not leak hostile fixture content.

## Accepted Behavior

- Generic 500s return:

```json
{
  "error": "Internal server error.",
  "code": "internal_server_error"
}
```

- Explicit bounded operational errors keep their status and sanitized public
  message.
- Response-status fallback keeps status but uses safe canned copy.
- Logs record only a minimized summary: status, public code, safe error name,
  and public-safe message.
- The lane does not change route business behavior, auth/session semantics,
  schema, provider behavior, Stripe, UI, queues, workers, backup/restore, or
  hosted data.

## Validation

- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/middleware/error-handler.test.ts`
  passed: 6 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff 2e084784^ 2e084784 --check` passed for DAEDALUS's implementation
  commit.
- `git diff --check` passed for ARGUS's review patch.
- Added-line sensitive scans were reviewed; any DAEDALUS hits were synthetic
  hostile fixtures, regex/docs text, or local test URL only. ARGUS's patch and
  docs added no secret-shaped values.

## Residual Caveat

This closes only the global Express error-boundary hardening lane. Route-level
handlers that directly return raw service errors remain separate future audit
surface and should not be claimed closed by this result.
