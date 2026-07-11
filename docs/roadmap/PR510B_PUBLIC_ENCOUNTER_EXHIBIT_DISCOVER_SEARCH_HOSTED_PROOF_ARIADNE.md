# PR510B - Public Encounter Exhibit Discover Search Hosted Proof

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status:

```text
OPEN_HOSTED_DISCOVER_SEARCH_PROOF
```

## Source

PR510A implementation:

`docs/roadmap/PR510A_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_GROUP_RESULT.md`

ARGUS acceptance:

`docs/roadmap/PR510A_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_GROUP_REVIEW_RESULT.md`

MIMIR closeout:

`docs/roadmap/PR510A_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_GROUP_CLOSEOUT.md`

## Purpose

Prove the deployed public encounter exhibit Discover search group on Railway.

This is a hosted proof lane, not an implementation lane.

## Deployment Floor

Before testing, confirm hosted web/API include PR510A implementation commit or
later:

```text
ad12809c feat: add encounter exhibit search group
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
2. `/discover/search?q=<public title token>` returns `200` and includes the
   proof row under `publicEncounterExhibits`.
3. Empty search returns a bounded empty `publicEncounterExhibits` group.
4. Public summary search returns the proof row, or any intentionally deferred
   match class is recorded before closeout.
5. Public tag search returns the proof row, or any intentionally deferred match
   class is recorded before closeout.
6. Initiator display snapshot search returns the proof row, or any
   intentionally deferred match class is recorded before closeout.
7. Responder display snapshot search returns the proof row, or any
   intentionally deferred match class is recorded before closeout.
8. Search result payloads are metadata-only and route only to
   `/encounters/[slug]`.
9. The public search group label is `Encounter Exhibits`.
10. Malformed, removed, retracted, wrong-schema, missing-source, and deleted
    exhibits stay absent.
11. Discover feed/rising/featured, public persona pages, public Space pages,
    forum/Salon, public document, Station Press, and writing samples still do
    not surface encounter exhibits.
12. Desktop Discover search rendering fits without overlap, clipped controls,
    or horizontal overflow.
13. `390px` Discover search rendering fits without overlap, clipped controls,
    or horizontal overflow.
14. Hosted search latency is acceptable for protected alpha, or the result
    recommends a separate public search-index or normalization repair.
15. Cleanup deletes any proof artifact and proof report rows created by the
    proof.

## Pass Conditions

PR510B may pass only if:

- hosted deployment includes PR510A or later;
- `/discover/search` exposes only the accepted `publicEncounterExhibits` group
  behavior;
- search uses already-public metadata fields only;
- payloads remain metadata-only;
- results route only to `/encounters/[slug]`;
- hidden, removed, retracted, malformed, wrong-schema, missing-source, and
  deleted rows stay absent;
- no public no-drift surface starts showing encounter exhibits outside the
  accepted search group and `/encounters`;
- desktop and mobile search UI fit;
- latency is acceptable for protected alpha or the only follow-up is a narrow
  public search-index/normalization repair;
- cleanup succeeds;
- proof output is sanitized.

## Block Conditions

Stop and wake MIMIR if any of these occur:

- hosted deployment is stale or not ready;
- `/discover/search` returns a server error;
- payload contains raw owner ids, source persona ids, private session ids,
  private artifact ids, private setup text, generated reply text, transcript
  excerpts, private curation, prompts, provider details, source bodies,
  report/admin internals, or cross-owner words;
- result hrefs route anywhere other than `/encounters/[slug]`;
- malformed, removed, retracted, wrong-schema, missing-source, or deleted rows
  appear;
- Discover feed/rising/featured, public persona, public Space, forum/Salon,
  Station Press, public document, or writing samples show encounter exhibits;
- desktop or `390px` search UI breaks;
- cleanup cannot remove proof artifacts.

## Recording Rules

Record statuses, bounded error codes, route names, deployment commit prefix,
latency timings, sanitized counts, which public-field query classes passed or
were deferred, and pass/fail conclusions.

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
docs/roadmap/PR510B_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_HOSTED_PROOF_RESULT.md
```

Include:

- pass/block verdict;
- hosted deployment floor;
- whether a proof artifact was created;
- empty search verdict;
- title, summary, tag, initiator display, and responder display query verdicts;
- metadata-only payload verdict;
- route-only-to-encounter verdict;
- hidden/malformed/retracted/removed/missing-source/deleted absence verdict;
- public no-drift verdict;
- desktop and `390px` Discover search rendering verdict;
- hosted search latency note;
- cleanup verdict;
- privacy/secret scan result;
- final wakeup.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- ARGUS accepted PR510A public encounter exhibit Discover search group.
- PR510A adds only a dedicated `/discover/search` group named `Encounter Exhibits` with key `publicEncounterExhibits`.
- Search uses public title, summary, tags, and same-owner display snapshots only.
- Result payloads remain metadata-only and route only to `/encounters/[slug]`.
- Discover feed/rising/featured, public persona, public Space, forum/Salon, Station Press/public documents, private material, provider/retrieval, billing/social/storage, Redis/Cloudflare, queue/worker, package/lockfile, migration, and search-index scope remain out.
Task:
- Run PR510B hosted Discover search proof.
- Confirm hosted web/API include `ad12809c` or later before product proof.
- You may create exactly one disposable same-owner public exhibit if hosted has no suitable proof row, then clean it up.
- Prove empty search, public-field matching, metadata-only payloads, `/encounters/[slug]` routing, unsafe-row absence, public no-drift, desktop and 390px rendering, latency, cleanup, and privacy.
- Wake MIMIR with PASS or BLOCK.
```
