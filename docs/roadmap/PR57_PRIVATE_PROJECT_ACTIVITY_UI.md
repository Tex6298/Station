# PR57 - Private Project Activity UI

Date: 2026-06-19
Status: implemented by DAEDALUS; ready for ARGUS review
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rehearses signed owner UI,
MIMIR decides next lane.

## Purpose

Surface the PR56 owner-only Project activity readback inside the private
Project detail page so owners can see whether attached Developer Spaces are
producing observable activity.

This is a readback panel only. It should make the existing Project scaffold feel
less hollow without opening public Projects, quota math, billing semantics,
exports, member authorization, hosted runtime, Cloudflare, developer-agent, or
DexOS-specific work.

## Scope

Implement only:

- Update private `apps/web/app/projects/[idOrSlug]/page.tsx` to read the PR56
  `activity` object from `GET /projects/:idOrSlug`.
- Add a compact owner-only activity panel/card on Project detail.
- Display bounded counters from the API response:
  - attached Developer Spaces;
  - ingested nodes;
  - ingested events;
  - ingested snapshots;
  - storage bytes;
  - public reads;
  - exports.
- Keep labels observational, for example "Observed activity" or "Project
  activity", not "quota", "billing", "limits", "hosted runtime", or "usage
  entitlement".
- Show zero-state Projects cleanly with `0` counters and neutral copy.
- Preserve attach/detach refresh behavior so the activity panel updates after
  `refreshProjectState`.
- Keep existing owner-only sign-in and error behavior.
- Keep narrow viewport fit at roughly `390px`.

## Non-Scope

- No API route changes unless DAEDALUS finds a type mismatch that cannot be
  handled in the web page.
- No schema or migration work.
- No public Project page or Discover integration.
- No quota math, billing, Stripe, plan gates, entitlement decisions, or usage
  enforcement.
- No Project activity timeline, raw ingestion events, event payloads, private
  logs, methodology/field-log storytelling, or evidence documents.
- No Project exports or `export_packages.project_id`.
- No contributor/member auth, invitations, role management, or team UI.
- No Cloudflare, Tier 2 hosting, containers, queues, Redis, deployment pipeline,
  developer-agent, chat-native tools, DexOS widgets, or Interconnected Lab work.

## Acceptance

ARGUS can accept PR57 if:

- The private Project detail page renders the PR56 `activity` object without
  changing backend behavior.
- Missing or zero activity values render as zeros, not errors or blank broken
  UI.
- Activity labels are clearly observational and do not imply quota/billing
  semantics.
- Attach and detach still refresh Project detail and do not desync the attached
  Developer Space list.
- Anonymous users still see only the existing sign-in path.
- No public Project route/page, billing/quota behavior, exports, member auth,
  Cloudflare, hosted runtime, developer-agent, DexOS, or
  `export_packages.project_id` work is added.

## Validation

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If a web build is run, record the known Windows standalone symlink `EPERM`
separately from compile/type/page-generation success.

## Handoff

Wake ARGUS with:

- exact UI files changed;
- response-shape/type changes;
- activity labels used;
- zero-state behavior;
- attach/detach refresh confirmation;
- validation results;
- scope confirmation that no API/schema/public/billing/quota/export/member/
  Cloudflare/Tier 2/developer-agent/DexOS/`export_packages.project_id` work was
  added.

If ARGUS accepts, ARGUS should wake ARIADNE for a human rehearsal and wake
MIMIR with the review verdict. ARIADNE should verify:

- signed owner Project detail shows the activity panel;
- zero or seeded activity is legible;
- attach/detach still works and refreshes the page state;
- `390px` layout has no horizontal overflow or offscreen controls;
- anonymous Project detail still redirects/signs in without private leakage.

If blocked, wake MIMIR with the exact blocker. Do not leave the lane silent.

## DAEDALUS Implementation

Changed:

- Extended private owner `/projects/[idOrSlug]`.
- Reads the optional PR56 `activity` object from `GET /projects/:idOrSlug`.
- Normalizes missing activity fields to zero.
- Adds an `Observed activity` panel.
- Displays these counters:
  - Attached spaces;
  - Nodes;
  - Events;
  - Snapshots;
  - Storage bytes;
  - Public reads;
  - Exports.
- Preserves attach/detach refresh through `refreshProjectState`, so activity
  refreshes with Project detail after actions.

Files changed:

- `apps/web/app/projects/[idOrSlug]/page.tsx`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/PR57_PRIVATE_PROJECT_ACTIVITY_UI.md`

API/schema files changed:

- None.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:projects` | Pass | 5 tests passed; Project activity API coverage stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 11 tests passed; Developer Space behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only for touched files and local triad state. |

Scope guard:

- No API route change.
- No schema or migration work.
- No public Project page.
- No quota math, billing, exports, member auth, Cloudflare, Tier 2 hosting,
  developer-agent, DexOS, or `export_packages.project_id`.

ARIADNE rehearsal request if ARGUS accepts:

- Signed owner Project detail shows the `Observed activity` panel.
- Zero or seeded activity is legible.
- Attach/detach still refreshes Project detail and the activity panel.
- `390px` layout has no horizontal overflow or offscreen controls.
- Anonymous Project detail still redirects/signs in without private leakage.
