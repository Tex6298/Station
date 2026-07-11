# PR508B - Owner Encounter Public Exhibit Metadata Hosted Proof

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date: 2026-07-11

Status: Open hosted proof

## Source

ARGUS accepted PR508A:

`docs/roadmap/PR508A_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_REVIEW_RESULT.md`

MIMIR local closeout and hosted migration prep:

`docs/roadmap/PR508A_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_REVIEW_CLOSEOUT.md`

## Deployment Floor

Prove the hosted web/API deployment includes PR508A code commit:

```text
acb63c4f review: accept PR508A public exhibit metadata
```

If Railway has not deployed this commit or a later main commit, wait/retry or
return a deployment freshness blocker. Do not use local dev proof as hosted
proof.

## Hosted Migration State

MIMIR already applied and proved hosted migration `076`:

```text
ledger=20260711104902 / 076_persona_encounter_public_exhibits
columns=18
constraints=12
policies=4
triggers=2
reportTarget=1
tags_ok=true
tags_null=false
```

Re-probe migration `076` before product proof. If the hosted API still cannot
see the new schema, record a schema-cache or deployment blocker instead of
forcing product proof.

## Proof Checklist

Use the live staging target. Prove from a human-eye/browser route where
possible, backed by bounded API probes where needed.

Required checks:

- hosted web/API health and deployment freshness pass;
- hosted migration `076` re-probe passes;
- owner auth works, non-owner auth works, and signed-out context is available;
- owner can create or use one same-owner private candidate artifact;
- desktop owner Studio can publish one metadata-only public exhibit from that
  candidate artifact with newly authored public title, summary, and tags;
- `390px` owner Studio can publish or verify the same publish/retract controls
  without horizontal overflow or clipped controls;
- signed-out public `/encounters/[slug]` shows only metadata, safe same-owner
  display snapshots, provenance, and sign-in-to-report copy;
- signed-in report creates a `persona_encounter_public_exhibit` report without
  raw ids or private material in readback;
- admin remove hides the public route and admin restore reopens only a removed
  published exhibit;
- owner retract hides the public route;
- moderation remove/restore cannot override an owner-retracted exhibit;
- signed-out, cross-owner, non-candidate, malformed, forbidden-field, and
  cross-owner persona publish attempts fail closed;
- public Space/persona/Discover/search/forum samples show no private encounter
  artifact or exhibit surfacing outside the dedicated exhibit route;
- cleanup retracts/removes the exhibit and deletes any proof artifact created;
- proof output is sanitized.

If the hosted proof environment lacks an admin-capable account for the
moderation checks, return a concrete admin-role blocker instead of passing.

## Public/Private Boundary

The public route may show only:

- public exhibit title;
- public summary/context note;
- public tags;
- safe same-owner persona display snapshots;
- public slug/status/provenance;
- report or sign-in-to-report controls.

The public route, report readback, and proof output must not show:

- transcripts;
- raw generated responder replies;
- owner-selected excerpts;
- private setup;
- private curation title, note, or tags;
- raw owner ids, persona ids, or private session ids;
- provider payloads;
- model config;
- prompt bodies;
- private context;
- source bodies;
- SQL details;
- stack traces;
- cookies;
- tokens;
- env values;
- secret-shaped strings;
- cross-owner persona words.

## Forbidden During Proof

Do not add code, migrations, seeds, package files, lockfiles, or new product
behavior in this lane. If proof finds a defect, report the narrow blocker and
wake MIMIR.

Do not print or commit credentials, cookies, browser storage state, raw ids,
private bodies, generated replies, provider details, SQL details, screenshots,
traces, videos, or secret-shaped values.

## Result Required

Write:

`docs/roadmap/PR508B_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_HOSTED_PROOF_RESULT.md`

Then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR508B hosted proof for owner encounter public exhibit metadata.
- Include pass/block verdict, deployment freshness, migration 076 proof, desktop/390px owner publish/retract result, signed-out public route result, report/takedown result, boundary/no-drift result, and cleanup result.
Task:
- Close PR508B if passed, or route the narrow blocker to the correct owner.
```
