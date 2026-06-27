# Production Operations Read-Only Proof Result

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date: 2026-06-27

Status: complete - wake MIMIR

## Verdict

```text
PASS - READ-ONLY OPS PROOF
```

ARIADNE ran the hosted read-only operations proof from
`docs/roadmap/PRODUCTION_OPERATIONS_READONLY_PROOF_ARIADNE.md`.

Only selected fields from the allowed health and deployment-health endpoints
were recorded.

## Endpoint Results

| Service | Endpoint | HTTP status | `ok` | `ready` |
| --- | --- | ---: | --- | --- |
| web | `/health` | 200 | true | n/a |
| web | `/health/deployment` | 200 | true | true |
| api | `/health` | 200 | true | n/a |
| api | `/health/deployment` | 200 | true | true |

## Deployment Freshness

| Service | Expected service | Branch | Short commit prefix | Runtime floor | Result |
| --- | --- | --- | --- | --- | --- |
| web | `@station/web` | `main` | `30524db2` | `30524db2` | Pass |
| api | `@station/api` | `main` | `30524db2` | `4575b10b` | Pass |

Docs/state deploy waiver: current `fork/main` is ahead of hosted runtime prefix
`30524db2` only by docs and `.station-agents/state/*` commits. No newer runtime,
schema, config, package, provider, billing, or deploy behavior is required for
this read-only proof.

## Selected API Readiness

| Check | Selected status |
| --- | --- |
| database | `ok:true`, `configured:true` |
| migrations | `ok:true` |
| storage | `ok:true`, bucket `persona-files` exists, private true |
| public URLs | selected object had no allowed boolean/status fields |
| Supabase auth redirects | `ok:true` |
| Stripe | `ready:true` |
| providers | selected object had no allowed boolean/status fields |
| Redis | `configured:true` |
| Supabase URL configured | true |
| Supabase anon key configured | true |
| Supabase service role configured | true |
| Database URL configured | true |
| Anthropic provider configured | false |
| DeepSeek provider configured | false |
| NVIDIA provider configured | true |
| Embedding profile | `station_free_1536` |
| Embedding provider | `gemini` |
| Embeddings configured | true |
| OpenAI embeddings configured | false |
| Gemini embeddings configured | true |
| Stripe billing configured | true |
| Stripe prices configured | true |
| Redis configured | true |
| JWT secret configured | true |

## Forbidden-Output Scan

The result records only service labels, endpoint labels, HTTP statuses, top-level
booleans, expected public-safe service names, branch labels, short commit
prefixes, and selected readiness booleans/status categories.

No raw response bodies, full hosted URLs, generated timestamps, deployment IDs,
raw IDs, secrets, cookies, auth headers, SQL rows, hosted logs, stack traces,
private content, provider payloads, billing payloads, prompts, completions,
customer data, or screenshots of endpoint JSON were recorded.

## Residual Risk

This is protected-alpha operations readback only. It is not production
readiness, full Station MVP readiness, backup/restore proof, durable
worker/queue/realtime proof, live-money billing proof, Cloudflare proof, or
partner-ready operations proof.

## Recommendation

MIMIR can close the operations read-only proof slice and choose the next
product or operations lane. If MIMIR wants a final acceptance review, wake ARGUS
against this selected-evidence packet.
