# PR463 - Discover, Public, and Community Polish Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Source

PR462 closed hosted Studio quota readback confirmation:

`docs/roadmap/PR462_HOSTED_STUDIO_QUOTA_READBACK_CONFIRMATION_CLOSEOUT.md`

Discern-to-Tex priority:

`docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_PLAN.md`

This is a hosted human-eye rehearsal. Use the product like a public visitor who
is trying to understand what Station is, what is public, what is private, and
how public work connects to community discussion.

## Goal

Audit Discover, public Space/document, Writing, and Forums/community polish on
hosted Station and return one concrete next lane.

This is not a broad redesign. The useful output is either
`PASS_WITH_NEXT_LANE` or one bounded DAEDALUS patch target.

## Hosted Gate

Use:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Runtime should be at PR461 product/review commit `187996cd` or later for web/API
before judging product behavior. If Railway is still serving an older commit,
return `DEPLOYMENT_WAITING`.

## Route Set

Sample signed-out first, then signed-in only where the public route naturally
shows account-aware affordances. Keep the run read-only.

Routes and stops:

1. `/`
2. `/discover`
3. public Space route from Discover
4. public document route from that Space
5. linked forum discussion route from the public document, if visible
6. `/forums`
7. one forum category
8. one forum thread or discussion if naturally visible
9. `/writing`
10. Writing tabs, type filters, and search as read-only interactions
11. public Developer Space observatory if it appears in Discover

Check desktop plus one narrow mobile viewport around 390px.

Do not post replies, vote, report, publish, edit, delete, run provider setup,
open billing checkout, import/export, upload, or call private model flows.

## Acceptance Gates

- A public visitor can understand the path from Discover to public Space,
  document, and discussion.
- Visibility, provenance, authorship, and public/private boundaries are clear.
- Public discussion controls that look actionable either work read-only, are
  disabled, or are clearly not available in the current state.
- Writing tabs, type filters, and search provide visible state changes or clear
  inactive/empty states.
- Forum category/thread labels are readable and do not overlap counts or route
  labels.
- Public Developer Space observatory, if present, remains clearly separate from
  private owner/manage routes.
- Empty/loading/error states encountered in public routes explain what is
  absent without implying broken backend behavior.
- Desktop and mobile layouts remain readable without horizontal overflow,
  clipped controls, overlapping labels, or hidden route affordances.
- Visible text does not expose raw ids, prompts, private source bodies, provider
  payloads, credentials, storage paths, stack traces, payment secrets, or
  secret-shaped material.

## Report

Wake MIMIR with exactly one:

- `PASS_WITH_NEXT_LANE`: public/community polish is good enough; recommend the
  next Discern-to-Tex priority by name.
- `PRODUCT_DEFECT_NEEDS_DAEDALUS`: one concrete public/community polish defect
  should be fixed next.
- `DEPLOYMENT_WAITING`: hosted runtime is stale.

If reporting a defect, include:

- route;
- viewport;
- action or state;
- expected behavior;
- actual behavior;
- smallest recommended DAEDALUS patch lane.

Do not commit screenshots, cookies, session values, raw owner ids, customer ids,
subscription ids, private source bodies, prompts, completions, provider keys,
stack traces, or raw network payloads.

## ARIADNE Result

Completed:

`docs/roadmap/PR463_DISCOVER_PUBLIC_COMMUNITY_POLISH_REHEARSAL_RESULT.md`

Verdict:

```text
PASS_WITH_NEXT_LANE
```
