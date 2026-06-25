# PR300 - Pair-Aware Selected Context Contract Result

Owner: DAEDALUS
Opened by: MIMIR
Date: 2026-06-25
Status: PASS WITH CAVEATS - accepted by ARGUS

## Summary

ARGUS accepts PR300 with a narrow review patch. PR300 repairs the selected-context answer-contract targeting gap proven by
ARIADNE's PR299 hosted evidence.

The contract no longer reports `fulfilled` just because an answer mentions
selected facts and some unrelated selected label. Mentioned selected facts now
need their own selected label/name/title from the same selected item.

ARGUS's patch preserves the previous fact-only behavior for selected items that
do not have a label/name/title at all. Those items can still fulfill on fact
coverage instead of forcing an impossible `missed_selected_labels` retry.

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
  - ARGUS review patch: counts an unpaired fact only for selected items that
    actually have a label/name/title, preserving fact-only fulfillment for
    unlabeled selected items.
- `apps/api/src/routes/conversation-archive.test.ts`
  - Adds coverage where an answer mentions supporting facts for two selected
    items plus an unrelated selected label. The first answer now fails as
    `missed_selected_labels` and triggers the existing one-shot retry.
  - Adds the matching pass path where the retry answer includes the matched
    selected labels/names/titles with their supporting facts.
  - ARGUS review patch: adds coverage proving an unlabeled selected item can
    fulfill by fact coverage without a retry.

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
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 41 tests passed, including pair-aware unrelated-label failure, matched-pair pass, ARGUS fact-only unlabeled guard, PR295 label-miss retry, PR297 facts-only failure, missed-all retry, creative no-retry, persisted-message boundary, and trace/session raw-string checks. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed; owner-scoped sanitized trace detail remains green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | 2 turbo tasks passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass | Whitespace check passed. |
| `git diff --cached --check` | Pass | Staged whitespace check passed before ARGUS wakeup and during ARGUS review. |
| Added-line hygiene scan | Pass | No credentials, emails, credentialed URLs, UUID-shaped ids, raw prompts, raw completions, private source bodies, or secret-bearing env values found. |

The npm fallback runner emitted existing warnings about pnpm-only `.npmrc`
keys. Those are not Station validation failures.

## Caveats

- This is a local pair-aware contract repair. It does not prove hosted answer
  quality until ARIADNE reruns the hosted replay after deploy.
- Supporting facts still use bounded term coverage; PR300 ties that coverage to
  the selected item whose exact label/name/title is present.
- ARGUS's fact-only guard is deliberately narrow: it changes only selected
  items with no available label/name/title and does not loosen labeled
  selected-pair fulfillment.

## ARGUS Verdict

PASS WITH CAVEATS.

ARGUS accepts PR300 and wakes MIMIR.

WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR300 Pair-Aware Selected Context Contract with a narrow review
  patch.
- Contract fulfillment now requires mentioned selected facts to have their own
  selected label/name/title in the same selected item.
- Unrelated selected labels no longer satisfy selected facts from other items;
  those answers fail as `missed_selected_labels` and use the existing one-shot
  retry path.
- ARGUS preserved fact-only fulfillment for selected items that have no
  label/name/title available, avoiding an impossible missing-label retry.
- Retry scope remains private persona chat only, selected context required,
  direct/factual owner prompt required, and one retry maximum.
- Creative/style prompts remain single-shot unless they include an explicit
  factual command.
- Provider-only selected-context scaffolding and failed first answers are not
  persisted as owner-visible messages.
- Trace/readiness output remains sanitized to allow-listed booleans, counts,
  enums, and timing buckets; raw selected strings remain absent from trace and
  session rows.
- No hosted probing, provider/model selection, embedding, retrieval ranking,
  context assembly, schema, seed, import, Redis, Cloudflare, queue, worker,
  billing, Stripe, public UI, or Studio UI behavior changed.
Validation:
- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` passed, 41 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed, 2 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed, 2 turbo tasks.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing web raw
  `<img>` warnings only.
- `git diff --check` passed.
- `git diff --cached --check` passed.
- Added-line hygiene scan found no credentials, emails, credentialed URLs,
  UUID-shaped ids, raw prompts, raw completions, private source bodies, or
  secret-bearing env values.
Recommendation:
- Open the next hosted ARIADNE rerun after deploy.
