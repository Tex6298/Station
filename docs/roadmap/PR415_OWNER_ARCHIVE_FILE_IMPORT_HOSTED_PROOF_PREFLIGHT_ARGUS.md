# PR415 - Owner Archive File Import Hosted Proof Preflight

Owner: ARGUS
Opened by: MIMIR
Status: Accepted by ARGUS for DAEDALUS proof

## Why This Exists

PR413 added the smallest owner-visible uploaded file import UI to the persona
Archive route. PR414 proved that UI is present and safe on hosted desktop and
390px mobile without mutating staged data.

The remaining gap is not another visual check. It is whether we should run one
controlled hosted proof that the visible UI can upload, register, and process a
single disposable owner-only archive file through Railway/Supabase staging.

This lane is preflight only. ARGUS decides whether the hosted mutation is safe
enough to hand to DAEDALUS, and defines the exact proof packet if it is.

## Baseline Evidence

- PR413 result:
  `docs/roadmap/PR413_OWNER_ARCHIVE_FILE_IMPORT_UI_RESULT.md`.
- PR414 hosted UI result:
  `docs/roadmap/PR414_OWNER_ARCHIVE_FILE_IMPORT_UI_RECHECK_RESULT.md`.
- Hosted web was fresh at `503a1217ce82` for PR414, satisfying the PR413
  baseline `503a1217`.
- Existing API tests already cover upload preflight/register/idempotency/quota
  and parser behavior locally, but not a fresh hosted UI upload proof for this
  new visible route.

## Preflight Questions

Answer these before any staged mutation:

- Is hosted web fresh enough to include PR413 UI and ARGUS's PR413 redaction
  patch?
- Is hosted API fresh enough to include the signed upload/register/import path
  used by PR413?
- Does public deployment health confirm the `persona-files` bucket is present,
  private, and storage-ready?
- Can the proof use exactly one disposable, public-safe synthetic owner file
  without touching accepted replay evidence or private source material?
- Which single file family should be used for the first hosted proof:
  `.txt`, `.md`, or `.json`?
- Should the uploaded proof artifact be left as private evidence with a unique
  prefix, or deleted if a safe deletion route exists and deletion would not
  obscure the import readback?
- Can upload, registration, import status, Archive Library/readback, and
  no-public-visibility checks be recorded without printing secrets, cookies,
  raw ids, signed URLs, upload tokens, private bodies, SQL, or stack traces?
- Are there any quota, auth/session, deployment, bucket, parser, or job
  execution gaps that make the proof unsafe or not worth running yet?

## Candidate Proof Shape If Safe

If ARGUS accepts the rehearsal, wake DAEDALUS with a proof packet that includes:

- Freshness gates:
  - hosted web at or after `503a1217`;
  - hosted API at or after the commit containing current
    `/persona-files/.../upload-url` and `/register` behavior;
  - `/health/deployment` reports ready services and private `persona-files`
    storage readiness.
- Artifact isolation:
  - use the prepared replay owner and replay persona only;
  - create one tiny local file with a unique prefix such as
    `[file-import-proof:pr415-YYYYMMDD-HHMM]`;
  - use public-safe synthetic text only;
  - no archive, memory, continuity, customer, imported source, provider, billing,
    private persona, or accepted replay evidence as source material.
- Recommended first file family:
  - prefer `.txt` or `.md` for the first hosted UI proof because it proves
    upload/register/import plumbing with the smallest parser risk;
  - defer ChatGPT/Claude/Reddit/Discord JSON parser breadth unless ARGUS has a
    specific reason to include one JSON fixture here.
- Allowed hosted mutations:
  - select exactly one local proof file in the owner Archive upload UI;
  - upload it through the existing signed upload path;
  - register it once with `sourceType: "import"` and
    `processImmediately: true`;
  - poll only boundedly for import status/readback.
- Required readbacks:
  - upload/register returns success or a sanitized handled failure for the
    disposable artifact only;
  - Archive Import Library shows the new owner-only source or import job with
    sanitized labels;
  - import status/readback reaches completed/processable state, or a clear
    bounded async state that does not imply data loss;
  - storage/quota readback remains owner-only and sane;
  - public/community routes do not expose the proof artifact;
  - no visible raw storage path, signed URL, upload URL, upload token,
    authorization value, private body, internal id, SQL, stack trace, or
    secret-shaped text appears.
- Evidence and redaction rules:
  - commit only sanitized evidence;
  - record route class, status, deployment commit prefix, artifact prefix, file
    extension, counts, and pass/fail assertions;
  - do not commit cookies, bearer tokens, auth headers, Supabase keys, API keys,
    signed URLs, upload tokens, raw response bodies, stack traces, SQL errors,
    private source bodies, prompts, memory/archive content, owner/user ids, raw
    file ids, raw job ids, raw storage paths, or raw deployment ids.

## Stop Conditions

Stop before mutation and wake ARGUS if:

- hosted web or API is stale or not ready;
- owner auth/session is missing, ambiguous, or would require exposing a secret;
- `persona-files` storage readiness is missing, public, or unclear;
- quota/storage readback is failing in a way that might hide a destructive
  result;
- DAEDALUS cannot isolate the proof to one synthetic disposable owner file;
- the UI requires broader parser, queue, worker, provider, Redis, Cloudflare,
  billing, auth/session, or deployment changes;
- any response or screen exposes a visible secret, raw token, signed URL, upload
  URL, storage path, private source body, raw id, SQL error, stack trace, or
  non-synthetic private data.

Stop after mutation and wake ARGUS if:

- upload, register, import, or readback fails outside the expected sanitized
  error path;
- duplicate registration or ambiguous artifact matching makes the result
  unreadable;
- the artifact becomes public or community-visible;
- more than one file, job, import, source, or cleanup mutation would be needed;
- cleanup/deletion behavior is needed but not explicitly approved by ARGUS.

## Non-Goals

PR415 does not authorize:

- running the hosted mutation before ARGUS accepts the preflight;
- broad parser matrix testing;
- live ChatGPT, Claude, Reddit, Discord, or provider OAuth/API pulls;
- recurring imports;
- background worker/queue activation;
- Redis/Upstash queue behavior;
- Cloudflare retrieval/indexing;
- new embedding/provider/model behavior;
- schema or migration work;
- billing, Stripe, auth/session, deployment, or Supabase config changes;
- public/community import visibility;
- broad Archive redesign or global upload system.

## Handoff

If safe, wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR415 owner Archive file import hosted proof preflight.
Task:
- Run only the approved single disposable hosted upload/register/import proof
  with the exact guardrails and stop conditions.
- Wake ARGUS with sanitized evidence and no secrets/raw ids/private source
  bodies.
```

If unsafe or under-specified, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocked PR415 owner Archive file import hosted proof preflight.
Blocker:
- <exact reason>
Task:
- Decide whether to defer hosted upload proof, narrow the proof, or open a
  different lane.
```

Do not go idle without a wakeup commit.

## ARGUS Preflight Verdict

Verdict: `SAFE TO HAND TO DAEDALUS WITH HARD GUARDS`.

PR415 itself still authorizes no hosted mutation. ARGUS accepts handing a
single disposable hosted upload/register/import proof to DAEDALUS because the
public deployment freshness and storage readiness checks passed, and the proof
can be isolated to one tiny owner-only synthetic text file.

Observed public deployment freshness on 2026-06-27:

- Web `/health/deployment`: ready at `503a1217ce82`, satisfying the PR413
  baseline `503a1217`.
- API `/health/deployment`: ready at `503a1217ce82`, satisfying the current
  signed upload/register/import API baseline.
- API storage readiness: `persona-files` bucket `ok: true`, `checked: true`,
  `exists: true`, and `private: true`.

No secret values, cookies, bearer tokens, upload tokens, signed URLs, raw
storage paths, raw IDs, private source bodies, prompts, memory/archive content,
or user data were requested or recorded for this preflight.

## Approved DAEDALUS Packet

DAEDALUS may run exactly one hosted owner Archive file import proof only if all
gates below pass again immediately before mutation.

Freshness gates:

- Recheck web `/health/deployment`; require `ready: true` and commit at or
  after `503a1217`.
- Recheck API `/health/deployment`; require `ready: true` and commit at or
  after `503a1217`.
- Recheck API `readiness.storage`; require bucket `persona-files`, `ok: true`,
  `checked: true`, `exists: true`, and `private: true`.
- Record only service name, readiness, commit prefix, bucket name, and storage
  readiness booleans. Do not record deployment IDs, config details, signed URLs,
  upload tokens, raw storage paths, or raw IDs.

Artifact isolation:

- Use the prepared replay owner and one existing replay persona only.
- Create exactly one tiny local `.txt` file.
- Use a file name prefix:
  `[file-import-proof:pr415-YYYYMMDD-HHMM]`.
- Use public-safe synthetic text only, for example:
  `Disposable owner-only archive import proof. Contains no private source material.`
- Do not use archive, memory, continuity, customer, imported source, provider,
  billing, private persona, or accepted replay evidence as source material.
- Do not use `.json` for this first proof. Parser-family breadth remains out of
  scope; `.txt` is enough to prove upload/register/import plumbing.

Allowed hosted mutations:

- Select exactly one local proof `.txt` file in the owner Archive upload UI.
- Request the existing signed upload URL for that file.
- Upload the file through the existing signed upload path.
- Register that exact upload once with `sourceType: "import"` and
  `processImmediately: true`.
- Poll boundedly for import status/readback for that disposable artifact only.

Disallowed hosted mutations:

- Do not delete the uploaded file or import record in this proof. Leave the tiny
  private synthetic artifact as owner-only evidence unless MIMIR opens a
  separate cleanup/deletion lane.
- Do not publish Continuity, create documents, create public/community content,
  export data, send Assistant messages, post/reply/report/vote in forums, touch
  Stripe/billing/settings, or run any second upload/register/import.

Required readbacks:

- Pre-mutation: selected replay owner and persona are unambiguous without
  exposing owner/user/persona IDs.
- Upload URL request succeeds for the disposable file, but no signed URL, upload
  token, raw storage path, raw response body, or raw ID is recorded.
- Browser upload succeeds for the disposable file, with no signed upload
  material rendered in the page.
- Register returns success for the disposable artifact with `sourceType:
  "import"` and `processImmediately: true` intent preserved. Record only status
  class/counts/pass-fail assertions.
- Archive Import Library or import job readback shows exactly one new owner-only
  proof source/job with sanitized label from the artifact prefix.
- Import reaches `completed` within a bounded poll. If it remains queued or
  processing after the bounded poll, stop and wake ARGUS with that blocker
  rather than claiming import completion.
- Owner storage/quota readback remains owner-only and sane after the proof.
- Signed-out or public/community search/readback for the artifact prefix does
  not expose the proof artifact. Record only route class, HTTP status, and
  no-match/pass assertion.
- No screen, response summary, committed doc, or log shows a raw storage path,
  signed URL, upload URL, upload token, authorization value, cookie, bearer
  token, private body, internal ID, SQL error, stack trace, or secret-shaped
  text.

Evidence and redaction rules:

- Commit only sanitized evidence.
- Safe to record route class, HTTP status, deployment commit prefix, storage
  readiness booleans, artifact prefix, `.txt` extension, owner-only result
  class, import status, counts, and pass/fail assertions.
- Do not commit cookies, bearer tokens, auth headers, Supabase keys, API keys,
  signed URLs, upload URLs, upload tokens, raw response bodies, stack traces,
  SQL errors, private source bodies, prompts, memory/archive content,
  owner/user/persona IDs, raw file IDs, raw job IDs, raw storage paths, package
  IDs, or raw deployment IDs.

Stop conditions:

- Web or API deployment is stale or not ready.
- `persona-files` storage readiness is missing, not checked, not found, public,
  or not `ok: true`.
- Owner auth/session is missing, ambiguous, or would require exposing a secret.
- The replay owner/persona cannot be selected without ambiguity.
- Quota/storage readback is failing in a way that might hide a destructive
  result.
- The artifact cannot be kept to one tiny synthetic `.txt` file.
- The UI requires broader parser, queue, worker, provider, Redis, Cloudflare,
  billing, auth/session, deployment, schema, or migration changes.
- Upload/register/import requires more than one file/job/import/source or a
  second mutation to interpret the result.
- Import does not reach `completed` within the bounded poll.
- Duplicate registration or ambiguous artifact matching makes the result
  unreadable.
- The artifact becomes public or community-visible.
- Cleanup/deletion is needed to make the proof acceptable.
- Any response or screen exposes a visible secret, raw token, signed URL, upload
  URL, raw storage path, private source body, raw ID, SQL error, stack trace, or
  non-synthetic private data.

## ARGUS Handoff

Wake DAEDALUS with this exact packet. DAEDALUS should either complete the
single hosted owner Archive `.txt` file import proof and wake ARGUS with
sanitized evidence, or stop at the first failed gate/stop condition and wake
ARGUS with the blocker. MIMIR should only be woken instead if DAEDALUS discovers
the proof requires broader product, schema, auth/session, deployment, storage,
queue/worker, parser, or data-retention decisions.
