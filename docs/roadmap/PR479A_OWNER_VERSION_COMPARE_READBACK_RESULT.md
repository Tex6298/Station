# PR479A Owner Version Compare Readback Result

Date: 2026-06-29

Owner: DAEDALUS / A2

State: READY_FOR_ARGUS_REVIEW

Source: `docs/roadmap/PR479_NATIVE_AUTHORING_VERSIONING_PREFLIGHT_RESULT.md`

## Result

DAEDALUS implemented the accepted PR479A slice: owner-only, metadata-only
version compare/readback on the existing Studio publish version-history surface.

Implementation:

- Added `documentVersionCompareReadback` in `apps/web/lib/publishing.ts`.
- Wired the helper into `/studio/publish?documentId=...` Version History using
  the existing owner-only version fetch already available to the Studio publish
  flow.
- Compared current editable document metadata against the selected or newest
  prior `PublishingDocumentVersion`.
- Rendered changed/unchanged rows for title, slug, type, status, visibility,
  comments, Space link, persona link, publication state, provenance, and
  snapshot time.
- Added focused helper/source tests proving metadata-only output, secret-shaped
  source-label redaction, no prior body exposure, no private raw IDs, no restore
  or revert action, and no version mutation route wiring.

## Boundaries

This patch does not change API routes, schemas, auth/session behavior,
persistence, public document reads, approval mutation behavior, or publish/
retract/delete semantics.

The compare readback does not expose prior-version bodies, private source rows,
raw document IDs, raw discussion/thread IDs, owner IDs, source IDs, approval
internals, SQL/table details, stack traces, provider payloads, secrets, public
prior-version links, restore/revert controls, rich editor behavior, template
systems, scheduling, social dispatch, Station Press behavior, Redis,
Cloudflare, workers, queues, billing, Stripe, deployment, or AI/provider calls.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/publishing-ui.test.ts` | Pass | 15 tests passed, including metadata-only compare and mutation-scope source assertions. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 171 tests passed, including the new publishing helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 41 tests passed; existing document version/public-read boundaries remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 4 tests passed; linked discussion visibility remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` | Pass | 20 tests passed, including approval redaction plus publishing helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed successfully from turbo cache. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| Diff-only sensitive/scope scan | Pass | Matches are expected guardrail/test/doc strings or sanitized metadata helpers; no prior body, raw private identifier, secret, public prior-version, restore/revert, mutation, API/schema/auth, provider, billing, worker, queue, Redis, Cloudflare, or deployment behavior was added. |

## ARGUS Review Request

ARGUS should review that the compare remains owner-only, metadata-only, and
readback-only on the existing Studio version history surface.

If accepted, wake MIMIR with `WAKEUP A1:` for PR479A closeout and the next lane.
If fixes are needed, wake DAEDALUS with `WAKEUP A2:` and the exact row, helper,
UI copy, or test expectation that failed.
