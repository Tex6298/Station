# PR434 - NVIDIA Provider Data-Policy Preflight Review Result

Date reviewed: 2026-06-28

Reviewer: ARGUS / A3

Status: accepted public/synthetic only - wake MIMIR

## Verdict

```text
ACCEPT PUBLIC/SYNTHETIC ONLY
```

NVIDIA platform chat may remain available for public-safe synthetic probes and
public-safe Developer Space/observatory calls. Private Station context is not
accepted for NVIDIA platform calls.

No DAEDALUS implementation patch is required for the current repo. The current
repo/docs already keep private NVIDIA replay blocked and label the PR433 exact
output and usage-accounting gaps honestly.

## Evidence Read

- `docs/roadmap/PR434_NVIDIA_PROVIDER_DATA_POLICY_PREFLIGHT_ARGUS.md`
- `docs/roadmap/PR433_NVIDIA_PLATFORM_CHAT_SYNTHETIC_PROOF_REVIEW_RESULT.md`
- `docs/roadmap/PR5_DEVELOPER_SPACE_PROVIDER_POLICY.md`
- `docs/roadmap/PR5_DEVELOPER_SPACE_PROVIDER_POLICY_RESULT.md`
- `docs/roadmap/STATION_RETRIEVAL_PROVIDER_RESEARCH_ARIADNE.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`
- `docs/architecture/persistence-schema-baseline.md`
- `apps/api/src/services/developer-space.service.ts`
- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/services/replay-readiness.service.ts`
- `apps/api/src/services/ai-observability.service.ts`
- `packages/ai/src/providers/router.ts`

Repo truth:

- PR433 proves only synthetic NVIDIA routeability. It does not approve private
  replay, provider policy, exact-output fidelity, or product-provider expansion.
- Replay readiness still says exact-output compliance was noisy and NVIDIA
  usage tokens are not parsed by the current OpenAI-compatible adapter.
- PR5 accepted owner-only Developer Space provider-policy evaluation/readback as
  labels and allow/deny metadata only; the policy route does not execute an LLM.
- `STATION_FUTURE_LANES.md` keeps Supabase as the source of truth for private
  memory, archive, visibility, continuity, and owner authorization.
- ARIADNE provider research says NVIDIA trial/evaluation use should not receive
  confidential, controlled, or sensitive archive material without an explicit
  MIMIR decision and accepted data-policy gate.
- NVIDIA embeddings are not a drop-in replacement for Station's current
  `vector(1536)` path; embeddings/retrieval changes remain out of PR434 scope.

## Mode Decision

| Mode | PR434 verdict | Provider-bound data allowed now | Data that must stay inside Station/Supabase |
| --- | --- | --- | --- |
| Public/synthetic-only platform calls | Accepted | Synthetic prompts, public-safe connectivity probes, public labels, route/model labels, status, latency, and estimated tokens/costs. | Secrets, credentials, IDs, private prompts, prompt/completion logs, private source snippets, owner corpus, Memory, Continuity, Archive, Integrity, Canon, and replay-selected context. |
| Public Developer Space/observatory calls | Accepted only when content is public-safe | Already-public Developer Space/observatory text or synthetic/public context after owner policy evaluation allows it. | Owner-only drafts, private archive chunks, private source bodies, unpublished project data, owner identifiers, provider payloads, raw trace bodies, and secrets. |
| Owner BYOK calls | No NVIDIA BYOK mode accepted by this lane | Existing owner-BYOK policy/readback may continue as a non-secret posture label for supported BYOK providers. | Treat `owner_byok_only` as a block on platform NVIDIA. Do not imply NVIDIA BYOK support until MIMIR opens and ARGUS reviews a separate lane. |
| Platform calls with private Studio context | Blocked | None. | Private Studio context, owner messages, private persona/profile text, selected private context, and real user prompts. |
| Platform calls with Memory, Continuity, Archive, Integrity, Canon, or replay owner corpus | Blocked | None. | All private/runtime/replay corpus material, source snippets, selected labels/facts that expose private content, corpus anchors, source IDs, and private provenance bodies. |

## Exact Output

The PR433 exact-output miss is acceptable for routeability only. It does not
require a model/config change before public-safe probes continue.

It does block any claim that the current NVIDIA route is ready for exact-wording
product replay, factual answer-contract acceptance, or private/direct replay
bars. If MIMIR wants NVIDIA to satisfy exact-output or answer-contract behavior,
open a separate DAEDALUS lane for model/config/prompt-contract proof with
ARGUS tests before product use.

## Usage Accounting

The current usage-accounting posture is acceptable only for non-metered
synthetic/public probes where Station clearly labels token and cost values as
estimates.

It is not acceptable for billing, quotas, customer-visible spend claims, or
replay economics because PR433 notes that NVIDIA response usage is not parsed by
the current OpenAI-compatible adapter. Product use needs either provider usage
parsing or an accepted Station-estimate contract that records model, route,
estimation basis, and uncertainty.

## Observability And Readback

NVIDIA call readback must remain owner-scoped and sanitized.

It may show:

- provider route label, provider family, provider mode, and model label;
- status, latency, token estimates, cost estimates, and estimate/source labels;
- policy code, requested context class, allow/deny result, denial reason, and
  private-archive gate;
- public/synthetic mode labels and Developer Space posture labels;
- active embedding profile metadata such as `station_free_1536`, provider, and
  dimension.

It must never show:

- prompt text, completion text, raw provider payloads, request/response bodies,
  headers, keys, cookies, bearer tokens, database URLs, provider base URLs, or
  credentials;
- owner IDs, persona IDs, conversation IDs, trace IDs, source IDs, corpus IDs,
  private source snippets, selected private facts, Memory text, Archive text,
  Continuity bodies, Integrity/Canon private context, or replay owner corpus
  content;
- logs or docs that let a public/non-owner reader infer private corpus shape.

## Private-Context Future Gate

If MIMIR later wants private Station context to leave Station for NVIDIA, that
must be a separate policy and implementation lane. Required gates:

- explicit accepted provider/data contract for retention, training/use,
  confidentiality, deletion, export, audit, and user trust;
- owner-facing disclosure/consent and a way to distinguish platform-provider
  private use from owner BYOK and non-NVIDIA product paths;
- owner-scoped audit/readback that records provider route, model, status,
  policy, mode, token/cost accounting, and deletion/export implications without
  raw private content;
- tests proving denied modes fail closed, accepted modes minimize provider
  payloads, observability is sanitized, and owner/non-owner boundaries hold;
- no embeddings, retrieval dimensions, schema, Cloudflare, Redis, workers,
  queues, billing, Stripe, provider menu, or model-gateway changes unless MIMIR
  opens those lanes explicitly.

## Next Safe Lane

Private NVIDIA usage is blocked. The next safe product lane is staged replay on
the existing non-NVIDIA product path, with `station_free_1536`/Gemini retrieval
and current owner/privacy gates intact.

NVIDIA can continue only as a public/synthetic dev/staging probe path unless
MIMIR opens a separate bounded private-provider lane or a separate exact-output
model/config proof lane.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 53 tests passed; provider policy evaluation still denies private archive by default, keeps owner-BYOK fail-closed, and sanitizes posture/observability. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/provider-router.test.ts` | Pass | 10 tests passed; NVIDIA route shape, BYOK precedence, fallback, and missing-config behavior remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed; PR433 caveats and sanitized trace detail remain pinned. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/ai-observability-ui.test.ts` | Pass | 8 tests passed; UI helpers keep secrets, URLs, IDs, prompts, and private archive text out of visible facts. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Wakeup

Wake MIMIR for closeout and next-lane sequencing. Do not wake DAEDALUS from
PR434 unless MIMIR chooses a concrete implementation lane.
