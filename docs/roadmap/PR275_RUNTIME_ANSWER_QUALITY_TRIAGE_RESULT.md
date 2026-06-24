# PR275 - Runtime Answer Quality Triage Result

Owner: A2 / DAEDALUS

Date: 2026-06-24

Status: PASS WITH CAVEATS - accepted by ARGUS

## Boundary

This triage addressed the PR274 hosted answer-quality caveat. It did not change
providers, embeddings, schema, migrations, Redis, Cloudflare, queues, workers,
imports, seeds, billing, Stripe state, public UI, or broad Studio UX.

Temporary hosted probes used the local replay-owner credentials only inside the
process. Committed evidence records sanitized booleans, counts, categories, and
test outcomes only. It does not record credentials, tokens, cookies, raw ids,
private source bodies, compiled prompts, provider payloads, hosted logs, raw
completions, or database rows.

## Verdict

PASS WITH CAVEATS.

The intended replay persona was selected, but PR274's generic prompt context did
not select the full accepted anchor set. The selected context and prompt carried
only one accepted concept and one matching phrase, both from Archive. The full
accepted anchor set was present in active Memory and retrievable through targeted
Archive/context queries, and the rejected-control anchor stayed absent from
active selected evidence.

DAEDALUS patched the narrow defect: vector memory search now backfills remaining
slots with owner-scoped, lifecycle-filtered lexical memory matches when vector
retrieval returns fewer injectable memories than requested. This keeps vector
retrieval as the primary path while recovering exact textual replay facts that
the embedding result missed.

The caveat is deployment evidence: the patch is proven by local/unit gates, but
the hosted replay chat needs an ARGUS-reviewed deploy/rerun before MIMIR closes
the two-anchor recall bar from live product evidence.

## Sanitized Triage

| Question | Result | Sanitized evidence |
| --- | --- | --- |
| Did PR274 select the intended replay persona? | Yes | Three owned personas existed; the first private platform persona was selected and was the only persona with broad replay context counts. |
| Did PR274 generic context include both accepted anchors? | No | Selected generic context had Canon 3, Integrity 1, Continuity 4, Memory 3, Archive 4, but only one accepted concept and one phrase reached selected sources/prompt. |
| Which category carried the partial anchor? | Archive only | Memory, Continuity, Integrity, and Canon selected sources had zero accepted-anchor signals under the generic prompt; Archive had one concept and one phrase. |
| Was the full accepted anchor set available for the selected persona? | Yes | Active Memory contained both accepted concepts and both matching phrases. Targeted Archive retrieval for the missing side returned HTTP 200 with four chunks and full accepted-anchor signals. |
| Would an explicit both-anchor context query reach prompt assembly? | Yes | Explicit both-anchor context returned the same category counts and full accepted-anchor signals in selected sources and prompt assembly. |
| Was the rejected-control anchor present? | No | Rejected-control signal was absent from the selected generic context, explicit context, active Memory, and targeted Archive chunks. |
| Was prompt assembly truncation the cause? | No | Topology retained all requested sources in each category for the relevant probes; no category reported truncation or drops in the sanitized evidence. |

Root cause: retrieval selection, not persona selection, prompt truncation, auth,
provider config, or model safety refusal. Vector Memory retrieval missed an
active exact lexical replay memory; the generic context then had only a partial
Archive anchor to answer from.

## Patch

Changed:

- `packages/ai/src/retrieval/semantic-search.ts`

Behavior:

- Keep vector memory retrieval as the primary path.
- If vector retrieval returns fewer injectable owner memories than requested,
  fill the remaining slots from keyword-ranked memory candidates.
- The supplement is owner-scoped, excludes already selected vector rows, filters
  rejected/quarantined/expired/superseded/archive-source memory through the same
  lifecycle rules, and only includes candidates with actual lexical overlap.

Tests:

- `packages/ai/test/retrieval-metadata.test.ts` now covers the PR275 failure
  mode: vector search returns a plausible memory while missing an exact active
  staging anchor; the lexical backfill adds the exact anchor and keeps the
  rejected control out.
- ARGUS strengthened that fixture so the lexical supplement also proves
  other-owner and archive-source candidates stay excluded from the supplemental
  path.

## Validation

| Command | Result |
| --- | --- |
| `node tmp-pr275-context-triage.mjs` | Pass. Temporary sanitized hosted probe answered the PR275 triage questions; temp file removed. |
| `npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata` | Pass, 9 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass, 8 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass, 2 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass, 35 tests. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass, 2 turbo tasks. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing raw `<img>` warnings in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass. |
| `git diff --cached --check` | Pass. |
| Added-line hygiene scan | Pass. No credential-like values, emails, credentialed URLs, or UUID-shaped ids found in the PR275 ARGUS diff. |

## Recommendation

ARGUS accepts the hybrid Memory backfill as narrow, owner/lifecycle safe, and
adequately tested after the test-only hostile fixture hardening.

MIMIR should open a hosted PR276 rerun that replays the same single bounded
chat/context path after deployment and records whether full two-anchor recall is
now live.
