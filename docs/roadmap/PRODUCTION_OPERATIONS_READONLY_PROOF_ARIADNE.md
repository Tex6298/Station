# Production Operations Read-Only Proof

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date: 2026-06-27

Status: open

## Why This Lane Exists

ARGUS accepted the production operations proof preflight in
`docs/roadmap/PRODUCTION_OPERATIONS_READONLY_PREFLIGHT_RESULT.md`.

This lane is a hosted read-only proof only. It should verify the allowed
Station web/API health and deployment-readiness surfaces without exposing raw
responses, secrets, internal identifiers, private data, hosted logs, SQL, or
production-readiness claims.

## Task

Use the existing Railway web/API targets already documented in the staging
packet. Query only these endpoint paths:

```text
/health
/health/deployment
```

Run them for both services:

```text
web
api
```

Write the result packet at:

```text
docs/roadmap/PRODUCTION_OPERATIONS_READONLY_PROOF_RESULT.md
```

## Required Output

Include:

1. A four-row endpoint table:
   - service label: `web` or `api`;
   - endpoint label: `/health` or `/health/deployment`;
   - HTTP status;
   - top-level `ok`;
   - top-level `ready` for `/health/deployment`.
2. A deployment freshness table:
   - service label;
   - expected service name only if it is `@station/web` or `@station/api`;
   - branch;
   - short commit prefix only;
   - freshness result against the runtime floors below.
3. A selected readiness table for API `/health/deployment`:
   - check names;
   - booleans or high-level status categories only.
4. A docs/state-only deploy waiver statement if current `fork/main` is ahead of
   the hosted runtime commit only by docs or `.station-agents/state/*` commits.
5. A forbidden-output scan statement confirming no raw response bodies, full
   hosted URLs, generated timestamps, deployment IDs, raw IDs, secrets, cookies,
   auth headers, SQL rows, hosted logs, stack traces, private content, provider
   payloads, billing payloads, prompts, completions, or customer data were
   recorded.
6. A residual-risk paragraph stating that this is protected-alpha operations
   readback only, not production readiness, full Station MVP readiness,
   backup/restore proof, durable worker/queue/realtime proof, live-money
   billing proof, Cloudflare proof, or partner-ready operations proof.

## Runtime Floors

Compare hosted deployment commit prefixes against these floors:

```text
web: 30524db2
api: 4575b10b
```

Docs-only and `.station-agents/state/*` commits after those floors can be
waived. The waiver must name only commit classes, not raw response bodies.

## Allowed Evidence

Record only:

- service label;
- endpoint label;
- HTTP status;
- top-level `ok`;
- top-level `ready`;
- service name when it is `@station/web` or `@station/api`;
- branch name;
- short commit prefix, 8 to 12 hex characters;
- selected readiness check names with booleans/status categories;
- high-level provider/cache/queue labels and booleans exposed by readiness;
- storage bucket label `persona-files`, existence boolean, and private boolean;
- migration proof IDs, pass/fail booleans, and latest proof version/name;
- local source/docs file paths inspected.

## Forbidden Evidence

Do not record:

- raw JSON response bodies;
- screenshots of endpoint JSON;
- credential values, cookies, auth headers, bearer tokens, session values,
  webhook secrets, JWT contents, database URLs, pooler URLs, API keys, provider
  keys, Supabase service-role values, Stripe secrets, Upstash tokens, Railway
  tokens, or secret-shaped values;
- raw owner IDs, user IDs, customer IDs, subscription IDs, payment intent IDs,
  checkout session IDs, provider request IDs, package IDs, deployment IDs, or
  UUID-like internal identifiers;
- full commit SHAs when a short prefix is enough;
- full hosted URLs, project refs, repo owner/name, Railway environment name, or
  generated timestamps;
- private documents, archive text, prompts, completions, provider payloads,
  SQL rows, hosted logs, stack traces, memory/archive/canon/continuity
  material, billing payloads, or customer data.

If a forbidden value appears, omit it. If the proof cannot proceed without
recording it, stop and wake MIMIR.

## Failure Conditions

Fail or stop if:

- any allowed endpoint returns non-`200`;
- any top-level `ok` is not `true`;
- any `/health/deployment` `ready` is not `true`;
- web reports a commit older than `30524db2`;
- API reports a commit older than `4575b10b`;
- either service reports a non-`main` branch without MIMIR approval;
- the proof requires hosted logs, SQL, auth/session, private owner data,
  provider calls, billing calls, or hosted mutation;
- the result would need to record forbidden evidence;
- the result would imply production readiness, full MVP readiness, durable
  worker/queue/realtime readiness, backup/restore proof, live-money billing
  readiness, Cloudflare readiness, or partner-ready operations.

## Handoff

Wake MIMIR with:

```text
PASS - READ-ONLY OPS PROOF
FAIL - READ-ONLY OPS PROOF
STOPPED - FORBIDDEN EVIDENCE
```

If the proof passes, recommend whether MIMIR should close the ops slice and
choose the next product lane, or ask ARGUS for a final acceptance review.
