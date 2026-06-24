# PR285 - Answer Label Preservation Repair Result

Owner: A2 / DAEDALUS
Status: pass with caveats - accepted by ARGUS
Completed: 2026-06-24

## Verdict

`PASS WITH CAVEATS`, accepted by ARGUS.

PR285 patched the remaining label-preservation layer after PR284 showed hosted
answers could recall both invented phrases but not the paired accepted concept
labels.

Hosted proof still requires a post-deploy PR286 rerun.

## Root Cause / Hypothesis

The selected Memory source carried useful label metadata in its `title`, but
private prompt assembly passed Memory to `buildPersonaChatPrompt` as
`source.content` only. Archive and Integrity already used formatted
title/content strings; Memory did not.

That means answer focus could preserve phrase text from Memory content while
discarding paired concept labels stored in Memory titles or labels.

## Patch Summary

Changed `packages/ai/src/retrieval/context-builder.ts`:

- private Memory prompt input now uses the same `formatSourceForPrompt(source)`
  helper as Archive and Integrity;
- selected Memory titles/labels therefore reach the provider-facing prompt
  alongside selected Memory content;
- the prompt input shape did not change.

Changed `packages/ai/test/retrieval-metadata.test.ts`:

- the DB-shaped fixture now keeps concept labels in the selected Memory title
  while phrase text remains in Memory content;
- the test proves Memory content alone lacks the concept label, but the
  provider-facing prompt still contains both labels and both phrases.

No retrieval, provider routing, embedding, schema, seed, import, Redis,
Cloudflare, queue, worker, billing, Stripe, public UI, or Studio UI behavior was
changed.

## Local Evidence

| Question | Result |
| --- | --- |
| Does answer focus include selected source titles/labels? | Yes after the patch: Memory uses title/content formatting before prompt construction. |
| Were accepted concept labels available before answer focus? | Yes locally: the focused fixture stores concept labels in Memory title metadata. |
| Did the previous string-array prompt path discard useful labels? | Yes: Memory strings were built from content only. |
| Does the repair preserve labels and phrases generically? | Yes locally: labels in title and phrases in content both reach the private provider-facing prompt. |
| Does rejected-control/source-copy/prompt-boundary safety remain intact? | Yes locally. Filtering is unchanged, prompt input shape is unchanged, and no source-copy expansion was added. |

## Validation

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata` | Pass. 12 tests, including title-label preservation into provider-facing prompt. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass. 8 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass. 35 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass. 2 tests. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass. 2 turbo tasks. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings: raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass. Whitespace check passed. |
| `git diff --cached --check` | Pass. Staged whitespace check passed before ARGUS verdict. |
| Added-line hygiene scan | Pass. No credential-like values, emails, credentialed URLs, UUID-shaped ids, raw prompts, or private source bodies found in the PR285 ARGUS diff. |

## Recommendation

ARGUS accepts prompt-boundary safety, label/source preservation, no hardcoded
replay anchors, no scope creep, and secret/raw-data hygiene.

MIMIR should open an ARIADNE hosted PR286 rerun after deploy.
