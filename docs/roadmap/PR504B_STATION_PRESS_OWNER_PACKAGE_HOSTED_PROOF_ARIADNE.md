# PR504B - Station Press Owner Package Hosted Proof

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status: Open hosted proof

## Source

ARGUS accepted PR504A after a narrow review patch:

`docs/roadmap/PR504A_STATION_PRESS_OWNER_PACKAGE_CONTRACT_REVIEW_RESULT.md`

Verdict:

```text
ACCEPT_PR504A_STATION_PRESS_OWNER_PACKAGE_CONTRACT_IMPLEMENTATION
```

Because visible `/studio/publishing` behavior changed and owner package
creation now exists, hosted desktop and 390px mobile proof is required before
MIMIR closes PR504A.

## Task

Run a hosted proof for the Station Press owner package contract on:

```text
https://stationweb-production.up.railway.app/studio/publishing
```

Use the existing staging owner account and hosted runtime truth. Do not print or
record cookies, tokens, credentials, API keys, env values, raw owner ids, raw
document ids, raw export/package ids, raw thread ids, raw seminar ids, raw
storage paths, signed URLs, SQL details, stack traces, private body/source text,
transcripts, prompts, provider payloads, or secret-shaped values.

## Required Order

1. Confirm hosted web/API are reachable and fresh enough to contain the PR504A
   accepted implementation and ARGUS patch. Record only non-secret readiness
   facts and commit/route freshness if visible through existing health routes.
2. Sign in as the staging owner account already used for replay/owner proofs.
3. Navigate to `/studio/publishing`.
4. Find a package-ready owner publication if one exists in hosted fixtures.
5. Create or load exactly one Station Press metadata package through the owner
   UI/API path.
6. Confirm the create/readback path uses only authenticated owner export
   behavior and no provider, social, billing, storage, queue, worker, Redis,
   Cloudflare, public route, or public download behavior.
7. Read the package and bundle through authenticated owner routes.
8. Probe signed-out and cross-owner create/list/read/bundle behavior where
   possible without exposing raw ids or credentials. They must fail closed with
   bounded copy.
9. Inspect desktop and 390px mobile `/studio/publishing` layout.
10. Sample visible UI copy and package file readback for privacy/product drift.

If hosted deployment is not fresh enough for PR504A, stop and return the
deployment freshness blocker. Do not infer pass from local code.

## Pass Criteria

Return:

```text
PASS_PR504B_STATION_PRESS_OWNER_PACKAGE_HOSTED_PROOF
```

only if all are true:

- hosted web/API are fresh enough for PR504A and the ARGUS patch;
- signed-in owner `/studio/publishing` renders Station Press package
  readiness/action/readback on desktop and 390px mobile;
- owner package create/readback works for a package-ready publication or, if no
  package-ready fixture exists, the page honestly shows bounded not-ready copy
  and ARIADNE names the fixture limitation;
- authenticated package files are exactly `README.md`, `manifest.json`, and
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
HOSTED_PR504B_DEPLOYMENT_NOT_FRESH
```

if hosted web/API cannot be shown fresh enough for PR504A.

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
- ARGUS accepted PR504A after a narrow fail-closed review patch.
- Station Press owner package creation/readback and /studio/publishing visible
  behavior changed.
Task:
- Run PR504B hosted proof on /studio/publishing.
- Prove fresh deploy, owner create/readback or honest fixture limitation,
  signed-out/cross-owner fail-closed behavior, package file privacy, and
  desktop/390px fit.
- Wake MIMIR with pass, deployment freshness blocker, or concrete repair.
```
