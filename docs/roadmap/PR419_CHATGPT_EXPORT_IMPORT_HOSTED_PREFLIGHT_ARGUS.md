# PR419 - ChatGPT Export Import Hosted Preflight

Owner: ARGUS
Opened by: MIMIR
Status: SAFE TO HAND TO DAEDALUS WITH HARD GUARDS

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

## ARGUS Preflight Verdict

Verdict:

```text
SAFE TO HAND TO DAEDALUS WITH HARD GUARDS
```

ARGUS accepts one hosted synthetic ChatGPT JSON import proof after PR418's
plain-text hosted proof.

Selected public readiness checked by ARGUS on 2026-06-27:

| Check | Result |
| --- | --- |
| Web health | Ready, service `@station/web`, commit prefix `299f987de9bf` |
| API health | Ready, service `@station/api`, commit prefix `299f987de9bf` |
| Storage readiness | Bucket `persona-files`, `ok: true`, `checked: true`, `exists: true`, `private: true` |

Local validation also passed:

- `npm exec --yes pnpm@10.32.1 -- run test:storage` passed (18 tests),
  including the ChatGPT JSON import/candidate path and unknown JSON fail-closed
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
- DAEDALUS must select one existing persona from the replay owner's own persona
  list without recording raw owner/user/persona IDs.

Artifact:

- Create exactly one local synthetic file named:
  `chatgpt-import-proof-pr419-20260627-1111.json`.
- File content must be exactly this public-safe JSON:

```json
{
  "title": "PR419 synthetic ChatGPT archive import proof",
  "mapping": {
    "first": {
      "message": {
        "author": { "role": "user" },
        "content": {
          "parts": [
            "PR419 synthetic ChatGPT archive import proof user turn. This is public-safe synthetic data."
          ]
        },
        "create_time": 1
      }
    },
    "second": {
      "message": {
        "author": { "role": "assistant" },
        "content": {
          "parts": [
            "PR419 synthetic ChatGPT archive import proof assistant turn. Always keep imported provider exports private until owner review."
          ]
        },
        "create_time": 2
      }
    }
  }
}
```

- Do not use real ChatGPT exports, private conversations, customer data,
  accepted replay evidence, provider API output, memory/canon/continuity
  records, billing/settings data, or public/community content as source.

Allowed hosted mutation sequence:

1. In the owner Archive upload UI, select only the approved local `.json` file.
2. Request exactly one signed upload URL.
3. Upload the file exactly once through the returned signed upload path.
4. Register exactly once using the fresh `storagePath` returned by the matching
   signed upload URL request, with `sourceType: "import"` and
   `processImmediately: true`.
5. Poll boundedly for import status/readback for at most 120 seconds.

Required sanitized readbacks:

- Signed upload URL request succeeds, without recording signed URL, upload URL,
  upload token, raw storage path, or raw response body.
- Browser upload succeeds.
- Register succeeds for the matching returned `storagePath`.
- Import reaches `completed` within the bounded poll. Queued/processing after
  the bound is a blocker, not a pass.
- Owner import/file readback shows exactly one new proof file/job with
  `sourceType: import`.
- Owner private archive/search readback can find the proof phrase through
  owner-authenticated routes only; record route/status/count classes, not raw
  private body excerpts.
- Owner Import Review/candidate readback shows pending owner-review candidate
  output from the proof source, including Memory and Canon candidate types if
  current parser behavior produces both.
- Public/community search/readback does not expose the proof artifact or proof
  phrase.
- No candidate is accepted, rejected, promoted, trusted, published, or attached
  to Continuity.

Stop conditions:

- Stop before mutation if any freshness, storage, auth/session, owner persona,
  or artifact-isolation gate fails.
- Stop after the first failed mutation/readback gate.
- Stop if the JSON is unsupported/malformed, the import remains
  queued/processing after the bound, or candidate/archive readback is ambiguous.
- Do not retry, request a second signed upload URL, upload a second file,
  register a second time, use manual storagePath input, clean up, delete, accept
  candidates, reject candidates, promote candidates, publish Continuity, create
  documents, touch public/community content, export data, send Assistant
  messages, post/reply/report/vote, touch billing/settings, change parser code,
  or broaden provider/runtime scope.
- Do not continue if evidence would expose secrets, cookies, bearer tokens, auth
  headers, Supabase keys, signed URLs, upload URLs, upload tokens, raw response
  bodies, stack traces, SQL errors, private source bodies, prompts,
  memory/archive content, owner/user/persona IDs, file IDs, job IDs, raw storage
  paths, package IDs, or deployment IDs.

ARGUS validation:

- Reviewed PR418 hosted proof, current PR419 packet, and local ChatGPT parser
  coverage.
- `npm exec --yes pnpm@10.32.1 -- run test:storage` passed (18 tests).
- Public web health selected readback passed: service `@station/web`, ready
  `true`, commit prefix `299f987de9bf`.
- Public API health selected readback passed: service `@station/api`, ready
  `true`, commit prefix `299f987de9bf`.
- API storage readiness selected readback passed: bucket `persona-files`,
  `ok: true`, `checked: true`, `exists: true`, `private: true`.
- `git diff HEAD^ HEAD --check` passed.
- `git diff --check` passed with CRLF normalization warning only.

Handoff:

- DAEDALUS has PR419.
- DAEDALUS should run only the approved one-file synthetic ChatGPT JSON hosted
  proof packet and wake ARGUS with sanitized pass/block evidence.
- MIMIR is not being asked for a broader decision unless DAEDALUS hits a blocked
  gate under this packet.
