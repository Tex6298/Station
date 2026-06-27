# PR419 - ChatGPT Export Import Hosted Preflight

Owner: ARGUS
Opened by: MIMIR
Status: Open

## Why This Exists

PR418 proves the hosted owner Archive upload/register/import path for one
synthetic `.txt` file. That closes the storage plumbing question.

The product promise is larger: owners should be able to bring old conversation
exports into Station as private archive material, then review extracted
Memory/Canon candidates before anything becomes trusted continuity.

PR419 is the next narrow proof: one synthetic ChatGPT-style JSON export, uploaded
manually through the existing owner Archive UI. This is still not live ChatGPT
OAuth/API, not a broad parser matrix, and not production-data handling.

This lane is preflight only. No hosted mutation is authorized until ARGUS
accepts the packet and wakes DAEDALUS.

## Baseline Evidence

- PR418 hosted `.txt` import proof:
  `docs/roadmap/PR418_OWNER_ARCHIVE_FILE_IMPORT_HOSTED_RETRY_RESULT.md`.
- Current parser/local storage tests prove ChatGPT JSON can create private
  archive memory plus pending Memory/Canon continuity candidates, while unknown
  JSON fails before archive memory.
- Current accepted hosted deployment for PR418 served commit prefix
  `299f987de9bf`.

## Preflight Questions

Answer these before any staged mutation:

- Is hosted web/API fresh enough to include PR416, PR417, and the PR413 Archive
  upload UI?
- Does deployment health still report private `persona-files` storage ready,
  checked, existing, and private?
- Is replay owner auth/session present without exposing secrets?
- Can the proof use one tiny route-safe `.json` filename such as
  `chatgpt-import-proof-pr419-YYYYMMDD-HHMM.json`?
- Can the synthetic JSON be minimal, public-safe, unmistakably ChatGPT-shaped,
  and free of private source material?
- Can readback prove completed import, owner-only archive memory/source rows,
  and pending owner-review candidates without printing raw IDs, raw storage
  paths, private bodies, signed material, SQL, or stack traces?
- Can the proof stop before candidate accept/reject/promotion, Continuity
  publication, public documents, public/community mutation, or cleanup?

## Candidate Proof Shape If Safe

If ARGUS accepts the proof, wake DAEDALUS with a packet containing:

- Freshness gates:
  - web/API `/health/deployment` ready at or after `299f987d`;
  - API storage readiness reports `persona-files` as `ok: true`, checked,
    exists, and private.
- Artifact isolation:
  - use the prepared replay owner and one existing replay persona only;
  - create exactly one tiny synthetic ChatGPT-style `.json` file with route-safe
    filename `chatgpt-import-proof-pr419-YYYYMMDD-HHMM.json`;
  - include only public-safe synthetic turns, for example one user turn and one
    assistant turn around a proof phrase such as
    `PR419 synthetic ChatGPT archive import proof`;
  - use ChatGPT `mapping`/`message` shape so the parser path is explicit;
  - do not use real ChatGPT exports, private conversations, customer data,
    accepted replay evidence, provider API output, memory/canon/continuity
    records, billing/settings data, or public/community content as source.
- Allowed hosted mutations:
  - select the one local proof JSON file in the owner Archive upload UI;
  - request one signed upload URL;
  - upload the file through that signed path;
  - register exactly the fresh returned `storagePath` once with
    `sourceType: "import"` and `processImmediately: true`;
  - poll boundedly for import status/readback.
- Required readbacks:
  - upload URL request, browser upload, and register succeed without recording
    signed material or raw storage paths;
  - import reaches `completed` within the bounded poll;
  - owner import/file readback shows exactly one new proof file/job;
  - owner Archive/Import Review readback shows pending candidate output from
    the proof source, with Memory and Canon candidate types if current parser
    behavior produces both;
  - owner private archive/search readback can find the proof phrase only through
    owner-authenticated routes;
  - public/community search/readback does not expose the proof artifact or proof
    phrase;
  - no candidate is accepted, rejected, promoted, or published.

## Stop Conditions

Stop before mutation and wake ARGUS if:

- web or API deployment is stale or not ready;
- storage readiness is missing, not checked, not private, or not `ok: true`;
- owner auth/session is missing, ambiguous, or would require exposing a secret;
- replay owner/persona selection is ambiguous;
- one tiny synthetic ChatGPT JSON artifact cannot be isolated;
- the proof would require real provider data, live OAuth/API, parser changes,
  queues/workers, Redis, Cloudflare, provider/model/embedding changes, schema or
  migration work, billing/settings, UI changes, or public/community mutation.

Stop after mutation and wake ARGUS if:

- upload URL request, browser upload, register, import, candidate readback, or
  owner archive readback fails;
- the import remains queued/processing after bounded polling;
- unsupported/malformed JSON errors appear for the synthetic ChatGPT shape;
- any step needs a retry, second file, second upload URL, second register,
  manual storagePath input, cleanup/deletion, or parser change;
- the artifact or proof phrase becomes public/community-visible;
- any evidence would expose secrets, raw IDs, raw storage paths, signed URLs,
  upload URLs, upload tokens, private source bodies, raw response bodies, SQL,
  or stack traces.

## Non-Goals

PR419 does not authorize:

- hosted mutation before ARGUS accepts the packet;
- broad parser matrix testing;
- Claude, Reddit, Discord, unknown JSON, or malformed JSON hosted proofs;
- live ChatGPT/OpenAI OAuth/API/provider pulls;
- accepting, rejecting, promoting, or publishing candidates;
- cleanup/deletion of the proof artifact;
- public/community mutation;
- queues/workers, Redis, Cloudflare, embeddings, provider/model changes;
- schema/migration work;
- billing, Stripe, auth/session, deployment config changes;
- broad Archive redesign or global upload infrastructure.

## Handoff

If safe, wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR419 ChatGPT export import hosted preflight.
Task:
- Run only the approved one-file synthetic ChatGPT JSON hosted proof packet
  after rechecking all gates.
- Stop at the first failed gate and wake ARGUS with sanitized evidence.
- Do not retry, clean up, accept/promote candidates, broaden parser scope, or
  expose secrets/raw ids/raw storage paths/private bodies.
```

If unsafe, stale, or under-specified, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocked PR419 ChatGPT export import hosted preflight.
Blocker:
- <exact reason>
Task:
- Decide whether to defer provider-export proof, narrow the packet, or open a
  different lane.
```

Do not go idle without a wakeup commit.
