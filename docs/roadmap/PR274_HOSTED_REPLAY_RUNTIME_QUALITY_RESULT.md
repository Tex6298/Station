# PR274 - Hosted Replay Runtime Quality Probe Result

Owner: A2 / DAEDALUS

Date: 2026-06-24

Status: PASS WITH CAVEATS

## Boundary

This was a hosted Railway runtime quality probe against the existing replay
owner and prepared replay persona. It did not patch product code, run Stripe,
import files, publish content, create or rotate keys, change providers, change
schema, or inspect hosted logs.

The local replay-owner env values were used only inside the probe process.
Committed evidence records statuses, counts, booleans, public deployment
identity, and coarse timing buckets only. It does not record credentials,
bearer tokens, cookies, owner ids, persona ids, conversation ids, trace ids,
private source bodies, compiled prompts, provider payloads, SQL, hosted logs, or
the raw model completion.

Synthetic staging prompt used for the single chat turn:

> Staging replay probe: in two short bullets, name only the accepted synthetic
> staging anchors and their matching invented retrieval phrases. Do not quote
> source bodies or mention production claims.

## Verdict

PASS WITH CAVEATS.

Hosted freshness, replay-owner auth/session persistence, owner context readback,
and safe observability/readiness evidence passed. The single chat turn returned
HTTP 200, produced a short answer, did not copy raw source-body markers, and left
a completed trace. The caveat is answer quality: the response only partially
recalled the accepted seeded anchor set, detecting one of two accepted anchor
concepts and one of two matching invented retrieval phrases.

This does not look like a route, auth, storage, provider-configuration, or
observability break. It is a runtime answer-quality question over otherwise
available Memory, Archive, Continuity, Integrity, and Canon context.

## Hosted Freshness

| Check | Result | Sanitized evidence |
| --- | --- | --- |
| API `/health` | Pass | HTTP 200, `ok:true`, `250-749ms`. |
| Web `/health` | Pass | HTTP 200, `ok:true`, `250-749ms`. |
| API `/health/deployment` | Pass | HTTP 200, `ready:true`, branch `main`, service `@station/api`, environment `production`, commit prefix `454f3ec4dbf0`. |
| Web `/health/deployment` | Pass | HTTP 200, `ready:true`, branch `main`, service `@station/web`, environment `production`, commit prefix `454f3ec4dbf0`. |
| PR272 implementation freshness | Pass | Public deployment identity is at the PR272 implementation commit prefix and local ancestry includes `454f3ec`. |

The first runtime helper inherited a local web URL from env; hosted web
freshness was therefore rerun explicitly against the production web URL before
this packet was recorded.

## Auth And Session

| Check | Result | Sanitized evidence |
| --- | --- | --- |
| Replay-owner API sign-in | Pass | HTTP 200; access and refresh tokens were present but not printed or committed. |
| API `/auth/me` | Pass | HTTP 200; configured owner matched internally; email present; tier `canon`; admin flag `false`. |
| Unauthenticated readiness boundary | Pass | Unauthenticated `GET /observability/replay-readiness` returned HTTP 401. |
| Hosted web login | Pass | Browser login reached `/studio`. |
| Browser storage/cookie | Pass | Station session storage and auth cookie were present; values were not printed. |
| Browser `/auth/me` | Pass | Browser token could call `/auth/me` with HTTP 200. |
| Reload persistence | Pass | Reload stayed on protected Studio instead of returning to `/login`. |
| Owner route navigation | Pass | `/studio/archive` reached without a login redirect. |

## Runtime Chat

| Check | Result | Sanitized evidence |
| --- | --- | --- |
| Chat route | Pass | `POST /conversations/persona/:personaId/chat` returned HTTP 200. |
| Latency bucket | Pass | `3000-9999ms`. |
| Answer presence | Pass | Short answer present, `1-280` chars. |
| Accepted anchor recall | Caveat | Partial: one accepted anchor concept and one matching phrase detected. |
| Rejected control | Pass | Rejected-control anchor was absent from the answer. |
| Raw source-body copy | Pass | No raw source-body marker was detected in the answer. |
| Provider/config failure | Pass | No provider failure code or classification returned. |

## Context Readback

The probe selected the first private platform replay persona from three owned
personas. The context preview was owner-authenticated and recorded only counts
and source categories:

| Category | Count |
| --- | ---: |
| Canon | 3 |
| Integrity | 1 |
| Continuity | 4 |
| Memory | 3 |
| Archive | 4 |

Additional readback:

- Context preview selected 15 total sources with source categories matching the
  count table above.
- Memory retrieval mode was `vector`; archive retrieval mode was `vector`;
  memory fallback was `none`.
- Search counts were Memory 3, Archive 12, Continuity 4.
- Skipped counts were Memory 0 and Archive 5.
- Memory briefing returned 10 active memories, 0 shared owner blocks, 3
  lifecycle status kinds, 3 trust status kinds, and 1 edge kind.
- Imports returned 7 jobs: 6 completed and 1 historical failed job.
- Exports returned 5 packages, all completed.

No context source bodies, source titles, raw ids, compiled prompts, or manifest
bodies were committed.

## Observability

| Check | Result | Sanitized evidence |
| --- | --- | --- |
| Summary before chat | Pass | 9 traces, 0 failures, token total bucket `10k-49999`, average latency bucket `>=10000ms`. |
| Summary after chat | Pass | 10 traces, 0 failures, token total bucket `10k-49999`, average latency bucket `3000-9999ms`. |
| Trace delta | Pass | +1 trace after the chat round trip. |
| Recent traces | Pass | 6 recent traces returned; all completed; source family `conversation`; duration buckets only. |
| Latest trace context counts | Pass | Canon 3, Memory 3, Archive 4, Integrity 1, Continuity 4. |
| Replay readiness | Pass | `prep_only`; 7 measurement points, 5 setup proofs, 6 setup blockers, 8 capture surfaces. |

No trace ids, event payloads, prompts, completions, provider payloads, SQL, or
hosted logs were committed.

## Validation

No product code changed.

| Check | Result |
| --- | --- |
| `node tmp-pr274-runtime-probe.mjs` | Completed sanitized hosted API/runtime probe. Result: auth, context, chat route, and observability passed with partial anchor-recall caveat. Temporary file removed. |
| Hosted freshness `node -e` probe | Pass. Web/API health and deployment readiness passed against explicit production hosts. |
| `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr274-session-persistence.spec.js --reporter=line --workers=1` | Initial local runner attempts hit the known temporary-spec module resolution/version issue. |
| `NODE_PATH=<matching npx cache node_modules> npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr274-session-persistence.spec.js --reporter=line --workers=1` | Pass, 1 hosted session-persistence test. Temporary file removed. |

## Recommendation

Wake MIMIR, not ARGUS, because no patch was made.

Recommended next lane: MIMIR should open a narrow DAEDALUS runtime answer-quality
triage if full two-anchor recall remains the acceptance bar. The lane should
inspect why context readback contained the expected Memory, Archive, Continuity,
Integrity, and Canon categories while the model answer only partially recalled
the seeded anchors. It should avoid provider swaps, schema changes, imports,
new UI work, and broad replay rehearsal unless MIMIR decides the partial recall
is acceptable enough to hand to ARIADNE for human-eye runtime judgement.
