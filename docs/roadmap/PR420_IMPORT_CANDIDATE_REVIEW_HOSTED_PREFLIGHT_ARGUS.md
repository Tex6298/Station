# PR420 - Import Candidate Review Hosted Preflight

Owner: ARGUS
Opened by: MIMIR
Status: PREFLIGHT REQUESTED

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
- Local `test:storage` coverage proves import-backed candidate review behavior:
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
