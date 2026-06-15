# PR 7 Live Replay Optimization Baseline Result

Date: 2026-06-15

Owner: A2 / DAEDALUS

Status: ready for A3 / ARGUS review

## Verdict

The live Railway replay baseline supports no immediate code lane.

All measured public, owner, retrieval, observability, billing, export, and
Developer Space routes returned HTTP 200 in this single sanitized sample. The
slowest measured route was deployment readiness, followed by context preview and
private archive retrieval. Those timings are worth watching, but this pass did
not produce a concrete route/service, Cloudflare, Redis/cache, worker, provider,
billing, archive, export, or UI defect.

## Measured Route Set

| Route label | Status | Duration | Sanitized evidence |
| --- | ---: | ---: | --- |
| Web health | 200 | 501 ms | `ok:true`. |
| API health | 200 | 415 ms | `ok:true`. |
| API deployment readiness | 200 | 3294 ms | `ready:true`; readiness keys present for database, migrations, providers, public URLs, Redis, storage, Stripe, and Supabase Auth redirects; operational cache label `upstash_rest`. |
| Replay owner sign-in | 200 | 1038 ms | Authenticated with tier `private`; token retained in process memory only. |
| `/auth/me` | 200 | 598 ms | User present; tier `private`; non-admin; email present but not recorded. |
| Persona list | 200 | 1046 ms | One owner persona; visibility `private`; provider `platform`. |
| Persona detail | 200 | 1341 ms | Continuity summary keys present for archive files, archived chats, canon, candidates, records, integrity sessions, and memory. |
| Context preview | 200 | 2528 ms | Context keys include archive, canon, counts, integrity, memory, sources, systemPrompt, and trace; trace keys include embedding, retrieval mode, searched, selected sources, and skipped; searched memory count `1`. |
| Private archive retrieval | 200 | 1816 ms | Retrieval mode `vector`; chunk count `1`; skipped source count `0`. |
| Persona export list | 200 | 920 ms | Three completed `persona_archive` packages. |
| Export readback | 200 | 762 ms | Completed persona archive; manifest keys present; Markdown readback present. |
| Export bundle readback | 200 | 816 ms | Bundle present; three files; integrity algorithm `sha256`. |
| Observability summary | 200 | 803 ms | Four traces; zero failed traces; total tokens `5853`; estimated cost `0.6045` pence; average latency `1097` ms. |
| Observability trace list | 200 | 746 ms | Four completed traces: three `conversation`, one `system`; total listed tokens `5789` input / `64` output. |
| Billing status | 200 | 756 ms | Tier `private`; subscription status `active`; customer/subscription fields present but values not recorded. |
| Developer Spaces public list | 200 | 433 ms | One public Developer Space. |
| Developer Spaces owner list | 200 | 759 ms | One owner public Developer Space; provider policy `public_synthetic_only`. |
| Developer Space detail | 200 | 1574 ms | Public detail returned one node, one event, and no linked documents. |
| Developer Space usage | 200 | 929 ms | Usage counters present for events, exports, nodes, public reads, snapshots, and storage bytes. |

## Recommendation

Ranked next recommendation: **no code now**.

Reason: this single live replay sample found no failed route, no user-visible
timeout, no failed billing state, no export/readback gap, no retrieval-mode
regression, and no Developer Space availability gap. Future optimization should
open only from fresh evidence that names the exact weak route or user-facing
rehearsal defect.

## Privacy Boundary

The probe used ignored local replay-owner credentials and kept access tokens,
IDs, raw response bodies, query text, private archive text, manifests, prompts,
completions, cookies, credentials, customer IDs, subscription IDs, owner IDs,
persona IDs, Developer Space IDs, export IDs, and trace IDs out of committed
docs.

No product code, route behavior, auth, billing, Stripe, Redis, Cloudflare,
provider routing, embeddings, archive retrieval semantics, export scope,
migrations, or UI changed.

## ARGUS Review Result

A3 / ARGUS accepts PR 7 on 2026-06-15 as an evidence-only/no-code baseline.

Review findings:

- The measured route set covers the requested public health, deployment,
  replay-owner, persona, context-preview, private archive retrieval,
  observability, billing, export, and Developer Space surfaces.
- The result records statuses, durations, counts, modes, booleans, and
  provider/cost labels only. It does not commit private archive text, prompts,
  completions, raw response bodies, raw manifests, checkout or portal URLs,
  customer IDs, subscription IDs, owner IDs, persona IDs, Developer Space IDs,
  export IDs, trace IDs, cookies, JWTs, credentials, API keys, or `.env` values.
- The no-code recommendation is supported for this single sample: no measured
  route failed, timed out, regressed retrieval mode, exposed a billing gap,
  broke export readback, or proved a Redis/cache, Cloudflare, worker, provider,
  archive, export, billing, or UI defect.
- ARGUS reran public live health probes only. API/web health returned `ok:true`,
  and API deployment readiness returned `ready:true` with sanitized readiness
  labels. The public API deployment identity still served runtime commit
  `297fc0a`, not this docs-only head; that is acceptable for this no-code
  evidence lane because product/runtime code did not change in PR 7.

Future code lanes should re-check deployment identity against the target code
commit before treating live evidence as a deployed-code proof.
