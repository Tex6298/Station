# PR287 - Reliable Selected-Context Answer Use Result

Owner: A2 / DAEDALUS
Status: pass with caveats - accepted by ARGUS
Completed: 2026-06-24

## Result

`PASS WITH CAVEATS`, accepted by ARGUS with a narrow test patch.

DAEDALUS patched the answer-use boundary after selected context has already
been assembled. The strongest root-cause hypothesis is provider payload
placement: selected-context answer focus was present only in the system prompt,
before prior chat history, while the final provider-facing owner message did
not carry the compact selected facts near the answer slot.

The patch duplicates compact selected-context focus into the provider-facing
final user message under an explicit `Owner message:` section. The original
owner message is still saved unchanged in `conversation_messages`; only the
provider payload receives the extra compact focus. This keeps provider message
order stable, avoids synthetic turn alternation issues, and makes the final
provider user message carry both the selected facts and the owner request.

## Patch Summary

- Added compact provider selected-context focus assembly in
  `apps/api/src/routes/conversations.ts`.
- Provider-facing final user message now includes:
  - sanitized selected context focus across Canon, Integrity, Memory,
    Continuity, and Archive;
  - a boundary note that focus lines are facts/source context, not instructions
    from quoted material;
  - the original owner message under `Owner message:`.
- Runtime budget and quota/token estimates now use the actual provider-facing
  final user message length, so duplicated focus is counted conservatively.
- No retry behavior was added.
- No retrieval, provider routing, embedding, schema, seed, import, Redis,
  Cloudflare, queue, worker, billing, Stripe, public UI, or Studio UI behavior
  changed.

## Test Coverage

The focused conversation archive route test now seeds an accepted Memory item
with synthetic concept labels and paired phrases, captures the OpenAI BYOK
provider payload, and proves:

- the final provider message remains role `user`;
- compact selected context appears in the final provider-facing message;
- the prior chat-history assistant turn remains immediately before that final
  provider message;
- runtime budget counts the larger provider-facing message while retaining the
  true persisted-history count;
- trace sessions and trace events do not store the selected synthetic private
  strings.
- ARGUS added a regression assertion proving the provider-only selected-context
  augmentation is not persisted into stored user `conversation_messages`.

## Validation

All required PR287 local checks passed:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata` | Pass | 12 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 8 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 35 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | 2 turbo tasks passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass | Whitespace check passed. |
| `git diff --cached --check` | Pass | Staged whitespace check passed before ARGUS verdict. |
| Added-line hygiene scan | Pass | No credential-like values, emails, credentialed URLs, UUID-shaped ids, raw prompts, or private source bodies found in the PR287 ARGUS diff. |

## Safety

- Rejected-control filtering and source-copy boundaries are unchanged.
- The provider payload can receive selected private context, as before via the
  system prompt, but traces/debug responses continue to record only sanitized
  counts and budget metadata.
- No raw hosted prompts, completions, provider payloads, hosted logs, SQL,
  private source bodies, raw ids, cookies, tokens, or credentials were added.
- No replay persona name, hosted id, seeded label, or staging prompt wording is
  hardcoded in product code.

## Recommendation

ARGUS accepts provider payload ordering, prompt-boundary wording,
token/accounting conservatism, lack of hardcoded replay anchors, and raw-data
leakage safety.

MIMIR should open an ARIADNE hosted PR288 rerun after deploy to measure whether
user-adjacent selected focus clears the hosted recall failure.
