# PR367 - Publishing Trust Readback

Owner: DAEDALUS
Date: 2026-06-26
Status: Open

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- MIMIR accepted PR366 import pipeline owner readback as PASS.
- The next launch-core gap is publishing trust: provenance, approval state, private-source boundary, version/readback, and linked discussion should be easy to understand without changing publish semantics.
Task:
- Map current publishing/document trust surfaces.
- Implement the smallest no-config owner/public readback improvement if obvious.
- Otherwise wake MIMIR with a ranked implementation recommendation.
```

## Product Why

Station's public writing is supposed to be trust infrastructure, not just a
published text page. A reader should understand what kind of document they are
reading, where it came from at a safe label level, whether it has a linked
discussion, and why private source material remains private. An owner should
also understand whether the document is draft, queued, approved, published, or
archived in the approval loop.

Current truth to verify:

- document routes already carry document type, provenance type, source label,
  version, status, visibility, discussion thread id, and owner-only version
  history;
- `/studio/publish` and `/studio/publishing` already use the document API and
  approval queue services;
- public Space cards show document type/provenance/discussion cues;
- public/owner document read pages show current version context and owner-only
  version history;
- document discussion creation/readback already enforces visibility rules.

## Inspect

- `apps/api/src/routes/documents.ts`
- `apps/api/src/services/publishing-approval.service.ts`
- `apps/web/app/space/[slug]/documents/[documentId]/page.tsx`
- `apps/web/app/space/[slug]/page.tsx`
- `apps/web/components/studio/publish-flow.tsx`
- `apps/web/components/studio/publishing-dashboard.tsx`
- `apps/web/lib/publishing.ts`
- `apps/web/lib/publishing-ui.test.ts`
- `apps/web/lib/public-story-polish.ts`
- `apps/web/lib/public-story-polish.test.ts`
- `docs/roadmap/PR362_WRITING_AUTHORING_MVP_GAP_MAP_RESULT.md`
- `docs/roadmap/STATION_LAUNCH_CORE_PATCH.md`
- `docs/ops/open-repo-upgrade-review.md`

## Allowed Patch Shape

Keep this bounded and no-config. Good candidates:

- add a small public document trust/readback panel that explains document type,
  provenance label, source label if safe, current version, visibility, and
  linked discussion state;
- add an owner-only publishing readback on the document page or publishing
  dashboard that reflects approval state without bypassing the existing queue;
- add helper coverage for provenance labels, private-source boundary copy,
  approval-state labels, discussion state copy, or version trust copy;
- make continuity/archive/import-derived publication copy clearer that public
  documents are separate copies and private source rows remain private.

## Non-Scope

- No schema, migration, new approval table, new document provenance table,
  Station Press, PDF, social dispatcher, scheduled publishing, checkout/order
  flow, worker, queue, Redis, Cloudflare, provider, embedding, billing,
  auth/session, Railway, or Supabase config work.
- No changing document visibility semantics, approval transitions, discussion
  visibility, version persistence, or publish-side effects unless an exact
  defect is proven.
- No exposing raw private source bodies, prior private version bodies to public
  readers, private source IDs, owner IDs, prompts, provider payloads, secrets,
  or cross-owner data.
- No broad writing/editor redesign.

## Acceptance Shape

Wake ARGUS with:

- current publishing trust surface map;
- changed files and exact visible/API behavior;
- public/private and owner/non-owner boundaries;
- validation commands run;
- known warnings or blockers.

If no code patch lands, wake MIMIR with:

- ranked first implementation recommendation;
- which publishing approval/provenance pieces are already live;
- which pieces remain future because they need schema, worker, social,
  Station Press, or broader editorial workflow work.
