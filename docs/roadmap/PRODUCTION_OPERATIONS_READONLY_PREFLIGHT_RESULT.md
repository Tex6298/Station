# Production Operations Read-Only Proof Preflight Result

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date: 2026-06-27

Status: complete - wake MIMIR

## Verdict

```text
ACCEPT PREFLIGHT - OPEN ARIADNE READ-ONLY PROOF
```

ARGUS accepts a narrow hosted read-only operations proof. The proof should be
owned by ARIADNE because it is a hosted evidence/rehearsal lane, but it must use
the strict evidence packet below.

This preflight does not authorize product code, config, schema, package,
provider, Redis, Cloudflare, Stripe, worker/queue, hosted mutation, SQL,
hosted log, auth/session, billing, UI, or production-readiness work.

## Allowed Hosted Endpoints

Only these hosted endpoints are allowed:

- Web `/health`
- Web `/health/deployment`
- API `/health`
- API `/health/deployment`

No authenticated endpoints, owner routes, billing routes, provider routes,
database queries, hosted logs, SQL consoles, mutation routes, or direct
provider/Supabase/Railway dashboards are required or authorized.

## Allowed Evidence

For each service and endpoint, ARIADNE may record only:

- service label: `web` or `api`;
- endpoint label: `/health` or `/health/deployment`;
- HTTP status;
- top-level `ok` boolean;
- top-level `ready` boolean for `/health/deployment` only;
- Railway service name only when it is the expected public-safe service label:
  `@station/web` or `@station/api`;
- Railway branch name;
- Railway commit prefix, shortened to 8-12 hex characters;
- selected readiness check names with boolean/status values;
- approved high-level readiness error categories:
  `not_configured`, `query_failed`, `timeout`, `not_supported`,
  `unauthorized`, `config_mismatch`, or `unreachable`;
- high-level provider/cache/queue labels and booleans already exposed by
  readiness output, such as embedding profile/provider enum, provider
  configured booleans, Redis/Upstash configured booleans, queue provider status,
  and operational-cache `enabled`/`kind`/`disabledReason`;
- storage bucket label `persona-files`, whether it exists, and whether it is
  private;
- migration proof IDs, pass/fail booleans, and latest proof version/name;
- source/docs file paths inspected locally.

ARIADNE should not paste raw JSON response bodies. Select fields into a small
table and omit everything else.

## Forbidden Evidence

Do not record:

- credential values, cookies, auth headers, bearer tokens, session values,
  webhook secrets, JWT contents, database URLs, pooler URLs, API keys, provider
  keys, Supabase service-role values, Stripe secrets, Upstash tokens, Railway
  tokens, or any secret-shaped value;
- raw owner IDs, user IDs, customer IDs, subscription IDs, payment intent IDs,
  checkout session IDs, provider request IDs, package IDs, deployment IDs, or
  UUID-like internal identifiers;
- full Railway deployment metadata beyond service label, branch, and short
  commit prefix;
- full commit SHA if a short prefix is enough;
- `appUrl`, `apiUrl`, full hosted URLs, project refs, deployment ids, repo
  owner/name, Railway environment name, or `generatedAt` timestamps;
- private documents, archive text, prompts, completions, provider payloads,
  SQL rows, hosted logs, stack traces, source bodies, memory/archive/canon/
  continuity material, billing payloads, or customer data;
- screenshots that reveal raw endpoint JSON.

If a forbidden value appears in the response, the proof may continue only if the
value is not recorded. If the proof would require recording it, stop and wake
ARGUS.

## Commit Freshness Rules

The hosted proof should compare deployment commit prefixes against runtime
floors, not against docs-only baton commits.

Current floors for this packet:

- Web runtime floor: `30524db2`, the accepted web copy/readback runtime commit
  after the UX09 hosted proof.
- API runtime floor: `4575b10b`, the latest accepted hosted runtime boundary
  when no newer API/runtime commit is present.

Docs-only and `.station-agents/state/*` commits after those floors can be
waived without a fresh Railway runtime deploy. The waiver must name only commit
classes, for example: "docs/state only after web floor; no runtime deploy
required."

Failure rules for freshness:

- Web `/health/deployment` reports a commit older than `30524db2`.
- API `/health/deployment` reports a commit older than `4575b10b`.
- Either service reports a non-`main` branch without MIMIR approval.
- Either service omits a commit prefix and the proof cannot establish the
  runtime floor safely.

If a service reports a later commit, ARIADNE may accept it only after local
source inspection confirms the later commit is on `fork/main` and does not add
unreviewed runtime/config/schema/package scope that should have gone through
ARGUS.

## Required Proof Shape

ARIADNE should produce a result packet that includes:

- a four-row endpoint table for web/API `/health` and `/health/deployment`;
- a deployment freshness table for web and API, using short commit prefixes
  only;
- a selected readiness table for API `/health/deployment` with check names and
  booleans/status categories only;
- an explicit docs-only deploy waiver statement if HEAD is ahead of the hosted
  runtime commit only by docs/state commits;
- a forbidden-output scan statement confirming no secrets, raw IDs, logs, SQL,
  stack traces, private content, provider payloads, billing payloads, deployment
  IDs, or raw response bodies were recorded;
- a residual-risk paragraph stating that the proof is protected-alpha
  operations readback, not production readiness, backup/restore proof, durable
  worker proof, live-money billing proof, Cloudflare proof, or partner-ready
  operations proof.

## Failure Conditions

The proof fails or must stop if:

- any allowed endpoint returns non-`200`;
- any top-level `ok` is not `true`;
- any `/health/deployment` `ready` value is not `true`;
- web or API deployment freshness is older than the required floor;
- service label or branch is unexpected;
- a response contains only raw data that cannot be summarized safely;
- the proof requires hosted logs, SQL, auth/session, private owner data,
  provider calls, billing calls, or any hosted mutation;
- a secret, raw ID, private source body, prompt, completion, provider payload,
  stack trace, SQL error, Stripe object identifier, deployment ID, or customer
  data is printed or committed;
- the result claims production readiness, full Station MVP readiness, durable
  workers/queues/realtime, backup/restore proof, live-money billing readiness,
  Cloudflare readiness, or partner-ready operations.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| DAEDALUS delta review | Pass | Reviewed `PRODUCTION_OPERATIONS_READINESS_DELTA_RESULT.md` and accepted the need for proof-handling preflight before hosted checks. |
| Health route source review | Pass | Reviewed web/API `/health` and `/health/deployment` source and readiness output shape. |
| Runtime freshness review | Pass | Source log after UX09 showed web runtime change `30524db2` and no newer API runtime change after `4575b10b`. |
| `git diff c141b19^ c141b19 --check` | Pass | MIMIR preflight-open commit whitespace check passed. |

## ARGUS Recommendation

Wake MIMIR with `ACCEPT PREFLIGHT - OPEN ARIADNE READ-ONLY PROOF`.

If MIMIR opens the proof, the task should be ARIADNE-hosted read-only evidence
using exactly this packet. No DAEDALUS patch is needed before that proof.
