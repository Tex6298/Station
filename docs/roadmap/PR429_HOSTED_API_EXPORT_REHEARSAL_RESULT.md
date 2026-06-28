# PR429 - Hosted API-Backed Export Rehearsal Result

Owner: ARIADNE / A4

Date: 2026-06-28

Status: complete - PASS WITH CAVEAT

## Verdict

```text
PASS WITH CAVEAT
```

ARIADNE completed the hosted Railway export rehearsal against the production
web and API origins. The run used replay owner sign-in through the product UI,
then verified hosted owner-only export posture for persona archive, Developer
Space archive, and Project manifest packages.

The caveat is product-surface specific: Developer Space manage exposes
owner-only export creation/status, but not manifest or bundle readback controls.
The Developer Space manifest and bundle were verified through the authenticated
export API, so this is a UX/product caveat rather than a backend failure.

## Hosted Preflight

| Surface | Route | Result |
| --- | --- | --- |
| Web | `/health` | Pass, HTTP 200 |
| Web | `/health/deployment` | Pass, HTTP 200, deployment identity ready |
| API | `/health` | Pass, HTTP 200 |
| API | `/health/deployment` | Pass, HTTP 200, deployment identity/readiness available |

The deployment endpoint readback was treated as readiness evidence only. This
result does not infer stale or fresh code changes from a skipped Railway deploy
when Railway reports no watched-file changes.

## Route Coverage

| Route label | Result |
| --- | --- |
| `/studio` | Product UI sign-in restored a private Studio session. |
| `/studio/personas/:personaId` | Persona workspace reachable. |
| `/studio/personas/:personaId/files` | Persona export/status surface reachable. |
| `/developer-spaces` | Developer Spaces index reachable. |
| `/developer-spaces/:slug/manage` | Owner manage route reachable. |
| `/projects` | Owner Projects index reachable. |
| `/projects/:slug` | Project export surface reachable. |

## Export Surface Results

| Export class | Hosted surface | Result |
| --- | --- | --- |
| Persona archive | `/studio/personas/:personaId/files` | Pass. UI showed `Export Trust`, `Persona export status`, owner-only JSON/Markdown copy, package counts, completed status, `View manifest`, `View portable bundle`, `Manifest readback`, `Portable bundle readback`, `README.md`, `manifest.json`, `manifest.md`, and `sha256`. |
| Developer Space archive | `/developer-spaces/:slug/manage` plus API readback | Pass with caveat. UI showed `Exports`, owner-only JSON/Markdown package copy, `Create export`, private-readback language, not-public-download language, and completed status. Manifest and bundle readback were API-readable, but not exposed as manage-page controls. |
| Project manifest | `/projects/:slug` | Pass. UI showed `Owner Export`, `Project export`, owner-only Project manifest copy, `Create manifest`, package counts, completed status, `Manifest readback`, `Bundle file list`, `README.md`, `manifest.json`, `manifest.md`, and `sha256`. |

Sanitized package readback confirmed:

- persona archive package: `persona_archive`, `json_markdown`, `completed`,
  11 included sections, manifest present, owner-only bundle readback;
- Developer Space archive package: `developer_space_archive`,
  `json_markdown`, `completed`, 6 included sections, manifest present,
  owner-only bundle readback;
- Project manifest package: `project_manifest`, `json_markdown`, `completed`,
  5 included sections, manifest present, owner-only bundle readback;
- all three bundle classes returned exactly `README.md`, `manifest.json`, and
  `manifest.md` with non-zero byte counts and 12-character SHA-256 prefixes in
  the user/API readback evidence.

## Privacy And Claim Boundaries

Normal UI text was scanned before opening manifest/bundle details on the persona,
Developer Space, Project, and mobile persona export surfaces.

Result:

- no raw UUID-shaped IDs visible in normal UI;
- no secret-shaped values visible in normal UI;
- no database URLs, credential-shaped strings, provider payloads, prompts,
  completions, raw private source bodies, or transcript bodies captured or
  committed;
- no UI claim of database backup/restore, managed backup, full workspace
  export, PDF/binary export, storage-object backup, production disaster
  recovery, RPO/RTO, or hosted backup readiness.

Raw manifests and bundle bodies were opened only to prove owner readback
availability and were not copied into this result.

## Mobile Spot Check

At 390px width, `/studio/personas/:personaId/files` showed:

- `Persona export status`;
- `Create JSON/Markdown manifest`;
- package counts;
- completed status.

Document-level width stayed bounded: client width and scroll width were both
390px, with no horizontal overflow.

## Allowed Mutations

The rehearsal stayed inside the PR429 mutation budget:

- product UI sign-in/session;
- owner-only export package/readback actions through existing product/API
  surfaces.

No publish, retract, delete, billing, Stripe, token-credit, provider, Redis,
Cloudflare, worker, queue, Supabase dashboard, Railway config, storage, private
archive creation, or schema/config mutation was performed.

## Residual Caveat

Developer Space owner manage should eventually expose the same manifest and
bundle readback controls that persona and Project export surfaces expose. This
does not block PR429 because the Developer Space class is honestly
API/readback-only for manifest/bundle details today, and the manage UI already
communicates owner-only JSON/Markdown packages as private readbacks, not public
downloads.

## Wakeup

Wake MIMIR with `PASS WITH CAVEAT`.
