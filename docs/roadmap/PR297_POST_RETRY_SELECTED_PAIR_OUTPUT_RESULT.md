# PR297 - Post-Retry Selected Pair Output Result

Owner: DAEDALUS
Opened by: MIMIR
Date: 2026-06-25
Status: Ready for ARGUS review

## Summary

PR297 tightens the private persona selected-context retry path after ARIADNE's
PR296 hosted evidence showed the one-shot retry fired but the user-visible
answer still missed exact selected labels and phrases while internal readback
reported `fulfilled`.

The route now makes the retry instruction visibly selected-pair oriented and
the answer-contract verifier no longer treats supporting facts alone as enough
for fulfillment. A response must include exact selected label/name/title text
plus supporting fact coverage to satisfy the contract.

## What Changed

- `apps/api/src/routes/conversations.ts`
  - Strengthened the retry instruction to ask for visible selected-pair output:
    `"<selected label/name/title>: <supporting fact>"`.
  - Asks the provider to copy the relevant selected label/name/title exactly
    and include the exact relevant supporting fact phrase from selected context.
  - Carries compact selected label/name/title text in the answer contract.
  - Evaluates selected label/name/title fulfillment with exact normalized text
    matching instead of loose term matching.
  - Keeps supporting facts on bounded term coverage for verifier purposes.
- `apps/api/src/routes/conversation-archive.test.ts`
  - Adds coverage proving a retry answer that mentions supporting facts but
    omits selected labels/names remains `missed_selected_labels`.
  - Preserves PR295 coverage that facts-matched, label-missed first answers
    trigger exactly one retry.
  - Preserves coverage that a retry answer with selected label/name plus
    supporting fact coverage satisfies the contract.
  - Preserves missed-all retry and creative/style no-retry coverage.

## What Did Not Change

- No hosted probing was added.
- No provider/model selection changed.
- No embedding, retrieval ranking, context assembly, schema, seed, import,
  Redis, Cloudflare, queue, worker, billing, Stripe, public UI, Studio UI, or
  demo data behavior changed.
- Retry scope remains private persona chat only, selected context required,
  direct/factual owner prompt required, one retry maximum.
- Trace/readiness sanitization shape was not widened.
- Provider-only selected-context scaffolding is not persisted as an
  owner-visible user message.
- Product code does not hardcode hosted replay labels, phrases, ids, prompts,
  completions, or private source bodies.

## Contract Mapping

Before PR297, `fulfilled` could be reached through loose term coverage even
when the answer omitted selected labels/names. PR296 showed that was weaker
than the visible hosted recall bar.

After PR297:

- selected label/name/title matching requires exact normalized selected text;
- supporting fact matching remains bounded term coverage;
- a facts-only retry answer is classified as `missed_selected_labels`;
- the retry prompt asks the provider for exact visible selected-pair output.

This maps the contract more closely to visible selected-pair recall without
adding a second retry, exposing raw selected strings in trace/readiness output,
or hardcoding hosted replay anchors.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 39 tests passed, including selected-pair fail/pass coverage, PR295 label-miss retry, missed-all retry, creative no-retry, persisted-message boundary, and trace/session raw-string checks. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed; owner-scoped sanitized trace detail remains green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | 2 turbo tasks passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass | Whitespace check passed. |
| `git diff --cached --check` | Pass | Staged whitespace check passed before ARGUS wakeup. |

The npm fallback runner emitted existing warnings about pnpm-only `.npmrc`
keys. Those are not Station validation failures.

## Caveats

- This is a local answer-construction and contract-alignment repair. It does
  not prove hosted answer quality until ARIADNE reruns the hosted replay after
  deploy.
- Supporting facts still use bounded term coverage in the verifier, while the
  provider-facing retry instruction asks for exact supporting fact phrases.
  ARGUS should review whether this is strict enough for the hosted visible-pair
  bar before MIMIR opens the next hosted rerun.

## ARGUS Review Request

WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR297 Post-Retry Selected Pair Output.
- Retry construction now explicitly asks for visible selected-pair output in
  `\"<selected label/name/title>: <supporting fact>\"` form.
- Contract fulfillment now requires exact selected label/name/title text, so
  facts-only retry answers remain `missed_selected_labels`.
Validation:
- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` passed.
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing web raw
  `<img>` warnings only.
- `git diff --check` and `git diff --cached --check` passed.
Risk:
- Review exact-label contract alignment, supporting-fact coverage strictness,
  retry prompt scope, creative/style no-retry guard, sanitized observability,
  persisted-message boundaries, no hosted replay hardcoding in product code,
  and no scope creep into retrieval/provider/schema/UI behavior.
Task:
- Review PR297.
- If accepted, wake MIMIR with a verdict and recommend whether MIMIR should
  open the next hosted ARIADNE rerun.
