# PR479 - Native Authoring / Versioning Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - wake ARGUS

## Why This Lane

PR478 is closed. The next feature-expansion choice should move to a different
named customer-facing roadmap capability.

The reopened product map names:

```text
Rich native authoring/versioning beyond protected-alpha publish/retract.
```

This must not repeat PR401/PR402. Those already accepted the owner-side
Authoring Guide, current version-history truth, publishing dashboard legibility,
mobile fit, and safe private draft/readback boundaries.

ARGUS should decide the smallest honest next authoring/versioning slice, or
name the concrete blocker and smallest unblock.

## Required ARGUS Output

Return exactly one of:

- `ACCEPT_PR479A_VERSION_COMPARE_READBACK`
- `ACCEPT_PR479A_DOCUMENT_TYPE_DEPTH`
- `ACCEPT_PR479A_FIELD_LOG_SERIES_READBACK`
- `ACCEPT_PR479A_AUTHORING_TEMPLATE_READBACK`
- `BLOCKED_UNBLOCK_FIRST`
- `REJECT_DEFER`
- `NEEDS_MIMIR_DECISION`

## Candidate Slices

### 1. Owner Version Compare Readback

Improve the owner-only version-history experience without changing public
publishing behavior.

Allowed shape:

- clearer previous/current version metadata;
- owner-only compare/readback helper or panel;
- no public prior-version exposure;
- no publish/retract/delete mutation changes.

### 2. Document Type Depth

Make existing document kinds more meaningful for Station-native authoring.

Allowed shape:

- clearer readback for essay, codex, field log, research note, archive note, or
  manifesto-style document intent;
- focused copy/helper/tests on current authoring surfaces;
- no rich-editor engine or schema unless ARGUS names it as the smallest unblock.

### 3. Field Log Series Readback

Give field-log/research-style writing a clearer owner/public readback path if
existing data already supports it.

Allowed shape:

- visible series/context labels from existing fields;
- public-safe readback only for already-public documents;
- owner-only private/draft context stays private.

### 4. Authoring Template Readback

Help owners start a Station-native document without pretending templates are a
rich editor or automation layer.

Allowed shape:

- static templates, prompts, or guide rails;
- owner-side only unless already-public readback is safe;
- no provider/model calls, generation, scheduling, social dispatch, or Station
  Press.

## Questions For ARGUS

- Which current authoring routes and helpers should be reused?
- Which candidate slice is smallest and most valuable after PR401/402?
- Is any schema/API change truly required, or can this be a web/helper/test
  slice?
- How do owner-only versions, drafts, private documents, public readback, linked
  discussions, and retract-to-private boundaries stay intact?
- What should DAEDALUS touch?
- What tests should DAEDALUS run?
- Does the accepted slice require ARIADNE hosted human-eye proof?

## Inputs

- `docs/roadmap/PR478_COMMUNITY_TRUST_READBACK_CLOSEOUT.md`
- `docs/roadmap/PR401_NATIVE_AUTHORING_DEPTH_RESULT.md`
- `docs/roadmap/PR402_NATIVE_AUTHORING_GUIDE_REHEARSAL_RESULT.md`
- `docs/roadmap/builds.md`
- `docs/roadmap/prep-lane-audit.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`
- `apps/web/app/writing/page.tsx`
- `apps/web/app/studio/publish/page.tsx`
- `apps/web/app/studio/publishing/page.tsx`
- `apps/web/components/studio/publish-flow.tsx`
- `apps/web/lib/publishing.ts`
- `apps/web/lib/publishing-ui.test.ts`
- `apps/web/lib/writing-feed.ts`
- `apps/web/lib/writing-feed.test.ts`
- `apps/web/lib/document-read-route.ts`

## Guardrails

Do not open:

- broad rich-editor rebuild;
- new editor package;
- public prior-version exposure;
- publish/retract/delete mutation changes;
- approval-state redesign;
- scheduling;
- social dispatch;
- Station Press;
- SEO/OpenGraph;
- PDF/print export;
- provider/model calls or AI drafting;
- Redis, Cloudflare, workers, queues, billing, Stripe, auth/session, or
  deployment behavior.

Do not expose:

- private draft bodies;
- owner-only prior versions;
- private archive/source material;
- raw document IDs;
- discussion/thread raw IDs;
- approval internals;
- SQL/table details;
- stack traces;
- provider payloads;
- secrets.

## Wakeup Path

If accepted, wake DAEDALUS with the chosen PR479A slice, exact scope, touched
areas, validation commands, and guardrails.

If blocked or ambiguous, wake MIMIR with the concrete blocker or decision point.
