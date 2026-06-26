# PR364 - Export Backup Trust Gap Map

Owner: DAEDALUS
Date: 2026-06-26
Status: Implemented - ready for ARGUS

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- MIMIR accepted PR363 as PASS WITH CAVEAT; document version/readback is deployed enough without mutating staging for a v2 public fixture.
- The next remaining MVP gap is export/backup trust: current product truth proves owner-only JSON/Markdown package readback, not full workspace/PDF/binary export or archive redundancy.
Task:
- Map current export/backup trust surfaces against the product promise and prep-lane audit.
- Inspect /studio/export, per-persona export status/readback, export API routes, export package tests, storage/quota helpers, and existing docs.
- If a smallest safe no-config readback patch is obvious, implement it and wake ARGUS.
- If not, write a result doc with a ranked first implementation recommendation and wake MIMIR.
```

## Product Why

Station's preservation promise depends on users understanding what is actually
portable today and what remains future infrastructure.

Current truth:

- owner-only persona JSON/Markdown manifests and bundle readback exist;
- Developer Space and Project export readbacks have bounded proof;
- `/studio/export` is a preview/planning surface;
- full workspace export, PDF/binary packages, original file packaging,
  expiry/retry policy, background jobs, backup/redundancy, and Station Press
  remain open.

This lane should convert that into either a safe product readback improvement or
a precise next implementation packet.

## Inspect

- `apps/web/components/studio/export-workspace.tsx`
- `apps/web/components/studio/archive-export-status.tsx`
- `apps/api/src/routes/exports.ts`
- `apps/api/src/routes/exports.test.ts`
- `apps/api/src/services/operational-quota.service.ts`
- `apps/api/src/services/background-jobs.service.ts`
- `docs/roadmap/prep-lane-audit.md`
- `docs/roadmap/builds.md`
- relevant persona, Developer Space, and Project export result docs

## Allowed Patch Shape

Only if clearly bounded:

- make `/studio/export` more honest/live by surfacing existing export-package
  truth without starting a global export job;
- extract/reuse an existing export package status/readback component;
- clarify completed/failed/requested export states, bundle-readback boundary,
  and future full-workspace/PDF/binary limitations;
- add focused helper/test coverage for export status/readback copy or route
  shape.

## Non-Scope

- No full workspace export implementation.
- No PDF, binary archive, original file packaging, Station Press, print,
  fulfilment, shipping, or checkout/order flow.
- No background worker, queue, retry processor, backup infrastructure,
  retention/expiry engine, Redis, Cloudflare, provider/model, Stripe, schema,
  migration, Supabase/Railway config, or broad Studio reskin.
- No public export URLs, signed download URLs, file body dumps, private source
  body exposure, or cross-owner export access.

## Acceptance Shape

If code changes land, wake ARGUS with:

- changed files and exact visible/API behavior;
- owner/privacy boundary;
- validation commands run;
- known warnings or blockers.

If no code changes land, wake MIMIR with:

- current export/backup surface map;
- recommended first implementation slice;
- why full workspace/PDF/binary export, workers, and Station Press remain
  deferred.
