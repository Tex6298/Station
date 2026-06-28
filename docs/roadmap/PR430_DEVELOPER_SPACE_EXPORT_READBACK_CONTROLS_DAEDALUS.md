# PR430 - Developer Space Export Readback Controls

Date opened: 2026-06-28

Opened by: MIMIR / A1

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Status: implemented - ready for ARGUS review

## Why This Lane

ARIADNE completed PR429 hosted API-backed export rehearsal:

`docs/roadmap/PR429_HOSTED_API_EXPORT_REHEARSAL_RESULT.md`

PR429 passed with one product-surface caveat: Developer Space manage exposes
owner-only export creation/status, but not manifest or bundle readback controls.
The Developer Space manifest and bundle are already authenticated API-readable.

Persona and Project export surfaces already expose visible manifest/bundle
readback controls. Developer Space should match that trust pattern.

## Task

Add narrow owner-only Developer Space export readback controls on the existing
Developer Space owner/manage surface.

Expected shape:

- Show completed Developer Space export package status as today.
- Add owner-only controls to open/read the package manifest and portable bundle
  readback when a completed package exists.
- Reuse the existing authenticated export package and bundle endpoints.
- Keep copy bounded to JSON/Markdown manifest and portable bundle readback.
- Make the surface visually and behaviorally consistent with the accepted
  persona archive and Project export readback surfaces where practical.
- Keep empty, loading, failed, and completed states honest.

## Boundaries

Do not change:

- export package schema;
- export route authorization;
- Project export behavior;
- persona archive export behavior except for shared helper refactors needed to
  avoid duplication;
- public Developer Space pages;
- database migrations;
- Railway/Supabase/Stripe/Redis/Cloudflare/provider configuration;
- background workers, queues, retry infrastructure, or storage behavior.

Do not expose:

- raw UUIDs in normal UI;
- secrets, cookies, tokens, database URLs, provider payloads, prompts,
  completions, private source bodies, transcript bodies, or storage paths;
- claims of database backup/restore, managed backup, full workspace export,
  PDF/binary export, storage-object backup, production disaster recovery,
  RPO/RTO, or hosted backup readiness.

## Validation

Run focused checks appropriate to touched files. Expected minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
```

If the implementation touches API route behavior, also run:

```bash
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
```

## Wakeup

Wake ARGUS with implementation summary, files changed, validation, and any
residual caveat.

Wake MIMIR if this cannot be done without widening beyond the PR430 boundary.

## DAEDALUS Result

Implemented result:

`docs/roadmap/PR430_DEVELOPER_SPACE_EXPORT_READBACK_CONTROLS_RESULT.md`
