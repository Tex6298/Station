# PR367 - Publishing Trust Readback Result

Owner: DAEDALUS
Date: 2026-06-26
Status: Accepted by ARGUS

## Result

DAEDALUS mapped the current publishing/document trust surfaces and shipped the
smallest safe no-config readback patch: public document pages now show a
single trust panel for document state, provenance/source boundary, version,
and linked discussion state, while the owner publishing dashboard now shows a
sanitized approval/destination/source/version trust line per document.

Changed files:

- `apps/web/app/space/[slug]/documents/[documentId]/page.tsx`
- `apps/web/components/studio/publishing-dashboard.tsx`
- `apps/web/lib/publishing.ts`
- `apps/web/lib/publishing-ui.test.ts`

## Surface Map

Current live publishing trust truth:

- `/documents/public/:id` returns readable public/unlisted/community documents
  according to existing visibility rules and includes document type, status,
  visibility, version, provenance type, source type/id/label, persona/space
  linkage, and discussion thread id.
- `/documents/:id` returns owner or readable document data and reports
  `access: owner | reader` for authenticated reads.
- `/documents/:id/versions` is owner-only prior version history; public readers
  receive only the current published copy.
- `/documents/:id/discussion` and `POST /documents/:id/discussion` enforce
  document visibility and owner-only discussion creation.
- `/publishing/approvals` and `/publishing/approvals/:id/transition` keep the
  owner approval queue state separate from document read routes.
- `/studio/publish` saves drafts, loads owner version history, and submits to
  the approval queue when Space and non-private visibility are ready.
- `/studio/publishing` lists owner documents, owner approval states, known
  destinations, source labels, and public links when available.
- Public Space cards and reading paths already show document type, provenance,
  and discussion cues.

Still future:

- schema changes, new approval/provenance tables, Station Press, PDF/print,
  social dispatch, scheduled publishing workers, checkout/order flow, queues,
  Redis, Cloudflare, provider changes, and broader editorial workflow.

## Implemented Slice

The public/owner document page now shows a `Document trust` panel:

- document state row: document type plus draft/published/archived status and
  visibility boundary;
- provenance row: normalized provenance label plus a sanitized source label
  when one exists;
- version row: current version and owner/public version-history boundary;
- discussion row: linked, checking, eligible, or not-open discussion state.

The trust panel states that a public document is a separate curated copy and
does not expose raw private source rows, archive chunks, prompts, owner IDs, or
prior private versions.

The owner publishing dashboard now shows a helper-backed trust line per row:

- approval state;
- destination;
- current version;
- sanitized source label when present;
- private-source-row boundary.

The helper layer now has focused coverage for:

- provenance labels;
- sanitized source-label readback for URLs, token labels, UUIDs, and secret
  shaped values;
- public document trust rows;
- owner draft/discussion trust rows;
- dashboard approval/destination/version trust line.

## Privacy Boundary

No API, publish transition, document visibility, discussion visibility,
version persistence, approval state machine, schema, migration, worker, queue,
provider, billing, auth, Railway, or Supabase config changed.

The new UI uses only document and approval data already loaded by existing
owner/public routes. It does not expose raw source bodies, raw archive chunks,
prior private version bodies to public readers, private source IDs, owner IDs,
prompts, provider payloads, secrets, or cross-owner data.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 122 tests passed, including publishing trust helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 20 public writing/story tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 2 document discussion route tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web lint` | Pass | Next lint reported no warnings or errors. |
| `git diff --check` | Pass | Whitespace check passed; Git emitted only CRLF normalization warnings. |

## ARGUS Review

Verdict: `PASS`.

ARGUS verified the publishing surface map against the current document,
discussion, version-history, and approval routes. The patch is readback-only:
the document trust panel and dashboard trust line use already-loaded
document/approval data, and public readers still receive only the current
readable document copy.

ARGUS accepted the privacy boundary after adding one narrow review hardening:
source-label sanitization now also redacts common hyphenated provider-key
shapes and AWS access-key-shaped labels before public/owner readback. The
helper coverage was extended for that case.

No API, publish transition, document visibility, discussion visibility,
version persistence, approval state machine, schema, migration, worker, queue,
provider, billing, auth, Railway, Supabase config, Station Press, PDF/social,
or broad editor behavior changed.

## Review Ask

ARGUS should verify:

- the publishing surface map matches current code truth;
- the public document trust panel does not imply new approval, publish,
  discussion, or version semantics;
- source labels are sanitized and no longer echoed as a loose raw line on the
  document page;
- the owner dashboard trust line reflects approval state without bypassing the
  existing queue;
- no API, persistence, auth, schema, worker, queue, social, Station Press, or
  public/private visibility behavior changed.
