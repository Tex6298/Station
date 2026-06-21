# PR133 2C Agents Observe Offline Adapter Dry Run

Status: Opened by MIMIR on 2026-06-21 for DAEDALUS.

## Why This Lane

PR132 proved the core privacy shape: a tiny Agents Observe-style event can be
transformed into `DeveloperSpaceBatchImportPayload` and wrapped for PR128 signed
observed-runtime webhook request construction without leaking raw prompt,
command, path, tool, terminal, token, session, event, or agent source ids.

The next step should make that proof usable by a developer/operator without
requiring live Station credentials. We need a repeatable offline dry run that
can read a fixture, transform it, validate the redaction contract, and show what
would be sent before any live adapter, Cloudflare boundary, or key-bearing smoke
run is opened.

## Scope

- Add a small offline dry-run entry point in the developer-space client package
  or examples area.
- It should accept a local Agents Observe-style fixture path or use the PR132
  fixture by default.
- It should transform the fixture through the PR132 helper into
  `DeveloperSpaceBatchImportPayload`.
- It should optionally build the PR128 observed-runtime webhook request envelope
  using a clearly marked fake/demo signing secret only.
- It should print or return a safe dry-run summary:
  - event/node/snapshot/supporting-context counts;
  - public/private/secret classification counts;
  - coarse labels and provenance names;
  - whether the no-raw-source-id/no-secret assertions passed;
  - a clear `not sent` status.
- Add focused tests proving the dry run does not require
  `STATION_DEVELOPER_KEY`, `STATION_API_URL`, a live webhook id, Railway,
  Supabase, Cloudflare, or network access.
- Document how to run the dry run locally and what output is safe to paste into
  a review handoff.

## Privacy Contract

The dry-run output must not serialize or print:

- raw prompts;
- command bodies;
- file paths;
- token values;
- raw tool payloads;
- terminal/stdout/stderr-like output;
- fixture `sessionId`;
- fixture `eventId`;
- fixture `agent.id`;
- live API keys;
- live signing secrets;
- webhook ids unless they are synthetic demo ids.

Opaque/demo structural ids are acceptable only if they cannot be traced back to
raw source ids.

## Acceptance

- A developer can run the dry run locally with no secrets and get a safe,
  reviewable summary.
- The implementation reuses PR132 transform/request-construction helpers instead
  of duplicating mapping logic.
- Tests fail if raw fixture ids or secret-shaped values appear in serialized
  dry-run output.
- README/docs clearly distinguish:
  - offline dry run;
  - request construction proof;
  - live signed send, which remains PR130/config-gated.

## Validation

Run the narrow relevant gates:

```bash
pnpm test:developer-space-client
pnpm --filter @station/developer-space-client build
pnpm --filter @station/developer-space-client typecheck
git diff --check
```

If the package has no standalone typecheck script, use the closest repo-local
typecheck that covers touched files and report that choice.

## Non-Scope

- No live webhook send.
- No `STATION_DEVELOPER_KEY` requirement.
- No Developer Space key generation or rotation.
- No Railway/Supabase/Cloudflare config request.
- No Cloudflare Worker, Vectorize, D1, Queue, or Durable Object work.
- No external repo code vendoring.
- No hosted runtime, task scheduler, agent control plane, or execution surface.
- No UI changes.
- No billing/Stripe, Redis memory truth, provider routing, or retrieval model
  changes.
- No committed secrets.

## Handoff

Wake ARGUS with:

- dry-run command/API shape;
- sample safe output shape;
- fixture/source evidence;
- proof that no live config or network access is required;
- privacy/no-raw-id/no-secret test evidence;
- validation results;
- explicit non-claims.

Wake MIMIR instead if PR132 helpers are too narrow to reuse cleanly without
widening scope.
