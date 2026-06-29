# PR479A Owner Version Compare Readback ARGUS Review Result

Owner: ARGUS / A3

Date: 2026-06-29

Verdict: `ARGUS_ACCEPTED_PR479A_OWNER_VERSION_COMPARE_READBACK`

## Decision

ARGUS accepts PR479A after applying one narrow owner-scope review patch.

DAEDALUS' implementation added the requested owner version compare/readback on
the existing Studio publish Version History surface. The helper output is
metadata-only, the UI does not add restore/revert controls or version mutation
routes, and the patch does not change API, schema, auth, public document reads,
approval transitions, publish/retract/delete behavior, provider calls, queues,
billing, Cloudflare, Redis, workers, or deployment behavior.

## Review Patch

ARGUS found one narrow overclaim before acceptance:

- The new compare data was safe, but the Studio Version History panel was gated
  by `documentId` alone.
- `/documents/:id` can return a public-readable document to a signed-in
  non-owner, while `/documents/:id/versions` correctly fails owner-only.
- That meant a non-owner could still see the Studio no-prior/current-version
  panel for a public document if they manually opened
  `/studio/publish?documentId=...`.

ARGUS patched the UI to track `hasOwnerVersionAccess`, set it only after the
owner-only `/documents/:id/versions` fetch succeeds, and render the Version
History / compare panel only when `documentId && hasOwnerVersionAccess`.

This keeps the visible compare/readback owner-only without changing the API or
exposing prior versions.

## Reviewed Surface

ARGUS reviewed DAEDALUS' implementation delta from `d97cc757` to `ff400ca5`,
then added the owner-access gate patch in:

- `apps/web/lib/publishing.ts`
- `apps/web/lib/publishing-ui.test.ts`
- `apps/web/components/studio/publish-flow.tsx`
- `docs/roadmap/PR479A_OWNER_VERSION_COMPARE_READBACK_RESULT.md`
- roadmap and validation baseline updates

ARGUS also reread the accepted preflight:

- `docs/roadmap/PR479_NATIVE_AUTHORING_VERSIONING_PREFLIGHT_RESULT.md`

## Findings

Accepted:

- `documentVersionCompareReadback(...)` compares metadata only: title, slug,
  document type, status, visibility, discussion setting, Space/persona presence,
  publication state, provenance label, and snapshot time.
- The helper does not consume or return prior body text, version row IDs, owner
  IDs, source IDs, discussion/thread IDs, raw internal IDs, or approval
  internals.
- Secret-shaped source labels and UUID-like values are redacted before display.
- The Studio publish panel now renders only after a successful owner-only
  versions fetch.
- The UI adds no restore/revert action and no version mutation route.
- Existing owner-only API and public current-document read boundaries remain
  unchanged.

No remaining safety gap found:

- no public prior-version exposure;
- no private draft body, prior body, private source row, raw document ID, raw
  discussion/thread ID, owner ID, source ID, approval internal, SQL/table
  detail, stack trace, provider payload, secret, token, auth header, cookie, or
  hosted log exposure;
- no API route, schema, auth/session, persistence, approval mutation,
  publish/retract/delete, rich editor, template, scheduling, social dispatch,
  Station Press, SEO/OpenGraph, PDF/print, provider/model, AI drafting, Redis,
  Cloudflare, worker/queue, billing, Stripe, or deployment behavior change.

## Validation

ARGUS reran the requested validation after the owner-access gate patch:

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/publishing-ui.test.ts` | Pass | 15 tests passed, including metadata-only compare, redaction, no mutation scope, and owner-access source assertions. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 171 tests passed, including the new publishing helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 41 tests passed; owner-only document version and public-read no-versions assertions remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 4 tests passed; linked discussion visibility remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` | Pass | 20 tests passed, including approval redaction plus publishing helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck replayed from cache; web typecheck ran fresh and passed. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| API/schema diff check | Pass | No changed files under API, packages/types, packages/db, db, migrations, Supabase, or schema paths. |
| Diff-only sensitive/scope scan | Pass | Matches are expected redaction test sentinels, guardrail strings, or helper boundary copy; no prior body, raw private identifier, secret, public prior-version, restore/revert, mutation, API/schema/auth, provider, billing, worker, queue, Redis, Cloudflare, or deployment behavior was added. |

## Handoff

Wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
```

Task: close PR479A as accepted and decide the next lane. ARGUS does not require
ARIADNE hosted proof for this owner-only metadata readback because the review
patch keeps the panel behind the existing owner-only versions fetch and no
mutation or public exposure changed. If MIMIR wants human-eye confidence anyway,
route a read-only owner Studio publish desktop/mobile check plus a signed-out or
non-owner public document check proving no prior-version panel appears.
