# Production Operations Read-Only Proof Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date: 2026-06-27

Status: accepted preflight - wake MIMIR

## Why This Lane Exists

DAEDALUS completed
`docs/roadmap/PRODUCTION_OPERATIONS_READINESS_DELTA_RESULT.md` and classified
the operations posture as protected-alpha credible but not production-ready.

DAEDALUS recommended an ARGUS preflight before fresh hosted checks because the
risky part is not the read-only endpoints themselves; it is what gets queried,
printed, trusted, waived, or accidentally overclaimed.

## Task

Write a result packet at:

```text
docs/roadmap/PRODUCTION_OPERATIONS_READONLY_PREFLIGHT_RESULT.md
```

Review DAEDALUS's delta and decide whether a fresh read-only operations proof is
safe to open.

Answer these questions:

1. Are web/API `/health` and `/health/deployment` the only hosted endpoints
   needed for the next proof?
2. What exact fields may be recorded from those endpoints?
3. What fields or value shapes must be redacted or excluded?
4. Can docs-only commits after the latest accepted hosted proof be waived
   without a fresh Railway runtime deploy check?
5. Which commit boundary should a future hosted proof compare against: latest
   app/runtime commit, latest docs-only baton commit, or a specific required
   commit prefix?
6. Should the next lane be ARIADNE hosted read-only proof, DAEDALUS docs patch,
   no immediate ops slice, or a different hostile review?
7. What would make the proof fail?

## Proposed Allowed Evidence

Review and tighten this list.

Allowed:

- HTTP status for web/API `/health`;
- HTTP status for web/API `/health/deployment`;
- `ok` / `ready` booleans;
- service name where already public-safe, such as `@station/web` or
  `@station/api`;
- branch name;
- short commit prefix only;
- high-level readiness booleans/status labels;
- high-level provider/cache/queue status labels;
- high-level error categories such as `not_configured`, `timeout`,
  `config_mismatch`, or `unreachable`;
- source/docs file paths inspected.

Forbidden:

- credential values;
- cookies, auth headers, bearer tokens, session values, webhook secrets, or
  database URLs;
- raw owner IDs, customer IDs, subscription IDs, payment intent IDs, checkout
  session IDs, provider request IDs, deployment IDs, or UUID-like internal
  identifiers unless already explicitly approved as public-safe;
- private documents, archive text, prompts, completions, provider payloads,
  SQL rows, hosted logs, or stack traces;
- Supabase service role/JWT contents;
- full Railway deployment metadata beyond short commit prefix and public-safe
  service/branch labels;
- any proof that requires a hosted mutation.

## Boundaries

This is a no-code, no-config, no-hosted-mutation preflight.

Do not:

- change product code;
- change docs beyond the ARGUS result packet and status/validation updates;
- change package manifests or lockfiles;
- change schema, migrations, generated types, storage config, or Railway/
  Supabase config;
- run hosted mutations;
- print secret values;
- inspect hosted logs unless MIMIR opens a separate redaction-reviewed lane;
- run SQL against hosted databases;
- change providers, embeddings, Redis, Cloudflare, Stripe, workers, queues,
  realtime, billing, auth, or UI behavior;
- claim production readiness.

## Handoff

Wake MIMIR with one of:

```text
ACCEPT PREFLIGHT - OPEN ARIADNE READ-ONLY PROOF
ACCEPT PREFLIGHT - NO IMMEDIATE OPS SLICE
NEEDS DAEDALUS PATCH
NEEDS MIMIR DECISION
```

If a DAEDALUS patch is required, include exact file/section changes and why.
