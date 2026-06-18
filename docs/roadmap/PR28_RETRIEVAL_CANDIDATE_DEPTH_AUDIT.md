# PR28 - Retrieval Candidate Depth Audit

Date: 2026-06-18
Status: opened for A2 / DAEDALUS
Owner: DAEDALUS audits/implements if needed, ARGUS reviews. ARIADNE is not
needed unless a visible context-preview or Studio search surface changes.

## Purpose

Resolve the PR26 recall-depth caveat before considering Cloudflare, Redis
vectors, or a broader search architecture.

PR26 improved ranking inside the widened fetched candidate pool. It did not
prove corpus-wide lexical recall when exact evidence is buried beyond the
fetched candidate count. PR28 should determine whether that is a real replay
problem and, if it is, patch the smallest Station-native retrieval depth fix.

## Scope

- Audit current archive, memory, and context-preview candidate fetch limits.
- Add a focused fixture where exact replay evidence is present but buried behind
  enough noisy candidates to test the current candidate-depth boundary.
- If the fixture fails, prefer a Station/Supabase-native fix:
  - adaptive lexical fallback;
  - safer candidate pool expansion;
  - source-type or token-aware prefiltering;
  - deterministic two-pass query;
  - or a bounded SQL/RPC change if already supported by the repo.
- Keep trace metadata excerpt-free and owner/operator safe.
- Preserve current Gemini `1536` vector behavior and keyword fallback.

## Explicit Non-Scope

- Do not add Cloudflare retrieval or request Cloudflare config.
- Do not add Redis vector search or Redis memory truth.
- Do not change embedding provider, vector dimensions, or reindex profile.
- Do not add workers or queue infrastructure.
- Do not broaden UI/UX.
- Do not make private snippets public in trace or test docs.

## Cloudflare Decision Boundary

This lane is the evidence step before Cloudflare.

If DAEDALUS can resolve the candidate-depth caveat with Station/Supabase
retrieval, Cloudflare stays deferred.

If DAEDALUS proves Station/Supabase cannot meet the replay need without an
index-mirror/edge adapter, wake MIMIR with:

- the failing fixture name;
- why Station/Supabase cannot solve it narrowly;
- whether an ID-only Cloudflare Vectorize mirror would solve it;
- the privacy review surface ARGUS would need.

Do not implement Cloudflare in PR28.

## Validation

Run the narrow gate touched by the audit/fix:

```bash
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:continuity
npx tsx --test packages/ai/test/retrieval-metadata.test.ts
npm exec --yes pnpm@10.32.1 --filter @station/api build
git diff --check
```

If no code change is justified, document the fixture/audit result and run the
closest existing retrieval tests plus `git diff --check`.

## ARGUS Review Ask

ARGUS should hostile-review:

- whether the fixture really exercises candidate-depth rather than ranking;
- owner/persona scoping under the deeper candidate path;
- trace privacy;
- performance/limit risk from any expanded candidate pool;
- whether any Cloudflare/Redis/provider claims are overreach.

## Wake Discipline

DAEDALUS should wake ARGUS with:

- audit result;
- fixture name and what it proves;
- behavior changed, if any;
- validation commands/results;
- whether Cloudflare remains deferred or MIMIR needs a concrete decision.
