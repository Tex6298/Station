# PR429 - Hosted API-Backed Export Rehearsal

Date opened: 2026-06-28

Opened by: MIMIR / A1

Owner: ARIADNE / A4

Status: complete - PASS WITH CAVEAT

## Why This Lane

PR428 accepted local API-backed owner export and bundle integrity proof for
persona archive, Developer Space archive, and Project manifest exports.

The remaining honest gap is hosted/user-facing readback: can a replay owner see
and verify the export posture on Railway without the product implying database
restore, full workspace backup, PDF/binary export, storage-object backup, or
production disaster recovery?

This is not a broad staging demo. It is a narrow hosted export rehearsal.

## Rehearsal Target

Use hosted Railway staging:

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`

Use the existing replay/staging owner credentials available to ARIADNE's
browser/tooling environment. If credentials are unavailable, mark the run
`BLOCKED` and wake MIMIR with only the missing credential label, not secret
values.

## Route Sequence

1. Preflight hosted freshness:
   - Web `/health`
   - Web `/health/deployment`
   - API `/health`
   - API `/health/deployment`
2. Sign in as the replay owner through the product UI.
3. Open private Studio:
   - `/studio`
   - `/studio/personas/:personaId`
4. Persona export readback:
   - open the persona export/status surface from the Studio/persona/archive
     route;
   - create or reuse an existing completed JSON/Markdown package only if the UI
     offers that existing accepted action;
   - open manifest and bundle readback when available.
5. Developer Space export readback:
   - open `/developer-spaces`;
   - open the accepted replay Developer Space owner/manage route;
   - verify any owner export/readback surface available there.
6. Project export readback:
   - open the user-facing Project/Developer Space/owner route where Project
     manifest export is exposed, if one exists;
   - if no user-facing Project export stop exists, use authenticated API
     readback only and record this as a product caveat, not a failure.
7. Mobile spot check:
   - repeat the key export/status readback path at 390px or equivalent mobile
     width;
   - verify no document-level horizontal overflow and no unusable controls.

## Pass Conditions

Pass if ARIADNE can show, without privacy leakage:

- owner-only export status/readback is reachable on hosted;
- completed packages clearly describe JSON/Markdown manifest/bundle scope;
- file names, sizes, hashes/hash prefixes, counts, and package status are
  understandable enough for a replay owner;
- persona, Developer Space, and Project export classes are either user-visible
  or honestly documented as API/readback-only for now;
- private/public separation stays clear;
- no raw UUID-shaped IDs, database URLs, tokens, cookies, secrets, provider
  payloads, prompts, completions, raw manifest bodies, private source bodies,
  or transcript bodies are visible in normal UI;
- the UI does not imply database backup/restore, managed backup, full workspace
  export, PDF/binary export, storage-object backup, production disaster
  recovery, RPO/RTO, or hosted backup readiness.

## Allowed Mutations

Allowed:

- sign-in/session restore;
- creating an owner-only export package only through an existing accepted export
  button or API route;
- opening existing manifest and bundle readback.

Not allowed:

- publish/retract/delete flows;
- billing, Stripe, token top-up, provider/model, Redis, Cloudflare, worker,
  queue, Supabase dashboard, SQL, storage, migration, or Railway config
  mutation;
- creating real private archive material;
- capturing or committing raw manifests, raw bundles, private bodies, secrets,
  IDs, cookies, tokens, provider payloads, prompts, or completions.

## Verdict Format

Return one of:

```text
PASS
PASS WITH CAVEAT
FAIL
BLOCKED
```

Wake MIMIR with:

- route labels checked;
- desktop/mobile result;
- export classes proven or caveated;
- any concrete broken control or misleading claim;
- exact next owner if repair is needed.

Wake DAEDALUS directly only if there is a concrete, reproducible product defect
with route, visible label, expected behavior, and actual behavior.

## Result

ARIADNE completed this rehearsal:

`docs/roadmap/PR429_HOSTED_API_EXPORT_REHEARSAL_RESULT.md`

Verdict: `PASS WITH CAVEAT`.
