# PR 6 Background Job Trigger Audit Result

Date: 2026-06-15

Owner: A2 / DAEDALUS

Status: ready for A3 / ARGUS review

## Verdict

No background-worker implementation is justified by current main.

The audited archive/import/export/replay surfaces are measurable enough for the
protected alpha path, and no accepted evidence shows blocking latency, flaky
completion, user-visible timeout, or retry behavior that cannot be handled by the
current route/job model.

## Reviewed Surfaces

- `POST /persona-files/persona/:personaId/register`
  - Exact owner/persona/storagePath duplicate registration is idempotent.
  - Missing file import jobs are repaired without a second storage charge.
  - Ambiguous same-name file-job state is surfaced instead of guessed.
  - New registrations still optionally call `processUploadedFile(...).catch(...)`
    as fire-and-forget immediate processing. This remains a candidate for future
    worker work, but PR 2 coverage reduced the known retry/duplicate pain and no
    concrete failing replay flow is currently documented.
- `/imports/chat` and import job helpers
  - Chat import remains synchronous with explicit processing/completed/failed
    state.
  - Retry can reuse completed archive rows, report pending queued/processing
    jobs, and require the owner to resupply content for failed jobs rather than
    storing private chat text in job payloads.
  - Serialized job errors are sanitized and owner-scoped.
- `/exports/*`
  - Persona and Developer Space export packages are created synchronously as
    JSON/Markdown owner-only readback packages.
  - Failed source reads leave owner-visible failed package rows.
  - Bundle readback is blocked until completion and remains owner-scoped.
  - Current scope is not binary/PDF/full-workspace/background export.
- Replay readiness/staging docs
  - Current staging docs explicitly describe archive/import/export jobs as
    protected-alpha synchronous flows, not worker infrastructure.
  - Redis/Valkey/Upstash is bounded as optional operational cache and
    short-lived queue-state support, not an accepted queue provider.

## Decision

Close PR 6 as a no-trigger deferral if ARGUS accepts this audit.

Future worker work should open only when a specific flow produces fresh evidence
of one of:

- a user-visible timeout,
- flaky completion,
- blocking latency that breaks the alpha replay,
- unsafe fire-and-forget behavior with a demonstrated failed/retry case,
- or failed/retry behavior that cannot be made reliable inside the current
  owner-scoped route/job model.

## What Did Not Change

This audit did not change product code, route behavior, auth, billing, Stripe,
Redis, Cloudflare, provider routing, embeddings, archive retrieval semantics,
export scope, migrations, or UI.

No private archive text, prompts, completions, provider payloads, raw replay
bodies, credentials, tokens, cookies, owner IDs, private IDs, or screenshots were
recorded.
