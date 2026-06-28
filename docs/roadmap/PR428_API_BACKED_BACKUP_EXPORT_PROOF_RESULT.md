# PR428 - API-Backed Backup/Export Proof Result

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Date: 2026-06-28

Status: accepted by ARGUS after narrow test patch

## Verdict

```text
READY FOR ARGUS REVIEW
```

DAEDALUS completed the API-backed owner export and bundle integrity proof for
all three accepted export classes:

- persona archive;
- Developer Space archive;
- Project manifest.

PR427 local PostgreSQL tooling acquisition remains superseded. No `psql`,
`pg_dump`, Docker, Supabase CLI, database dump/restore, hosted SQL, Supabase
dashboard work, storage operation, hosted runtime change, schema/config/package
change, worker, queue, Redis, Cloudflare, provider, billing, or Stripe work was
performed.

## Proof Shape

The proof is local API/test-fixture coverage through the existing authenticated
export routes. It uses the in-memory Supabase test double and authenticated
owner/other-owner bearer sessions already used by `test:exports`.

Hosted/replay coverage was not attempted in this lane. Complete coverage comes
from local fixtures because PR428 is a boundary/integrity proof of the existing
API behavior, not a hosted backup or database restore rehearsal.

## Coverage

| Export class | Routes covered | Package readback | Bundle integrity | Owner boundary |
| --- | --- | --- | --- | --- |
| Persona archive | `POST /exports/persona/:personaId`, `GET /exports/persona/:personaId`, `GET /exports/:id`, `GET /exports/:id/bundle` | `persona_archive`, `json_markdown`, `completed`, owner-only | File set is `README.md`, `manifest.json`, `manifest.md`; bundle SHA map is recomputed from in-memory file contents | Anonymous create/list/bundle rejected; other-owner create/read/bundle blocked |
| Developer Space archive | `POST /exports/developer-spaces/:spaceId`, `GET /exports/developer-spaces/:spaceId`, `GET /exports/:id`, `GET /exports/:id/bundle` | `developer_space_archive`, `json_markdown`, `completed`, owner-only | File set is `README.md`, `manifest.json`, `manifest.md`; bundle SHA map is recomputed from in-memory file contents | Anonymous create/list/bundle rejected; other-owner create/read/bundle blocked |
| Project manifest | `POST /exports/projects/:projectIdOrSlug`, `GET /exports/projects/:projectIdOrSlug`, `GET /exports/:id`, `GET /exports/:id/bundle` | `project_manifest`, `json_markdown`, `completed`, owner-only | File set is `README.md`, `manifest.json`, `manifest.md`; bundle SHA map is recomputed from in-memory file contents | Anonymous list/bundle rejected; other-owner list/create/read/bundle blocked |

## Sanitized Evidence

No raw manifests, raw bundle bodies, private source text, transcript bodies,
prompts, completions, provider payloads, owner IDs, project IDs, source IDs,
database URLs, storage paths, cookies, tokens, secrets, or environment values
are copied into this result.

Sanitized readback proven by tests:

- Persona manifest schema: `station.persona.export.v1`.
- Persona summary counts: memory 1, canon 1, archive files 1, archive imports
  1, archived chats 1, continuity candidates 1, continuity records 1,
  integrity sessions 1, published documents 4, document versions 1,
  moderation reports 2.
- Persona trust flags keep provenance, publication states, document version
  history, continuity record visibility, owner report scope, and private source
  rows explicit.
- Developer Space manifest schema: `station.developer_space.export.v1`.
- Developer Space summary counts: nodes 1, events 2, snapshots 1, linked public
  documents 1.
- Developer Space trust flags keep API keys excluded and linked document
  references public-safe only.
- Project manifest schema: `station.project.export_manifest.v1`.
- Project summary counts: attached Developer Spaces 1, owner Project evidence
  refs 2, public Project evidence refs 1.
- Project trust flags keep owner-only posture, document-body omission, separated
  public references, and private linked source rows explicit.
- Project bundle readback uses the stored package manifest/Markdown. The test
  mutates live Project, Developer Space, evidence-link, document, node, event,
  snapshot, and usage rows after package creation and proves the bundle still
  returns stored package readback instead of live mutable source rows.

## Test Patch

DAEDALUS tightened `apps/api/src/routes/exports.test.ts` by adding:

- a shared bundle-integrity assertion that recomputes SHA-256 from each
  in-memory bundle file content and checks it against both the file entry and
  bundle integrity map;
- anonymous persona create/list/bundle rejection checks;
- anonymous Developer Space create/list/bundle rejection checks;
- shared integrity coverage for persona, Developer Space, and Project bundles.

The patch does not change product route behavior.

ARGUS added a narrow follow-up test patch during review:

- anonymous package readback rejection checks for persona, Developer Space, and
  Project export packages;
- anonymous Project export create rejection check;
- other-owner persona and Developer Space package-list rejection checks.

See `docs/roadmap/PR428_API_BACKED_BACKUP_EXPORT_PROOF_REVIEW_RESULT.md`.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 7 tests passed with PR428 bundle-integrity and anonymous-boundary assertions. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass | API TypeScript typecheck completed successfully. |
| `npm exec --yes pnpm@10.32.1 -- run test:projects` | Pass | 17 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 53 tests passed. |
| `git diff --check` | Pass | Passed with CRLF normalization warning only. |
| `git diff --cached --check` | Pass | Passed with CRLF normalization warnings only. |

## Residual Risk

This proves API-backed owner export package and bundle integrity for the three
accepted export classes under local fixtures. It does not prove database
backup/restore, managed backup redundancy, storage-object backup, original
binary/PDF/file backup, full workspace backup, hosted production backup
readiness, disaster recovery, RPO/RTO, or hosted data coverage.

## Wakeup

Wake ARGUS with `READY FOR ARGUS REVIEW`.

## ARGUS Review

ARGUS accepted PR428 after the narrow test patch:

`docs/roadmap/PR428_API_BACKED_BACKUP_EXPORT_PROOF_REVIEW_RESULT.md`
