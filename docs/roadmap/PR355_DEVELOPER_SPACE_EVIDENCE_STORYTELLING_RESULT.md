# PR355 - Developer Space Evidence Storytelling Result

Owner: DAEDALUS

Date: 2026-06-26

Status: Ready for MIMIR

## Summary

PR355 did not need a product patch. The current Developer Space public
observatory, owner manage surface, helper layer, and tests already cover the
evidence storytelling concern from the wakeup packet.

The current code separates:

- public methodology, findings, field logs, and notes;
- public-safe live readback from an external self-hosted runtime;
- snapshots as readback, not proof that Station hosts or controls the runtime;
- owner-only raw event and snapshot detail;
- owner-only evidence drafting, review, and publish-request actions.

No route, helper, schema, auth, ingestion, billing, runtime, visibility, or UI
behavior changed in PR355.

## Public Observatory Evidence

`apps/web/app/developer-spaces/[slug]/page.tsx` already wires the public
observatory through the existing helper layer:

- `ObservatoryStory` uses the Tier 1 framing and public readback summary so the
  page explains what Station hosts and what remains external.
- `ObservatoryOrientation` renders `developerSpaceVisitorReadingPath(detail)`
  under the "How to read this observatory" section.
- `EvidenceReadingPath` renders the linked evidence in order, labels each role,
  shows excerpts in-page, and uses different copy for owner and public views.
- The page only enables raw detail rendering through
  `shouldShowRawDeveloperSpaceData(detail.access)`, which is owner-only.
- The public page includes the evidence path beside node, event, snapshot, and
  visualization readback without adding fake methodology or fake findings.

`apps/web/lib/developer-space-observatory.ts` already contains the storytelling
contract:

- `developerSpaceTierOneFramingCopy()` says Station hosts the public showcase,
  observatory, evidence path, and readback while the project runtime remains
  external and self-hosted.
- `developerSpaceMethodologyCopy(detail)` counts public methodology, finding,
  and field-log links, explains when none are present, and states the private
  boundary for owner and public views.
- `developerSpaceVisitorReadingPath(detail)` filters to public, published,
  public-visibility evidence, then separates evidence, current readback, and
  snapshot meaning.
- `developerSpaceEvidenceTitle()`, `developerSpaceEvidenceRoleCopy()`, and
  `developerSpaceEvidenceRoleDescription()` give role-aware labels for
  methodology, findings, field logs, and notes.
- `orderedDeveloperSpaceEvidence()` orders evidence as methodology, finding,
  field log, then note.
- `developerSpaceEvidenceEmptyCopy(ownerView)` explains both owner and public
  empty evidence states without hiding the live observatory.
- `shouldShowRawDeveloperSpaceData()` is true only for owner access.

## Owner Manage Evidence

`apps/web/app/developer-spaces/[slug]/manage/page.tsx` already makes the owner
side of the evidence path clear:

- The page labels itself as the private `Tier 1 operating console`.
- The owner intro says public visitors see only the public observatory and
  evidence path.
- The current-state readback says owner readback is separate from quota
  counters and the public visitor boundary.
- The `Evidence path` panel tells owners to curate methodology, findings,
  field logs, and notes beside external-runtime signals.
- The create form exposes the evidence role, body, and `Publish to visitor
  evidence path` control.
- Existing rows show `Visible to visitors` or `Hidden from visitors`.
- Draft/private owner evidence can expose `Review draft` and `Request publish`
  actions when eligible.
- Event ingestion copy tells owners to include provenance/source references so
  visitors can distinguish runtime output, imports, and AI-generated material
  without seeing raw payloads.

## Test Evidence

`apps/web/lib/developer-space-observatory.test.ts` already covers the relevant
helper behavior:

- visitor data stays readable and non-raw;
- Tier 1 framing separates self-hosted runtime from Station readback;
- methodology copy stays honest about public evidence and the private boundary;
- visitor reading path separates evidence, readback, and snapshots;
- visitor reading path filters out owner-only, private, and draft documents;
- evidence labels use role-aware Developer Page language;
- evidence reading path orders roles and has honest empty copy;
- observed runtime readback feeds public helpers without raw secrets.

Because no product code changed, PR355 adds no new route/helper tests.

## Roadmap Evidence

`docs/roadmap/STATION_UI_UX_ROADMAP.md` says UX-06 needs Developer Space public
observatory clarity, operator/private separation, methodology/finding/field-log
documents, live status, usage/quota separation, and non-technical visual
explanations.

Current code now satisfies that specific evidence-storytelling concern.

`docs/roadmap/STATION_FUTURE_LANES.md` already treats current Developer Space
storytelling as something to keep on the existing public-safe methodology,
evidence ordering, field-log, and reading-guide helpers. It leaves broader
future work such as project updates/changelog/feed, Developer Agent expansion,
runtime history/playback, and deeper external runtime lanes outside this
packet.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `git diff --check` | Pass | Docs-only whitespace check. |
| `git diff --cached --check` | Pass | Staged docs-only whitespace check before commit. |

## Recommendation

MIMIR can close PR355 as `covered / no product patch`.

The sharper next packet should not be another copy patch over the already
tested evidence helpers. Choose one of these instead:

- `PR356 - Developer Space Evidence Storytelling Hosted Recheck` for ARIADNE:
  prove the current public observatory and owner manage evidence path on hosted
  Railway, desktop and mobile, without mutating ingestion keys or evidence.
- Or, if implementation is desired before another hosted proof, open a narrow
  source-map packet for the deferred Developer Space project
  updates/changelog/feed lane, because that is a distinct future feature rather
  than a missing evidence-storytelling copy layer.
