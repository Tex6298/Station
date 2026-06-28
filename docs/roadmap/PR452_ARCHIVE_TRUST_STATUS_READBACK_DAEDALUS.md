# PR452 - Archive Trust Status Readback

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Source

PR451 closed the hosted Continuity review-link proof. The next memory/
continuity/archive UX lane is Archive trust/status readback.

Existing notes:

- `docs/roadmap/ARCHIVE_IMPORT_SOURCE_WORDING_ARIADNE.md` says broader Archive
  UX should eventually separate pasted/file import sources, archived chats,
  continuity-linked archive material, and storage/quota categories.
- `docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_PLAN.md` lists Archive trust states
  and Archive trust cards as early UI slices.

## Goal

Make the persona Archive/files page explain what archive material exists and
what each count means, without making `0` import sources look like "no archive"
when archived chats or continuity-linked archive material exist elsewhere.

This should improve trust and orientation, not invent new archive semantics.

## Scope

Use the narrowest implementation that makes the Archive page clearer:

- add or refine Archive trust/status cards on the owner-only persona
  Archive/files route;
- distinguish pasted/file import sources from archived chats;
- distinguish imported content/storage usage from source counts;
- include continuity-linked archive material only if current code already has a
  safe owner-only count/readback source;
- keep failed/processing/import-review states honest and visible if already
  present;
- preserve existing archive import, retry, storage, export, and runtime-context
  behavior.

If a useful count is not available from existing owner-safe data, label the
category as not yet tracked or omit it. Do not fake live counts.

## Boundaries

Do not change:

- archive import execution;
- file upload/storage semantics;
- conversation archival;
- continuity selection or runtime retrieval;
- export package shape;
- publication visibility;
- auth/session behavior;
- provider/model behavior;
- billing/quota enforcement;
- schema, migrations, workers, queues, Redis, Cloudflare, Railway, Supabase
  config, or Developer Space behavior.

Do not expose private source bodies, storage paths, raw archive ids, raw owner
ids, prompts, provider payloads, credentials, or raw import errors beyond
existing owner-only sanitized readback.

## Acceptance Gates

- Owner can tell the difference between import sources, archived chats, imported
  content/storage, and any continuity-linked archive material that is shown.
- `0` import sources does not imply all archive-backed material is absent when
  archived chats/storage evidence exists.
- Empty, failed, processing, and completed states stay honest.
- Mobile layout remains readable without horizontal overflow.
- Archive remains clearly owner-only trust infrastructure, not a public
  publication surface.

## Validation

Run focused validation appropriate to the implementation:

```text
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
```

Use API typecheck if backend code changes.

## Handoff

When complete, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS added Archive trust/status readback for PR452.
- Archive now distinguishes import sources, archived chats, storage/imported content, and any safe continuity-linked archive material.
Risk:
- Archive readback must stay owner-only and must not fake unavailable backend counts.
Task:
- Review privacy boundaries, count semantics, empty/failure states, mobile readability, and focused tests.
```
