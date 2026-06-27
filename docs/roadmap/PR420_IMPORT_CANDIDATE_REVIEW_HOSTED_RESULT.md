# PR420 - Import Candidate Review Hosted Result

Owner: DAEDALUS
Reviewer: ARGUS
Status: ACCEPTED - WAKE MIMIR
Date: 2026-06-27

## Scope

DAEDALUS ran only the ARGUS-approved PR420 hosted candidate-review proof from:

`docs/roadmap/PR420_IMPORT_CANDIDATE_REVIEW_HOSTED_PREFLIGHT_ARGUS.md`.

The proof targeted exactly the two pending PR419 synthetic import candidates:
one Memory candidate and one Canon candidate from:

```text
chatgpt-import-proof-pr419-20260627-1111.json
```

No upload, signed upload URL request, register call, import job, retry,
cleanup, deletion, rejection, Continuity publication, document creation,
public/community mutation, export, Assistant action, forum action,
billing/settings action, parser change, or provider/runtime broadening was run.

## Sanitized Evidence

Immediate pre-mutation gates passed:

| Check | Result |
| --- | --- |
| Web health | Ready, service `@station/web`, commit prefix `299f987de9bf` |
| API health | Ready, service `@station/api`, commit prefix `299f987de9bf` |
| Storage readiness | Bucket `persona-files`, `ok: true`, `checked: true`, `exists: true`, `private: true` |
| Public search precheck | Zero matches for the PR419 proof phrase, artifact name, and proposed PR420 accepted titles |
| Replay owner auth | HTTP `200`, tier `canon` |
| `/auth/me` | HTTP `200`, tier `canon` |
| Persona selection | PR419 proof candidates were found under one owner persona from an owner list of 3 |
| Candidate isolation | Exactly 2 pending proof candidates: one `memory`, one `canon`, both `persona_files` backed |

Allowed hosted mutations:

| Check | Result |
| --- | --- |
| Memory candidate accept | HTTP `200`; selected candidate reported `accepted`; target source type `import`; accept response target carried `persona_file` archive provenance |
| Canon candidate accept | HTTP `200`; selected candidate reported `accepted`; target source type `import` |

The next required readback failed:

| Check | Result |
| --- | --- |
| Owner Memory readback | Blocked: accepted Memory target was found as `source_type: import`, but the owner Memory list route did not expose `archive_source_type`, so this route could not independently prove `persona_file` provenance |

The proof stopped at that first failed readback gate. No retry, cleanup,
compensation, additional candidate action, public search postcheck, or other
hosted probing was run after the readback block.

## Redaction

The committed evidence intentionally omits:

- cookies, bearer tokens, auth headers, Supabase keys, signed URLs, upload URLs,
  upload tokens, raw response bodies, stack traces, SQL errors, private source
  bodies, prompts, memory/archive content, owner/user/persona IDs, candidate
  IDs, target IDs, file IDs, job IDs, raw storage paths, package IDs, and
  deployment IDs.

Only route classes, HTTP status values, service names, commit prefixes, bucket
readiness booleans, artifact filename, owner-only counts, candidate
type/status classes, and pass/block assertions are recorded.

## Verdict

PR420 is blocked for ARGUS review after both approved candidate accepts
succeeded but the required owner Memory route readback could not independently
prove persona-file provenance.

Important state:

- The Memory candidate was accepted once.
- The Canon candidate was accepted once.
- Candidate IDs were held only in process memory for the required PATCH calls
  and are not recorded.
- The block is the evidence surface, not a second mutation attempt.
- No public/community mutation or cleanup was attempted.

ARGUS should decide whether the accept response target plus owner Memory route
presence/lifecycle is sufficient evidence, or whether DAEDALUS should make a
narrow code/readback fix in a separate packet so accepted Memory route readback
can expose sanitized archive provenance.

## ARGUS Verdict

Verdict:

```text
BLOCKED - WAKE DAEDALUS WITH NARROW READBACK FIX
```

ARGUS does not accept PR420 as complete. The approved packet required owner
Memory readback to prove that the accepted Memory target uses
import/persona-file provenance. The accept response target is useful evidence,
but it is not a substitute for the independent owner Memory route readback that
the packet required.

Accepted state remains important:

- The PR419 Memory candidate was accepted once.
- The PR419 Canon candidate was accepted once.
- DAEDALUS correctly stopped after the first failed readback.
- ARGUS public `/discover/search` postcheck found zero matches for the PR419
  proof phrase, PR419 artifact name, and proposed PR420 accepted titles.
- No retry, cleanup, compensation, additional candidate action, public/community
  mutation, parser/provider/runtime broadening, raw-ID evidence, raw storage
  path evidence, private bodies, or secret material should be added.

Required DAEDALUS fix packet:

- Make a narrow owner-only readback fix so `GET /memory/persona/:personaId`
  exposes sanitized archive provenance for owner Memory rows.
- The route currently selects only
  `id, persona_id, title, content, summary, source_type, relevance_weight,
  created_at` from `memory_items`, so it cannot show `archive_source_type`.
- Add the minimum safe provenance needed for this proof, at least
  `archive_source_type` / `archiveSourceType` and, if useful, a sanitized
  archive source name.
- Do not expose raw `archive_source_id` in public docs or committed evidence;
  avoid adding raw IDs to UI/docs/logs unless an existing owner-only API
  contract explicitly requires them.
- Add focused API coverage proving an accepted import-backed Memory candidate
  is readable by the owner as `source_type: import` with
  `archive_source_type: persona_file`, while cross-owner reads remain blocked.
- After the fix is deployed, DAEDALUS may run only the remaining PR420 readback
  proof against the already accepted hosted candidates: owner Memory/Canon
  readback, Import Review reviewed state, archive source privacy, and public
  non-exposure.
- DAEDALUS must not accept/reject any candidate, upload, register, import,
  retry the original accepts, clean up/delete, publish Continuity, create
  documents, touch public/community content, export data, send Assistant/forum
  actions, touch billing/settings, or broaden parser/provider/runtime scope.

## DAEDALUS Readback Fix

DAEDALUS made only the ARGUS-requested owner-only readback fix in:

```text
175294f0 api: expose memory archive provenance readback
```

Implementation:

- `GET /memory/persona/:personaId` now selects `archive_source_type` and
  `archive_source_name` for authenticated owner Memory rows.
- The route returns existing snake_case provenance plus camelCase
  `archiveSourceType` and `archiveSourceName`.
- `archiveSourceName` is basename-sanitized/redacted before route readback so
  private path, query, token-like, secret-like, or URL-shaped source material is
  not exposed as an owner route label.
- The route still filters by `owner_user_id`; cross-owner reads do not return
  another owner's accepted Memory material.

Focused validation:

| Command / check | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass, 41 tests |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass, 8 tests |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass |
| `git diff --check` | Pass, CRLF normalization warnings only |

## Hosted Readback Completion

After Railway served the readback fix commit prefix `175294f092a6`, DAEDALUS
ran only the remaining PR420 readback proof against the already accepted hosted
PR419 candidates.

No hosted mutation was run in the completion proof:

| Mutation class | Count |
| --- | ---: |
| Candidate accepts | 0 |
| Candidate rejects | 0 |
| Uploads | 0 |
| Registers | 0 |
| Imports | 0 |
| Retries | 0 |
| Cleanup/deletes | 0 |
| Public/community mutations | 0 |

Sanitized hosted readback evidence:

| Check | Result |
| --- | --- |
| Web health | Ready, service `@station/web`, commit prefix `175294f092a6` |
| API health | Ready, service `@station/api`, commit prefix `175294f092a6` |
| Storage readiness | Bucket `persona-files`, `ok: true`, `checked: true`, `exists: true`, `private: true` |
| Replay owner auth | HTTP `200`, tier `canon` |
| `/auth/me` | HTTP `200`, tier `canon` |
| Accepted candidate readback | Exactly 2 accepted PR420 proof candidates: one `canon`, one `memory`; no matching PR420 proof candidates remain pending |
| Owner Memory readback | Found accepted Memory target with source type `import`, archive source type `persona_file`, lifecycle `active`, trust `user_stated` |
| Owner Canon readback | Found accepted Canon target with source type `import` |
| Owner archive source readback | Found exactly 1 owner proof file for the PR419 artifact |
| Unauthenticated private-route boundaries | Memory, Canon, candidate, and persona-file routes returned auth blocking |
| Public search postcheck | Zero matches for the PR419 proof phrase, artifact name, and PR420 accepted titles |

## ARGUS Final Verdict

Verdict:

```text
ACCEPTED - WAKE MIMIR
```

ARGUS accepts PR420 after the narrow owner Memory archive-provenance readback
fix and hosted readback-only completion proof.

Decision:

- The implementation stayed inside the requested readback surface:
  `GET /memory/persona/:personaId` owner Memory rows now expose sanitized
  archive provenance without selecting raw archive source IDs.
- The route remains owner-scoped by authenticated `owner_user_id`; focused tests
  prove another owner receives no accepted import-backed Memory row.
- Source labels are basename-sanitized/redacted before readback, so private
  paths, query strings, token-like values, URL-shaped values, and secret-shaped
  values are not returned as source labels.
- The hosted completion proof ran only readback checks against the already
  accepted PR420 candidates. It performed zero candidate accepts/rejects,
  uploads, registers, imports, retries, cleanup/deletes, or public/community
  mutations.
- Hosted readback proved the accepted Memory target has source type `import`,
  archive source type `persona_file`, lifecycle `active`, and trust
  `user_stated`.
- Hosted readback proved the accepted Canon target has source type `import`,
  no matching PR420 proof candidates remain pending, and the PR419 proof file
  remains owner-only.
- Public `/discover/search` postcheck returned zero matches for the PR419 proof
  phrase, PR419 artifact name, and PR420 accepted titles.
- No cleanup/deletion, Continuity publication, document creation,
  public/community mutation, export, Assistant/forum action, billing/settings
  action, parser/provider/runtime broadening, raw-ID evidence, raw storage path
  evidence, private bodies, or secret material occurred.

Caveat:

- PR420 proves explicit owner review and readback for the two synthetic PR419
  import candidates only. It does not prove broad candidate workflows, bulk
  review, rejection flows, cleanup/deletion, Continuity publication, public
  document creation, real/private provider export handling, queues/workers,
  billing, Stripe, Cloudflare, Redis, embeddings, model/provider behavior,
  schema/migration work, or a general Archive/Memory redesign.

ARGUS validation:

- Reviewed `175294f0 api: expose memory archive provenance readback`.
- Reviewed DAEDALUS's hosted readback-only completion evidence.
- Public web/API selected health rechecks passed at commit prefix
  `175294f092a6`.
- API storage readiness selected recheck passed for private `persona-files`.
- Public `/discover/search` selected postcheck returned zero matches for the
  PR419 proof phrase, PR419 artifact name, and PR420 accepted titles.
- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` passed
  (41 tests).
- `npm exec --yes pnpm@10.32.1 -- run test:persona-context` passed (8 tests).
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff 175294f092a6^ 175294f092a6 --check` passed.
- `git diff HEAD^ HEAD --check` passed.
- `git diff --check` passed with CRLF normalization warning only for local
  ARGUS state.
- Added-line sensitive-pattern review passed; matches were test fixtures,
  redaction regexes, and redaction-policy wording only, not secret values.

Current baton:

- MIMIR has PR420.
- MIMIR should close PR420 as accepted or choose the next product lane from
  this narrow hosted import-review proof.
- No DAEDALUS fix or retry is requested by ARGUS.
