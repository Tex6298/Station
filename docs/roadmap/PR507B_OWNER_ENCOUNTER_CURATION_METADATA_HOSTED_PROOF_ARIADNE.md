# PR507B - Owner Encounter Curation Metadata Hosted Proof

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date: 2026-07-11

Status: Open hosted proof

## Source

ARGUS accepted PR507A:

`docs/roadmap/PR507A_OWNER_ENCOUNTER_CURATION_METADATA_REVIEW_RESULT.md`

MIMIR local closeout and hosted migration prep:

`docs/roadmap/PR507A_OWNER_ENCOUNTER_CURATION_METADATA_REVIEW_CLOSEOUT.md`

## Deployment Floor

Prove the hosted web/API deployment includes PR507A code commit:

```text
a23633f9 review: accept PR507A curation metadata
```

If Railway has not deployed this commit or a later main commit, wait/retry or
return a deployment freshness blocker. Do not use local dev proof as hosted
proof.

## Hosted Migration State

MIMIR already applied and proved hosted migration `075`:

```text
ledger=20260711094206 / 075_persona_encounter_private_session_curation
columns=5/5
constraints=4/4
tags_ok=true
tags_null=false
```

Re-probe migration `075` before browser/API proof. If the hosted API still
cannot see the new schema, record a schema-cache or deployment blocker instead
of forcing product proof.

## Proof Checklist

Use the live staging target. Prove from a human-eye/browser route where
possible, backed by bounded API probes where needed.

Required checks:

- hosted web/API health and deployment freshness pass;
- owner auth works, and a non-owner or signed-out context is available for
  boundary probes;
- signed-in owner can create or use one saved private same-owner encounter
  artifact;
- desktop owner Studio flow can add, edit, and clear owner title,
  summary/note, tags, and the private candidate/planning marker;
- `390px` owner Studio flow can add, edit, and clear the same metadata without
  horizontal overflow or clipped controls;
- owner list/detail readback shows curation metadata without raw owner ids, raw
  persona ids, raw session ids, provider details, prompts, SQL details, or
  public/share controls;
- signed-out curation read/update probes fail closed with bounded auth errors;
- cross-owner curation read/update probes fail closed with bounded `404` and no
  row-existence leak;
- sampled public Space/persona routes show no private encounter artifact,
  curation metadata, owner setup, responder text, or public/shareable encounter
  controls;
- cleanup deletes the test artifact and removes owner readback;
- proof output is sanitized.

## Copy/Product Boundaries

Visible UI may call the marker:

- private candidate;
- private planning marker;
- owner-only planning flag.

Visible UI must not imply:

- publish;
- share;
- public exhibit;
- public preview;
- moderation approval;
- cross-owner consent;
- provider-generated summary;
- exact future save/publish behavior.

## Forbidden During Proof

Do not print or commit:

- connection strings, passwords, tokens, service keys, cookies, browser storage
  state, env values, or bearer values;
- raw owner ids, persona ids, session ids, SQL details, stack traces, prompt or
  setup bodies, generated responder text, provider payloads, screenshots,
  traces, videos, or private row bodies.

Do not add code, migrations, seeds, package files, lockfiles, or new product
behavior in this lane. If proof finds a defect, report the narrow blocker and
wake MIMIR.

## Result Required

Write:

`docs/roadmap/PR507B_OWNER_ENCOUNTER_CURATION_METADATA_HOSTED_PROOF_RESULT.md`

Then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR507B hosted proof for owner encounter curation metadata.
- Include pass/block verdict, deployment freshness, migration 075 proof, desktop/390px owner flow result, auth/cross-owner/public no-drift result, and cleanup result.
Task:
- Close PR507B if passed, or route the narrow blocker to the correct owner.
```
