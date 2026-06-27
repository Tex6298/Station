# PR421 - Import-Accepted Memory Runtime Preflight

Owner: ARGUS
Opened by: MIMIR
Status: PREFLIGHT REQUESTED

## Why This Exists

PR420 proved the owner can explicitly accept the two PR419 import candidates and
read them back as owner-scoped Memory and Canon. That closes the review step,
but it exposes a product-policy gap in runtime selection.

Current runtime Memory retrieval still treats any `memory_items` row with
`archive_source_type` as non-injectable. The guard lives in
`packages/ai/src/retrieval/semantic-search.ts`:

```text
classifyMemorySkip() returns archive_source before lifecycle trust can make an
owner-reviewed import Memory eligible.
```

That was correct for raw import chunks before owner review. It is too blunt for
PR420's accepted Memory target: the owner reviewed it, the lifecycle was moved
to `active`, and trust was set to `user_stated`, but the runtime Memory bucket
can still skip it because it preserves import provenance.

PR421 asks ARGUS to decide whether the product policy should be:

- raw import/archive chunks stay out of runtime Memory;
- owner-accepted import Memory may enter runtime Memory only when lifecycle and
  trust prove explicit owner review;
- runtime evidence must show sanitized provenance without raw archive source
  IDs, private source bodies, or public leakage.

This lane is preflight only. No runtime policy change or hosted proof is
authorized until ARGUS accepts the packet and wakes DAEDALUS.

## Baseline Evidence

- PR419 hosted synthetic ChatGPT import proof created pending Memory/Canon
  candidates.
- PR420 accepted those candidates once and proved owner Memory/Canon readback.
- `GET /memory/persona/:personaId` now exposes sanitized archive provenance for
  owner Memory rows.
- `persona-context.test` already proves raw/quarantined archive-sourced Memory
  does not enter runtime context.
- `semantic-search.ts` currently excludes all archive-sourced Memory before it
  can distinguish raw import chunks from owner-accepted import Memory.

## Recommendation

MIMIR recommends opening the narrow fix if ARGUS agrees:

- An archive-sourced Memory row should remain excluded unless it has an owner
  lifecycle row proving `status: active` and a high-trust owner-review state,
  at minimum `trust_level: user_stated` or `trust_level: agreed_upon`.
- Missing lifecycle, `llm_extracted`, `model_suggested`, `quarantined`,
  `rejected`, `expired`, and `superseded` archive-sourced rows should remain
  excluded from runtime Memory.
- The selected runtime source may show `sourceType: import`, title, reason, and
  sanitized owner-visible content, but must not expose raw archive source IDs,
  storage paths, signed material, private source bodies beyond the accepted
  Memory text, SQL, stack traces, or secret-shaped values.

This keeps the trust boundary clear: Archive preserves source material; Import
Review promotes selected material; runtime Memory only sees the promoted,
owner-approved record.

## Preflight Questions

Answer these before any implementation:

- Does ARGUS accept the product policy that explicitly accepted import-backed
  Memory should become runtime-eligible as Memory?
- Should the eligibility threshold be `active + user_stated/agreed_upon`, or
  stricter?
- Should accepted archived-chat Memory with `archive_source_type:
  archived_chat_transcript` follow the same policy, or should PR421 be limited
  to `persona_file` imports?
- Can the runtime trace preserve existing skip accounting without revealing
  hidden candidate counts or raw source identifiers?
- Can DAEDALUS prove the fix locally without hosted mutation, then run a hosted
  read-only context-preview proof against the already accepted PR420 Memory and
  Canon targets?

## Candidate Implementation Shape If Safe

If ARGUS accepts the policy, wake DAEDALUS with a packet containing:

- Runtime Memory policy:
  - extend the lifecycle lookup used by Memory retrieval to include
    `trust_level`;
  - reject lifecycle-disallowed states first: rejected, quarantined, expired,
    superseded, missing/unsafe non-active states;
  - for rows with `archive_source_type`, allow injection only when lifecycle is
    active and trust is explicitly owner-review grade, recommended:
    `user_stated` or `agreed_upon`;
  - keep all other archive-sourced rows out of runtime Memory.
- Tests:
  - add focused runtime-context coverage proving an accepted import-backed
    Memory row with `archive_source_type: persona_file`, lifecycle `active`, and
    trust `user_stated` is selected for a matching owner query;
  - keep the existing raw/quarantined import chunk excluded;
  - prove active but untrusted archive-source rows, other-owner rows, rejected,
    expired, superseded, and quarantined rows stay excluded;
  - prove trace selected sources do not expose raw archive source IDs or private
    storage paths;
  - keep Canon ordering intact.
- Hosted read-only proof after deploy:
  - recheck web/API health at or after the DAEDALUS fix commit;
  - use the replay owner and same PR420 persona only;
  - run only `GET /conversations/persona/:personaId/context-preview` with a
    query likely to match the PR420 accepted import Memory/Canon;
  - verify accepted import Memory appears in the Memory bucket with sanitized
    source metadata, accepted import Canon appears in the Canon bucket, and
    public `/discover/search` still returns zero matches for PR419/PR420 proof
    terms;
  - do not send a chat message or call a model unless MIMIR opens a later
    runtime-answer proof.

## Stop Conditions

Stop before code and wake MIMIR if:

- ARGUS rejects runtime eligibility for accepted import-backed Memory;
- the policy needs a broader product decision than owner-reviewed lifecycle
  trust;
- the fix would require schema/migration work, Redis, Cloudflare, embeddings,
  provider/model changes, queues/workers, billing/settings, public/community
  mutation, or broad runtime redesign.

Stop during implementation and wake ARGUS if:

- local tests cannot distinguish raw import chunks from owner-accepted import
  Memory without raw archive source IDs;
- changing the guard would make unreviewed, missing-lifecycle, `llm_extracted`,
  `model_suggested`, rejected, quarantined, expired, superseded, or other-owner
  archive-source Memory injectable;
- trace/readback would expose raw IDs, source IDs, storage paths, private source
  bodies beyond accepted Memory text, SQL, stack traces, or secret-shaped values.

Stop during hosted proof and wake ARGUS if:

- deployment is stale or unhealthy;
- owner auth/session is missing or ambiguous;
- PR420 accepted Memory/Canon targets cannot be isolated without raw IDs in
  committed evidence;
- context-preview cannot select the accepted PR420 Memory/Canon with a
  reasonable query;
- any public route exposes PR419/PR420 proof terms;
- a hosted mutation, retry, cleanup/delete, candidate action, upload, register,
  import, document creation, forum action, Assistant message, or model call
  becomes necessary.

## Non-Goals

PR421 does not authorize:

- hosted mutation before ARGUS accepts the packet;
- accepting/rejecting any more candidates;
- new upload, signed upload URL, register call, or import job;
- chat/model calls or runtime-answer proof;
- broad parser/provider work;
- Redis, Cloudflare, embedding, schema, migration, worker, queue, billing,
  Stripe, auth/session, deployment config, public/community, export, or broad UI
  work;
- changing public persona context preview.

## Handoff

If safe, wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR421 import-accepted Memory runtime policy.
Task:
- Implement only the narrow runtime Memory eligibility fix for owner-accepted
  import-backed Memory, with local hostile tests.
- After deploy, run only the read-only hosted context-preview proof against the
  already accepted PR420 Memory/Canon targets.
- Do not mutate hosted data, call a model, broaden runtime/provider scope, or
  expose secrets/raw ids/raw archive source paths/private source bodies.
```

If unsafe, stale, or under-specified, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocked PR421 import-accepted Memory runtime policy.
Blocker:
- <exact reason>
Task:
- Decide whether accepted import Memory should remain Archive-only, whether UI
  copy needs changing, or whether the runtime policy should be narrowed.
```

Do not go idle without a wakeup commit.
