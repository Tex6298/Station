# PR12 - Private Archive Search

Date: 2026-06-17
Status: opened for A2 / DAEDALUS
Owner: DAEDALUS implementation, ARGUS review, ARIADNE human rehearsal only if
the Studio archive journey changes enough to need browser eyes.

## Why This Lane Is Next

PR10 made Studio publishing use the real document API. PR11 added the approval
queue and private-tier safety guards. The next unfinished launch-core item from
`docs/roadmap/STATION_LAUNCH_CORE_PATCH.md` is private archive search.

Do not open the worker lane just because the launch-core patch lists it. PR6
already accepted "background jobs only if replay/import proves pain" as the
current rule. This lane should stay focused on live owner-scoped archive search.

## Goal

Make `/studio/archive` search a real owner-scoped backend search across private
archive sources, instead of only client-side filtering the first summary page
returned by `/imports/archive`.

The result should let a replay owner prove: "Station can find my private
documents, memory, continuity, archive, files, imports, and archived chats
without exposing them to public Discover or another user."

## Current Baseline

- `GET /imports/archive` returns an authenticated owner-scoped summary.
- `apps/web/components/studio/archive-library.tsx` filters that loaded summary
  locally.
- `GET /discover/search` already has private owner buckets, but it is the public
  front-door search route and should not become the Studio archive API.
- `packages/ai/src/retrieval/archive-retrieval.ts` is persona-context retrieval,
  not a general workspace archive search surface.

## Scope

API:

- Add a narrow owner-scoped archive search route, preferably
  `GET /imports/archive/search`, unless extending `/imports/archive` is clearly
  less disruptive.
- Require authentication and derive owner scope from the session.
- Search owner-private metadata and safe text fields across:
  - documents;
  - memory items;
  - canon items;
  - persona files;
  - import jobs;
  - archived chat transcripts;
  - continuity records;
  - integrity sessions, if the existing table shape makes this a small addition.
- Support server-side `q`, `type` or `source`, `personaId`, `status`, `limit`,
  and a simple sort. Keep a conservative max limit.
- Return a sanitized result shape that the Studio archive UI can render without
  special knowledge of every source table.

Suggested result shape:

```ts
type PrivateArchiveSearchResult = {
  id: string;
  kind:
    | "document"
    | "memory"
    | "canon"
    | "persona_file"
    | "import_job"
    | "archived_chat"
    | "continuity"
    | "integrity";
  title: string;
  summary: string;
  personaId?: string;
  personaName?: string;
  status?: string;
  visibility?: string;
  sourceLabel: string;
  href?: string;
  occurredAt?: string;
  match: {
    field: string;
    reason: string;
  };
  privacy: "owner_only";
};
```

Privacy and safety:

- Do not return raw file bodies, full chat transcripts, full memory chunks, or
  unbounded import error text.
- Cap snippets and summaries. Prefer metadata summaries over raw private text.
- Failed import rows should remain searchable by safe source/status/error
  summary, and should not hide previously successful archive material.
- Anonymous visitors must not receive private buckets.
- Authenticated non-owners must not see another user's private archive,
  memory, canon, files, imports, continuity, integrity, documents, or archived
  chat rows.
- Search must degrade to metadata/full-text results when embeddings are missing.
  Do not make this lane depend on Gemini, OpenAI, Redis, or Cloudflare.

Web:

- Update `/studio/archive` so the search box and filters use the backend search
  endpoint when a query or filter is active.
- Keep the existing owner archive summary for the initial "what do I have?"
  view unless replacing it is simpler and equally safe.
- Render loading, empty, and error states that answer:
  - Is my material safe?
  - What can I add next?
  - Who can see this?
- If a visible filter or button is not wired, remove it, disable it, or label it
  honestly. Do not leave pretend controls.
- Keep the archive trust language consistent with the per-persona Archive tab:
  owner-only, source material, failed safely, source remains private.

## Out Of Scope

- Background workers, BullMQ, queue architecture, and async job migration.
- Vector reindexing, embedding migration, Gemini/OpenAI provider changes, or
  Redis-backed memory truth.
- Cloudflare retrieval adapters.
- Public Discover redesign.
- Broad UI reskin work outside the archive search surface.
- Binary/original file download work or export bundle expansion.
- Creator-positive publishing queue proof.

## Validation

Add focused coverage for the new search behavior. Use the existing test family
where it fits; add a narrow script only if the repo needs one.

Minimum local gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Required test cases:

- unauthenticated archive search fails;
- owner sees their own matching private rows;
- another authenticated owner does not see those rows;
- source/type filters narrow results;
- no query returns either a safe bounded default or a validation error, but not
  an unbounded dump;
- long private text and failed import errors are capped/sanitized;
- continuity and archive records stay owner-only;
- archive UI search/filter controls call real state and do not pretend to work.

## Handoff To ARGUS

When ready, DAEDALUS should wake A3 / ARGUS with:

- route/service/UI files changed;
- exact searched sources and fields;
- result shape and snippet cap policy;
- owner-scoping and non-owner proof;
- any migrations or type changes;
- validation commands and results;
- explicit caveats, especially any source excluded from this first slice.

ARGUS should review hostile owner scoping, public/private leakage, unbounded
response shapes, silent fallback to false empty states, and fake UI controls.

If ARGUS accepts and the UI changed materially, wake ARIADNE for a human
rehearsal of `/studio/archive` on desktop and mobile.
