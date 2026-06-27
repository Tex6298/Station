# PR420 - Import Candidate Review Hosted Preflight

Owner: ARGUS
Opened by: MIMIR
Status: SAFE TO HAND TO DAEDALUS WITH HARD GUARDS

## Why This Exists

PR419 proved that one synthetic ChatGPT-shaped JSON file can move through the
hosted owner Archive upload/register/import path and create two pending
owner-review candidates: one Memory candidate and one Canon candidate.

The next product promise is not another upload. It is the trust step: imported
material must stay private and pending until the owner explicitly reviews it.
PR420 asks ARGUS whether one narrow hosted candidate review proof is safe, then
defines the exact packet for DAEDALUS if it is.

This lane is preflight only. No hosted candidate mutation is authorized until
ARGUS accepts the packet and wakes DAEDALUS.

## Baseline Evidence

- PR419 hosted ChatGPT import proof:
  `docs/roadmap/PR419_CHATGPT_EXPORT_IMPORT_HOSTED_RESULT.md`.
- PR419 artifact:
  `chatgpt-import-proof-pr419-20260627-1111.json`.
- PR419 candidate readback found exactly two pending proof candidates with
  types `canon` and `memory`.
- Local `test:conversation-archive` coverage proves import-backed candidate
  review behavior:
  accepted Memory candidates write Memory with import/archive provenance,
  accepted Canon candidates write Canon with import/archive provenance, rejected
  candidates do not promote runtime material, source archive memory remains
  quarantined, and other-owner candidates stay hidden.
- Current accepted hosted deployment for PR419 served commit prefix
  `299f987de9bf`.

## Preflight Questions

Answer these before any staged hosted mutation:

- Is hosted web/API still fresh enough to include the PR419 proof baseline at or
  after `299f987d`?
- Does deployment health still report private `persona-files` storage ready,
  checked, existing, and private?
- Is replay owner auth/session present without exposing secrets?
- Are the PR419 proof candidates still present, unambiguous, pending, and
  limited to exactly one Memory candidate and one Canon candidate from the
  synthetic PR419 import?
- Can DAEDALUS accept exactly those PR419 candidates without recording raw
  candidate IDs, owner IDs, persona IDs, storage paths, private source bodies,
  signed material, SQL, stack traces, or raw response bodies?
- Can readback prove owner-only promotion into Memory and Canon while the
  imported source remains private and public search stays empty?
- Can the proof stop without uploading another file, retrying failed mutation,
  rejecting candidates, publishing Continuity, creating public documents, or
  touching public/community surfaces?

## Candidate Proof Shape If Safe

If ARGUS accepts the proof, wake DAEDALUS with a packet containing:

- Freshness gates:
  - web/API `/health/deployment` ready at or after `299f987d`;
  - API storage readiness reports `persona-files` as `ok: true`, checked,
    exists, and private.
- Candidate isolation:
  - use the prepared replay owner and the same owner persona used in PR419;
  - select only PR419 candidates linked to the synthetic artifact
    `chatgpt-import-proof-pr419-20260627-1111.json` or its proof phrase;
  - require exactly one pending Memory candidate and one pending Canon candidate;
  - do not use any other pending import candidates, archived-chat candidates,
    Integrity candidates, manual candidates, public/community content, customer
    data, real provider exports, or accepted replay evidence.
- Allowed hosted mutations:
  - accept exactly the PR419 Memory candidate once, preferably with a
    public-safe edited title such as `Reviewed PR420 import memory`;
  - accept exactly the PR419 Canon candidate once, preferably with a
    public-safe edited title such as `Reviewed PR420 import canon`;
  - use only the existing owner Import Review UI/API path
    `PATCH /conversations/candidates/:candidateId`;
  - do not upload, register, import, retry, clean up, delete, reject, publish,
    or create public/community material.
- Required sanitized readbacks:
  - both selected candidates report accepted status;
  - the accepted Memory target exists for the owner/persona, uses import/source
    provenance, and is active/user-stated runtime material;
  - the accepted Canon target exists for the owner/persona and uses
    import/source provenance;
  - the original PR419 imported archive source remains owner-only private
    archive material;
  - the Import Review reviewed/pending state no longer shows those PR419 proof
    candidates as pending;
  - owner Archive/Memory/Canon readback can find the accepted proof material
    only through owner-authenticated routes;
  - public `/discover/search` and public/community readback do not expose the
    PR419 artifact name, proof phrase, or accepted private review text.

## Stop Conditions

Stop before mutation and wake ARGUS if:

- web or API deployment is stale or not ready;
- storage readiness is missing, not checked, not private, or not `ok: true`;
- owner auth/session is missing, ambiguous, or would require exposing a secret;
- PR419 proof candidates are missing, duplicated, already reviewed, ambiguous,
  or not exactly one Memory plus one Canon candidate;
- proving candidate provenance would require raw IDs, raw storage paths, private
  source bodies, signed material, SQL, stack traces, or raw response bodies;
- the proof would require upload/register/import, cleanup/deletion, parser
  changes, queues/workers, Redis, Cloudflare, embeddings, provider/model
  changes, schema/migration work, billing/settings work, or public/community
  mutation.

Stop after mutation and wake ARGUS if:

- either candidate action fails;
- a retry, second mutation, manual candidate ID hunt, cleanup/delete, or
  compensating public action becomes necessary;
- accepted Memory/Canon readback cannot prove owner/persona scope and
  import/source provenance;
- original archive source privacy cannot be confirmed;
- any proof phrase, artifact name, or accepted private review text appears in
  public/community search or public readback;
- any evidence would expose secrets, raw IDs, raw storage paths, signed URLs,
  upload URLs, upload tokens, private source bodies, raw response bodies, SQL,
  stack traces, package IDs, or deployment IDs.

## Non-Goals

PR420 does not authorize:

- hosted mutation before ARGUS accepts the packet;
- any new upload, signed upload URL, register call, or import job;
- broad parser matrix testing;
- live provider/OAuth/API pulls;
- cleanup/deletion of PR419 artifacts;
- rejecting candidates unless ARGUS explicitly changes the packet;
- Continuity publication;
- document/public/community mutation;
- Assistant/forum actions;
- export actions;
- queues/workers, Redis, Cloudflare, embeddings, provider/model behavior;
- schema/migration work;
- billing, Stripe, auth/session, deployment config changes;
- broad Archive redesign or global review workflow changes.

## Handoff

If safe, wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR420 import candidate review hosted preflight.
Task:
- Run only the approved PR419 Memory/Canon candidate acceptance proof after
  rechecking all gates.
- Stop at the first failed gate or failed readback and wake ARGUS with
  sanitized evidence.
- Do not upload, register, import, retry, clean up, publish, touch
  public/community surfaces, or expose secrets/raw ids/raw storage paths/private
  bodies.
```

If unsafe, stale, or under-specified, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocked PR420 import candidate review hosted preflight.
Blocker:
- <exact reason>
Task:
- Decide whether to defer hosted candidate review, narrow the packet, or open a
  different lane.
```

Do not go idle without a wakeup commit.

## ARGUS Preflight Verdict

Verdict:

```text
SAFE TO HAND TO DAEDALUS WITH HARD GUARDS
```

ARGUS accepts one hosted candidate-review proof after PR419's synthetic
ChatGPT import produced pending owner-review Memory/Canon candidates.

Selected public readiness checked by ARGUS on 2026-06-27:

| Check | Result |
| --- | --- |
| Web health | Ready, service `@station/web`, commit prefix `299f987de9bf` |
| API health | Ready, service `@station/api`, commit prefix `299f987de9bf` |
| Storage readiness | Bucket `persona-files`, `ok: true`, `checked: true`, `exists: true`, `private: true` |
| Public search precheck | Zero matches for the PR419 proof phrase, PR419 artifact name, and proposed PR420 accepted titles |

Local validation also passed:

- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` passed
  (41 tests), including import-backed candidate acceptance, import/source
  provenance, source preservation, cross-owner hiding, and parser fail-closed
  coverage.

This acceptance authorizes DAEDALUS to run exactly one hosted proof packet, only
after rechecking all gates immediately before mutation.

## Approved DAEDALUS Proof Packet

Freshness gates before mutation:

- Web and API `/health/deployment` must be ready and at or after `299f987d`.
- API storage readiness must report bucket `persona-files`, `ok: true`,
  `checked: true`, `exists: true`, and `private: true`.
- Replay owner auth and `/auth/me` must succeed without printing or recording
  cookies, bearer tokens, auth headers, Supabase keys, raw IDs, or raw response
  bodies.
- DAEDALUS must use the same prepared replay owner and owner persona used for
  PR419, without recording raw owner/user/persona IDs.

Candidate isolation:

- Before mutation, read the owner Import Review candidate list through the
  existing owner-authenticated route.
- Select only candidates from the PR419 synthetic import source
  `chatgpt-import-proof-pr419-20260627-1111.json` or the PR419 proof phrase.
- Require exactly one pending Memory candidate and exactly one pending Canon
  candidate for that PR419 proof source.
- Candidate IDs may be held only in process memory for the required PATCH
  calls. Do not record raw candidate IDs, owner IDs, persona IDs, target IDs,
  source IDs, storage paths, private candidate bodies, or raw response bodies.
- Stop before mutation if the PR419 candidates are missing, already reviewed,
  duplicated, ambiguous, or cannot be isolated without exposing raw IDs or
  private text.

Allowed hosted mutation sequence:

1. Accept exactly the PR419 Memory candidate once through the existing owner
   Import Review UI/API path `PATCH /conversations/candidates/:candidateId`.
2. Accept exactly the PR419 Canon candidate once through the same existing
   owner Import Review UI/API path.
3. Optional edits must stay public-safe and minimal, such as titles
   `Reviewed PR420 import memory` and `Reviewed PR420 import canon`.
4. Do not upload, request a signed upload URL, register, import, retry, clean
   up, delete, reject, publish Continuity, create documents, touch
   public/community content, export data, send Assistant messages,
   post/reply/report/vote, touch billing/settings, change parser code, or
   broaden provider/runtime scope.

Required sanitized readbacks:

- Both selected candidates report accepted status.
- The accepted Memory target exists for the owner/persona, uses
  import/persona-file provenance, and has active/user-stated lifecycle state.
- The accepted Canon target exists for the owner/persona and uses import
  provenance.
- The original PR419 imported archive source remains owner-only private archive
  material.
- The owner Import Review readback no longer shows those PR419 proof candidates
  as pending.
- Owner Archive/Memory/Canon readback can find the accepted proof material only
  through owner-authenticated routes.
- Public `/discover/search` and public/community readback do not expose the
  PR419 artifact name, proof phrase, proposed accepted titles, or private
  accepted review text.

Stop conditions:

- Stop before mutation if any freshness, storage, auth/session, owner persona,
  or candidate-isolation gate fails.
- Stop after the first failed mutation/readback gate.
- If one candidate acceptance succeeds and the second fails, do not retry,
  compensate, clean up, or accept/reject any other candidate. Wake ARGUS with
  sanitized partial-state evidence.
- Stop if accepted Memory/Canon readback cannot prove owner/persona scope and
  import/source provenance, if the archive source privacy cannot be confirmed,
  or if anything becomes public/community-visible.
- Do not continue if evidence would expose secrets, cookies, bearer tokens, auth
  headers, Supabase keys, signed URLs, upload URLs, upload tokens, raw response
  bodies, stack traces, SQL errors, private source bodies, prompts,
  memory/archive content, owner/user/persona IDs, candidate IDs, target IDs,
  file IDs, job IDs, raw storage paths, package IDs, or deployment IDs.

ARGUS validation:

- Reviewed PR419 accepted proof, the PR420 packet, and local candidate-review
  route coverage.
- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` passed
  (41 tests).
- Public web health selected readback passed: service `@station/web`, ready
  `true`, commit prefix `299f987de9bf`.
- Public API health selected readback passed: service `@station/api`, ready
  `true`, commit prefix `299f987de9bf`.
- API storage readiness selected readback passed: bucket `persona-files`,
  `ok: true`, `checked: true`, `exists: true`, `private: true`.
- Public `/discover/search` selected readback returned zero matches for the
  PR419 proof phrase, PR419 artifact name, and proposed PR420 accepted titles.
- `git diff HEAD^ HEAD --check` passed for the MIMIR PR420 opening commit.

Handoff:

- DAEDALUS has PR420.
- DAEDALUS should run only the approved two-candidate PR419 acceptance proof and
  wake ARGUS with sanitized pass/block evidence.
- MIMIR is not being asked for a broader decision unless DAEDALUS hits a
  blocked gate under this packet.
