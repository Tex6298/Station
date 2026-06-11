# Staging replay data and Gemini retrieval measurement plan

Date: 2026-06-11

Status: replay seed/helper implemented, hardened, executed against staging, and
accepted by ARGUS as setup evidence. Populated retrieval/context-preview
measurement has now run with sanitized counts for ARGUS review.

## Current truth

- Public `https://stationapi-production.up.railway.app/health/deployment`
  returns `ready:true` after ARGUS accepted the Supabase Auth redirect proof.
- Migration `029` is applied and the provider-aware
  `match_memory_items`/`match_private_archive_chunks` RPCs are callable.
- Migration `030` is applied and `integrity_questions` has explicit read-only
  client RLS.
- The active product-testing embedding profile is `station_free_1536`, backed
  by Gemini for the free-tier testing lane.
- The previous RPC proof returned zero rows by design. That proves shape and
  availability only; it does not prove retrieval quality.
- The bounded staging replay corpus has now been seeded with sanitized,
  non-production local corpus text. This proves setup data exists; it does not
  yet prove retrieval quality or route-level replay behavior.
- Populated archive-retrieval and context-preview probes have run against the
  seeded corpus with sanitized counts only. Response bodies, prompt bodies,
  private excerpts, credentials, tokens, owner ids, and persona ids were not
  captured in committed docs.

## DAEDALUS route audit result

DAEDALUS did not populate staging replay data in this pass. Existing UI/API
paths cannot create the full bounded corpus from a fresh replay signup without
an explicit setup helper:

- API beta signup creates a confirmed account but the profile defaults to
  `visitor`.
- Persona creation requires at least `private`.
- Space and document creation require at least `creator`.
- Developer Space creation requires `canon`.
- Persona-file archive ingestion, conversation archive, context preview,
  continuity records, discussion/comment paths, and export readback all depend
  on first having a usable owner/persona and, for the public corpus, creator
  surfaces.
- No reusable replay-account env keys or documented replay account credentials
  exist in this repo/worktree.
- The local `.env` has staging Supabase/Gemini values, but using service-role
  credentials directly to mutate tiers or seed rows would be an unreviewed
  helper path, not "existing UI/API paths."

ARGUS accepted the narrow replay seed/helper lane. MIMIR opens it as the next
setup-only implementation task before populated measurement.

## Seed/helper scope

DAEDALUS should design and implement the smallest helper that can prepare a
staging replay owner and bounded replay corpus without smuggling direct
service-role mutation into the measurement lane.

Hard constraints:

- create or reuse exactly one non-production replay owner;
- assign the minimum explicit tier needed for the bounded corpus;
- seed only owner-scoped replay rows for that owner/persona;
- write Gemini `station_free_1536` vectors with the active metadata;
- avoid committed secrets, passwords, cookies, tokens, private excerpts, prompt
  bodies, and raw archive text;
- make the helper repeatable or at least idempotent enough that re-running it
  does not create uncontrolled duplicate replay evidence;
- document the exact data categories created using sanitized labels/counts only;
- wake ARGUS for hostile review before seeded data is treated as measurement
  evidence.

## DAEDALUS helper implementation result

DAEDALUS implemented `scripts/staging-replay-seed.mjs` as setup-only helper
code. ARGUS accepted it after owner-reuse hardening, and MIMIR authorized one
staging seed run with a synthetic ignored local corpus.

- Creates or reuses exactly one replay owner keyed by
  `STATION_REPLAY_OWNER_USERNAME`.
- Existing replay-owner reuse now requires `STATION_REPLAY_OWNER_ID` to match
  the profile id before the helper updates auth credentials or tier. This keeps
  username collisions from becoming accidental account takeover during setup.
- Requires local-only `STATION_REPLAY_OWNER_EMAIL` and
  `STATION_REPLAY_OWNER_PASSWORD` so the replay owner can later sign in for
  route measurement; those values are never printed or committed.
- Assigns `canon`, the minimum single-owner tier that can create persona,
  Space/document, and Developer Space replay surfaces.
- Reads corpus text from the ignored local path
  `docs/ops/staging-replay-corpus.local.json` by default. The committed
  `docs/ops/STAGING_REPLAY_CORPUS.example.json` is placeholders only.
- Seeds deterministic owner-scoped persona, conversation/archive transcript,
  active/excluded memory rows, continuity record, public Space/document,
  thread/comment, Developer Space node/event/snapshot, usage row, and export
  manifest.
- Writes Gemini `station_free_1536` memory vectors with provider/model/
  dimension/index/backfill metadata and emits sanitized labels/counts only.
- Adds `pnpm replay:seed:validate` for structural validation of the example
  corpus without staging mutation.

## MIMIR live seed decision

MIMIR's 2026-06-11 decision is to run the helper against staging once DAEDALUS
has prepared the missing local-only inputs. Presence-only checks found
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `GEMINI_API_KEY` available in
the local environment, but no `STATION_REPLAY_OWNER_EMAIL`,
`STATION_REPLAY_OWNER_PASSWORD`, `STATION_REPLAY_OWNER_ID`,
`STATION_REPLAY_OWNER_USERNAME`, `STATION_REPLAY_CORPUS_PATH`, or ignored local
corpus file.

DAEDALUS should:

1. Create `docs/ops/staging-replay-corpus.local.json` from the committed
   example using synthetic, non-production text with distinctive retrieval
   anchors. The local file is ignored and must not be committed.
2. Use local-only replay owner env values for exactly one staging replay owner.
   Credentials may live in ignored local env only; do not print or commit them.
3. Run `pnpm replay:seed:staging` once the local corpus validates.
4. Capture only sanitized helper output: mode, run label, counts, public-safe
   slugs/labels, active embedding metadata, and omitted-evidence categories.
5. Wake ARGUS with the sanitized seed result before retrieval measurement
   resumes.

## DAEDALUS live seed result

DAEDALUS ran the accepted helper against staging on 2026-06-11. The ignored
local corpus used synthetic, non-production anchor text and was not committed.
Replay owner credentials and profile id were stored only in ignored local env
values and were not printed.

Sanitized helper output:

- Mode: `seeded`.
- Run label: `staging-replay-alpha`.
- Active embedding metadata: provider `gemini`, model `gemini-embedding-2`,
  dimension `1536`, index `memory_items_embedding_1536`, backfill version `2`.
- Counts: owner profiles `1`, personas `1`, conversations `1`, archived
  transcripts `1`, memory items `4`, continuity records `1`, spaces `1`,
  documents `1`, threads `1`, comments `1`, Developer Spaces `1`, Developer
  Space nodes `1`, Developer Space events `1`, Developer Space snapshots `1`,
  export packages `1`.
- Public-safe labels/slugs: persona `Station Replay Persona`, Space
  `station-replay-alpha`, document `station-replay-alpha-note`, Developer Space
  `station-replay-dev-alpha`, export kind `persona_archive`.
- Omitted from output and docs: credentials, tokens, raw archive text, prompt
  bodies, and private excerpts.

ARGUS accepted the seeded state after live staging review. Retrieval measurement
may use this corpus as setup evidence, but the seed run itself is not retrieval
quality proof.

ARGUS review result:

- The replay owner profile exists exactly once, is keyed to the ignored local
  `STATION_REPLAY_OWNER_ID`, and remains `canon`.
- Owner-scoped persona, archived conversation/transcript, four replay memory
  rows, continuity record, Space/document/thread/comment, Developer Space
  node/event/snapshot, and persona export package are present with bounded
  counts.
- Space, document, and Developer Space slugs are owned by the replay owner.
- Replay memory rows use active Gemini metadata: provider `gemini`, model
  `gemini-embedding-2`, dimension `1536`, index
  `memory_items_embedding_1536`, source `supabase_pgvector`, backfill version
  `2`.
- Public Developer Space event/snapshot payloads did not contain secret-shaped
  keys in ARGUS's live check.
- No committed `.env`, ignored local corpus, owner id, credentials, tokens, raw
  corpus text, prompt bodies, or private excerpts were found.

## MIMIR measurement decision

MIMIR's 2026-06-11 decision is to run populated retrieval/context-preview
measurement now. DAEDALUS should use the accepted seeded corpus and local-only
replay owner credentials, then wake ARGUS with sanitized results.

## DAEDALUS populated retrieval measurement

DAEDALUS ran live populated retrieval/context-preview probes against the
deployed API on 2026-06-11 using ignored local replay owner credentials. Tokens
were captured only in process memory and were not printed.

Setup probe:

- API host: `stationapi-production.up.railway.app`.
- Sign-in: HTTP `200`, latency `1308ms`; token captured but not printed.
- Deployment health: HTTP `200`, latency `1597ms`, `ready:true`.
- Active embedding profile: `station_free_1536`; provider `gemini`; model
  `gemini-embedding-2`; embeddings configured `true`.
- Replay persona lookup: HTTP `200`, latency `771ms`; matched by name, id not
  printed.

Owner probes:

| Label | Route | HTTP | Mode | Authorized chunks | Skipped sources | Latency | Human rating | Notes |
| --- | --- | --- | --- | ---: | ---: | ---: | --- | --- |
| `archive-anchor-one` | `/conversations/persona/:personaId/archive-retrieval` | 200 | `vector` | 2 | 0 | 1890ms | high | Expected synthetic anchor observed locally; excerpt not stored. |
| `archive-anchor-two` | `/conversations/persona/:personaId/archive-retrieval` | 200 | `vector` | 2 | 0 | 2254ms | high | Expected synthetic anchor observed locally; excerpt not stored. |
| `context-anchor-one` | `/conversations/persona/:personaId/context-preview` | 200 | `context-preview` | 2 archive sources | n/a | 2641ms | high | Counts: canon 0, memory 1, integrity 1, archive 2; rejected control absent. |
| `context-excluded-negative-control` | `/conversations/persona/:personaId/context-preview` | 200 | `context-preview` | 2 archive sources | n/a | 2824ms | medium | Counts: canon 0, memory 1, integrity 1, archive 2; rejected control absent. |

Hostile probes:

| Label | Route | HTTP | Latency | Result |
| --- | --- | ---: | ---: | --- |
| `anonymous-archive` | `/conversations/persona/:personaId/archive-retrieval` | 401 | 385ms | Expected block. |
| `invalid-token-archive` | `/conversations/persona/:personaId/archive-retrieval` | 401 | 569ms | Expected block. |
| `wrong-persona-archive` | `/conversations/persona/:personaId/archive-retrieval` | 404 | 915ms | Expected block. |

Coverage note: a second-owner credential was not available in local env, so the
hostile auth lane used anonymous, invalid token, and wrong-persona probes rather
than a true other-owner token.

Omitted from committed evidence: tokens, cookies, credentials, owner ids,
persona ids, response bodies, prompt bodies, raw corpus text, and private
excerpts.

ARGUS accepted this measurement as populated retrieval evidence for the seeded
corpus. The result proves the live route can retrieve relevant seeded archive
material through the active Gemini `station_free_1536` profile and can assemble
context-preview counts without including the rejected-memory negative control.
It does not prove broad search quality or production ranking.

ARGUS review note: a live second-owner token was not available, so cross-owner
privacy for this route remains supported by focused automated tests
(`test:conversation-archive` and `test:persona-context`) plus live anonymous,
invalid-token, and wrong-persona probes. A true live second-owner probe remains
a useful hardening follow-up, but it is not blocking this seeded retrieval
measurement acceptance.

Measurement requirements covered in this pass:

- sign in through the deployed API using the ignored local replay owner
  credentials; do not print tokens or credentials;
- query the seeded archive anchors through
  `/conversations/persona/:personaId/archive-retrieval`;
- query at least one context-preview path through
  `/conversations/persona/:personaId/context-preview`;
- record only HTTP status, retrieval mode, authorized chunk count,
  skipped-source count, route latency, active embedding profile/provider/model,
  and human relevance ratings;
- run hostile paths for anonymous access, invalid-token access, wrong-persona
  scope, and excluded/rejected memory where the seeded corpus supports it;
- true second-owner retrieval remains unrun because no second-owner credential
  was available in local env;
- view private snippets only locally if needed to assign relevance ratings, but
  do not commit excerpts, prompt bodies, response bodies, tokens, cookies,
  credentials, owner ids, or raw corpus text;
- if a measurement helper is needed, keep it local or add only a non-secret
  reusable harness after ARGUS review.

## MIMIR replay E2E decision

ARGUS accepted populated retrieval quality for the seeded corpus. MIMIR's next
lane is a broader staged replay E2E walkthrough, with the true live second-owner
probe folded in as the first privacy preflight.

DAEDALUS should first create or use a local-only second-owner credential/token
without committing it, then prove that owner cannot retrieve the replay owner's
private archive or context-preview data. If this probe exposes private rows,
stop and wake ARGUS with the sanitized failure.

If the privacy preflight passes, continue the walkthrough:

- live `/health/deployment` remains `ready:true`;
- replay owner sign-in works through the deployed API;
- seeded persona/archive/context-preview retrieval remains usable;
- public Space/document/discussion surfaces are reachable without private
  leakage;
- Developer Space public observatory data is reachable and public-safe;
- owner-only export manifest readback is reachable without private body capture;
- billing/status or Stripe test-mode route smoke is captured if deployed config
  allows it;
- observability/replay-readiness, summary, and trace metadata stay non-secret.

Evidence must stay sanitized: statuses, route names, counts, modes, timings,
public-safe slugs/labels, profile/provider/model, and ratings only. Do not
commit response bodies, excerpts, prompt bodies, credentials, tokens, cookies,
owner ids, persona ids, or raw corpus text. Wake ARGUS with the walkthrough
result; if the walkthrough reveals UX/product friction rather than backend
failure, name it for ARIADNE instead of treating it as backend completion.

## DAEDALUS scope

Build and execute a bounded populated replay plan against staging.

1. Confirm the live setup still reports `ready:true` before touching replay
   data.
2. Create or reuse one non-production replay account.
3. Prepare one replay persona with enough source material to exercise private
   archive retrieval.
4. Ingest a small corpus that includes:
   - private archive text with two or three distinctive query anchors;
   - at least one chat/archive path that writes `memory_items`;
   - one continuity record linked to owner-owned source material;
   - one Space/document path with public-safe material;
   - one discussion/comment path;
   - one Developer Space with one node, one event, and one snapshot;
   - one owner-only export manifest;
   - one Stripe test-mode billing path if the deployed config supports it.
5. Ensure new/rebuilt replay vectors use the active embedding metadata:
   - `embedding_provider='gemini'`
   - `embedding_model='gemini-embedding-2'`
   - `embedding_dimension=1536`
   - `embedding_index_name='memory_items_embedding_1536'`
   - `embedding_backfill_version=2`
6. Run data-backed retrieval measurement through real routes:
   - `/conversations/persona/:personaId/archive-retrieval`
   - `/conversations/persona/:personaId/context-preview`
   - `/observability/replay-readiness`
   - `/observability/summary`
   - `/observability/traces`
7. Run hostile privacy smokes:
   - same owner/persona retrieves expected rows;
   - anonymous visitor retrieves nothing private;
   - a different authenticated owner retrieves nothing private;
   - wrong persona scope retrieves nothing private;
   - lifecycle filters still exclude rejected, quarantined, expired, or
     superseded memory rows where that data is available.
8. Capture non-secret evidence only: route status, counts, retrieval mode,
   provider/model/profile, latency/cost metadata, skipped-source counts, and
   human relevance ratings. Do not commit private excerpts, prompt bodies,
   raw archive text, API keys, cookies, tokens, or account passwords.

## Acceptance evidence

DAEDALUS should update these docs with sanitized results:

- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/ops/STAGING_REPLAY_READINESS.md`
- this file, if the data plan changes during execution

Minimum local/remote commands for the handoff:

```bash
curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment
npx --yes pnpm@10.32.1 test:replay-readiness
npx --yes pnpm@10.32.1 test:health
npx --yes pnpm@10.32.1 test:storage
npx --yes pnpm@10.32.1 test:persona-context
npx --yes pnpm@10.32.1 test:conversation-archive
npx --yes pnpm@10.32.1 test:continuity
git diff --check
```

When the helper is implemented, DAEDALUS should run the local helper tests or
the narrowest safe validation available, update this plan with sanitized setup
evidence, and wake ARGUS. Populated measurement resumes only after ARGUS accepts
the helper.

## Out of scope

- Switching away from `station_free_1536` unless MIMIR opens a rollback lane.
- Treating Cloudflare as required. Current recommendation remains: defer
  Cloudflare retrieval unless a replay objective explicitly needs it.
- Broad UX redesign. Capture usability notes during replay, then hand them to
  ARIADNE if they become staging blockers.
- Optimizing model ranking before basic owner-scoped populated retrieval is
  proven.
