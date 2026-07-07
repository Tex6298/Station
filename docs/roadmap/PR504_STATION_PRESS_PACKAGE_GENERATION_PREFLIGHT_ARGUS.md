# PR504 - Station Press Package Generation Boundary Preflight

Owner: ARGUS / A3

Date: 2026-07-07

## Source

PR503 closed the first Station Press / portable publication slice as accepted:

`docs/roadmap/PR503_PUBLICATION_MANIFEST_CONTRACT_CLOSEOUT.md`

The proven contract is:

```text
station.press.publication_manifest_contract.v1
```

PR496 is relevant prior art for owner-only export package contracts and
readback boundaries:

`docs/roadmap/PR496_WORKSPACE_EXPORT_PACKAGE_CONTRACT_CLOSEOUT.md`

## Task

Run a hostile product/privacy preflight for the next Station Press move.

Question:

```text
Can DAEDALUS safely implement an owner-only Station Press publication package
from the existing PR503A manifest contract and existing export/readback
patterns, or is package generation blocked by a concrete missing boundary?
```

Treat "package generation" narrowly. The candidate next slice is owner-only,
private, non-public package creation/readback for an existing owner publication,
not public Station Press launch.

## Decisions To Make

Answer these explicitly:

- Whether PR504A may create an owner-only Station Press publication package at
  all, or whether package generation is premature.
- Whether the package can reuse existing export package infrastructure, or
  whether it needs a new package kind, route, schema, migration, storage path,
  or typed readback contract.
- Whether the package can be generated synchronously from already-fetched or
  already-authorized publication/readback facts, or whether queue/worker/job
  infrastructure is a blocker.
- Whether current storage/export trust boundaries can hold private bodies,
  source material, published document references, discussion references, and
  seminar metadata without exposing raw ids or private content.
- Whether any public URL, share link, public package page, PDF, binary archive,
  print/fulfillment, commercial packaging, billing/Stripe, social dispatch,
  provider/model call, Redis, Cloudflare, or new public route is required. If
  required, treat that as a blocker unless the smallest safe unblock lane is
  obvious and narrow.
- Whether the visible owner UI should remain readback-only until package
  generation exists, or whether a small owner readiness/action control is safe.

## Acceptable Outcomes

Return:

```text
ACCEPT_PR504A_STATION_PRESS_OWNER_PACKAGE_CONTRACT
```

only if DAEDALUS can implement a narrow next slice with all of these boundaries:

- owner-only authenticated route/UI behavior;
- no public package URL, public download, public Station Press availability
  claim, social dispatch, billing, print, fulfillment, PDF, binary archive, or
  original-file packaging;
- no provider/model call, Redis, Cloudflare, queue, worker, or background job;
- no private source/body/transcript/prompt/provider payload exposure;
- no raw owner, persona, document, thread, export, package, seminar, approval,
  source, file, or storage ids in visible/readback copy;
- exact DAEDALUS file boundary, route/API boundary if any, migration/schema
  boundary if any, and required tests are named.

Return:

```text
ACCEPT_PR504A_STATION_PRESS_READINESS_ONLY
```

if package generation is not safe yet, but a smaller owner-only readiness or
diagnostic readback lane would directly unblock a future package contract.

Return:

```text
BLOCK_PR504_STATION_PRESS_PACKAGE_GENERATION
```

if the next real move needs a product/config/infrastructure decision first.
Name the concrete blocker and the smallest numbered unblock lane MIMIR should
open instead.

## Non-Scope

Do not ask DAEDALUS to implement during this preflight.

Do not approve:

- PDF generation;
- binary archives;
- original-file packaging;
- print-on-demand or fulfillment;
- public Station Press package URLs;
- public package pages;
- public prior-version history;
- provider/model calls;
- queue/worker jobs;
- Redis/Cloudflare architecture;
- billing/commercial packaging;
- social dispatch;
- broad `/studio/publishing` redesign;
- public launch claims;
- private body/source exposure.

## Evidence To Inspect

At minimum inspect:

- PR503 preflight, implementation, review, hosted proof, and closeout docs;
- PR496 workspace export package contract/readback closeout and result docs;
- current export routes/services/helpers/tests;
- current publishing dashboard/helpers/tests;
- document discussion and seminar readback boundaries;
- export trust copy and package readback privacy tests.

## Suggested Validation

Run or explain why not:

```text
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run a changed-path/source scan sufficient to detect whether an accepted
PR504A would require API/schema/storage/worker/provider/billing/social/public
route changes.

## Handoff

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- PR503/PR503A/PR503B closed accepted: Station has a hosted-proven owner-only
  publication manifest contract readback.
- The next Station Press question is package generation boundary, not broad
  Press launch.
Task:
- Run PR504 hostile preflight.
- Decide whether DAEDALUS may implement a narrow owner-only Station Press
  package contract, whether only readiness/readback is safe, or whether a
  concrete blocker must be removed first.
- Wake MIMIR with the verdict and exact next lane.
```
