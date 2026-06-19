# PR64 Archive Import Review Rehearsal - ARIADNE Result

Date: 2026-06-19
Agent: A4 / ARIADNE
Verdict: Pass

## Runtime Checked

- Route: signed owner Archive tab at `/studio/personas/:personaId/files`
- Target persona: `Station Replay Persona`
- Web/API deployment identity:
  `b2b9dafc2a5541789a6a41a7ea05190c05679aba`
- Account mode: signed replay owner via local env
- Browser: Chrome/CDP
- Desktop viewport: `1365x900`
- Mobile viewport: `390x844`

No credentials, tokens, cookies, raw uploaded source bodies, raw trace payloads,
raw ids, URLs, bearer values, token assignments, or secret-shaped values are
included in this result.

## Result

ARIADNE accepts PR64 from the signed owner UI rehearsal.

The final run checked the two current archive paths separately:

- pasted import through the visible `Archive Import` form completed and refreshed
  the `Archive Import Library`;
- parsed ChatGPT file upload through the existing owner-scoped
  `/persona-files/persona/:personaId/upload-url` and `register` flow created
  the Import Review Memory and Canon candidates.

This matches current runtime behavior: pasted `/imports/chat` refreshes the
archive job/library state, while parsed uploaded files create Import Review
candidates.

The final reviewed source was
`ariadne-pr64-review-2026-06-19T06-50-17-909Z.json`. Signed source-label API
readback after the browser actions showed:

- Memory candidate: `accepted`, with ARIADNE's edited Memory text;
- Canon candidate: `rejected`, with the original server-returned candidate text;
- the rejected Canon card did not keep the stale local edit visible.

Across the final run, the persona summary moved from:

- memory count: `11` to `14`
- canon count: `3` to `3`

The Memory increase came from the pasted import, uploaded archive ingest, and
accepted Memory candidate. The Canon count stayed stable because the Canon
candidate was rejected.

A preliminary selector probe seeded one extra pending PR64 review pair before
the final source-specific pass. The acceptance above is tied to the final
source-label readback listed here.

## Desktop

Desktop passed:

- `Archive Trust`, `Import Review`, `Archive Import`, and `Archive Import
  Library` all rendered;
- the Import Review overview stayed readable and showed Pending, Reviewed,
  Memory, and Canon metrics;
- candidate cards showed Memory/Canon labels, private import source type,
  source/destination/state readback, and owner-readable preservation copy;
- Memory copy explained that accepting writes edited text to Memory;
- Canon copy explained that accepting writes edited text to Canon;
- rejection copy explained that rejecting keeps the candidate out of runtime
  material while preserving the private source;
- pasted import completion made the pasted source visible in the library;
- uploaded parsed import completion made the review source visible in the review
  cards after refresh;
- `Accept with edits` changed the Memory card to `Accepted to Memory`;
- `Reject` changed the Canon card to `Rejected; source preserved`;
- no document-level horizontal overflow;
- no offscreen controls.

## Mobile

Mobile passed at `390px`:

- all Archive sections remained present;
- Import Review cards remained readable before review;
- source/destination/state readback collapsed without horizontal overflow;
- Memory/Canon destination copy and reject-preservation copy stayed readable;
- the accepted Memory and rejected Canon states remained visible after reload;
- no document-level horizontal overflow;
- no offscreen controls.

## Privacy

The Archive tab kept the PR64 privacy boundary in new readback surfaces:

- no raw UUID-shaped IDs were visible;
- no URLs, bearer values, token assignments, or secret-shaped values were
  visible;
- no raw trace/API payload fields were visible;
- no unexpected raw transcript/source body display was added beyond existing
  owner-editable candidate review text.

This preserves the intended Station UX: archive is trust infrastructure, and
Import Review explains promotion into Memory/Canon without turning private
source material or operational internals into exposed page content.

## Scope

No global archive redesign, parser/OAuth work, background job/queue
infrastructure, export behavior, schema, public archive route, raw trace/API
payload display, Redis, Cloudflare, Project work, hosted runtime, worker,
billing/quota, broad redesign, or DexOS work was added by ARIADNE.

## Validation

- `node --check scripts/tmp-pr64-archive-import-review-rehearsal.mjs`
- `node scripts/tmp-pr64-archive-import-review-rehearsal.mjs`
- Signed owner API source-label readback for the final reviewed source
- Signed Chrome/CDP desktop Archive tab checks
- Signed Chrome/CDP pasted import refresh check
- Signed Chrome/CDP signed file upload/register review-candidate setup
- Signed Chrome/CDP Memory `Accept with edits` and Canon `Reject` checks
- Signed Chrome/CDP `390px` Import Review checks before and after review
- Privacy checks for raw IDs, URLs, bearer values, token assignments, secrets,
  and trace/API payload markers
- Temporary local probe script was removed before commit.
