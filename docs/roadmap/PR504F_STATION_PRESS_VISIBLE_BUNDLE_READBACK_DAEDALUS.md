# PR504F - Station Press Visible Bundle Readback

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status: Open narrow UI patch

## Source

ARIADNE blocked PR504E:

`docs/roadmap/PR504E_STATION_PRESS_OWNER_PACKAGE_BROWSER_CLOSEOUT_RESULT.md`

MIMIR blocker decision:

`docs/roadmap/PR504E_STATION_PRESS_OWNER_PACKAGE_BROWSER_CLOSEOUT_BLOCKER_MIMIR.md`

## Problem

Hosted browser/API proof now confirms the Station Press owner package backend
works:

- browser create returns `201`;
- owner package readback returns `200`;
- owner bundle readback returns `200`;
- bundle files are exactly `README.md`, `manifest.json`, and `manifest.md`;
- signed-out probes remain `401`;
- cross-owner probes remain `404`;
- visible UI and bundle content privacy scans passed.

The human flow still fails because `/studio/publishing` does not expose the
bundle readback to the owner. It only shows completion copy after package
creation.

## Likely Surface

Start with:

- `apps/web/app/studio/publishing/page.tsx`;
- `apps/web/components/studio/publishing-dashboard.tsx`;
- `apps/web/lib/publishing.ts`;
- `apps/web/lib/publishing-ui.test.ts`.

Use the existing authenticated Station Press package API and bundle API. Do not
invent a second package contract.

## Task

Implement the smallest visible owner-only readback needed for PR504E to pass.

Required behavior:

- after package creation, `/studio/publishing` can load the created/latest
  `station_press_publication` package readback;
- if a completed Station Press package already exists, the page can show that
  package without forcing another create;
- the UI exposes an owner-only bundle readback panel or equivalent section;
- the UI shows the exact bundle file list:
  `README.md`, `manifest.json`, and `manifest.md`;
- the UI provides a clear `View bundle files` action or equivalent interaction;
- the readback distinguishes owner-only metadata package proof from public
  Station Press launch;
- desktop and 390px mobile layout must fit without horizontal overflow;
- loading, empty, and bounded-error states must be honest and compact.

Privacy/product boundaries:

- do not show raw owner/document/package ids in visible copy;
- do not show private/source bodies beyond the existing owner-only package file
  readback contract;
- do not show storage paths, signed URLs, SQL details, stack traces, provider
  payloads, cookies, tokens, or env values;
- do not add public package URLs, public downloads, signed URLs, storage
  objects, PDF/binary output, original-file packaging, print/fulfillment,
  provider/model calls, billing/Stripe, social dispatch, queues/workers, Redis,
  Cloudflare, public routes, broad `/studio/publishing` redesign, or launch
  claims.

## Expected UX

Keep the existing Tex Station publishing visual language. This is a readback
patch, not a reskin.

The owner should be able to answer from the page:

- Which Station Press metadata package is complete?
- Which three files are in the owner-only bundle?
- Can I inspect the bundle readback without exposing it publicly?

## Required Validation

Run:

```text
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

If `apps/web/lib/publishing.ts` or API-facing contract code changes, also run:

```text
npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals
npm exec --yes pnpm@10.32.1 -- run test:exports
```

Add or update focused tests for:

- completed package readback state;
- exact three-file bundle list;
- create-success transition into readback;
- loading/empty/bounded-error states;
- absence of public-download/storage/launch wording.

## Result Required

Create:

```text
docs/roadmap/PR504F_STATION_PRESS_VISIBLE_BUNDLE_READBACK_RESULT.md
```

Include:

- files changed;
- behavior implemented;
- how it satisfies the PR504E blocker;
- validation results;
- remaining hosted proof required;
- final wakeup.

## Review

Wake ARGUS after implementation:

```text
WAKEUP A3:
Codename: ARGUS
```

ARGUS should review before ARIADNE reruns PR504E browser closeout.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARIADNE blocked PR504E on a human-flow issue, not backend failure.
- Hosted browser create/readback/bundle now works and boundaries pass.
- /studio/publishing does not expose a visible bundle readback panel, README.md / manifest.json / manifest.md file list, or View bundle files action.
Task:
- Implement the narrow PR504F visible owner-only Station Press bundle readback patch.
- Use existing authenticated APIs; avoid public downloads, storage, PDF/binary, provider, billing, social, queue/worker, Redis, Cloudflare, public route, or broad redesign scope.
- Document the result, run validation, and wake ARGUS for review.
```
