# PR30 - Native Document Versioning Alpha

Date: 2026-06-18
Status: opened for A2 / DAEDALUS
Owner: DAEDALUS implements, ARGUS reviews. ARIADNE rehearses only if the Studio
or public document journey changes visibly enough to need a human-eye pass.

## Purpose

Move Station documents one step closer to serious authored works by adding a
bounded version-history alpha on top of the existing document, publishing,
approval, Space, Discover, and discussion surfaces.

This is the next product lane after PR29's live replay refresh found no backend
repair lane and no Cloudflare/Redis/provider/workers trigger.

## Current Truth

- Documents already support typed drafts/publishing with Station vocabulary:
  `essay`, `codex`, `manifesto`, `field_log`, `research`, `archive_note`, and
  `transcript`.
- The existing `documents` table already has a `version` field.
- Publishing approval queue tables and tests exist.
- Public documents can surface on Spaces/Discover and attach discussions.
- The gap is durable, inspectable version history, especially for `codex`
  documents and serious authored works.

## Scope

- Add a durable document-version history model if one does not already exist.
- Preserve prior title/body/summary/type/visibility/provenance/source metadata
  when an owner edits a document.
- Increment or otherwise reconcile `documents.version` when versioned fields
  change.
- Add owner-only API readback for document version history.
- Keep public reads on the current document version unless a prior public
  version route is explicitly and safely supported.
- Update exports enough that owner-only document/archive exports preserve
  version-history references or summaries if version rows exist.
- Add the smallest Studio authoring/readback surface needed to prove a Creator
  can see that a document, especially a `codex`, has prior versions.

## Explicit Non-Scope

- Do not build a full rich text editor.
- Do not build Station Press, PDF export, or binary package export.
- Do not add scheduled publishing, social dispatch, or live connectors.
- Do not add Cloudflare, Redis memory truth, provider routing, vector dimension
  changes, workers, Stripe changes, or broad UI redesign.
- Do not expose private prior versions publicly by accident.

## Acceptance

- A Creator-tier owner can create a typed draft, edit it, and retain an
  inspectable prior version.
- A `codex` document can be versioned without losing prior title/body/summary
  and provenance details.
- Other users cannot read private/unowned version rows.
- Public reads remain visibility-safe and point to the intended current public
  document.
- Exports do not silently drop version-history knowledge once version rows
  exist.

## Validation

Run the narrow gate touched by the implementation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:continuity-publication
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 --filter @station/api build
git diff --check
```

If a migration is added, include migration/RLS tests or static SQL assertions
matching the repo's existing test style.

## ARGUS Review Ask

ARGUS should hostile-review:

- owner-only version reads;
- public/private visibility boundaries for prior versions;
- update/publish behavior for current document versus version rows;
- export preservation and no private leakage;
- whether the UI honestly communicates current versus prior version state;
- whether this stays a versioning alpha rather than a rich-editor/product
  rewrite.

## Wake Discipline

DAEDALUS should wake ARGUS with:

- files changed;
- schema/API/UI behavior changed;
- versioning semantics;
- validation commands/results;
- whether ARIADNE should rehearse visible authoring/version history.
