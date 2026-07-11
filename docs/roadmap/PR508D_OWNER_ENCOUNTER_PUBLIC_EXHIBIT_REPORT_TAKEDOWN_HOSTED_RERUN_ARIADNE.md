# PR508D - Owner Encounter Public Exhibit Report/Takedown Hosted Rerun

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status:

```text
OPEN_HOSTED_REPORT_TAKEDOWN_RERUN
```

## Source

PR508B hosted proof blocked only at signed-in report creation:

`docs/roadmap/PR508B_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_HOSTED_PROOF_RESULT.md`

PR508C code repair:

`docs/roadmap/PR508C_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TARGET_REPAIR_RESULT.md`

ARGUS review acceptance:

`docs/roadmap/PR508C_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TARGET_REPAIR_REVIEW_RESULT.md`

MIMIR closeout:

`docs/roadmap/PR508C_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TARGET_REPAIR_CLOSEOUT.md`

## Purpose

Rerun the hosted PR508B report/takedown proof after PR508C repaired the public
exhibit moderation target identity mismatch.

This is a hosted proof lane, not an implementation lane.

## Deployment Floor

Before testing, confirm hosted `@station/api` includes the PR508C repair commit
or a later `main` commit:

```text
e573945f fix: persist public exhibit report targets by id
```

If Railway has not deployed this commit or later, wait/retry or wake MIMIR with
a deployment freshness blocker. Do not use local dev proof as hosted proof.

## Targets

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

## Required Flow

Use the original PR508B proof as the baseline:

`docs/roadmap/PR508B_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_HOSTED_PROOF_ARIADNE.md`

Because the PR508B proof artifact was deleted during cleanup, PR508D may create
exactly one new same-owner private candidate artifact for this hosted rerun.

Required checks:

1. Hosted web/API health and deployment freshness pass.
2. Hosted migration `076` still probes as present and compatible.
3. Owner, non-owner, and admin auth pass.
4. Create exactly one same-owner private candidate artifact if no suitable
   existing disposable proof artifact is available.
5. Publish one metadata-only public exhibit from the owner flow.
6. Public exhibit route remains slug-based and metadata-only.
7. Signed-out report attempt returns `401`.
8. Signed-in public exhibit report by slug returns `201`.
9. Hosted `moderation_reports.target_id` stores the public exhibit UUID, not
   the slug.
10. Duplicate report by slug returns the bounded duplicate behavior.
11. Admin report queue resolves the UUID target to safe public exhibit context.
12. Admin remove hides the public route.
13. Admin restore reopens only an eligible removed published exhibit.
14. Owner-retracted exhibits cannot be removed/restored into public visibility
    by moderation actions.
15. Missing, malformed, removed, and retracted report attempts fail closed.
16. Public Space/persona/Discover/search/forum/feed surfaces still do not
    surface encounter exhibits outside `/encounters/[slug]`.
17. Cleanup deletes the proof artifact and any proof report row if the route
    allows it.
18. Sanitized proof output records no secrets or private material.

## Pass Conditions

PR508D may pass only if:

- hosted deployment includes PR508C or later;
- signed-in public exhibit report by slug returns `201`;
- report persistence uses the public exhibit UUID as
  `moderation_reports.target_id`;
- admin queue/remove/restore can operate from the UUID target;
- owner-retracted exhibit protection remains intact;
- the dedicated public route remains slug-based and metadata-only;
- no public no-drift sample surfaces encounter exhibits outside
  `/encounters/[slug]`;
- cleanup completes;
- proof output is sanitized.

## Block Conditions

Stop and wake MIMIR if any of these occur:

- hosted API is stale or not ready;
- migration `076` compatibility regressed;
- report creation still returns `500`;
- report creation writes slug or non-UUID target ids;
- duplicate report behavior leaks row identity or private material;
- admin queue cannot resolve safe target context from UUID;
- admin remove/restore fails or overrides owner-retracted protection;
- public routes expose private setup, generated reply text, transcript
  excerpts, raw private ids, provider payloads, prompts, private curation text,
  source bodies, or cross-owner words;
- public Discover/search/forum/feed/Space/persona surfaces encounter exhibits
  outside the dedicated route;
- cleanup cannot remove the proof artifact.

## Recording Rules

Record statuses, bounded error codes, route names, deployment commit prefix,
sanitized counts, and pass/fail conclusions.

Do not record credentials, cookies, auth tokens, raw owner ids, source persona
ids, private session ids, prompt bodies, private setup bodies, generated reply
text, transcript excerpts, private curation text, provider keys, base URLs,
model config, SQL details, stack traces, provider payloads, env values,
screenshots, traces, videos, browser storage state, bearer values, or
secret-shaped strings.

Do not add code, migrations, seeds, package files, lockfiles, product behavior,
or proof artifacts in this lane. If proof finds a defect, report the narrow
blocker and wake MIMIR.

## Result Required

Create:

```text
docs/roadmap/PR508D_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TAKEDOWN_HOSTED_RERUN_RESULT.md
```

Include:

- pass/block verdict;
- hosted deployment floor;
- migration `076` compatibility re-probe;
- count of proof artifacts created;
- report creation and duplicate report verdict;
- report target UUID proof verdict;
- admin queue/remove/restore verdict;
- owner-retracted protection verdict;
- public no-drift verdict;
- cleanup verdict;
- privacy/secret scan result;
- final wakeup.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- ARGUS accepted PR508C public exhibit report target repair.
- PR508C keeps public report routes slug-based, resolves slug to public exhibit UUID server-side, and persists UUID moderation report targets for hosted schema compatibility.
- PR508B already proved deployment, migration 076, owner publish/retract, public metadata-only route, layout, boundaries, no-drift, cleanup, and privacy except for signed-in report creation/admin takedown.
Task:
- Run PR508D hosted report/takedown rerun.
- Confirm hosted API includes `e573945f` or later before product proof.
- You may create exactly one new same-owner private candidate artifact if needed, then clean it up.
- Prove signed-in public exhibit report by slug returns 201, report target is UUID, duplicate report is bounded, admin queue/remove/restore works from UUID, owner-retracted protection holds, public no-drift holds, and cleanup passes.
- Wake MIMIR with PASS or BLOCK.
```
