# PR300 - Pair-Aware Selected Context Contract Result

Owner: DAEDALUS
Opened by: MIMIR
Date: 2026-06-25
Status: Ready for ARGUS review

## Summary

PR300 repairs the selected-context answer-contract targeting gap proven by
ARIADNE's PR299 hosted evidence.

The contract no longer reports `fulfilled` just because an answer mentions
selected facts and some unrelated selected label. Mentioned selected facts now
need their own selected label/name/title from the same selected item.

## What Changed

- `apps/api/src/routes/conversations.ts`
  - Tracks selected facts that are mentioned without their own selected
    label/name/title.
  - Reports `fulfilled` only when at least one selected item has both its
    label/name/title and supporting fact coverage, and no mentioned selected
    facts are missing their own labels/names/titles.
  - Reports `missed_selected_labels` when selected facts are mentioned but
    their own labels/names/titles are missing, even if an unrelated selected
    label appears elsewhere in the answer.
- `apps/api/src/routes/conversation-archive.test.ts`
  - Adds coverage where an answer mentions supporting facts for two selected
    items plus an unrelated selected label. The first answer now fails as
    `missed_selected_labels` and triggers the existing one-shot retry.
  - Adds the matching pass path where the retry answer includes the matched
    selected labels/names/titles with their supporting facts.

## What Did Not Change

- No hosted probing was added.
- No provider/model selection changed.
- No embedding, retrieval ranking, context assembly, schema, seed, import,
  Redis, Cloudflare, queue, worker, billing, Stripe, public UI, Studio UI, or
  demo data behavior changed.
- Retry scope remains private persona chat only, selected context required,
  direct/factual owner prompt required, one retry maximum.
- The creative/style no-retry guard was preserved.
- Trace/readiness sanitization shape was not widened.
- Provider-only selected-context scaffolding is not persisted as an
  owner-visible user message.
- Product code does not hardcode hosted replay labels, phrases, ids, prompts,
  completions, or private source bodies.

## Contract Mapping

Before PR300, the contract could see selected facts and a selected label
somewhere in the answer and report `fulfilled`, even when the label belonged to
another selected item.

After PR300:

- selected fact coverage is evaluated per selected item;
- selected label/name/title coverage is evaluated per selected item;
- selected facts without their own selected label/name/title are counted as
  unpaired facts;
- any unpaired selected fact keeps the contract out of `fulfilled`;
- the failure reason is `missed_selected_labels`, which preserves the existing
  one-shot retry path under the private/direct/factual safe gate.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 40 tests passed, including pair-aware unrelated-label failure, matched-pair pass, PR295 label-miss retry, PR297 facts-only failure, missed-all retry, creative no-retry, persisted-message boundary, and trace/session raw-string checks. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed; owner-scoped sanitized trace detail remains green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | 2 turbo tasks passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass | Whitespace check passed. |
| `git diff --cached --check` | Pass | Staged whitespace check passed before ARGUS wakeup. |

The npm fallback runner emitted existing warnings about pnpm-only `.npmrc`
keys. Those are not Station validation failures.

## Caveats

- This is a local pair-aware contract repair. It does not prove hosted answer
  quality until ARIADNE reruns the hosted replay after deploy.
- Supporting facts still use bounded term coverage; PR300 ties that coverage to
  the selected item whose exact label/name/title is present.

## ARGUS Review Request

WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR300 Pair-Aware Selected Context Contract.
- Contract fulfillment now requires mentioned selected facts to have their own
  selected label/name/title in the same selected item.
- Unrelated selected labels no longer satisfy selected facts from other items;
  those answers fail as `missed_selected_labels` and use the existing one-shot
  retry path.
Validation:
- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` passed.
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing web raw
  `<img>` warnings only.
- `git diff --check` and `git diff --cached --check` passed.
Risk:
- Review pair-aware fulfillment, retry scope, creative/style no-retry guard,
  sanitized observability, persisted-message boundaries, no hosted replay
  hardcoding in product code, and no scope creep into retrieval/provider/schema
  or UI behavior.
Task:
- Review PR300.
- If accepted, wake MIMIR with a verdict and recommend whether MIMIR should
  open the next hosted ARIADNE rerun.
