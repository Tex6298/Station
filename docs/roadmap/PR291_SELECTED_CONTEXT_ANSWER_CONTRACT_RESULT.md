# PR291 - Selected-Context Answer Contract Diagnostic Result

Owner: A2 / DAEDALUS
Status: pass with caveats - accepted by ARGUS
Completed: 2026-06-25

## Result

`PASS WITH CAVEATS`, accepted by ARGUS with a narrow review patch.

DAEDALUS added a private-only selected-context answer contract verifier and a
one-shot retry. The strongest remaining hypothesis is that provider-facing
selected context can be present and well-shaped while the first model answer
still ignores it. PR291 now detects that failure class locally before another
hosted rerun.

The verifier keeps selected labels/titles and supporting fact terms in process
memory only. Trace payloads store only booleans, counts, and reason codes.
ARGUS tightened the direct-factual gate so a bare question mark does not trigger
retry for creative/style prompts.

## Patch Summary

- Added a selected-context answer contract in
  `apps/api/src/routes/conversations.ts`.
- The contract applies only for private persona chat when the owner message is
  direct/factual and selected context exists.
- The verifier compares the final answer against selected source labels/titles
  and compact supporting fact terms without storing the raw strings.
- If the first answer clearly misses all selected focus, the route retries once
  with an answer-contract retry marker in the provider-facing final user
  message.
- ARGUS review patch removed the bare question-mark trigger from the
  direct-factual classifier so retry remains bounded to factual trigger words
  such as `list`, `what`, `which`, `recall`, `remember`, `facts`, `pairs`,
  `labels`, `selected context`, `tell me`, and `give me`.
- The persisted owner message stays unchanged; the first failed answer is not
  persisted when a retry succeeds.
- No retrieval, context assembly, provider routing/model choice, embeddings,
  schema, seeds, imports, Redis, Cloudflare, queues, workers, billing, Stripe,
  public UI, Studio UI, or human-demo behavior changed.

## Retry And Accounting

- Retry maximum: one.
- Retry scope: private persona chat only.
- Retry trigger: selected context exists, owner prompt is direct/factual, and
  the first answer matches no selected label/fact focus.
- Safe acceptance gate: retry is for the PR290 failure class where all selected
  focus is missed. Partial label-only or fact-only misses are recorded as
  sanitized verdicts but do not trigger another route-level retry.
- Quota check: uses a conservative estimate that includes the initial provider
  request plus the possible retry request when the contract is applicable.
- Trace totals and token usage: include the first attempt plus retry attempt
  token counts when retry occurs, using provider usage where available and local
  estimates otherwise.
- Retry failure: does not expose raw provider errors through trace payloads; the
  route keeps sanitized retry status metadata.

## Test Coverage

The focused conversation archive route test now proves:

- selected focus reaches the final provider-facing user message;
- a direct private answer that ignores selected focus triggers exactly one
  retry;
- the retry request carries the answer-contract retry marker and selected
  label/fact pairs;
- the successful retry preserves the selected label and supporting facts;
- a creative private prompt with selected context and a question mark does not
  retry when it misses selected focus;
- trace payloads record sanitized reason codes/counts only;
- persisted `conversation_messages` keep the original owner message, do not
  store provider-only selected context, and do not persist the failed first
  answer.

## Validation

All required PR291 local checks passed:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata` | Pass | 12 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 8 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 37 tests passed, including one-shot retry coverage and the ARGUS creative-prompt no-retry guard. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | 2 turbo tasks passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass | Whitespace check passed. |
| `git diff --cached --check` | Pass | Staged whitespace check passed before ARGUS verdict. |
| Added-line hygiene scan | Pass | No credential-like values, emails, credentialed URLs, UUID-shaped ids, raw prompts, raw completions, private source bodies, or secret-bearing env values found in the PR291 ARGUS diff. |

## Safety

- Rejected-control filtering and source-copy boundaries are unchanged.
- Provider-facing selected context remains provider-only and is not persisted as
  user chat content.
- Trace/debug/readiness metadata stores sanitized contract reason codes and
  count buckets, not raw selected strings, prompts, completions, provider
  payloads, hosted logs, SQL, private source bodies, raw ids, cookies, tokens,
  or credentials.
- Product code contains no replay persona name, hosted id, test account detail,
  seeded anchor string, or staging prompt wording.

## Recommendation

ARGUS accepts the repair. MIMIR should open an ARIADNE PR292 hosted rerun after
deploy. If hosted PR292 still fails after the verifier/retry path is deployed,
the next decision should classify whether the issue belongs to provider/model
behavior rather than route contract delivery.
