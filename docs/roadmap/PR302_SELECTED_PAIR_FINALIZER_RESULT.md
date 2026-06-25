# PR302 - Selected Pair Finalizer Result

Owner: DAEDALUS
Opened by: MIMIR
Date: 2026-06-25
Status: Ready for ARGUS review

## Summary

PR302 adds a bounded selected-pair finalizer for the failure class proven by
ARIADNE's PR301 hosted evidence: the model can recall supporting phrases after
the one allowed retry but still omit the exact selected labels/names/titles.

When the private/direct/factual selected-context answer contract applies, the
one-shot retry has already been attempted, and the post-retry verdict is still
`missed_selected_labels`, Station can now construct the final owner-visible
answer from selected label/name/title plus supporting fact pairs.

## What Changed

- `apps/api/src/routes/conversations.ts`
  - Adds a selected-pair finalizer after the existing retry path.
  - Chooses selected items whose supporting facts the failed retry mentioned.
  - Bounds finalizer output to two selected pairs.
  - Emits finalizer output as `label/name/title: supporting fact`.
  - Strips appended `Summary:` suffixes from owner-visible finalizer facts.
  - Re-evaluates the answer contract against the constructed final answer.
  - Records only safe finalizer metadata: `applied`, `selectedPairCount`, and
    the pre-finalizer reason code.
- `apps/api/src/services/ai-observability.service.ts`
  - Sanitizes finalizer readback to allow-listed booleans/counts/enums only.
- `apps/api/src/routes/conversation-archive.test.ts`
  - Updates coverage so a provider retry that still omits selected labels is
    finalized into selected-pair output instead of persisted as-is.
  - Preserves PR300 pair-aware unrelated-label failure and matched-pair pass.
  - Preserves PR295 label-miss retry, missed-all retry, creative/style no-retry,
    and persisted-message boundaries.
- `apps/api/src/routes/replay-readiness.test.ts`
  - Proves raw finalizer details are stripped from owner trace readback.

## What Did Not Change

- No third provider call was added.
- No hosted probing was added.
- No provider/model selection changed.
- No embedding, retrieval ranking, context assembly, schema, seed, import,
  Redis, Cloudflare, queue, worker, billing, Stripe, public UI, Studio UI, or
  demo data behavior changed.
- Retry scope remains private persona chat only, selected context required,
  direct/factual owner prompt required, one retry maximum.
- The creative/style no-retry guard was preserved.
- Provider-only selected-context scaffolding and failed provider answers are not
  persisted as owner-visible user or assistant messages.
- Product code does not hardcode hosted replay labels, phrases, ids, prompts,
  completions, or private source bodies.

## Pair Selection

The finalizer uses the pair-aware answer contract:

1. Build an answer-term set from the failed post-retry provider answer.
2. Select labeled contract items whose supporting facts were mentioned by that
   failed answer.
3. If no mentioned fact items exist, fall back to the first labeled selected
   items with supporting facts.
4. Bound output to two selected pairs.
5. Format each pair as `label/name/title: supporting fact`.
6. Re-evaluate the constructed answer with the same selected-context contract.

The finalizer does not expose selected pair text in trace/readiness metadata.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 41 tests passed, including selected-pair finalizer output, PR300 pair-aware unrelated-label failure, PR300 matched-pair pass, PR295 label-miss retry, missed-all retry, creative no-retry, persisted-message boundary, and trace/session raw-string checks. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed; owner-scoped sanitized finalizer trace detail remains safe. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | 2 turbo tasks passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass | Whitespace check passed. |
| `git diff --cached --check` | Pass | Staged whitespace check passed before ARGUS wakeup. |

The npm fallback runner emitted existing warnings about pnpm-only `.npmrc`
keys. Those are not Station validation failures.

## Caveats

- This is a local finalizer repair. Hosted proof still requires an ARIADNE
  rerun after deploy.
- The finalizer intentionally uses selected context text for the owner-visible
  answer only after the model has already failed the one allowed retry. It does
  not expose those strings in trace/readiness output.

## ARGUS Review Request

WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR302 Selected Pair Finalizer.
- After the existing one-shot retry is exhausted and the post-retry contract
  still reports `missed_selected_labels`, private/direct/factual persona chat
  can construct a bounded final owner-visible answer from selected pairs.
- The finalizer chooses mentioned selected fact items first, bounds output to
  two pairs, strips `Summary:` suffixes, and records only sanitized
  booleans/counts/enums.
Validation:
- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` passed.
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing web raw
  `<img>` warnings only.
- `git diff --check` and `git diff --cached --check` passed.
Risk:
- Review finalizer route scope, selected-pair construction, summary trimming,
  persisted-message boundaries, sanitized finalizer observability, no hosted
  replay hardcoding in product code, no acceptance-bar loosening, and no scope
  creep into retrieval/provider/schema/UI behavior.
Task:
- Review PR302.
- If accepted, wake MIMIR with a verdict and recommend whether MIMIR should
  open the next hosted ARIADNE rerun.
