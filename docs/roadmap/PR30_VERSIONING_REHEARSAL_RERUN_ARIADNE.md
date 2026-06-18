# PR30 Versioning Rehearsal Rerun - ARIADNE Result

Date: 2026-06-18
Agent: A4 / ARIADNE
Verdict: Pass for the PR30 Studio version-history surface

## Runtime Checked

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`
- Web/API deployment identity: `87501eb4ec1bd37c14d5a3b19c8967b98aed8ec6`
- API deployment readiness: `ready:true`
- Migration proof label: `025-037 / public_schema_object_rpc_and_document_version_proof`

The live readiness response now proves `public.documents.version` and
`public.document_versions` through the public object/RPC proof.

## Rehearsal Document

ARIADNE used the staging replay owner without printing credentials.

- Document: `dc082978-f63b-4a7b-b2bb-700a94bf37e0`
- Space-backed `codex` document with `unlisted` visibility
- `GET /documents/:id`: `200`, `version: 3`
- `GET /documents/:id/versions`: `200`, `currentVersion: 3`
- Prior version rows: `v2`, `v1`
- Publishing approval queue entry: present after `Send for review`

The owner-only API version rows preserve prior body text as intended. The browser
panel did not render the raw prior body markers.

## Browser Flow

Desktop Chrome/CDP pass:

- Loaded `/studio/publish?documentId=dc082978-f63b-4a7b-b2bb-700a94bf37e0`.
- Existing document loaded with `Version History`.
- `Save draft` changed title/body and advanced the visible label to
  `Current version v3; 2 prior versions saved from v1 to v2.`
- `Send for review` completed and the approval queue contained the document.
- Version rows displayed `v2` and `v1` with title, type, and visibility only.
- No document-level horizontal overflow.
- No prior body marker appeared in visible text, form controls, or the version
  panel.

375px Chrome/CDP pass:

- Reloaded the same document at `375x812`.
- Version label still showed current `v3` and two prior versions.
- Prior rows stayed readable as title/type/visibility rows.
- `document.scrollWidth` and `document.clientWidth` both measured `375`.
- No prior body marker appeared in visible text, form controls, or the version
  panel.

## Visual Defects

No blocking visual defects were found in the PR30 version-history panel.

Non-blocking existing chrome caveat: at 375px, the global top nav has offscreen
`My Space` and `Developer` link bounds, but it does not create document-level
horizontal scrolling and the Studio shell still exposes its `Menu` affordance.
This is outside the PR30 version-history panel.

## Validation

- `curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment`
- `curl.exe -fsS --max-time 30 https://stationweb-production.up.railway.app/health/deployment`
- Direct signed API probe for document read/version-history/approval readback
- Chrome/CDP desktop pass at `1440x1100`
- Chrome/CDP mobile pass at `375x812`
