# PR509B - Public Encounter Exhibit Index Hosted Proof

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status:

```text
OPEN_HOSTED_PUBLIC_INDEX_PROOF
```

## Source

PR509A implementation:

`docs/roadmap/PR509A_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_RESULT.md`

ARGUS acceptance:

`docs/roadmap/PR509A_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_REVIEW_RESULT.md`

MIMIR closeout:

`docs/roadmap/PR509A_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_CLOSEOUT.md`

## Purpose

Prove the deployed public encounter exhibit index on Railway.

This is a hosted proof lane, not an implementation lane.

## Deployment Floor

Before testing, confirm hosted web/API include PR509A implementation commit or
later:

```text
b0a116bd feat: add public encounter index
```

If Railway has not deployed this commit or later, wait/retry or wake MIMIR with
a deployment freshness blocker. Do not use local dev proof as hosted proof.

## Targets

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

## Required Flow

If hosted has no suitable published public exhibit for proof, ARIADNE may create
exactly one disposable same-owner private candidate artifact, publish one
metadata-only public exhibit, and clean it up afterward.

Prove:

1. Hosted web/API health and deployment freshness pass.
2. `GET /persona-encounters/public-exhibits` returns `200`.
3. Public list payload is bounded and metadata-only.
4. `limit` clamps to `1..24`.
5. Invalid cursor returns bounded `400`.
6. Cursor continuation works without exposing raw ids.
7. `/encounters` renders desktop cards without text overlap, clipped controls,
   or horizontal overflow.
8. `/encounters` renders at `390px` mobile without text overlap, clipped
   controls, or horizontal overflow.
9. Cards link only to `/encounters/[slug]`.
10. Report controls are absent from the index and remain detail-only.
11. Retracted and moderation-removed exhibits are absent from list/detail.
12. Owner-retracted moderation restore protection remains intact.
13. Discover search/feed, public persona pages, public Space pages, forums, and
   Station Press/public documents still do not surface encounter exhibits.
14. Hosted list-route latency is acceptable for protected alpha, or the result
   recommends a separate partial-index repair.
15. Cleanup deletes any proof artifact and proof report row created by the
   proof.

## Pass Conditions

PR509B may pass only if:

- hosted deployment includes PR509A or later;
- public list API and `/encounters` page work on hosted;
- payloads remain metadata-only;
- index cards route only to detail;
- report remains detail-only;
- hidden/retracted/removed rows stay absent;
- no public no-drift surface starts showing encounter exhibits outside
  `/encounters`;
- latency is acceptable for protected alpha or the only follow-up is a narrow
  partial-index repair;
- cleanup succeeds;
- proof output is sanitized.

## Block Conditions

Stop and wake MIMIR if any of these occur:

- hosted deployment is stale or not ready;
- public list endpoint returns a server error;
- payload contains raw owner ids, persona ids, private session ids, private
  artifact ids, setup text, generated reply text, transcript excerpts, private
  curation, prompts, provider details, source bodies, report/admin internals,
  or cross-owner words;
- cursor exposes private/raw ids;
- `/encounters` has mobile/desktop layout breakage;
- index cards expose report controls or imply transcripts/discussions exist;
- hidden/retracted/removed rows appear;
- Discover/search/feed/public persona/public Space/forum/Station Press surfaces
  show encounter exhibits;
- cleanup cannot remove proof artifacts.

## Recording Rules

Record statuses, bounded error codes, route names, deployment commit prefix,
latency timings, sanitized counts, and pass/fail conclusions.

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
docs/roadmap/PR509B_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_HOSTED_PROOF_RESULT.md
```

Include:

- pass/block verdict;
- hosted deployment floor;
- whether a proof artifact was created;
- API list contract verdict;
- cursor/limit verdict;
- desktop and `390px` index layout verdict;
- report-detail-only verdict;
- hidden/retracted/removed absence verdict;
- public no-drift verdict;
- list-route latency note;
- cleanup verdict;
- privacy/secret scan result;
- final wakeup.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- ARGUS accepted PR509A public encounter exhibit index.
- PR509A adds only a dedicated `/encounters` page plus bounded public list API for metadata-only published, non-removed public encounter exhibits.
- No Discover/search/feed, public persona, public Space, forum, Station Press, transcript/excerpt/raw reply, private material, provider, retrieval, billing, social, Redis, Cloudflare, queue, storage, package, lockfile, or migration scope entered.
Task:
- Run PR509B hosted public index proof.
- Confirm hosted web/API include `b0a116bd` or later before product proof.
- You may create exactly one disposable same-owner public exhibit if hosted has no suitable proof row, then clean it up.
- Prove API list, cursor/limit, desktop and 390px `/encounters`, report-detail-only behavior, hidden/retracted/removed absence, public no-drift, latency, cleanup, and privacy.
- Wake MIMIR with PASS or BLOCK.
```
