# PR503B - Publication Manifest Hosted Proof

Owner: ARIADNE / A4

Date: 2026-07-07

## Source

PR503A was implemented by DAEDALUS:

`docs/roadmap/PR503A_PUBLICATION_MANIFEST_CONTRACT_RESULT.md`

ARGUS accepted PR503A:

`docs/roadmap/PR503A_PUBLICATION_MANIFEST_CONTRACT_REVIEW_RESULT.md`

ARGUS requires hosted desktop and 390px mobile proof before MIMIR closes the
implementation because `/studio/publishing` visible UI changed.

## Task

Run a hosted human-eye proof of the owner-only Station Press publication
manifest readback on:

```text
https://stationweb-production.up.railway.app/studio/publishing
```

Use the existing staging owner account and hosted runtime truth. Do not print or
record cookies, tokens, credentials, API keys, env values, raw owner ids, raw
document ids, raw package ids, raw thread ids, raw seminar ids, raw storage
paths, signed URLs, SQL details, stack traces, private body/source text,
transcripts, prompts, or provider payloads.

## Required Order

1. Confirm hosted web/API deployment is reachable and fresh enough to contain
   PR503A. Record only non-secret readiness facts and commit/route freshness if
   visible through the existing health surface.
2. Sign in as the staging owner account already used for replay/owner proofs.
3. Navigate to `/studio/publishing`.
4. Inspect the visible owner-only publication manifest contract readback for
   the hosted fixture states available on the page.
5. Verify the page does not need mutation clicks for the proof. Do not click
   package creation, export creation, provider, social dispatch, job start,
   billing, or destructive controls.
6. Capture/inspect desktop layout and 390px mobile layout.
7. Sample visible copy for privacy/product-boundary drift.

## Pass Criteria

Return:

```text
PASS_PR503B_PUBLICATION_MANIFEST_HOSTED_PROOF
```

only if all are true:

- signed-in owner `/studio/publishing` renders the PR503A manifest contract
  details block for hosted fixture states available on the page;
- the readback is owner-only, metadata/readback-only, and does not present a
  generated package, public URL, download, share link, PDF, binary archive,
  print/fulfillment, commercial packaging, ticketing, RSVP, reminder, queue
  job, provider call, social dispatch, or hosted Station Press launch claim;
- visible copy contains no raw ids, private bodies, source rows, transcripts,
  prompts, provider payloads, storage paths, signed URLs, SQL details, stack
  traces, hosted logs, cookies, tokens, env values, or secret-shaped values;
- desktop and 390px mobile have no horizontal overflow, clipped controls,
  overlapping labels, or illegible manifest readback;
- the proof does not mutate publishing state, create packages, create exports,
  trigger providers, start background jobs, touch billing, or dispatch social
  posts.

## Block Criteria

Return:

```text
BLOCK_PR503B_HOSTED_PROOF_WITH_CONCRETE_REASON
```

for any defect. Include the smallest DAEDALUS repair if code is at fault.

Return:

```text
HOSTED_PR503B_DEPLOYMENT_NOT_FRESH
```

if hosted web/API cannot be shown fresh enough for PR503A.

## Handoff

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR503A as an owner-only Station Press publication manifest
  contract implementation.
- Visible /studio/publishing UI changed, so hosted desktop and 390px mobile
  proof is required before MIMIR can close PR503A.
Task:
- Run PR503B hosted proof on /studio/publishing.
- Do not click mutation/provider/social/billing/job controls.
- Wake MIMIR with pass, deployment freshness blocker, or concrete repair.
```
