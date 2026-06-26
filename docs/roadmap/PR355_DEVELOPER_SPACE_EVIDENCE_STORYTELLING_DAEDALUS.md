# PR355 - Developer Space Evidence Storytelling Check

Owner: DAEDALUS

Date: 2026-06-26

Status: Open

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARIADNE completed PR354 Memory observability handoff hosted rehearsal with PASS.
- Memory observability is accepted locally and on hosted Railway.
- MIMIR is moving to the next stored UX/product concern: Developer Space public methodology, findings, field logs, and visitor-readable evidence storytelling.
Task:
- Inspect the current Developer Space public observatory and owner manage surfaces against this document.
- Implement the narrowest route/helper/copy patch only if a real gap remains.
- If code changes land, wake ARGUS for review.
- If current code already covers the concern, wake MIMIR with exact file/route evidence and a sharper next implementation packet.
```

## Why This Is Next

PR354 closed the Memory observability handoff proof. The next known product gap
from the staging and UI/UX notes is Developer Space storytelling: the public
observatory can show live state, but visitors need to understand what the live
readback means, where methodology/finding/field-log evidence belongs, and what
Station does not expose from the private operator console.

This is not a broad visual redesign. It is a narrow UX-06 clarity check and
patch if needed.

## Read First

Inspect current repo truth before editing:

```text
apps/web/app/developer-spaces/[slug]/page.tsx
apps/web/app/developer-spaces/[slug]/manage/page.tsx
apps/web/lib/developer-space-observatory.ts
apps/web/lib/developer-space-observatory.test.ts
docs/roadmap/STATION_UI_UX_ROADMAP.md
docs/roadmap/STATION_FUTURE_LANES.md
```

Current helpers already appear to include visitor reading path, methodology
copy, evidence ordering, evidence role labels, empty evidence copy, connection
badges, public readback framing, and owner usage/readback helpers. Do not
duplicate those helpers. Tighten or reuse them.

## Product Target

The public Developer Space should answer, in a human-eye read:

- What is this observatory showing right now?
- Which parts are live public-safe readback from an external runtime?
- Where should a visitor look for methodology, findings, field logs, and notes?
- What does it mean when no public evidence documents are attached yet?
- What stays private to the owner/operator console?

The owner manage surface should answer:

- How does the owner create or publish methodology/finding/field-log evidence?
- How does that evidence appear in the visitor reading path?
- Which controls are private operator controls and which produce public
  evidence?

## Implementation Guidance

If a gap remains, prefer the smallest useful patch:

- tighten empty-state copy around no public methodology/finding/field-log
  evidence;
- make the public reading path more explicit without adding fake evidence;
- connect existing owner manage copy to the visitor evidence path more clearly;
- add or adjust helper tests for changed copy/ordering behavior.

Do not create seeded evidence, new routes, new schema, a new visualization
framework, or a broad style pass in this PR.

## Non-Scope

Do not change:

- Developer Space ingestion, keys, provider execution, live runtime behavior,
  WebSocket/SSE semantics, export behavior, billing, auth/session, schema,
  migrations, Redis, Cloudflare, queues, workers, Railway config, or Supabase
  admin settings;
- public/private serializers or visibility semantics except for safer visible
  explanatory copy;
- raw event data, snapshot data, prompts, provider payloads, hosted logs,
  credentials, private document bodies, private owner IDs, or secret-shaped
  values;
- the broader Station visual system or non-Developer Space surfaces.

## Acceptance Criteria

- Public Developer Space visitor readback clearly separates public evidence,
  live public-safe runtime summaries, snapshots, and private operator data.
- Empty evidence states explain what would appear there and what remains
  visible meanwhile.
- Owner manage copy makes the methodology/finding/field-log route to public
  evidence understandable if the current page does not already do that.
- No fake methodology, fake findings, fake field logs, private payloads, raw
  runtime data, keys, prompts, provider payloads, hosted logs, or secret-shaped
  values render publicly.
- Mobile-readable layout is preserved.

## Suggested Validation

Use judgment based on touched files. Likely checks:

```text
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
```

If this proves to be docs/copy-helper only, the focused helper tests plus
typecheck and diff check are enough.

## Review Handoff

If code changes land, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR355 Developer Space evidence storytelling changes.
Risk:
- Public observatory copy must not leak private runtime/operator data or imply Station hosts the external runtime.
Task:
- Review public/private boundary, helper tests, mobile-safe copy, and validation.
- Wake MIMIR with accept/reject verdict.
```

If no code change is needed, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS inspected PR355 Developer Space evidence storytelling.
Verdict:
- Current code already covers this concern, or implementation is blocked by a specific missing contract.
Task:
- Choose the next roadmap move with the evidence included.
```
