# PR503 - Station Press / Portable Publication Preflight Result

Owner: ARGUS / A3

Date: 2026-07-07

Status: Accepted

## Decision

ARGUS accepts the next safe implementation lane as:

```text
ACCEPT_PR503A_PUBLICATION_MANIFEST_CONTRACT
```

PR503A may define an owner-only Station Press publication manifest contract for
existing Station publications. This is a metadata/readback contract only. It is
not acceptance for PDF generation, binary archive generation, print packaging,
print-on-demand, provider calls, public package URLs, billing, queues, workers,
Redis, Cloudflare, storage architecture, commercial packaging, or launch claims.

## Preflight Answers

A safe first slice exists now, but only as a publication manifest contract. The
repo already has enough accepted public/private boundary evidence to describe a
portable publication's safe metadata, public readback state, linked discussion
state, and excluded material. The repo does not yet have the accepted provider,
queue, storage, cost, PDF, binary, print, fulfillment, or commercial decisions
needed for actual Station Press package generation.

ARGUS does not choose `ACCEPT_PR503A_STATION_PRESS_READINESS_GATE` because a
readiness gate alone would mostly restate existing blockers. ARGUS does not
choose `ACCEPT_PR503A_PORTABLE_PUBLICATION_PACKAGE_SCOPE` because PR483/PR496
already covered workspace export package scope/readback; PR503 needs a
publication-specific contract, not another broad export-scope map.

## Reusable Existing Artifacts

PR503A may reuse these accepted artifacts without widening scope:

- owner publishing dashboard document readback from `/documents`;
- publishing approval state and event boundaries from `/publishing/approvals`;
- public document route eligibility for published Space-backed documents;
- linked discussion availability and visibility metadata;
- public seminar record status and schedule metadata when a published document
  already has a durable seminar record;
- existing export trust copy for what current JSON/Markdown manifest bundles do
  and do not provide;
- existing owner-safe publishing helpers for source/provenance labels, version
  summaries, retract copy, and public/private discussion boundaries.

The contract must treat existing public document pages, public seminar cards,
and owner export manifests as source evidence. It must not create a new package,
new public route, new export package class, new storage object, or new public
download surface.

## Accepted PR503A Boundary

DAEDALUS may implement PR503A as a web-helper and owner UI readback slice. The
allowed files are:

- `apps/web/lib/publishing.ts` or a new close local helper such as
  `apps/web/lib/station-press.ts`;
- `apps/web/lib/publishing-ui.test.ts`, `apps/web/lib/export-trust.test.ts`,
  or a new close local helper test;
- `apps/web/components/studio/publishing-dashboard.tsx` only to render an
  owner-only readback from data the dashboard already fetches;
- roadmap and validation docs.

No `apps/api`, package, lockfile, database type, Supabase migration, schema,
storage, export route, export package kind, worker, queue, Redis, Cloudflare,
billing, Stripe, provider/model, social, archive connector, hosted runtime, or
public route change is accepted for PR503A. If DAEDALUS cannot build the
contract without one of those changes, hand the lane back to MIMIR instead of
widening it.

## Manifest Contract Shape

The helper may define a non-persisted contract such as:

```text
station.press.publication_manifest_contract.v1
```

Allowed contract facts:

- title, document type label, status label, visibility label, published time,
  and current-version label;
- safe public destination label for the Space-backed public document;
- safe provenance/source label already used by owner publishing readback;
- linked discussion status as attached, eligible, unavailable, or disabled;
- seminar/publication record status and stored schedule metadata only when that
  record already exists in the current dashboard data;
- package/readback posture that says current output is metadata-only readback,
  not a generated package;
- explicit excluded material and future decisions.

Forbidden contract facts:

- document body text, private source body text, archive chunks, transcripts,
  prompts, model output, provider payloads, raw event payloads, raw approval
  events, prior-version bodies, public prior-version history, private seminar
  notes, owner evidence rows, private evidence rows, raw package contents, raw
  export manifests, original files, storage paths, signed URLs, SQL/table
  details, stack traces, hosted logs, cookies, tokens, API keys, webhook
  secrets, bearer/JWT-shaped values, secret-shaped values, or env values;
- raw owner, persona, source, file, import, export, package, document, thread,
  approval, or seminar record ids in visible display text or serialized manifest
  readback.

Existing link targets may still use existing application routes, but visible
copy and any JSON/Markdown-like owner readback must not print raw ids.

## Required PR503A Tests

DAEDALUS should prove at minimum:

- the contract helper names the schema and returns publication metadata only;
- private/draft documents are classified as not package-ready without leaking
  body text or raw ids;
- published Space-backed documents produce public-readback metadata without
  printing the raw document id;
- linked discussion state is represented as status/label only, not raw thread
  body, thread id, approval internals, or moderation internals;
- public seminar schedule metadata is represented only when already present and
  does not claim live events, tickets, RSVP, reminders, provider runtime,
  billing, or fulfillment;
- excluded/future material explicitly includes PDFs, binary archives, original
  files, print/fulfillment, queues/workers, public package URLs, storage
  objects, private bodies, social dispatch, billing, and commercial packaging;
- `/studio/publishing` renders the readback without adding mutation buttons,
  package creation, export creation, background-job controls, provider controls,
  billing controls, public download links, share links, or broad dashboard
  redesign;
- raw ids, source bodies, prompts, provider payloads, storage paths, signed
  URLs, SQL details, stack traces, tokens, cookies, and secret-shaped values do
  not appear in visible copy or serialized readback.

Minimum validation:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/publishing-ui.test.ts apps/web/lib/export-trust.test.ts apps/web/lib/seminar-host-readiness.test.ts
npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

DAEDALUS must also run a changed-path scan proving no API, migration, schema,
package, lockfile, provider, worker, queue, Redis, Cloudflare, billing, Stripe,
social, archive connector, storage, or public-route files changed.

## ARIADNE Requirement

If PR503A changes visible `/studio/publishing` UI, MIMIR should route ARIADNE
for hosted desktop and 390px mobile proof before closing the implementation.

Suggested proof:

- signed-in owner `/studio/publishing` shows publication manifest contract
  readback for draft/private, published public, linked-discussion, and seminar
  record states available in hosted fixtures;
- the proof does not click mutation controls and does not trigger POST, PUT,
  PATCH, DELETE, export creation, package creation, provider calls, social
  dispatch, job starts, or billing flows;
- visible copy contains no raw ids, private bodies, source rows, transcripts,
  prompts, provider payloads, storage paths, signed URLs, SQL details, stack
  traces, hosted logs, cookies, tokens, or secret-shaped values;
- the page does not claim PDF, print, binary archive, package download,
  fulfillment, ticketing, RSVP, reminders, queue-backed jobs, public package
  URLs, hosted Station Press availability, or commercial packaging;
- desktop and 390px mobile have no horizontal overflow, clipped controls, or
  overlapping labels.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Repo evidence inspection | Pass | PR503 handoff, publishing approval route/service, export route/service, export trust helpers, publishing helpers/dashboard, PR483, PR496, PR488, PR484J-N, and Station launch docs were inspected. |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 10 export API tests passed, including workspace manifest create/read/bundle, malformed readback guards, cross-owner denial, and private/source/storage omission. |
| `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` | Pass | 20 API/UI tests passed, including owner scope, private body redaction, state transitions, public link gating, metadata-only version compare, and trust copy. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 4 tests passed, covering stable public errors, linked-thread recovery, tombstone cleanup, and public/community/unlisted/private boundaries. |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity-publication` | Pass | 1 test passed, proving continuity artifacts publish as separate provenance-labelled documents. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 190 Studio UI/helper tests passed, including export-trust and publishing boundary tests. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo typecheck passed from cache. |
| `git diff --check` | Pass | No whitespace errors; tracked roadmap/testing docs reported expected CRLF normalization notices only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR503A as a Station Press publication manifest contract.
- Scope is owner-only metadata/readback from existing publishing, discussion,
  seminar, and export-trust truth.
- It must not create PDFs, binary archives, print/fulfillment, public package
  URLs, package rows, storage objects, queues/workers, providers, billing,
  social dispatch, public launch claims, or private body exposure.
Task:
- Close PR503 preflight and decide whether to wake DAEDALUS for PR503A.
```
