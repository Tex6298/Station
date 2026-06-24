# PR277 - Hosted Runtime Retrieval Selection Repair

Owner: A2 / DAEDALUS
Status: accepted by ARGUS
Opened: 2026-06-24
Accepted: 2026-06-24

## Purpose

Repair the PR276 hosted runtime answer-quality failure without changing
providers, schema, seeds, imports, Redis, Cloudflare, queues, workers, billing,
or UI.

PR276 proved the PR275 implementation deployed, but the generic bounded prompt
still selected only partial accepted-anchor evidence before the provider answer.
The chat route, auth/session, intended persona selection, rejected-control
exclusion, source-copy safety, and observability all passed. The defect is the
retrieval/selection path feeding runtime context.

## Starting Evidence

PR275 found:

- the intended replay persona was selected;
- active Memory contained the full accepted anchor set;
- targeted Archive/context queries could retrieve the full accepted anchor set;
- vector Memory retrieval missed an exact active lexical replay memory;
- PR275 added lexical Memory backfill only when vector retrieval returned fewer
  injectable memories than requested.

PR276 found after deploy:

- hosted generic context still selected only one of two accepted anchor concepts
  and one of two matching invented retrieval phrases;
- Memory retrieval mode still reported `vector`;
- context counts were Canon 3, Memory 3, Integrity 1, Archive 4, Continuity 4;
- rejected-control evidence stayed absent;
- the hosted answer recalled zero accepted concepts and one matching phrase.

Likely hypothesis to test first: vector retrieval is filling all requested
Memory slots, so the PR275 lexical backfill never runs. If that is true, the
repair probably needs hybrid lexical/vector candidate blending or reranking, not
a provider or prompt change.

## Scope

Answer these questions with sanitized local/hosted probes:

1. Did the hosted generic Memory vector path return the full requested Memory
   count, preventing PR275 lexical backfill from running?
2. Are the selected vector Memory candidates lower lexical relevance than the
   exact active seeded-anchor memory?
3. Can a high-confidence lexical active Memory candidate be included without
   admitting rejected, quarantined, expired, superseded, other-owner, or
   archive-source candidates?
4. Does the repaired generic context select both accepted anchor concepts and
   both matching invented retrieval phrases before provider answer?
5. Does rejected-control evidence remain absent?

## Patch Rule

Patch the smallest retrieval-selection defect that explains PR276.

Likely acceptable patch shapes:

- hybrid lexical/vector Memory candidate blending before final Memory source
  selection;
- rerank/deduplicate selected vector Memory results against high-confidence
  owner-scoped lexical Memory candidates;
- promote exact active lexical Memory matches over weaker vector matches when
  the lexical candidate passes the same lifecycle/owner/source filters.

Required guardrails:

- vector retrieval remains primary;
- owner scoping remains mandatory;
- lifecycle filtering excludes rejected, quarantined, expired, and superseded
  Memory;
- archive-source Memory remains excluded from the supplemental Memory path;
- rejected-control anchor remains absent;
- no private raw bodies, raw ids, compiled prompts, provider payloads, hosted
  logs, SQL, or raw completions are committed.

## Non-Scope

Do not change:

- embedding provider, embedding model, or vector dimension;
- provider/model routing;
- schema or migrations;
- Redis, Cloudflare, queues, workers, or background infrastructure;
- imports, seeds, archive data, or replay owner data;
- billing, Stripe, or token credits;
- public UI or broad Studio UX.

## Validation

Run the narrowest relevant checks, starting with:

```bash
npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

If you run hosted/local probes, record sanitized booleans/counts only and remove
temporary files before handoff unless they are intended tests.

## Result Shape

Create:

```text
docs/roadmap/PR277_HOSTED_RUNTIME_RETRIEVAL_SELECTION_REPAIR_RESULT.md
```

Record:

- root cause;
- patch summary;
- whether generic context now selects both accepted anchor concepts and both
  matching invented retrieval phrases before provider answer;
- rejected-control exclusion;
- validation commands/results;
- exact next-owner recommendation.

## Handoff

Wake ARGUS with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR277 Hosted Runtime Retrieval Selection Repair.
- [root cause and patch summary]
Validation:
- [commands/results]
Task:
- Review owner/lifecycle/source filtering, rejected-control exclusion, and scope.
- If accepted, recommend whether MIMIR should open ARIADNE hosted PR278 rerun.
```
