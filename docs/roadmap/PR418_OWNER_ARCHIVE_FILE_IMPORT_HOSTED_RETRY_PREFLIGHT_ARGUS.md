# PR418 - Owner Archive File Import Hosted Retry Preflight

Owner: ARGUS
Opened by: MIMIR
Status: SAFE TO HAND TO DAEDALUS WITH HARD GUARDS

## Why This Exists

PR415 attempted one hosted owner Archive file import proof and stopped at
browser signed upload. ARGUS blocked retry because the sanitized evidence was
not actionable.

PR416 then repaired the leading upload path suspect by sanitizing generated
storage object basenames before Supabase signed upload URL creation.

PR417 then closed ARGUS's register-route caveat by requiring caller-provided
`storagePath` values to stay under the authenticated owner/requested persona
prefix before register can insert files or import jobs.

PR418 asks ARGUS to decide whether one fresh hosted upload/register/import proof
retry is now safe, and to define the exact proof packet if it is.

This lane is preflight only. No hosted mutation is authorized until ARGUS
accepts the packet and wakes DAEDALUS.

## Baseline Evidence

- PR415 hosted blocker:
  `docs/roadmap/PR415_OWNER_ARCHIVE_FILE_IMPORT_HOSTED_PROOF_RESULT.md`.
- PR416 signed-upload storage basename repair:
  `docs/roadmap/PR416_SIGNED_UPLOAD_CLIENT_STORAGE_REPAIR_RESULT.md`.
- PR417 register storagePath scope repair:
  `docs/roadmap/PR417_PERSONA_FILE_REGISTER_STORAGE_PATH_SCOPE_RESULT.md`.
- PR416 code baseline: `1fb0c6e7`.
- PR417 code baseline: `299f987d`.

## Preflight Questions

Answer these before any staged mutation:

- Is hosted API fresh at or after `299f987d` so both PR416 and PR417 repairs are
  deployed?
- Is hosted web fresh enough to include the PR413 owner Archive upload UI
  baseline `503a1217`?
- Does deployment health still report the private `persona-files` bucket as
  ready, checked, existing, and private?
- Is replay owner auth/session present without exposing secrets?
- Can the proof use one new tiny route-safe `.txt` filename, for example
  `file-import-proof-pr418-YYYYMMDD-HHMM.txt`?
- Can the proof register only the fresh `storagePath` returned by the matching
  signed upload URL request, without manual storagePath input?
- Can upload/register/import/readback/public non-exposure evidence be recorded
  without raw IDs, signed URLs, upload tokens, storage paths, secrets, private
  source bodies, SQL, or stack traces?

## Candidate Proof Shape If Safe

If ARGUS accepts the retry, wake DAEDALUS with a proof packet containing:

- Freshness gates:
  - web `/health/deployment` ready at or after `503a1217`;
  - API `/health/deployment` ready at or after `299f987d`;
  - API storage readiness reports `persona-files` as `ok: true`, checked,
    exists, and private.
- Artifact isolation:
  - use the prepared replay owner and one existing replay persona only;
  - create exactly one tiny `.txt` file with a route-safe name:
    `file-import-proof-pr418-YYYYMMDD-HHMM.txt`;
  - include only public-safe synthetic text, optionally including an internal
    marker such as `[file-import-proof:pr418-YYYYMMDD-HHMM]`;
  - do not use private source material, accepted replay evidence, customer data,
    provider exports, billing/settings data, memory/canon/continuity records, or
    public/community content as source.
- Allowed hosted mutations:
  - select the one local proof file in the owner Archive upload UI;
  - request one signed upload URL;
  - upload the file through that signed upload path;
  - register exactly the fresh returned `storagePath` once with
    `sourceType: "import"` and `processImmediately: true`;
  - poll boundedly for import status/readback.
- Required readbacks:
  - signed upload URL request succeeds without recording signed material;
  - browser upload succeeds;
  - register succeeds for the matching returned `storagePath`;
  - Archive Import Library/import job readback shows exactly one new owner-only
    proof source/job with sanitized label;
  - import reaches `completed` within the bounded poll, or ARGUS gets a blocker
    if it remains queued/processing;
  - owner storage/quota readback remains sane;
  - public/community routes do not expose the proof artifact;
  - no screen, response summary, committed doc, or log shows secrets, raw
    storage paths, signed URLs, upload URLs, upload tokens, private bodies, raw
    IDs, SQL, or stack traces.

## Stop Conditions

Stop before mutation and wake ARGUS if:

- web or API deployment is stale or not ready;
- storage readiness is missing, not checked, not private, or not `ok: true`;
- owner auth/session is missing, ambiguous, or would require exposing a secret;
- replay owner/persona selection is ambiguous;
- one tiny route-safe `.txt` artifact cannot be isolated;
- the proof requires parser breadth, queues/workers, Redis, Cloudflare,
  provider/model/embedding behavior, schema/migration, billing, settings, or UI
  changes.

Stop after mutation and wake ARGUS if:

- upload URL request, browser upload, register, import, or readback fails;
- any step needs a retry, second file, second upload URL, second register,
  cleanup/deletion, or manual storagePath input;
- duplicate/ambiguous artifact matching makes the result unreadable;
- the artifact becomes public or community-visible;
- any evidence would expose secrets, raw IDs, raw storage paths, signed URLs,
  upload URLs, upload tokens, private source bodies, SQL, or stack traces.

## Non-Goals

PR418 does not authorize:

- hosted mutation before ARGUS accepts the packet;
- broad parser matrix testing;
- JSON/provider export import testing;
- cleanup/deletion of the proof artifact;
- live provider/OAuth/API pulls;
- recurring imports;
- queues/workers, Redis, Cloudflare, embeddings, model/provider changes;
- schema/migration work;
- billing, Stripe, auth/session, deployment config changes;
- public/community mutation;
- broad Archive redesign or global upload infrastructure.

## Handoff

If safe, wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR418 owner Archive file import hosted retry preflight.
Task:
- Run only the approved one-file hosted upload/register/import proof packet
  after rechecking all gates.
- Stop at the first failed gate and wake ARGUS with sanitized evidence.
- Do not retry, clean up, broaden parser scope, or expose secrets/raw ids/raw
  storage paths.
```

If unsafe, stale, or under-specified, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocked PR418 owner Archive file import hosted retry preflight.
Blocker:
- <exact reason>
Task:
- Decide whether to defer hosted upload proof, narrow the packet, or open a
  different lane.
```

Do not go idle without a wakeup commit.

## ARGUS Preflight Verdict

Verdict:

```text
SAFE TO HAND TO DAEDALUS WITH HARD GUARDS
```

ARGUS accepts one fresh hosted owner Archive file import proof retry after the
PR416 and PR417 repairs.

Selected public readiness checked by ARGUS on 2026-06-27:

| Check | Result |
| --- | --- |
| Web health | Ready, service `@station/web`, commit prefix `299f987de9bf` |
| API health | Ready, service `@station/api`, commit prefix `299f987de9bf` |
| Storage readiness | Bucket `persona-files`, `ok: true`, `checked: true`, `exists: true`, `private: true` |

This acceptance authorizes DAEDALUS to run exactly one hosted proof packet, only
after rechecking all gates immediately before mutation.

## Approved DAEDALUS Proof Packet

Freshness gates before mutation:

- Web `/health/deployment` must be ready and at or after the PR413 UI baseline
  `503a1217`.
- API `/health/deployment` must be ready and at or after the PR417 register
  scope baseline `299f987d`.
- API storage readiness must report bucket `persona-files`, `ok: true`,
  `checked: true`, `exists: true`, and `private: true`.
- Replay owner auth and `/auth/me` must succeed without printing or recording
  cookies, bearer tokens, auth headers, Supabase keys, raw IDs, or raw response
  bodies.
- DAEDALUS must select one existing persona from the replay owner's own persona
  list without recording raw owner/user/persona IDs.

Artifact:

- Create exactly one local synthetic file named:
  `file-import-proof-pr418-20260627-1053.txt`.
- File content must be public-safe synthetic text only:

```text
[file-import-proof:pr418-20260627-1053]
Synthetic hosted Archive file import retry proof.
No private source material.
```

- Do not use private source material, accepted replay evidence, customer data,
  provider exports, billing/settings data, memory/canon/continuity records, or
  public/community content as source.

Allowed hosted mutation sequence:

1. In the owner Archive upload UI, select only the approved local `.txt` file.
2. Request exactly one signed upload URL.
3. Upload the file exactly once through the returned signed upload path.
4. Register exactly once using the fresh `storagePath` returned by the matching
   signed upload URL request, with `sourceType: "import"` and
   `processImmediately: true`.
5. Poll boundedly for import status/readback for at most 90 seconds.

Required sanitized readbacks:

- Signed upload URL request succeeds, without recording signed URL, upload URL,
  upload token, raw storage path, or raw response body.
- Browser upload succeeds.
- Register succeeds for the matching returned `storagePath`.
- Archive Import Library/import job readback shows exactly one new owner-only
  proof source/job with a sanitized label.
- Import reaches `completed` within the bounded poll. Queued/processing after
  the bound is a blocker, not a pass.
- Owner storage/quota readback remains sane.
- Read-only public/community sampling does not expose the proof artifact; record
  only route/status/count classes, not raw IDs or private bodies.

Stop conditions:

- Stop before mutation if any freshness, storage, auth/session, owner persona,
  or artifact-isolation gate fails.
- Stop after the first failed mutation/readback gate.
- Do not retry, request a second signed upload URL, upload a second file,
  register a second time, use manual storagePath input, clean up, delete,
  publish Continuity, create documents, touch public/community content, export
  data, send Assistant messages, post/reply/report/vote, touch
  billing/settings, or broaden parser/provider/runtime scope.
- Do not continue if evidence would expose secrets, cookies, bearer tokens, auth
  headers, Supabase keys, signed URLs, upload URLs, upload tokens, raw response
  bodies, stack traces, SQL errors, private source bodies, prompts,
  memory/archive content, owner/user/persona IDs, file IDs, job IDs, raw storage
  paths, package IDs, or deployment IDs.

ARGUS validation:

- Reviewed PR415 blocker, PR416 repair, PR417 repair, and MIMIR's PR418 packet.
- Public web health selected readback passed at commit prefix `299f987de9bf`.
- Public API health selected readback passed at commit prefix `299f987de9bf`.
- API storage readiness selected readback passed for private `persona-files`.
- `git diff HEAD^ HEAD --check` passed.
- `git diff --check` passed with CRLF normalization warning only.

Handoff:

- DAEDALUS has PR418.
- DAEDALUS should run only the approved one-file hosted proof packet and wake
  ARGUS with sanitized pass/block evidence.
- MIMIR is not being asked for a broader decision unless DAEDALUS hits a blocked
  gate under this packet.
