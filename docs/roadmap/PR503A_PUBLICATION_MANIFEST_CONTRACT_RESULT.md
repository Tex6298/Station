# PR503A - Publication Manifest Contract Result

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Date: 2026-07-07

Status: Ready for ARGUS review

Result:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS implemented the first Station Press / portable publication slice as
an owner-only, non-persisted publication manifest contract:

```text
station.press.publication_manifest_contract.v1
```

The contract uses existing `/studio/publishing` document, Space, linked
discussion, seminar-record, and export-trust truth. It creates no package,
export row, storage object, public URL, API route, queue job, provider call,
billing path, social dispatch, or public Station Press launch claim.

## Implementation

- `apps/web/lib/publishing.ts` now defines the contract helper,
  display rows, schema constant, and explicit excluded/future material list.
- Private/draft documents are classified as `not_package_ready` and do not
  carry owner source-label text in the manifest readback.
- Published Space-backed documents can show metadata-only public-readback
  posture without serializing raw document, thread, Space, seminar, package, or
  owner ids.
- Linked discussion state is represented as `attached`, `eligible`,
  `unavailable`, or `disabled` with status/label copy only.
- Seminar record status and stored schedule metadata are represented only when
  a record is already present in the current dashboard data.
- `/studio/publishing` renders a compact owner-only `Station Press manifest
  contract` details readback per document from already-fetched dashboard data.

## Boundaries Held

- No `apps/api`, package, lockfile, database type, Supabase migration, schema,
  storage, export route, export package kind, worker, queue, Redis, Cloudflare,
  billing, Stripe, provider/model, social, archive connector, hosted runtime,
  or public-route file changed.
- No document body text, private source body text, archive chunks,
  transcripts, prompts, model output, provider payloads, raw event payloads,
  raw approval events, prior-version bodies, public prior-version history,
  private seminar notes, raw package contents, raw export manifests, original
  files, storage paths, signed URLs, SQL details, stack traces, hosted logs,
  cookies, tokens, API keys, webhook secrets, bearer/JWT-shaped values, env
  values, or raw ids are serialized in the manifest contract.
- Excluded/future material explicitly includes PDFs, binary archives, original
  files, print/fulfillment, queues/workers, public package URLs, storage
  objects, private bodies, social dispatch, billing, and commercial packaging.
- The visible dashboard change is readback-only and adds no mutation buttons,
  package creation, export creation, background-job controls, provider
  controls, billing controls, public download links, share links, or broad
  redesign.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/publishing-ui.test.ts apps/web/lib/export-trust.test.ts apps/web/lib/seminar-host-readiness.test.ts` | Pass | 34 helper/UI tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` | Pass | 24 API/UI tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 4 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 194 Studio UI/helper tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo typecheck passed. |
| `git diff --check` | Pass | No whitespace errors before docs staging. |
| Changed-path scan | Pass | Only accepted web helper/dashboard/test files changed before docs; no API/schema/package/storage/provider/billing/social/public-route drift. |

## Review Notes

Because `/studio/publishing` visible UI changed, the PR503A source instruction
says ARIADNE hosted desktop and 390px mobile proof is required after ARGUS
acceptance and before MIMIR closeout.

## Handoff

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR503A as an owner-only Station Press publication manifest contract.
- The contract is metadata/readback only over existing publishing, discussion, seminar, and export-trust truth.
- /studio/publishing now renders a compact readback-only manifest details block from already-fetched owner data.
Risk:
- Visible UI changed, so ARIADNE hosted desktop and 390px mobile proof is required after acceptance.
- Review for raw id/source/body/provider/storage/package/billing/social/public-route drift.
Validation:
- Focused publishing/export/seminar helper tests passed: 34 tests.
- test:publishing-approvals passed: 24 tests.
- test:document-discussions passed: 4 tests.
- test:studio-ui passed: 194 tests.
- typecheck and changed-path scan passed.
Task:
- Review PR503A and either accept by waking MIMIR or send fixes back to DAEDALUS.
Status: READY_FOR_ARGUS_REVIEW
```
