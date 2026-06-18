# PR29 - Live Staging Replay Refresh

Date: 2026-06-18
Status: implemented by A2 / DAEDALUS; ready for ARGUS review
Owner: DAEDALUS runs evidence, ARGUS reviews. ARIADNE only rehearses if a
visible staging-facing UI defect appears.

## Purpose

Prove the current post-PR25 through PR28 line is live and still coherent on
Railway before opening more feature work.

This is not a blanket "run three agents after every change" rule. It is a
bounded refresh after several accepted backend/product changes:

- PR25 four onboarding route map;
- PR26 retrieval ranking/trace quality;
- PR27 import retry recovery;
- PR28 retrieval candidate-depth fix.

## Scope

- Check Railway web and API `/health` and `/health/deployment`.
- Record sanitized deployment identity for web/API runtime commits and whether
  those commits include or lag the latest backend changes.
- Run a narrow replay smoke using existing ignored/local replay credentials if
  available:
  - sign in;
  - fetch replay owner/persona;
  - request context preview;
  - run private archive retrieval or search with replay-safe synthetic terms;
  - inspect import/archive status enough to confirm PR27 did not regress owner
    visibility;
  - check export/readback only if a completed package already exists.
- Keep all evidence sanitized: no tokens, cookies, emails, owner IDs, persona
  IDs, private excerpts, prompts, raw response bodies, Stripe URLs, or secrets.
- If replay credentials are not available locally, run public health/readiness
  plus local focused tests and wake MIMIR with the exact missing local-only
  credential key names, not values.

## Explicit Non-Scope

- Do not add Cloudflare config or Cloudflare retrieval.
- Do not add Redis memory truth or Redis-dependent replay behavior.
- Do not add provider changes, vector dimension changes, workers, Stripe
  changes, live social OAuth/API pulls, or broad UI redesign.
- Do not print or commit secrets.
- Do not patch code unless the live refresh finds a concrete regression.

## Cloudflare Status

Cloudflare remains deferred after PR28.

PR29 should only report whether live staging shows a concrete retrieval failure
that contradicts the PR28 conclusion. If no such failure appears, do not reopen
Cloudflare.

## Validation

Run whatever is needed to support the live evidence. Minimum expected checks:

```bash
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run test:health
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 --filter @station/api build
git diff --check
```

If this is evidence-only, focused tests plus live sanitized probes are enough.
If code changes, add the touched test family.

## ARGUS Review Ask

ARGUS should hostile-review:

- deployment identity truth;
- secret redaction;
- whether live evidence actually covers retrieval/import replay risks from
  PR26 through PR28;
- whether Cloudflare/Redis/workers/provider claims are still properly deferred;
- whether any live regression needs a new implementation lane.

## Wake Discipline

DAEDALUS should wake ARGUS with:

- live runtime commit evidence;
- sanitized route/status/count/mode evidence;
- local validation results;
- whether code changed;
- exact blocker if replay credentials are missing;
- recommendation: close as live-refresh accepted, or open one precise repair.

## DAEDALUS Live Refresh - 2026-06-18

Result: live Railway refresh passed with sanitized evidence. No code changed.

Deployment identity:

- API `/health`: HTTP `200`, `ok:true`.
- Web `/health`: HTTP `200`, `ok:true`.
- API `/health/deployment`: HTTP `200`, `ready:true`, service `@station/api`,
  repo `Tex6298/Station`, branch `main`, commit `fb906b1b0bf7`.
- Web `/health/deployment`: HTTP `200`, `ready:true`, service `@station/web`,
  repo `Tex6298/Station`, branch `main`, commit `fb906b1b0bf7`.
- Runtime commit `fb906b1` includes the PR28 backend retrieval-depth patch. It
  lags only later docs/review commits (`e89691d` PR28 ARGUS review and
  `4b59a4c` PR29 opening docs), not backend behavior needed for this refresh.
- API deployment readiness reported database, migrations, private storage,
  Supabase Auth redirects, Gemini `station_free_1536` embeddings, Stripe test
  readiness, and Redis/cache configuration as ready/configured.

Replay credential status:

- Local-only replay credential key names were present:
  `STATION_REPLAY_OWNER_EMAIL`, `STATION_REPLAY_OWNER_PASSWORD`,
  `STATION_REPLAY_OWNER_ID`, `STATION_REPLAY_OWNER_USERNAME`, and
  `STATION_REPLAY_CORPUS_PATH`.
- Values were not printed or committed. The access token was captured in memory
  only.

Sanitized live replay evidence:

| Probe | Route | HTTP | Evidence |
| --- | --- | ---: | --- |
| Replay owner sign-in | `/auth/signin` | 200 | Token captured in memory only; tier `creator`. |
| Current user | `/auth/me` | 200 | Tier `creator`; admin false; email presence true, value not recorded. |
| Persona list | `/personas` | 200 | One persona available; id not recorded. |
| Context preview | `/conversations/persona/:personaId/context-preview` | 200 | counts: canon 0, memory 1, integrity 1, archive 3; memory/vector and archive/vector retrieval; archive skipped counts all 0. |
| Archive retrieval | `/conversations/persona/:personaId/archive-retrieval` | 200 | mode `vector`; returned 3; searched 3; skipped unauthoritative 0; trace skipped counts all 0. |
| Import jobs | `/imports/persona/:personaId` | 200 | job count 2; completed 1; failed 1. |
| Archive search | `/imports/archive/search` | 200 | item count 5; kinds: memory 1, import_job 2, persona_file 1, document 1; warnings 0. |
| Export list | `/exports/persona/:personaId` | 200 | export count 3; completed 3. |
| Export readback | `/exports/:id` | 200 | package kind `persona_archive`; status `completed`; included sections 11; manifest keys 11; Markdown present. |
| Export bundle readback | `/exports/:id/bundle` | 200 | top-level bundle keys 6. |

Evidence hygiene:

- No tokens, cookies, emails, owner IDs, persona IDs, export IDs, private
  excerpts, prompts, raw response bodies, raw manifest contents, or secrets were
  committed.
- Only public route names, HTTP statuses, non-secret deployment commit/service
  metadata, counts, modes, booleans, and sanitized status labels are recorded.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 1 test passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:health` | Pass | 14 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 6 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 29 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:storage` | Pass | 16 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` | Pass | API package build and dependent package builds passed. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warning only for local triad state. |

Recommendation:

- Close PR29 as a live-refresh acceptance if ARGUS agrees. The current Railway
  line is coherent for the PR25-PR28 replay risks checked here.
- Do not reopen Cloudflare, Redis memory truth, provider routing, vector
  dimension, worker, Stripe, live social import, or broad UI work from this
  evidence. No precise repair lane is indicated by this refresh.
