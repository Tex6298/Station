# PR503A - Publication Manifest Contract

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-07

Status: Open implementation

## Source

ARGUS accepted PR503A:

`docs/roadmap/PR503_STATION_PRESS_PORTABLE_PUBLICATION_PREFLIGHT_RESULT.md`

Verdict:

```text
ACCEPT_PR503A_PUBLICATION_MANIFEST_CONTRACT
```

## Goal

Implement the first Station Press / portable publication slice as an
owner-only publication manifest contract for existing Station publications.

This is a metadata/readback contract only. It should make `/studio/publishing`
able to explain what a future Station Press package could safely include for a
publication, what evidence already exists, and what is explicitly excluded.

## Allowed Files

Keep the implementation inside this boundary:

- `apps/web/lib/publishing.ts`, or a new close helper such as
  `apps/web/lib/station-press.ts`;
- `apps/web/lib/publishing-ui.test.ts`, `apps/web/lib/export-trust.test.ts`,
  or a new close helper test;
- `apps/web/components/studio/publishing-dashboard.tsx`, only to render an
  owner-only readback from data the dashboard already fetches;
- roadmap and validation docs.

Do not touch:

- `apps/api`;
- package files or lockfiles;
- database types;
- Supabase migrations or schema;
- storage;
- export routes or export package kinds;
- worker/queue code;
- Redis or Cloudflare code;
- billing or Stripe code;
- provider/model code;
- social code;
- archive connector code;
- hosted runtime config;
- public routes.

If a useful contract cannot be built without one of those changes, stop and
wake MIMIR with the exact blocker.

## Contract Shape

Define a non-persisted owner readback contract such as:

```text
station.press.publication_manifest_contract.v1
```

Allowed contract facts:

- schema/name/version label;
- title;
- document type label;
- status label;
- visibility label;
- published time;
- current-version label;
- safe public destination label for a Space-backed public document;
- safe source/provenance label already used by owner publishing readback;
- linked discussion status as attached, eligible, unavailable, or disabled;
- seminar/publication record status and stored schedule metadata only when that
  record already exists in current dashboard data;
- package/readback posture that says current output is metadata-only readback,
  not a generated package;
- explicit excluded/future material.

Forbidden contract facts:

- document body text;
- private source body text;
- archive chunks;
- transcripts;
- prompts, model output, provider payloads, raw event payloads;
- raw approval events;
- prior-version bodies;
- public prior-version history;
- private seminar notes;
- owner evidence rows or private evidence rows;
- raw package contents or raw export manifests;
- original files;
- storage paths or signed URLs;
- SQL/table details, stack traces, hosted logs;
- cookies, tokens, API keys, webhook secrets, bearer/JWT-shaped values,
  secret-shaped values, or env values;
- raw owner, persona, source, file, import, export, package, document, thread,
  approval, or seminar record ids in visible display text or serialized
  manifest readback.

Existing link targets may still use existing application routes, but visible
copy and any JSON/Markdown-like owner readback must not print raw ids.

## Product Requirements

Implement the helper and visible owner readback so that:

- private/draft documents are classified honestly as not package-ready;
- published Space-backed documents can show public-readback metadata without
  printing raw document ids;
- linked discussion state is status/label-only;
- seminar schedule/status metadata appears only when already available from
  the current publishing dashboard data;
- excluded/future material explicitly includes PDFs, binary archives, original
  files, print/fulfillment, queues/workers, public package URLs, storage
  objects, private bodies, social dispatch, billing, and commercial packaging;
- `/studio/publishing` does not add mutation buttons, package creation, export
  creation, background-job controls, provider controls, billing controls,
  public download links, share links, or broad dashboard redesign.

## Required Tests

Add or preserve focused tests proving:

- the contract helper names the schema and returns publication metadata only;
- private/draft documents are not package-ready and do not leak body text or
  raw ids;
- published Space-backed documents produce public-readback metadata without raw
  document ids;
- linked discussion state omits raw thread body, thread id, approval internals,
  and moderation internals;
- seminar schedule metadata is only represented when already present and does
  not claim live events, tickets, RSVP, reminders, provider runtime, billing, or
  fulfillment;
- excluded/future material includes PDFs, binary archives, original files,
  print/fulfillment, queues/workers, public package URLs, storage objects,
  private bodies, social dispatch, billing, and commercial packaging;
- `/studio/publishing` renders the readback without forbidden controls or broad
  redesign;
- visible copy and serialized readback omit raw ids, source bodies, prompts,
  provider payloads, storage paths, signed URLs, SQL details, stack traces,
  tokens, cookies, and secret-shaped values.

## Required Validation

Run:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/publishing-ui.test.ts apps/web/lib/export-trust.test.ts apps/web/lib/seminar-host-readiness.test.ts
npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run a changed-path scan proving no API, migration, schema, package,
lockfile, provider, worker, queue, Redis, Cloudflare, billing, Stripe, social,
archive connector, storage, or public-route files changed.

## Review

Wake ARGUS after implementation.

ARIADNE hosted desktop and 390px mobile proof is required if visible
`/studio/publishing` UI changes.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR503A as a Station Press publication manifest contract.
- Scope is owner-only metadata/readback from existing publishing, discussion,
  seminar, and export-trust truth.
Task:
- Implement PR503A inside the accepted web/helper/dashboard boundary.
- Do not create packages, public URLs, API routes, schema, storage, queues,
  workers, provider calls, billing, social dispatch, or public launch claims.
- Wake ARGUS with implementation result and validation.
```
