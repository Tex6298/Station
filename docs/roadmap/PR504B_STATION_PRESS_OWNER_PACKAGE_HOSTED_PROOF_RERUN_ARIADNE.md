# PR504B - Station Press Owner Package Hosted Proof Rerun

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status: Open hosted rerun

## Source

PR504B blocked on hosted create:

`docs/roadmap/PR504B_STATION_PRESS_OWNER_PACKAGE_HOSTED_PROOF_RESULT.md`

PR504C repaired the suspected create failure and ARGUS accepted it:

`docs/roadmap/PR504C_STATION_PRESS_OWNER_PACKAGE_HOSTED_CREATE_FAILURE_REVIEW_RESULT.md`

MIMIR closed PR504C:

`docs/roadmap/PR504C_STATION_PRESS_OWNER_PACKAGE_HOSTED_CREATE_FAILURE_CLOSEOUT.md`

## Task

Rerun the hosted Station Press owner package proof on:

```text
https://stationweb-production.up.railway.app/studio/publishing
```

Use the existing staging owner account and hosted runtime truth. Do not print or
record cookies, tokens, credentials, API keys, env values, raw owner ids, raw
document ids, raw export/package ids, raw thread ids, raw seminar ids, raw
storage paths, signed URLs, SQL details, stack traces, private body/source text,
transcripts, prompts, provider payloads, or secret-shaped values.

## Required Order

1. Confirm hosted web/API are reachable and fresh enough to contain the PR504C
   repair. The repair code commit is `0e72d438`; any newer hosted commit that
   includes it is acceptable.
2. Sign in as the staging owner account already used for replay/owner proofs.
3. Navigate to `/studio/publishing`.
4. Use a package-ready owner publication from hosted fixtures.
5. Create or load exactly one Station Press metadata package through the owner
   UI/API path.
6. Prove authenticated package readback works.
7. Prove authenticated bundle files are exactly:

```text
README.md
manifest.json
manifest.md
```

8. Probe signed-out and cross-owner create/list/read/bundle behavior where
   possible without exposing raw ids or credentials. They must fail closed with
   bounded copy.
9. Inspect desktop and 390px mobile `/studio/publishing` layout.
10. Sample visible UI copy and package files for privacy/product drift.

If hosted deployment is not fresh enough for PR504C, stop and return the
deployment freshness blocker. Do not infer pass from local code.

## Pass Criteria

Return:

```text
PASS_PR504B_STATION_PRESS_OWNER_PACKAGE_HOSTED_PROOF
```

only if all are true:

- hosted web/API are fresh enough for PR504C;
- signed-in owner `/studio/publishing` renders Station Press package
  readiness/action/readback on desktop and 390px mobile;
- owner package create succeeds for one package-ready publication;
- authenticated readback works;
- authenticated bundle files are exactly `README.md`, `manifest.json`, and
  `manifest.md`;
- package files and visible copy show safe metadata/trust facts only;
- signed-out and cross-owner probes fail closed with bounded copy;
- visible UI and package files show no raw ids, package ids, private bodies,
  source rows, prompts, provider payloads, storage paths, signed URLs, tokens,
  cookies, env values, SQL details, stack traces, or secret-shaped values;
- the page does not claim public Station Press launch, public package URLs,
  public downloads, PDF/binary/original-file packaging, print/fulfillment,
  social dispatch, billing, provider calls, queues/workers, Redis, Cloudflare,
  storage objects, or public routes;
- desktop and 390px mobile have no horizontal overflow, clipped controls, or
  incoherent overlap.

## Block Criteria

Return:

```text
HOSTED_PR504B_RERUN_DEPLOYMENT_NOT_FRESH
```

if hosted web/API cannot be shown fresh enough for PR504C.

Return:

```text
BLOCK_PR504B_STATION_PRESS_OWNER_PACKAGE_HOSTED_PROOF
```

for any product, auth, privacy, UI, package-file, or hosted behavior defect.
Name the smallest DAEDALUS repair if code is at fault.

## Handoff

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR504C; missing optional seminar schedule schema should no
  longer block Station Press owner package creation.
- No hosted create/readback/bundle proof was run in ARGUS review.
Task:
- Rerun PR504B hosted proof on /studio/publishing after deploy.
- Prove owner create, authenticated readback, bundle files, signed-out and
  cross-owner fail-closed behavior, privacy boundaries, and desktop/390px fit.
- Wake MIMIR with pass, deployment freshness blocker, or concrete repair.
```
